/**
 * Platform icon utilities for consistent platform representation
 */

import type { Platform } from '@shared/schemas/graph.types';

/**
 * Per-platform colors for visual distinction.
 * These values match the --colors-platform-* tokens in tokens.css (dark mode).
 * Kept as hex literals because callers use string interpolation (e.g. color-mix).
 *
 * @public
 */
export const PLATFORM_COLORS: Record<Platform, string> = {
  iOS: '#007AFF', // --colors-platform-ios
  macOS: '#64D2FF', // --colors-platform-macos
  tvOS: '#B87BFF', // --colors-platform-tvos
  watchOS: '#5AC8FA', // --colors-platform-watchos
  visionOS: '#7D7AFF', // --colors-platform-visionos
};

/**
 * Default fallback platform color — matches --colors-platform-default
 *
 * @public
 */
export const PLATFORM_COLOR = '#6F2CFF';

/** Maps platform names to their CSS custom property names */
const PLATFORM_CSS_PROPS: Record<Platform, string> = {
  iOS: '--colors-platform-ios',
  macOS: '--colors-platform-macos',
  tvOS: '--colors-platform-tvos',
  watchOS: '--colors-platform-watchos',
  visionOS: '--colors-platform-visionos',
};

/**
 * Get the color for a specific platform.
 *
 * When an element is provided, reads theme-aware colors from CSS custom
 * properties (set in tokens.css). Falls back to static hex values when
 * no element is available or the property is not set.
 *
 * @param platform - Platform name (e.g., `'iOS'`, `'macOS'`)
 * @param el - Optional host element to read CSS custom properties from
 * @returns CSS color string
 *
 * @public
 */
export function getPlatformColor(platform: string, el?: HTMLElement): string {
  if (el) {
    const prop = (PLATFORM_CSS_PROPS as Record<string, string>)[platform];
    if (prop) {
      const value = getComputedStyle(el).getPropertyValue(prop).trim();
      if (value) return value;
    }
  }
  return (PLATFORM_COLORS as Record<string, string>)[platform] || PLATFORM_COLOR;
}

/**
 * Get SVG path data for platform icons (for inline SVG rendering).
 * These are simplified versions of the Lucide icons.
 *
 * @param platform - Platform name (e.g., `'iOS'`, `'macOS'`)
 * @returns SVG path `d` attribute string
 *
 * @public
 */
export function getPlatformIconPath(platform: string): string {
  const pathMap: Record<string, string> = {
    // Smartphone icon (iOS) — Lucide smartphone: rounded rect + home indicator dot
    iOS: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01',

    // Laptop icon (macOS) — Lucide laptop: MacBook silhouette with keyboard base
    macOS:
      'M18 5a2 2 0 0 1 2 2v8.5a2 2 0 0 0 .2.9l1.1 2.1a1 1 0 0 1-.9 1.5H3.6a1 1 0 0 1-.9-1.5l1.1-2.1a2 2 0 0 0 .2-.9V7a2 2 0 0 1 2-2z M20 16H4',

    // Glasses icon (visionOS) — Lucide glasses: two lens circles + temple arms + bridge
    visionOS:
      'M10 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M22 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2 M2.5 13L5 7c.7-1.3 1.4-2 3-2 M21.5 13L19 7c-.7-1.3-1.5-2-3-2',

    // TV icon (tvOS) — modern flat screen + stand bar (no antenna)
    tvOS: 'M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M8 22h8 M12 20v2',

    // Watch icon (watchOS) — Lucide watch: round face + band straps + clock hands
    watchOS:
      'M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0z M12 10v2.2l1.6 1 M16.13 7.66l-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05 M7.88 16.36l.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05',
  };

  return pathMap[platform] || 'M12 2v20m10-10H2';
}
