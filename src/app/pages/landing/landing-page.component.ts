import { NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { METABASE_EMBED_URL } from '../../core/config/metabase.config';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-landing-page',
  imports: [NgIf, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  private readonly themeService = inject(ThemeService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly theme = this.themeService.theme;
  protected readonly themeLabel = computed(() =>
    this.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro',
  );
  protected readonly themeIcon = computed(() => (this.theme() === 'dark' ? '☀' : '☾'));
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly metabaseConfigured = !METABASE_EMBED_URL.includes('REEMPLAZAR');
  protected readonly metabaseEmbedUrl: SafeResourceUrl | null = this.metabaseConfigured
    ? this.sanitizer.bypassSecurityTrustResourceUrl(METABASE_EMBED_URL)
    : null;

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
