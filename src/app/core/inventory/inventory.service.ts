import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Product, DeductStockRequest } from './inventory.models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/inventario`;

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getProductBySku(sku: string): Observable<Product> {
    return this.http
      .get<Product>(`${this.apiUrl}/sku/${sku}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getProductsByBranch(sucursal: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.apiUrl}/sucursal/${sucursal}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  saveProduct(product: Product): Observable<Product> {
    return this.http
      .post<Product>(this.apiUrl, product)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deductStock(sku: string, cantidad: number): Observable<Product> {
    const payload: DeductStockRequest = { cantidad };
    return this.http
      .put<Product>(`${this.apiUrl}/descontar/${sku}`, payload)
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
        return throwError(() => new Error('No se pudo conectar con el microservicio de inventario.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('No tienes permisos para realizar esta acción.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intenta nuevamente.'));
  }
}
