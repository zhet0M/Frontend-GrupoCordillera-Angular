import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { BRANCH_OPTIONS } from '../../../../core/branches/branches.models';
import { allowedBranchValidator } from '../../../../core/branches/branches.validators';
import { AuthService } from '../../../../core/auth/auth.service';
import { InventoryService } from '../../../../core/inventory/inventory.service';
import { Product, ProductCategory } from '../../../../core/inventory/inventory.models';

@Component({
  selector: 'app-inventory-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-panel.component.html',
  styleUrl: './inventory-panel.component.css',
})
export class InventoryPanelComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly branchOptions = BRANCH_OPTIONS;
  protected readonly products = signal<Product[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchQuery = signal('');
  
  protected readonly showForm = signal(false);
  protected readonly editingProduct = signal<Product | null>(null);

  protected readonly hasWriteAccess = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'SUPER_ADMIN' || role === 'ADMIN_INVENTARIO';
  });

  protected readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.products();

    if (!query) {
      return all;
    }

    return all.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.sucursal.toLowerCase().includes(query),
    );
  });

  protected readonly productForm = this.fb.group({
    id: [null as number | null],
    sku: [''],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    categoria: ['TECNOLOGIA' as ProductCategory, [Validators.required]],
    marca: [''],
    modelo: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    costo: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
    sucursal: ['', [Validators.required, allowedBranchValidator()]],
    estado: ['DISPONIBLE'],
    // specific fields
    mesesGarantia: [null as number | null],
    voltaje: [''],
    material: [''],
    dimensiones: [''],
  });

  constructor() {
    this.loadData();
    
    // Auto-clear specific fields when category changes to keep it clean
    this.productForm.get('categoria')?.valueChanges.subscribe(cat => {
      if (cat === 'TECNOLOGIA') {
        this.productForm.patchValue({ material: '', dimensiones: '' });
      } else {
        this.productForm.patchValue({ mesesGarantia: null, voltaje: '' });
      }
    });
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.inventoryService
      .getProducts()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.products.set(data);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected openNewProductForm(): void {
    this.editingProduct.set(null);
    this.productForm.reset({
      sku: '',
      categoria: 'TECNOLOGIA',
      precio: 0,
      costo: 0,
      stock: 0,
      stockMinimo: 0,
      estado: 'DISPONIBLE'
    });
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected openEditForm(product: Product): void {
    this.editingProduct.set(product);

    this.productForm.patchValue({
      id: product.id,
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion,
      categoria: product.categoria,
      marca: product.marca,
      modelo: product.modelo,
      precio: product.precio,
      costo: product.costo,
      stock: product.stock,
      stockMinimo: product.stockMinimo,
      sucursal: product.sucursal,
      estado: product.estado,
      mesesGarantia: product.categoria === 'TECNOLOGIA' ? product.mesesGarantia : null,
      voltaje: product.categoria === 'TECNOLOGIA' ? product.voltaje : '',
      material: product.categoria === 'HOGAR' ? product.material : '',
      dimensiones: product.categoria === 'HOGAR' ? product.dimensiones : '',
    });
    
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  protected showSkuField(): boolean {
    return this.editingProduct() !== null;
  }

  protected hasAllowedBranchError(): boolean {
    const field = this.productForm.get('sucursal');
    return !!field && field.hasError('allowedBranch') && (field.dirty || field.touched);
  }

  protected submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.productForm.getRawValue();
    const productData = { ...formValue } as any;

    // Clean up unnecessary fields based on category
    if (productData.categoria === 'TECNOLOGIA') {
      delete productData.material;
      delete productData.dimensiones;
    } else {
      delete productData.mesesGarantia;
      delete productData.voltaje;
    }

    this.inventoryService
      .saveProduct(productData as Product)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (savedProduct) => {
          this.successMessage.set(`Producto ${savedProduct.sku} guardado correctamente.`);
          this.closeForm();
          this.loadData();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected isCategory(cat: ProductCategory): boolean {
    return this.productForm.get('categoria')?.value === cat;
  }
}
