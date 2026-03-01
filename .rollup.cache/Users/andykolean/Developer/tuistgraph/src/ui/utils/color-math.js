/**
 * Shared color math utilities for RGB/HSL conversions
 * Consolidates duplicate logic from color-generator.ts and zoom-colors.ts
 */
/**
 * Convert hue component to RGB value.
 * Shared helper for HSL to RGB conversion.
 *
 * @param p - First linear interpolation parameter
 * @param q - Second linear interpolation parameter
 * @param t - Hue fraction (0–1, will be wrapped)
 * @returns RGB channel value (0–1)
 */
export function hue2rgb(p, q, t) {
    let adjustedT = t;
    if (adjustedT < 0)
        adjustedT += 1;
    if (adjustedT > 1)
        adjustedT -= 1;
    if (adjustedT < 1 / 6)
        return p + (q - p) * 6 * adjustedT;
    if (adjustedT < 1 / 2)
        return q;
    if (adjustedT < 2 / 3)
        return p + (q - p) * (2 / 3 - adjustedT) * 6;
    return p;
}
/**
 * Convert a number (0–1) to a two-character hex string.
 *
 * @param n - Normalized value between 0 and 1
 * @returns Two-character hex string (e.g., `"ff"`)
 */
export function toHex(n) {
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
export function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
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
export function hslToRgb(h, s, l) {
    if (s === 0) {
        return { r: l, g: l, b: l };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
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
export function hexToHSL(hex) {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    // Parse hex values
    const r = Number.parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = Number.parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = Number.parseInt(cleanHex.substring(4, 6), 16) / 255;
    const normalized = rgbToHsl(r, g, b);
    return {
        h: normalized.h * 360,
        s: normalized.s * 100,
        l: normalized.l * 100,
    };
}
/**
 * Convert HSL (degrees/percentage format) to hex color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string with #
 */
export function hslToHex(h, s, l) {
    // Normalize to 0-1 range
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;
    const rgb = hslToRgb(hNorm, sNorm, lNorm);
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}
//# sourceMappingURL=color-math.js.map