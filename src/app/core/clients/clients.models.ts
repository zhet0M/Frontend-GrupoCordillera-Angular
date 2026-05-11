export type ClientType = 'REGULAR' | 'FRECUENTE' | 'VIP' | 'CORPORATIVO' | 'MAYORISTA';
export type ClientState = 'ACTIVO' | 'INACTIVO';

export interface Client {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoCliente: ClientType;
  estado: ClientState;
  fechaRegistro?: string;
  cantidadCompras?: number;
  montoAcumulado?: number;
  ultimaFechaCompra?: string;
}

export interface ClientRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoCliente: ClientType;
  estado: ClientState;
}