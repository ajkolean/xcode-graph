/**
 * Platform icon utilities for consistent platform representation
 */
/** Per-platform colors for visual distinction */
export declare const PLATFORM_COLORS: Record<string, string>;
/** Default fallback platform color */
export declare const PLATFORM_COLOR = "#6F2CFF";
/**
 * Get the color for a specific platform.
 *
 * @param platform - Platform name (e.g., `'iOS'`, `'macOS'`)
 * @returns Hex color string
 */
export declare function getPlatformColor(platform: string): string;
/**
 * Get the appropriate Lucide icon component name for a platform
 */
export declare function getPlatformIconName(platform: string): string;
/**
 * Get SVG path data for platform icons (for inline SVG rendering).
 * These are simplified versions of the Lucide icons.
 *
 * @param platform - Platform name (e.g., `'iOS'`, `'macOS'`)
 * @returns SVG path `d` attribute string
 */
export declare function getPlatformIconPath(platform: string): string;
/**
 * Get a label for the platform
 */
export declare function getPlatformLabel(platform: string): string;
