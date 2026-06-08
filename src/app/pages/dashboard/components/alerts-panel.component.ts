import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AlertNotification } from '../../../core/alerts/alerts.models';
import { AlertsService } from '../../../core/alerts/alerts.service';

@Component({
  selector: 'app-alerts-panel',
  imports: [CommonModule, DatePipe],
  templateUrl: './alerts-panel.component.html',
  styleUrl: './alerts-panel.component.css',
})
export class AlertsPanelComponent {
  private readonly alertsService = inject(AlertsService);

  protected readonly alerts = signal<AlertNotification[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly searchQuery = signal('');
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');

  protected readonly filteredAlerts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const start = this.startDate() || '';
    const end = this.endDate() || '';

    return this.alerts().filter((alert) => {
      const haystack = `${alert.titulo} ${alert.detalle} ${alert.tituloCompleto} ${alert.tiempoRelativo}`.toLowerCase();
      const createdAt = this.toDateKey(alert.fechaCreacion);

      return (
        (!query || haystack.includes(query)) &&
        (!start || createdAt >= start) &&
        (!end || createdAt <= end)
      );
    });
  });

  protected readonly totalAlerts = computed(() => this.alerts().length);
  protected readonly unreadAlerts = computed(() => this.alerts().filter((alert) => !alert.leida).length);
  protected readonly readAlerts = computed(() => this.alerts().filter((alert) => alert.leida).length);

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.alertsService
      .getAlerts()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.alerts.set(
            data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()),
          );
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected markAsRead(alert: AlertNotification): void {
    if (alert.leida) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.alertsService
      .markAsRead(alert.id)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Alerta marcada como leída.');
          this.loadData();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected markAllAsRead(): void {
    if (!this.totalAlerts()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.alertsService
      .markAllAsRead()
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Todas las alertas se marcaron como leídas.');
          this.loadData();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.startDate.set('');
    this.endDate.set('');
  }

  protected openDatePicker(input: HTMLInputElement): void {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  private toDateKey(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value.slice(0, 10);
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
