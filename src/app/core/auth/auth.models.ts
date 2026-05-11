export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_USUARIOS'
  | 'ADMIN_VENTAS'
  | 'ADMIN_INVENTARIO'
  | 'ADMIN_FINANZAS'
  | 'ADMIN_CLIENTES'
  | 'EJECUTIVO'
  | 'ANALISTA';

export type UserStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'BLOQUEADO';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  rol: UserRole;
}

export interface UserSession extends LoginResponse {
  authenticatedAt: string;
}
