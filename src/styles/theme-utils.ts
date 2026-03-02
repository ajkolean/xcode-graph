/**
 * Theme utilities powered by colord.
 * Provides color manipulation, contrast checking, and theme detection.
 */

import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';

// Enable accessibility plugin for contrast checks
extend([a11yPlugin]);

/**
 * Check if the user prefers dark mode.
 */
export function prefersDarkMode(): boolean {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

/**
 * Listen for color scheme changes.
 * @param callback - Called with `true` when dark mode is active, `false` otherwise
 * @returns Cleanup function to remove the listener
 */
export function onColorSchemeChange(callback: (isDark: boolean) => void): () => void {
  const mql = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mql)
    return () => {
      /* no-op: matchMedia unavailable */
    };
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

/**
 * Get the WCAG contrast ratio between two colors.
 */
export function contrastRatio(color1: string, color2: string): number {
  return colord(color1).contrast(color2);
}

/**
 * Check if two colors meet the given WCAG contrast level.
 */
export function meetsContrast(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  return colord(color1).isReadable(color2, { level });
}

/**
 * Ensure a color meets minimum contrast against a background.
 * Adjusts lightness until contrast requirement is met.
 */
export function ensureContrast(fg: string, bg: string, level: 'AA' | 'AAA' = 'AA'): string {
  let adjusted = colord(fg);
  const background = colord(bg);
  const isDarkBg = background.isDark();

  for (let i = 0; i < 20; i++) {
    if (adjusted.isReadable(background, { level })) {
      return adjusted.toHex();
    }
    adjusted = isDarkBg ? adjusted.lighten(0.05) : adjusted.darken(0.05);
  }
  return adjusted.toHex();
}

/**
 * Set the alpha channel of a color.
 */
export function withAlpha(color: string, alpha: number): string {
  return colord(color).alpha(alpha).toRgbString();
}

/**
 * Lighten a color by a percentage (0-1).
 */
export function lighten(color: string, amount: number): string {
  return colord(color).lighten(amount).toHex();
}

/**
 * Darken a color by a percentage (0-1).
 */
export function darken(color: string, amount: number): string {
  return colord(color).darken(amount).toHex();
}
