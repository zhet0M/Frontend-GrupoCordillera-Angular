import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { AlertNotification, AlertsSummaryResponse } from './alerts.models';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/alertas';

  getSummary(): Observable<AlertsSummaryResponse> {
    return this.http
      .get<AlertsSummaryResponse>(`${this.apiUrl}/resumen`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAlerts(): Observable<AlertNotification[]> {
    return this.http
      .get<AlertNotification[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  markAsRead(id: number): Observable<AlertNotification> {
    return this.http
      .put<AlertNotification>(`${this.apiUrl}/${id}/leer`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  markAllAsRead(): Observable<AlertNotification[]> {
    return this.http
      .put<AlertNotification[]>(`${this.apiUrl}/leer-todas`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return throwError(() => new Error(error.error));
      }
      if (error.error && typeof error.error.message === 'string') {
        return throwError(() => new Error(error.error.message));
      }
      if (error.status === 0) {
        return throwError(() => new Error('No se pudo conectar con el microservicio de alertas.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('No tienes permisos para consultar alertas.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intenta nuevamente.'));
  }
}
