import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { KpisService } from '../../../core/kpis/kpis.service';
import { KpiResult } from '../../../core/kpis/kpis.models';

type KpiDomainTabId = 'resumen' | 'ventas' | 'inventario' | 'finanzas' | 'clientes';

interface KpiDomainTab {
  id: KpiDomainTabId;
  label: string;
  description: string;
  types: readonly string[];
}

const KPI_DOMAIN_TABS: readonly KpiDomainTab[] = [
  {
    id: 'resumen',
    label: 'Resumen',
    description: 'Vista general de todos los KPIs del sistema.',
    types: [],
  },
  {
    id: 'ventas',
    label: 'KPIs Ventas',
    description: 'Indicadores de rendimiento comercial y comportamiento de ventas.',
    types: ['VENTAS_DIA', 'VENTAS_SEMANA', 'VENTAS_MES', 'VENTAS_POR_SUCURSAL', 'VENTAS_POR_CANAL', 'TICKET_PROMEDIO', 'VARIACION_MENSUAL', 'SUCURSAL_MEJOR_RENDIMIENTO'],
  },
  {
    id: 'inventario',
    label: 'KPIs Inventario',
    description: 'Stock, rotación y valor total del inventario.',
    types: ['STOCK_BAJO_MINIMO', 'ROTACION_INVENTARIO', 'INVENTARIO_TOTAL_VALOR'],
  },
  {
    id: 'finanzas',
    label: 'KPIs Finanzas',
    description: 'Ingresos, rentabilidad, costos y utilidad neta.',
    types: ['INGRESOS_TOTALES', 'MARGEN_RENTABILIDAD', 'COSTOS_OPERACIONALES', 'UTILIDAD_NETA'],
  },
  {
    id: 'clientes',
    label: 'KPIs Clientes',
    description: 'Actividad y comportamiento de clientes.',
    types: ['CLIENTES_NUEVOS', 'CLIENTES_FRECUENTES'],
  },
];

const KPI_LABELS: Record<string, string> = {
  VENTAS_DIA: 'Ventas del día',
  VENTAS_SEMANA: 'Ventas de la semana',
  VENTAS_MES: 'Ventas del mes',
  VENTAS_POR_SUCURSAL: 'Ventas por sucursal',
  VENTAS_POR_CANAL: 'Ventas por canal',
  TICKET_PROMEDIO: 'Ticket promedio',
  VARIACION_MENSUAL: 'Variación mensual',
  SUCURSAL_MEJOR_RENDIMIENTO: 'Mejor sucursal',
  STOCK_BAJO_MINIMO: 'Stock bajo mínimo',
  ROTACION_INVENTARIO: 'Rotación de inventario',
  INVENTARIO_TOTAL_VALOR: 'Valor total inventario',
  INGRESOS_TOTALES: 'Ingresos totales',
  MARGEN_RENTABILIDAD: 'Margen de rentabilidad',
  COSTOS_OPERACIONALES: 'Costos operacionales',
  UTILIDAD_NETA: 'Utilidad neta',
  CLIENTES_NUEVOS: 'Clientes nuevos',
  CLIENTES_FRECUENTES: 'Clientes frecuentes',
};

const KPI_TYPES_WITH_VARIATION = new Set<string>([
  'VENTAS_DIA',
  'VENTAS_SEMANA',
  'VENTAS_MES',
  'VARIACION_MENSUAL',
  'INGRESOS_TOTALES',
  'MARGEN_RENTABILIDAD',
  'COSTOS_OPERACIONALES',
  'UTILIDAD_NETA',
]);

@Component({
  selector: 'app-kpis-panel',
  imports: [CommonModule],
  templateUrl: './kpis-panel.component.html',
  styleUrl: './kpis-panel.component.css',
})
export class KpisPanelComponent {
  private readonly kpisService = inject(KpisService);

  protected readonly kpis = signal<KpiResult[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly activeTabId = signal<KpiDomainTabId>('resumen');

  protected readonly tabs = KPI_DOMAIN_TABS;

  protected readonly activeTab = computed(() => this.tabs.find((tab) => tab.id === this.activeTabId()) ?? this.tabs[0]);

  protected readonly visibleKpis = computed(() => {
    const activeTab = this.activeTab();

    if (!activeTab || activeTab.id === 'resumen') {
      return this.kpis();
    }

    return this.kpis().filter((kpi) => activeTab.types.includes(kpi.tipo));
  });

  protected readonly totalPositivos = computed(() => this.visibleKpis().filter((kpi) => kpi.estado === 'POSITIVO').length);
  protected readonly totalNegativos = computed(() => this.visibleKpis().filter((kpi) => kpi.estado === 'NEGATIVO').length);
  protected readonly totalNeutros = computed(() => this.visibleKpis().filter((kpi) => kpi.estado === 'NEUTRO' || kpi.estado === 'SIN_DATOS').length);

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.kpisService.getKpis().subscribe({
      next: (data) => {
        this.kpis.set(data);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  protected selectTab(tabId: KpiDomainTabId): void {
    this.activeTabId.set(tabId);
  }

  protected kpiLabel(tipo: string): string {
    return KPI_LABELS[tipo] ?? tipo;
  }

  protected hasVariation(tipo: string): boolean {
    return KPI_TYPES_WITH_VARIATION.has(tipo);
  }

  protected variationLabel(kpi: KpiResult): string {
    if (!this.hasVariation(kpi.tipo)) {
      return 'N/A';
    }

    const value = Number(kpi.variacion ?? 0);
    return `${value.toFixed(2)}%`;
  }

  protected variationStateClass(kpi: KpiResult): string {
    if (!this.hasVariation(kpi.tipo)) {
      return 'state-neutral';
    }

    const value = Number(kpi.variacion ?? 0);
    if (value > 0) return 'state-positive';
    if (value < 0) return 'state-negative';
    return 'state-neutral';
  }

  protected trackByTipo(_index: number, kpi: KpiResult): string {
    return kpi.tipo;
  }
}
