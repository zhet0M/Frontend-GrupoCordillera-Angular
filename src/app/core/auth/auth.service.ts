import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { LoginRequest, LoginResponse, RegisterRequest, UserRole, UserSession } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/auth';
  private readonly storageKey = 'grupo-cordillera-session';
  private readonly invalidCredentialsMessage = 'Correo o contraseña incorrectos';

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, payload)
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  register(payload: RegisterRequest): Observable<string> {
    return this.http
      .post(`${this.apiUrl}/registro`, payload, { responseType: 'text' })
      .pipe(catchError((error) => throwError(() => new Error(this.extractErrorMessage(error)))));
  }

  saveSession(session: LoginResponse): void {
    const userSession: UserSession = {
      ...session,
      authenticatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(userSession));
  }

  getSession(): UserSession | null {
    const storedSession = localStorage.getItem(this.storageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as UserSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getUserRole(): UserRole | null {
    return this.getSession()?.rol ?? null;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return this.invalidCredentialsMessage;
      }

      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el backend. Verifica que el gateway este corriendo en http://localhost:8080.';
      }
    }

    return 'No fue posible iniciar sesion. Intenta nuevamente.';
  }
}
