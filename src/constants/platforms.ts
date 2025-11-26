/**
 * Platform constants
 * Defines all supported Apple platforms
 */

export const PLATFORMS = {
  IOS: 'iOS',
  MACOS: 'macOS',
  WATCHOS: 'watchOS',
  TVOS: 'tvOS',
  VISIONOS: 'visionOS'
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

export const DEFAULT_PLATFORMS = new Set<string>([
  PLATFORMS.IOS,
  PLATFORMS.MACOS,
  PLATFORMS.WATCHOS,
  PLATFORMS.TVOS,
  PLATFORMS.VISIONOS
]);

export const PLATFORM_ICONS: Record<string, string> = {
  [PLATFORMS.IOS]: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z',
  [PLATFORMS.MACOS]: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  [PLATFORMS.WATCHOS]: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  [PLATFORMS.TVOS]: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
  [PLATFORMS.VISIONOS]: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z'
};
