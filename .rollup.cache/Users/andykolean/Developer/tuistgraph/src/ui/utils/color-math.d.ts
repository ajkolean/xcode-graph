/**
 * Shared color math utilities for RGB/HSL conversions
 * Consolidates duplicate logic from color-generator.ts and zoom-colors.ts
 */
/**
 * HSL color representation with normalized values (0-1)
 */
export interface HSLNormalized {
    h: number;
    s: number;
    l: number;
}
/**
 * HSL color representation with degrees/percentage (h: 0-360, s/l: 0-100)
 */
export interface HSLDegrees {
    h: number;
    s: number;
    l: number;
}
/**
 * RGB color representation (0-1 normalized)
 */
export interface RGBNormalized {
    r: number;
    g: number;
    b: number;
}
/**
 * Convert hue component to RGB value.
 * Shared helper for HSL to RGB conversion.
 *
 * @param p - First linear interpolation parameter
 * @param q - Second linear interpolation parameter
 * @param t - Hue fraction (0–1, will be wrapped)
 * @returns RGB channel value (0–1)
 */
export declare function hue2rgb(p: number, q: number, t: number): number;
/**
 * Convert a number (0–1) to a two-character hex string.
 *
 * @param n - Normalized value between 0 and 1
 * @returns Two-character hex string (e.g., `"ff"`)
 */
export declare function toHex(n: number): string;
/**
 * Convert RGB (0–1 normalized) to HSL (0–1 normalized).
 *
 * @param r - Red channel (0–1)
 * @param g - Green channel (0–1)
 * @param b - Blue channel (0–1)
 * @returns HSL color with all channels normalized to 0–1
 */
export declare function rgbToHsl(r: number, g: number, b: number): HSLNormalized;
/**
 * Convert HSL (0–1 normalized) to RGB (0–1 normalized).
 *
 * @param h - Hue (0–1)
 * @param s - Saturation (0–1)
 * @param l - Lightness (0–1)
 * @returns RGB color with all channels normalized to 0–1
 */
export declare function hslToRgb(h: number, s: number, l: number): RGBNormalized;
/**
 * Convert hex color to HSL (degrees/percentage format)
 * @param hex - Hex color string (with or without #)
 * @returns HSL with h: 0-360, s: 0-100, l: 0-100
 */
export declare function hexToHSL(hex: string): HSLDegrees;
/**
 * Convert HSL (degrees/percentage format) to hex color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string with #
 */
export declare function hslToHex(h: number, s: number, l: number): string;
