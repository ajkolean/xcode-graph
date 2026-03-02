/**
 * Shared color math utilities for RGB/HSL conversions
 * Consolidates duplicate logic from color-generator.ts and zoom-colors.ts
 */

import { colord } from 'colord';

/**
 * HSL color representation with normalized values (0-1)
 */
export interface HSLNormalized {
  h: number; // 0-1
  s: number; // 0-1
  l: number; // 0-1
}

/**
 * HSL color representation with degrees/percentage (h: 0-360, s/l: 0-100)
 */
export interface HSLDegrees {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
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
export function hue2rgb(p: number, q: number, t: number): number {
  // skipcq: JS-C1002
  let adjustedT = t;
  if (adjustedT < 0) adjustedT += 1;
  if (adjustedT > 1) adjustedT -= 1;
  if (adjustedT < 1 / 6) return p + (q - p) * 6 * adjustedT;
  if (adjustedT < 1 / 2) return q;
  if (adjustedT < 2 / 3) return p + (q - p) * (2 / 3 - adjustedT) * 6;
  return p;
}

/**
 * Convert a number (0–1) to a two-character hex string.
 *
 * @param n - Normalized value between 0 and 1
 * @returns Two-character hex string (e.g., `"ff"`)
 */
export function toHex(n: number): string {
  // skipcq: JS-C1002
  const hex = Math.round(n * 255).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

/**
 * Convert RGB (0–1 normalized) to HSL (0–1 normalized).
 *
 * @param r - Red channel (0–1)
 * @param g - Green channel (0–1)
 * @param b - Blue channel (0–1)
 * @returns HSL color with all channels normalized to 0–1
 */
export function rgbToHsl(r: number, g: number, b: number): HSLNormalized {
  // skipcq: JS-C1002
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0; // skipcq: JS-C1002
  let s = 0; // skipcq: JS-C1002
  const l = (max + min) / 2; // skipcq: JS-C1002

  if (max !== min) {
    const d = max - min; // skipcq: JS-C1002
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        break;
    }
  }

  return { h, s, l };
}

/**
 * Convert HSL (0–1 normalized) to RGB (0–1 normalized).
 *
 * @param h - Hue (0–1)
 * @param s - Saturation (0–1)
 * @param l - Lightness (0–1)
 * @returns RGB color with all channels normalized to 0–1
 */
export function hslToRgb(h: number, s: number, l: number): RGBNormalized {
  // skipcq: JS-C1002
  if (s === 0) {
    return { r: l, g: l, b: l };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s; // skipcq: JS-C1002
  const p = 2 * l - q; // skipcq: JS-C1002
  return {
    r: hue2rgb(p, q, h + 1 / 3),
    g: hue2rgb(p, q, h),
    b: hue2rgb(p, q, h - 1 / 3),
  };
}

/**
 * Convert hex color to HSL (degrees/percentage format)
 * @param hex - Hex color string (with or without #)
 * @returns HSL with h: 0-360, s: 0-100, l: 0-100
 */
export function hexToHSL(hex: string): HSLDegrees {
  const { h, s, l } = colord(hex).toHsl();
  return { h, s, l };
}

/**
 * Convert HSL (degrees/percentage format) to hex color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string with #
 */
export function hslToHex(h: number, s: number, l: number): string {
  // skipcq: JS-C1002
  return colord({ h, s, l }).toHex();
}
