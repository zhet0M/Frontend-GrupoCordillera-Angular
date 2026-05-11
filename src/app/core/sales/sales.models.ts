export type SaleChannel = 'POS' | 'ECOMMERCE';
export type FinanceState = 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';
export type ClientSnapshotType = 'REGULAR' | 'FRECUENTE' | 'VIP' | 'CORPORATIVO' | 'MAYORISTA';

export interface Sale {
  id?: number;
  sucursal: string;
  
  // Cliente info (opcional para POS, obligatorio para ECOMMERCE)
  clienteId?: number;
  nombreCliente?: string;
  apellidoCliente?: string;
  emailCliente?: string;
  telefonoCliente?: string;
  direccionCliente?: string;
  tipoClienteSnapshot?: ClientSnapshotType;
  
  // Producto info
  productoId?: number;
  skuProducto: string;
  nombreProducto?: string;
  precioUnitario?: number;
  
  // Venta info
  cantidad: number;
  montoTotal?: number;
  fecha?: string;
  canal: SaleChannel;
  
  // Finanzas info
  estadoFinanzas?: FinanceState;
  intentosFinanzas?: number;
  ultimoErrorFinanzas?: string;
  fechaUltimoIntentoFinanzas?: string;
}

export interface SaleCreateRequest {
  sucursal: string;
  skuProducto: string;
  cantidad: number;
  canal: SaleChannel;
  clienteId?: number | null;
}