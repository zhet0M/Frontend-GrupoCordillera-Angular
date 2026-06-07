export type KpiState = 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | 'SIN_DATOS';

export type KpiType =
  | 'VENTAS_DIA'
  | 'VENTAS_SEMANA'
  | 'VENTAS_MES'
  | 'VENTAS_POR_SUCURSAL'
  | 'VENTAS_POR_CANAL'
  | 'TICKET_PROMEDIO'
  | 'VARIACION_MENSUAL'
  | 'SUCURSAL_MEJOR_RENDIMIENTO'
  | 'STOCK_BAJO_MINIMO'
  | 'ROTACION_INVENTARIO'
  | 'INVENTARIO_TOTAL_VALOR'
  | 'INGRESOS_TOTALES'
  | 'MARGEN_RENTABILIDAD'
  | 'COSTOS_OPERACIONALES'
  | 'UTILIDAD_NETA'
  | 'CLIENTES_NUEVOS'
  | 'CLIENTES_FRECUENTES';

export interface KpiResult {
  tipo: KpiType;
  valor: number;
  variacion: number;
  estado: KpiState;
  periodo: string;
  descripcion: string;
  fuenteDatos: string;
  detalles: Record<string, number>;
}
