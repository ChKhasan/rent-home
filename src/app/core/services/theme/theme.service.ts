import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'nexthome-theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly browser: boolean;
  private readonly preferenceState = signal<ThemePreference>('system');
  private readonly resolvedState = signal<ResolvedTheme>('light');
  private mediaQuery: MediaQueryList | null = null;
  private initialized = false;

  readonly preference = this.preferenceState.asReadonly();
  readonly resolvedTheme = this.resolvedState.asReadonly();
  readonly isDark = computed(() => this.resolvedState() === 'dark');

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.browser = isPlatformBrowser(platformId);
  }

  initialize(): void {
    if (!this.browser || this.initialized) return;
    this.initialized = true;
    this.bindSystemThemeListener();
    const stored = this.readStoredPreference();
    this.preferenceState.set(stored);
    this.applyResolvedTheme();
  }

  setPreference(preference: ThemePreference): void {
    if (!this.browser) return;
    this.preferenceState.set(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Theme still applies when storage is unavailable (private mode or policy).
    }
    this.applyResolvedTheme();
  }

  private readonly handleSystemThemeChange = (): void => {
    if (this.preferenceState() === 'system') this.applyResolvedTheme();
  };

  private bindSystemThemeListener(): void {
    this.mediaQuery?.removeEventListener('change', this.handleSystemThemeChange);
    this.mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }

  private readStoredPreference(): ThemePreference {
    try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
    } catch {
      return 'system';
    }
  }

  private applyResolvedTheme(): void {
    const preference = this.preferenceState();
    const resolved: ResolvedTheme = preference === 'system'
      ? window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'
      : preference;

    this.resolvedState.set(resolved);
    const root = this.document.documentElement;
    root.dataset['theme'] = resolved;
    root.style.colorScheme = resolved;
    this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', resolved === 'dark' ? '#111312' : '#f6f7f7');
  }
}
