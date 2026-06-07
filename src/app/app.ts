import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  template: `
    <button
      class="global-theme-toggle"
      type="button"
      *ngIf="!isLanding()"
      [attr.aria-pressed]="theme() === 'light'"
      [attr.aria-label]="theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      (click)="toggleTheme()"
    >
      {{ themeLabel() }}
    </button>

    <router-outlet />
  `,
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly theme = this.themeService.theme;
  protected readonly themeLabel = computed(() =>
    this.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro',
  );

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected isLanding(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }
}
