import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserSession } from '../../core/auth/auth.models';
import { UsersAdminPanelComponent } from './components/users-admin-panel.component';

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
    roles: ['SUPER_ADMIN', 'ADMIN_VENTAS'],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: '04',
    description: 'Control de stock, reposicion y visibilidad de productos criticos.',
    summary: 'Entrega foco operativo sobre abastecimiento y niveles de inventario.',
    metricLabel: 'Stock critico',
    metricValue: 'En monitoreo',
    roles: ['SUPER_ADMIN', 'ADMIN_INVENTARIO'],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: '05',
    description: 'Resumen financiero, movimientos y control del flujo economico.',
    summary: 'Centraliza informacion financiera para analisis y seguimiento.',
    metricLabel: 'Balance diario',
    metricValue: 'Disponible',
    roles: ['SUPER_ADMIN', 'ADMIN_FINANZAS'],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: '06',
    description: 'Consulta de clientes, relacion comercial y actividad asociada.',
    summary: 'Ayuda a mantener el seguimiento del ciclo comercial del cliente.',
    metricLabel: 'Base comercial',
    metricValue: 'Activa',
    roles: ['SUPER_ADMIN', 'ADMIN_CLIENTES'],
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
  imports: [CommonModule, UsersAdminPanelComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly session = signal<UserSession | null>(this.authService.getSession());
  protected readonly activeTabId = signal('');

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
  }

  protected selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  protected logout(): void {
    this.authService.clearSession();
    this.session.set(null);
    void this.router.navigate(['/login']);
  }
}
