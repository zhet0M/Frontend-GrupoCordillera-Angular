import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { UserSession } from '../../core/auth/auth.models';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly session = signal<UserSession | null>(this.authService.getSession());
  protected readonly isAuthenticated = computed(() => this.session() !== null);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  protected submit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.authService.saveSession(response);
          this.session.set(this.authService.getSession());
          this.successMessage.set('');
          this.loginForm.reset({
            email: response.email,
            password: '',
          });
          void this.router.navigate(['/dashboard']);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  protected logout(): void {
    this.authService.clearSession();
    this.session.set(null);
    this.successMessage.set('Sesion cerrada correctamente.');
    this.errorMessage.set('');
    this.loginForm.reset({
      email: '',
      password: '',
    });
  }

  protected hasFieldError(fieldName: 'email' | 'password'): boolean {
    const field = this.loginForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }
}
