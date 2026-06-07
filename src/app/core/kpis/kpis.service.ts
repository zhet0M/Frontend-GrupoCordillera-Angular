import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { KpiResult, KpiType } from './kpis.models';

@Injectable({
  providedIn: 'root',
})
export class KpisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/kpis';

  getKpis(): Observable<KpiResult[]> {
    return this.http.get<KpiResult[]>(this.apiUrl).pipe(catchError(this.handleError.bind(this)));
  }

  getKpi(tipo: KpiType): Observable<KpiResult> {
    return this.http.get<KpiResult>(`${this.apiUrl}/${tipo}`).pipe(catchError(this.handleError.bind(this)));
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
        return throwError(() => new Error('No se pudo conectar con el microservicio de KPIs.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('No tienes permisos para consultar KPIs.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intenta nuevamente.'));
  }
}
