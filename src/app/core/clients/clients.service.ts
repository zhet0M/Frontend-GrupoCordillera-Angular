import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Client, ClientRequest } from './clients.models';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/clientes';

  getClients(): Observable<Client[]> {
    return this.http
      .get<Client[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getClientById(id: number): Observable<Client> {
    return this.http
      .get<Client>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  createClient(clientRequest: ClientRequest): Observable<Client> {
    return this.http
      .post<Client>(this.apiUrl, clientRequest)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateClient(id: number, clientRequest: ClientRequest): Observable<Client> {
    return this.http
      .put<Client>(`${this.apiUrl}/${id}`, clientRequest)
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
        return throwError(() => new Error('No se pudo conectar con el microservicio de clientes.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('No tienes permisos para realizar esta acción.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intenta nuevamente.'));
  }
}