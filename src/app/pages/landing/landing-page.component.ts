import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly theme = this.themeService.theme;
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly themeLabel = computed(() =>
    this.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro',
  );

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
