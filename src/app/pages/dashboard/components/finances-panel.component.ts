import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { FinancesService } from '../../../core/finances/finances.service';
import { FinanceTransaction, FinanceTransactionRequest, FinanceSummary, TransactionType } from '../../../core/finances/finances.models';

@Component({
  selector: 'app-finances-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finances-panel.component.html',
  styleUrl: './finances-panel.component.css',
})
export class FinancesPanelComponent {
  private readonly financesService = inject(FinancesService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly transactions = signal<FinanceTransaction[]>([]);
  protected readonly summary = signal<FinanceSummary>({ ingresos: 0, costo: 0, margen: 0 });
  
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchQuery = signal('');
  
  protected readonly showForm = signal(false);

  protected readonly hasWriteAccess = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN_FINANZAS';
  });

  protected readonly filteredTransactions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.transactions();

    if (!query) {
      return all;
    }

    return all.filter(
      (t) =>
        t.skuProducto.toLowerCase().includes(query) ||
        (t.nombreProducto && t.nombreProducto.toLowerCase().includes(query)) ||
        t.sucursal.toLowerCase().includes(query) ||
        t.tipoMovimiento.toLowerCase().includes(query)
    );
  });

  protected readonly transactionForm = this.fb.group({
    sucursal: ['', [Validators.required]],
    skuProducto: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    ingresos: [0, [Validators.required, Validators.min(0)]],
    costo: [0, [Validators.min(0)]],
    tipoMovimiento: ['INGRESO' as TransactionType, [Validators.required]],
    nombreProducto: [''],
    ventaId: [null as number | null],
    productoId: [null as number | null],
  });

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.financesService
      .getGeneralSummary()
      .subscribe({
        next: (data) => this.summary.set(data),
        error: () => console.error('Error al cargar resumen financiero')
      });

    this.financesService
      .getTransactions()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.transactions.set(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected openNewTransactionForm(): void {
    this.transactionForm.reset({
      sucursal: '',
      skuProducto: '',
      cantidad: 1,
      ingresos: 0,
      costo: 0,
      tipoMovimiento: 'INGRESO',
      nombreProducto: '',
      ventaId: null,
      productoId: null
    });
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  protected submitForm(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.transactionForm.getRawValue() as FinanceTransactionRequest;

    this.financesService
      .registerTransaction(formValue)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Movimiento financiero registrado con éxito.');
          this.closeForm();
          this.loadData();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }
}