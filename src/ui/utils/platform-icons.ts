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
    // Smartphone icon (iOS)
    iOS: 'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 18h0',

    // Monitor icon (macOS)
    macOS:
      'M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 21h8M12 17v4',

    // Glasses icon (visionOS)
    visionOS:
      'M6 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6-2h0M2 13c0-2 1-3 3-3h14c2 0 3 1 3 3',

    // TV icon (tvOS)
    tvOS: 'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM17 2l-5 5-5-5',

    // Watch icon (watchOS)
    watchOS:
      'M9 18V5l3-3 3 3v13M9 5h6M9 18h6M6 9h12a3 3 0 0 1 3 3 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3 3 3 0 0 1 3-3z',
  };

  return pathMap[platform] || 'M12 2v20m10-10H2'; // Default to generic store icon
}
