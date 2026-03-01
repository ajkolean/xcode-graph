/**
 * Utility functions for zoom-dependent color adjustments
 * Implements professional UX pattern: muted colors when zoomed out, vibrant when zoomed in
 * Similar to Figma, VSCode minimap, GitHub dependency graph, JetBrains tools
 */

import {
  normalizeZoom,
  ZOOM_LIGHTNESS_ADJUSTMENT,
  ZOOM_OPACITY,
  ZOOM_SATURATION,
} from '@shared/utils/zoom-constants';
import { hexToHSL, hslToHex, hslToRgb, rgbToHsl } from './color-math';

/**
 * Calculate saturation multiplier based on zoom level
 * @param zoom - Current zoom level (0.5 to 2.0)
 * @returns Saturation multiplier (0.3 at min zoom, 1.0 at max zoom)
 */
function getSaturationMultiplier(zoom: number): number {
  const t = normalizeZoom(zoom);
  return ZOOM_SATURATION.MIN + (ZOOM_SATURATION.MAX - ZOOM_SATURATION.MIN) * t;
}

/**
 * Calculate lightness adjustment based on zoom level
 * When zoomed out, slightly increase lightness for better readability
 */
function getLightnessAdjustment(zoom: number): number {
  return ZOOM_LIGHTNESS_ADJUSTMENT.AT_MIN_ZOOM * (1 - normalizeZoom(zoom));
}

/**
 * Adjust color based on zoom level
 * Zoomed out = pastel/muted colors
 * Zoomed in = vibrant/neon colors
 *
 * @param color - Hex color string
 * @param zoom - Current zoom level (0.5 to 2.0)
 * @returns Adjusted hex color string
 */
export function adjustColorForZoom(color: string, zoom: number): string {
  // Safety check for undefined or invalid colors
  if (!color || typeof color !== 'string') {
    return '#6F2CFF'; // Default purple color
  }

  const saturationMultiplier = getSaturationMultiplier(zoom);
  const lightnessAdjustment = getLightnessAdjustment(zoom);

  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (!match) return color;

    const r = Number(match[1]) / 255;
    const g = Number(match[2]) / 255;
    const b = Number(match[3]) / 255;
    const a = match[4] !== undefined ? Number(match[4]) : 1;

    const hsl = rgbToHsl(r, g, b);
    const adjS = hsl.s * saturationMultiplier;
    const adjL = Math.min(0.95, hsl.l + lightnessAdjustment / 100);
    const rgb = hslToRgb(hsl.h, adjS, adjL);

    return `rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, ${a})`;
  }

  const hsl = hexToHSL(color);
  const adjustedSaturation = hsl.s * saturationMultiplier;
  const adjustedLightness = Math.min(95, hsl.l + lightnessAdjustment);

  return hslToHex(hsl.h, adjustedSaturation, adjustedLightness);
}

/**
 * Adjust opacity based on zoom level
 * Some elements should be more transparent when zoomed out
 */
export function adjustOpacityForZoom(baseOpacity: number, zoom: number): number {
  const t = normalizeZoom(zoom);
  const opacityMultiplier =
    ZOOM_OPACITY.MIN_MULTIPLIER + (ZOOM_OPACITY.MAX_MULTIPLIER - ZOOM_OPACITY.MIN_MULTIPLIER) * t;
  return baseOpacity * opacityMultiplier;
}
