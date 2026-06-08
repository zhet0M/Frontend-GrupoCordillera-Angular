export type AlertType = 'STOCK_CRITICO' | 'VENTAS_BAJAS' | 'MARGEN_NORMALIZADO' | 'INFORMACION';

export interface AlertNotification {
  id: number;
  tipo: AlertType;
  icono: string;
  titulo: string;
  detalle: string;
  tituloCompleto: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string | null;
  tiempoRelativo: string;
}

export interface AlertsSummaryResponse {
  noLeidas: number;
  alertas: AlertNotification[];
}
