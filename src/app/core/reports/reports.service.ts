import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/reportes`;

  downloadSalesReport(inicio?: string, fin?: string): Observable<HttpResponse<Blob>> {
    const params = this.buildDateParams(inicio, fin);

    return this.http
      .get(`${this.apiUrl}/ventas/pdf`, {
        responseType: 'blob' as const,
        observe: 'response' as const,
        params,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  downloadInventoryReport(): Observable<HttpResponse<Blob>> {
    return this.http
      .get(`${this.apiUrl}/inventario/pdf`, {
        responseType: 'blob' as const,
        observe: 'response' as const,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  downloadFinanceReport(inicio?: string, fin?: string): Observable<HttpResponse<Blob>> {
    const params = this.buildDateParams(inicio, fin);

    return this.http
      .get(`${this.apiUrl}/finanzas/pdf`, {
        responseType: 'blob' as const,
        observe: 'response' as const,
        params,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  private buildDateParams(inicio?: string, fin?: string): HttpParams {
    let params = new HttpParams();

    if (inicio) {
      params = params.set('inicio', inicio);
    }

    if (fin) {
      params = params.set('fin', fin);
    }

    return params;
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return throwError(() => new Error('No se pudo conectar con el microservicio de reportes.'));
      }

      if (error.error instanceof Blob) {
        return throwError(() => new Error('No se pudo generar el PDF.'));
      }

      if (typeof error.error === 'string' && error.error.trim()) {
        return throwError(() => new Error(error.error));
      }

      if (error.error && typeof error.error.message === 'string') {
        return throwError(() => new Error(error.error.message));
      }
    }

    return throwError(() => new Error('Ocurrió un error inesperado al generar el reporte.'));
  }
}
