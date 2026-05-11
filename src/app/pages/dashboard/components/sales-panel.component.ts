import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { SalesService } from '../../../core/sales/sales.service';
import { Sale, SaleChannel, SaleCreateRequest } from '../../../core/sales/sales.models';

@Component({
  selector: 'app-sales-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-panel.component.html',
  styleUrl: './sales-panel.component.css',
})
export class SalesPanelComponent {
  private readonly salesService = inject(SalesService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly sales = signal<Sale[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
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
    sucursal: ['', [Validators.required]],
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
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  protected submitForm(): void {
    if (this.saleForm.invalid) {
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
}