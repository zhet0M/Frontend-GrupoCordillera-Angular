export type ProductCategory = 'TECNOLOGIA' | 'HOGAR';
export type ProductStatus = 'DISPONIBLE' | 'AGOTADO' | 'DESCONTINUADO';

export interface BaseProduct {
  id?: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria: ProductCategory;
  marca?: string;
  modelo?: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  sucursal: string;
  estado?: ProductStatus;
  fechaIngreso?: string;
}

export interface TechnologyProduct extends BaseProduct {
  categoria: 'TECNOLOGIA';
  mesesGarantia?: number;
  voltaje?: string;
}

export interface HomeProduct extends BaseProduct {
  categoria: 'HOGAR';
  material?: string;
  dimensiones?: string;
}

export type Product = TechnologyProduct | HomeProduct;

export interface DeductStockRequest {
  cantidad: number;
}