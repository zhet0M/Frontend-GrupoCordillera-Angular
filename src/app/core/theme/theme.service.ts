import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'grupo-cordillera-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<ThemeMode>(this.readStoredTheme());
  readonly isLight = computed(() => this.theme() === 'light');

  constructor() {
    effect(() => {
      const mode = this.theme();
      const body = this.document.body;
      const root = this.document.documentElement;

      body.classList.toggle('theme-light', mode === 'light');
      body.classList.toggle('theme-dark', mode === 'dark');
      root.classList.toggle('theme-light', mode === 'light');
      root.classList.toggle('theme-dark', mode === 'dark');
      root.style.colorScheme = mode;

      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // Ignore storage failures and keep the in-memory theme.
      }
    });
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  private readStoredTheme(): ThemeMode {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }
}
