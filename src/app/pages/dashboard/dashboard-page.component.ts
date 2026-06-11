import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AlertsService } from '../../core/alerts/alerts.service';
import { AlertNotification } from '../../core/alerts/alerts.models';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserSession } from '../../core/auth/auth.models';
import { METABASE_EMBED_URL, SALES_METABASE_EMBED_URL, STOCK_METABASE_EMBED_URL } from '../../core/config/metabase.config';
import { UsersAdminPanelComponent } from './components/users-admin-panel.component';
import { InventoryPanelComponent } from './components/inventory-panel.component';
import { SalesPanelComponent } from './components/sales-panel.component';
import { ClientsPanelComponent } from './components/clients-panel.component';
import { FinancesPanelComponent } from './components/finances-panel.component';
import { AlertsPanelComponent } from './components/alerts-panel.component';
import { ReportsPanelComponent } from './components/reports-panel.component';
import { KpisPanelComponent } from './components/kpis-panel.component';

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  description: string;
  summary: string;
  metricLabel: string;
  metricValue: string;
  roles: readonly UserRole[];
}

const ALL_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN_USUARIOS',
  'ADMIN_VENTAS',
  'ADMIN_INVENTARIO',
  'ADMIN_FINANZAS',
  'ADMIN_CLIENTES',
  'EJECUTIVO',
  'ANALISTA',
];

const DASHBOARD_TABS: readonly DashboardTab[] = [
  {
    id: 'resumen',
    label: 'Resumen',
    icon: '01',
    description: 'Vista general del sistema con accesos rapidos y estado de operacion.',
    summary: 'Consolida el panorama principal para iniciar la jornada con contexto.',
    metricLabel: 'Estado general',
    metricValue: 'Operativo',
    roles: ALL_ROLES,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: '02',
    description: 'Panel para aprobar registros, rechazar solicitudes, bloquear accesos y asignar roles.',
    summary: 'Centraliza la administración de accesos y permisos del sistema.',
    metricLabel: 'Gestión de accesos',
    metricValue: 'Disponible',
    roles: ['SUPER_ADMIN', 'ADMIN_USUARIOS'],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: '03',
    description: 'Seguimiento comercial, volumen transaccional y control del rendimiento de ventas.',
    summary: 'Permite revisar actividad comercial y preparar decisiones del area de ventas.',
    metricLabel: 'Panel comercial',
    metricValue: 'Habilitado',
    roles: ALL_ROLES,
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: '04',
    description: 'Control de stock, reposicion y visibilidad de productos criticos.',
    summary: 'Entrega foco operativo sobre abastecimiento y niveles de inventario.',
    metricLabel: 'Stock critico',
    metricValue: 'En monitoreo',
    roles: ALL_ROLES,
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: '05',
    description: 'Resumen financiero, movimientos y control del flujo economico.',
    summary: 'Centraliza informacion financiera para analisis y seguimiento.',
    metricLabel: 'Balance diario',
    metricValue: 'Disponible',
    roles: ALL_ROLES,
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: '06',
    description: 'Consulta de clientes, relacion comercial y actividad asociada.',
    summary: 'Ayuda a mantener el seguimiento del ciclo comercial del cliente.',
    metricLabel: 'Base comercial',
    metricValue: 'Activa',
    roles: ALL_ROLES,
  },
  {
    id: 'kpis',
    label: 'KPIs',
    icon: '07',
    description: 'Indicadores transversales para comparacion de periodos y lectura ejecutiva.',
    summary: 'Entrega una capa comun de seguimiento para cualquier usuario autenticado.',
    metricLabel: 'Indicadores',
    metricValue: 'Listos',
    roles: ALL_ROLES,
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: '08',
    description: 'Eventos operativos relevantes para reaccion rapida y seguimiento continuo.',
    summary: 'Visibiliza alertas importantes sin importar el modulo principal del usuario.',
    metricLabel: 'Prioridad',
    metricValue: 'Monitoreada',
    roles: ALL_ROLES,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: '09',
    description: 'Analisis consolidado y reportes orientados a toma de decisiones.',
    summary: 'Disponible para perfiles ejecutivos y analiticos con foco en lectura global.',
    metricLabel: 'Informes',
    metricValue: 'Preparados',
    roles: ['SUPER_ADMIN', 'EJECUTIVO', 'ANALISTA'],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_USUARIOS: 'Admin Usuarios',
  ADMIN_VENTAS: 'Admin Ventas',
  ADMIN_INVENTARIO: 'Admin Inventario',
  ADMIN_FINANZAS: 'Admin Finanzas',
  ADMIN_CLIENTES: 'Admin Clientes',
  EJECUTIVO: 'Ejecutivo',
  ANALISTA: 'Analista',
};

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, UsersAdminPanelComponent, InventoryPanelComponent, SalesPanelComponent, ClientsPanelComponent, FinancesPanelComponent, AlertsPanelComponent, ReportsPanelComponent, KpisPanelComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly alertsService = inject(AlertsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertsRefreshHandle = window.setInterval(() => this.refreshAlerts(), 15000);

  protected readonly session = signal<UserSession | null>(this.authService.getSession());
  protected readonly activeTabId = signal('');
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isAlertsOpen = signal(false);
  protected readonly alerts = signal<AlertNotification[]>([]);
  protected readonly unreadAlertsCount = signal(0);
  protected readonly isAlertsLoading = signal(false);
  protected readonly alertsError = signal('');
  protected readonly financeMetabaseConfigured = !METABASE_EMBED_URL.includes('REEMPLAZAR');
  protected readonly salesMetabaseConfigured = !SALES_METABASE_EMBED_URL.includes('REEMPLAZAR');
  protected readonly stockMetabaseConfigured = !STOCK_METABASE_EMBED_URL.includes('REEMPLAZAR');
  protected readonly financeMetabaseEmbedUrl: SafeResourceUrl | null = this.financeMetabaseConfigured
    ? this.sanitizer.bypassSecurityTrustResourceUrl(METABASE_EMBED_URL)
    : null;
  protected readonly salesMetabaseEmbedUrl: SafeResourceUrl | null = this.salesMetabaseConfigured
    ? this.sanitizer.bypassSecurityTrustResourceUrl(SALES_METABASE_EMBED_URL)
    : null;
  protected readonly stockMetabaseEmbedUrl: SafeResourceUrl | null = this.stockMetabaseConfigured
    ? this.sanitizer.bypassSecurityTrustResourceUrl(STOCK_METABASE_EMBED_URL)
    : null;

  protected readonly visibleTabs = computed(() => {
    const role = this.session()?.rol;

    if (!role) {
      return [];
    }

    return DASHBOARD_TABS.filter((tab) => tab.roles.includes(role));
  });

  protected readonly activeTab = computed(() => {
    const tabs = this.visibleTabs();
    return tabs.find((tab) => tab.id === this.activeTabId()) ?? tabs[0] ?? null;
  });

  protected readonly displayRole = computed(() => {
    const role = this.session()?.rol;
    return role ? ROLE_LABELS[role] : 'Sin rol';
  });

  protected readonly notificationLabel = computed(() => {
    const unread = this.unreadAlertsCount();
    if (unread <= 0) {
      return '';
    }

    return unread > 99 ? '+99' : String(unread);
  });

  constructor() {
    effect(() => {
      const tabs = this.visibleTabs();
      const currentTabId = this.activeTabId();

      if (!tabs.length) {
        this.activeTabId.set('');
        return;
      }

      if (!tabs.some((tab) => tab.id === currentTabId)) {
        this.activeTabId.set(tabs[0].id);
      }
    });

    this.refreshAlerts();
  }

  public ngOnDestroy(): void {
    window.clearInterval(this.alertsRefreshHandle);
  }

  protected selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
    this.isMobileMenuOpen.set(false);
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected toggleAlertsPanel(): void {
    this.isAlertsOpen.update((open) => !open);

    if (this.isAlertsOpen()) {
      this.refreshAlerts();
    }
  }

  protected closeAlertsPanel(): void {
    this.isAlertsOpen.set(false);
  }

  protected openAlert(alert: AlertNotification): void {
    const targetTab = this.resolveTargetTab(alert.tipo);

    if (targetTab) {
      this.selectTab(targetTab);
    }

    this.closeAlertsPanel();
    this.markAlertAsRead(alert.id);
  }

  protected markAllAlertsAsRead(): void {
    this.alertsService.markAllAsRead().subscribe({
      next: () => this.refreshAlerts(),
      error: (error: Error) => {
        this.alertsError.set(error.message);
      },
    });
  }

  protected logout(): void {
    this.authService.clearSession();
    this.session.set(null);
    void this.router.navigate(['/login']);
  }

  private refreshAlerts(): void {
    this.isAlertsLoading.set(true);
    this.alertsError.set('');

    this.alertsService.getSummary().subscribe({
      next: (summary) => {
        this.unreadAlertsCount.set(summary.noLeidas);
        this.alerts.set(summary.alertas);
        this.isAlertsLoading.set(false);
      },
      error: (error: Error) => {
        this.alertsError.set(error.message);
        this.isAlertsLoading.set(false);
      },
    });
  }

  private markAlertAsRead(id: number): void {
    this.alertsService.markAsRead(id).subscribe({
      next: () => this.refreshAlerts(),
      error: (error: Error) => {
        this.alertsError.set(error.message);
      },
    });
  }

  private resolveTargetTab(type: string): string | null {
    switch (type) {
      case 'STOCK_CRITICO':
        return 'inventario';
      case 'VENTAS_BAJAS':
        return 'ventas';
      case 'MARGEN_NORMALIZADO':
        return 'finanzas';
      default:
        return 'resumen';
    }
  }
}
