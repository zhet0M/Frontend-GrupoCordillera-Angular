export type TransactionType = 'INGRESO' | 'EGRESO' | 'AJUSTE';

export interface FinanceTransaction {
  id?: number;
  ventaId?: number;
  productoId?: number;
  skuProducto: string;
  nombreProducto?: string;
  cantidad: number;
  ingresos: number;
  costo: number;
  margen: number;
  fechaRegistro: string;
  sucursal: string;
  tipoMovimiento: TransactionType;
}

export interface FinanceTransactionRequest {
  ventaId?: number | null;
  productoId?: number | null;
  skuProducto: string;
  nombreProducto?: string | null;
  cantidad: number;
  ingresos: number;
  costo?: number | null;
  fechaRegistro?: string | null;
  sucursal: string;
  tipoMovimiento: TransactionType;
}

export interface FinanceSummary {
  ingresos: number;
  costo: number;
  margen: number;
}