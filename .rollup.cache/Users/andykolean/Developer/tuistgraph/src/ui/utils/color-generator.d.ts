/**
 * @module ui/utils/color-generator
 *
 * Deterministic color generation based on the design-system palette.
 * Maps any string to a consistent hex color using hashing and HSL adjustments.
 */
/**
 * Generate a consistent, distinct color for any string using design system colors.
 *
 * @param input - The string to generate a color for (e.g., project name, platform name)
 * @param category - Optional category for additional variation (`'platform'`, `'project'`, `'package'`, etc.)
 * @returns A hex color string (e.g., `"#6F2CFF"`)
 *
 * @example
 * ```ts
 * const color = generateColor('MyApp', 'project');
 * // => "#7a38ff"
 * ```
 */
export declare function generateColor(input: string, category?: string): string;
/**
 * Get a collection of distinct colors for a list of items.
 *
 * @param items - Strings to generate colors for
 * @param category - Optional category passed to {@link generateColor}
 * @returns A `Map` from each item to its hex color
 */
export declare function generateColorPalette(items: string[], category?: string): Map<string, string>;
/**
 * Generate a color with a specific alpha channel.
 *
 * @param input - The string to generate a color for
 * @param alpha - Opacity value between 0 and 1
 * @param category - Optional category passed to {@link generateColor}
 * @returns An `rgba()` CSS color string
 */
export declare function generateColorWithAlpha(input: string, alpha: number, category?: string): string;
//# sourceMappingURL=color-generator.d.ts.map