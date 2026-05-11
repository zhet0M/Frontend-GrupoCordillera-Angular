import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { UserRole } from '../auth/auth.models';
import { ApproveUserRequest, ManagedUser } from './user-management.models';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/auth/admin';

  getUsers(): Observable<ManagedUser[]> {
    return this.http
      .get<ManagedUser[]>(`${this.apiUrl}/usuarios`)
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  getPendingUsers(): Observable<ManagedUser[]> {
    return this.http
      .get<ManagedUser[]>(`${this.apiUrl}/pendientes`)
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  getAssignableRoles(): Observable<UserRole[]> {
    return this.http
      .get<UserRole[]>(`${this.apiUrl}/roles`)
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  approveUser(userId: number, rol: UserRole): Observable<ManagedUser> {
    const payload: ApproveUserRequest = { rol };

    return this.http
      .put<ManagedUser>(`${this.apiUrl}/usuarios/${userId}/aprobar`, payload)
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  rejectUser(userId: number): Observable<ManagedUser> {
    return this.http
      .put<ManagedUser>(`${this.apiUrl}/usuarios/${userId}/rechazar`, {})
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  blockUser(userId: number): Observable<ManagedUser> {
    return this.http
      .put<ManagedUser>(`${this.apiUrl}/usuarios/${userId}/bloquear`, {})
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el backend de autenticacion.';
      }
    }

    return 'No fue posible completar la operación.';
  }
}
