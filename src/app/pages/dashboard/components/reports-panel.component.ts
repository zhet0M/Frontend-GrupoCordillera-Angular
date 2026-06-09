import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';

import { ReportsService } from '../../../core/reports/reports.service';

@Component({
  selector: 'app-reports-panel',
  imports: [CommonModule],
  templateUrl: './reports-panel.component.html',
  styleUrl: './reports-panel.component.css',
})
export class ReportsPanelComponent {
  private readonly reportsService = inject(ReportsService);

  protected readonly salesStartDate = signal('');
  protected readonly salesEndDate = signal('');
  protected readonly financeStartDate = signal('');
  protected readonly financeEndDate = signal('');
  protected readonly isGenerating = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');

  protected generateSalesReport(): void {
    this.download(() => this.reportsService.downloadSalesReport(this.salesStartDate(), this.salesEndDate()), 'reporte-ventas.pdf');
  }

  protected generateInventoryReport(): void {
    this.download(() => this.reportsService.downloadInventoryReport(), 'reporte-inventario.pdf');
  }

  protected generateFinanceReport(): void {
    this.download(() => this.reportsService.downloadFinanceReport(this.financeStartDate(), this.financeEndDate()), 'reporte-finanzas.pdf');
  }

  protected clearSalesDates(): void {
    this.salesStartDate.set('');
    this.salesEndDate.set('');
  }

  protected clearFinanceDates(): void {
    this.financeStartDate.set('');
    this.financeEndDate.set('');
  }

  protected openDatePicker(input: HTMLInputElement): void {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  private download(request: () => Observable<HttpResponse<Blob>>, fallbackFilename: string): void {
    this.isGenerating.set(true);
    this.message.set('');
    this.errorMessage.set('');

    request()
      .pipe(finalize(() => this.isGenerating.set(false)))
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (!blob) {
            this.errorMessage.set('El servidor no devolvió un archivo PDF.');
            return;
          }

          const filename = this.extractFilename(response.headers.get('content-disposition')) ?? fallbackFilename;
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = filename;
          anchor.click();
          URL.revokeObjectURL(url);

          this.message.set(`Reporte generado: ${filename}`);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  private extractFilename(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const match = /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(contentDisposition);
    return match?.[1] ? decodeURIComponent(match[1].replace(/\"/g, '').trim()) : null;
  }
}
