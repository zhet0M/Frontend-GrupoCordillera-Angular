import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Sale, SaleCreateRequest } from './sales.models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/ventas`;

  getSales(): Observable<Sale[]> {
    return this.http
      .get<Sale[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getSalesByBranch(sucursal: string): Observable<Sale[]> {
    return this.http
      .get<Sale[]>(`${this.apiUrl}/sucursal/${sucursal}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getSalesToday(): Observable<Sale[]> {
    return this.http
      .get<Sale[]>(`${this.apiUrl}/hoy`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  registerSale(saleRequest: SaleCreateRequest): Observable<Sale> {
    return this.http
      .post<Sale>(this.apiUrl, saleRequest)
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
        return throwError(() => new Error('No se pudo conectar con el microservicio de ventas.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('No tienes permisos para realizar esta acción.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intenta nuevamente.'));
  }
}
