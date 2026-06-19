import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BRANCH_OPTIONS, isAllowedBranch } from '../../../../core/branches/branches.models';
import { allowedBranchValidator } from '../../../../core/branches/branches.validators';
import { AuthService } from '../../../../core/auth/auth.service';
import { ClientsService } from '../../../../core/clients/clients.service';
import { InventoryService } from '../../../../core/inventory/inventory.service';
import { SalesService } from '../../../../core/sales/sales.service';
import { Sale, SaleChannel, SaleCreateRequest } from '../../../../core/sales/sales.models';
import { hasAllowedSkuFormat, normalizeSku } from '../../../../core/sku/sku.utils';

@Component({
  selector: 'app-sales-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-panel.component.html',
  styleUrl: './sales-panel.component.css',
})
export class SalesPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly salesService = inject(SalesService);
  private readonly authService = inject(AuthService);
  private readonly clientsService = inject(ClientsService);
  private readonly inventoryService = inject(InventoryService);
  private readonly fb = inject(FormBuilder);
  private validationRequestId = 0;
  private clientValidationRequestId = 0;

  protected readonly branchOptions = BRANCH_OPTIONS;
  protected readonly sales = signal<Sale[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly productValidationState = signal<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  protected readonly productValidationMessage = signal('');
  protected readonly clientValidationState = signal<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  protected readonly clientValidationMessage = signal('');
  protected readonly searchQuery = signal('');
  
  protected readonly showForm = signal(false);

  protected readonly hasWriteAccess = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN_VENTAS';
  });

  protected readonly filteredSales = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.sales();

    if (!query) {
      return all;
    }

    return all.filter(
      (s) =>
        s.skuProducto.toLowerCase().includes(query) ||
        (s.nombreProducto && s.nombreProducto.toLowerCase().includes(query)) ||
        s.sucursal.toLowerCase().includes(query) ||
        (s.nombreCliente && s.nombreCliente.toLowerCase().includes(query))
    );
  });

  protected readonly totalSalesAmount = computed(() => {
    return this.filteredSales().reduce((sum, sale) => sum + (sale.montoTotal || 0), 0);
  });

  protected readonly saleForm = this.fb.group({
    sucursal: ['', [Validators.required, allowedBranchValidator()]],
    skuProducto: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    canal: ['POS' as SaleChannel, [Validators.required]],
    clienteId: [null as number | null],
  });

  constructor() {
    this.loadData();

    // Reset clienteId if canal is POS
    this.saleForm.get('canal')?.valueChanges.subscribe(canal => {
      if (canal === 'POS') {
        this.saleForm.patchValue({ clienteId: null });
        this.saleForm.get('clienteId')?.clearValidators();
      } else {
        this.saleForm.get('clienteId')?.setValidators([Validators.required]);
      }
      this.saleForm.get('clienteId')?.updateValueAndValidity();
    });

    this.saleForm.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.validateProductBranch();
        this.validateClientId();
      });
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.salesService
      .getSales()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.sales.set(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected openNewSaleForm(): void {
    this.saleForm.reset({
      sucursal: '',
      skuProducto: '',
      cantidad: 1,
      canal: 'POS',
      clienteId: null
    });
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.clearProductBranchValidation();
    this.clearClientValidation();
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.clearProductBranchValidation();
    this.clearClientValidation();
  }

  protected submitForm(): void {
    if (
      this.saleForm.invalid ||
      this.productValidationState() === 'loading' ||
      this.productValidationState() === 'invalid' ||
      this.clientValidationState() === 'loading' ||
      this.clientValidationState() === 'invalid'
    ) {
      this.saleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.saleForm.getRawValue() as SaleCreateRequest;

    this.salesService
      .registerSale(formValue)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (savedSale) => {
          this.successMessage.set(`Venta registrada con exito. Total: $${savedSale.montoTotal}`);
          this.closeForm();
          this.loadData();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected isEcommerce(): boolean {
    return this.saleForm.get('canal')?.value === 'ECOMMERCE';
  }

  protected isFieldInvalid(fieldName: 'sucursal' | 'skuProducto' | 'cantidad' | 'clienteId'): boolean {
    const field = this.saleForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  protected hasAllowedBranchError(): boolean {
    const field = this.saleForm.get('sucursal');
    return !!field && field.hasError('allowedBranch') && (field.dirty || field.touched);
  }

  protected isBranchMismatch(): boolean {
    return this.productValidationState() === 'invalid' && !!this.productValidationMessage();
  }

  protected isClientMismatch(): boolean {
    return this.clientValidationState() === 'invalid' && !!this.clientValidationMessage();
  }

  private validateProductBranch(): void {
    const skuControl = this.saleForm.get('skuProducto');
    const sku = normalizeSku(skuControl?.value);
    const sucursal = (this.saleForm.get('sucursal')?.value ?? '').trim();

    this.clearProductBranchValidation(false);

    if (skuControl && skuControl.value !== sku) {
      skuControl.setValue(sku, { emitEvent: false });
    }

    if (!sku || !sucursal) {
      this.productValidationState.set('idle');
      this.productValidationMessage.set('');
      return;
    }

    if (!hasAllowedSkuFormat(sku)) {
      this.productValidationState.set('invalid');
      this.productValidationMessage.set('El SKU debe comenzar con TEC- o HOG-.');
      this.setBranchMismatchError(true);
      return;
    }

    if (!isAllowedBranch(sucursal)) {
      this.productValidationState.set('invalid');
      this.productValidationMessage.set(`La sucursal ${sucursal} no es válida.`);
      this.setBranchMismatchError(true);
      return;
    }

    const requestId = ++this.validationRequestId;
    this.productValidationState.set('loading');
    this.productValidationMessage.set('Verificando producto y sucursal...');

    this.inventoryService.getProductBySku(sku).subscribe({
      next: (product) => {
        if (requestId !== this.validationRequestId) {
          return;
        }

        if (!isAllowedBranch(product.sucursal) || product.sucursal.trim().toLowerCase() !== sucursal.toLowerCase()) {
          const message = `El SKU ${sku} pertenece a ${product.sucursal}, no a ${sucursal}.`;
          this.productValidationState.set('invalid');
          this.productValidationMessage.set(message);
          this.setBranchMismatchError(true);
          return;
        }

        this.productValidationState.set('valid');
        this.productValidationMessage.set(`Producto disponible en ${product.sucursal}.`);
      },
      error: (error: Error) => {
        if (requestId !== this.validationRequestId) {
          return;
        }

        this.productValidationState.set('invalid');
        this.productValidationMessage.set(error.message || 'No se pudo validar el producto.');
        this.setBranchMismatchError(true);
      },
    });
  }

  private validateClientId(): void {
    const canal = this.saleForm.get('canal')?.value;

    if (canal !== 'ECOMMERCE') {
      this.clearClientValidation();
      return;
    }

    const rawClientId = this.saleForm.get('clienteId')?.value;
    const clientId = Number(rawClientId);

    this.clearClientValidation(false);

    if (!Number.isFinite(clientId) || clientId <= 0) {
      this.clientValidationState.set('idle');
      this.clientValidationMessage.set('');
      this.setClientMismatchError(false);
      return;
    }

    const requestId = ++this.clientValidationRequestId;
    this.clientValidationState.set('loading');
    this.clientValidationMessage.set('Verificando cliente...');

    this.clientsService.getClientById(clientId).subscribe({
      next: (client) => {
        if (requestId !== this.clientValidationRequestId) {
          return;
        }

        if (client.estado !== 'ACTIVO') {
          const message = `El cliente ${clientId} existe, pero no está activo.`;
          this.clientValidationState.set('invalid');
          this.clientValidationMessage.set(message);
          this.setClientMismatchError(true);
          return;
        }

        this.clientValidationState.set('valid');
        this.clientValidationMessage.set(`Cliente ${client.nombre} ${client.apellido} válido y activo.`);
        this.setClientMismatchError(false);
      },
      error: (error: Error) => {
        if (requestId !== this.clientValidationRequestId) {
          return;
        }

        this.clientValidationState.set('invalid');
        this.clientValidationMessage.set(error.message || 'No se pudo validar el cliente.');
        this.setClientMismatchError(true);
      },
    });
  }

  private clearProductBranchValidation(resetState = true): void {
    this.validationRequestId += 1;
    this.setBranchMismatchError(false);

    if (resetState) {
      this.productValidationState.set('idle');
      this.productValidationMessage.set('');
    }
  }

  private clearClientValidation(resetState = true): void {
    this.clientValidationRequestId += 1;
    this.setClientMismatchError(false);

    if (resetState) {
      this.clientValidationState.set('idle');
      this.clientValidationMessage.set('');
    }
  }

  private setBranchMismatchError(enabled: boolean): void {
    const skuControl = this.saleForm.get('skuProducto');
    const sucursalControl = this.saleForm.get('sucursal');

    this.toggleControlError(skuControl, 'branchMismatch', enabled);
    this.toggleControlError(sucursalControl, 'branchMismatch', enabled);
  }

  private setClientMismatchError(enabled: boolean): void {
    const clienteControl = this.saleForm.get('clienteId');
    this.toggleControlError(clienteControl, 'clientMismatch', enabled);
  }

  private toggleControlError(control: { errors: Record<string, unknown> | null; setErrors: (errors: Record<string, unknown> | null) => void } | null, errorKey: string, enabled: boolean): void {
    if (!control) {
      return;
    }

    const errors = { ...(control.errors ?? {}) };

    if (enabled) {
      errors[errorKey] = true;
      control.setErrors(errors);
      return;
    }

    if (!(errorKey in errors)) {
      return;
    }

    delete errors[errorKey];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }
}
