import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { FinanceTransaction, FinanceTransactionRequest, FinanceSummary } from './finances.models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class FinancesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/finanzas`;

  getTransactions(): Observable<FinanceTransaction[]> {
    return this.http
      .get<FinanceTransaction[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getGeneralSummary(): Observable<FinanceSummary> {
    return this.http
      .get<FinanceSummary>(`${this.apiUrl}/total`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  registerTransaction(request: FinanceTransactionRequest): Observable<FinanceTransaction> {
    return this.http
      .post<FinanceTransaction>(this.apiUrl, request)
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
        return throwError(() => new Error('No se pudo conectar con el microservicio de finanzas.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('No tienes permisos para realizar esta acción.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intenta nuevamente.'));
  }
}
