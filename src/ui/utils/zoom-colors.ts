/**
 * Utility functions for zoom-dependent color adjustments
 * Implements professional UX pattern: muted colors when zoomed out, vibrant when zoomed in
 * Similar to Figma, VSCode minimap, GitHub dependency graph, JetBrains tools
 */

import { hexToHSL, hslToHex } from './color-math';
import {
  ZOOM_CONFIG,
  ZOOM_LIGHTNESS_ADJUSTMENT,
  ZOOM_OPACITY,
  ZOOM_SATURATION,
  ZOOM_STROKE_WIDTH,
} from './zoom-constants';

/**
 * Calculate saturation multiplier based on zoom level
 * @param zoom - Current zoom level (0.5 to 2.0)
 * @returns Saturation multiplier (0.3 at min zoom, 1.0 at max zoom)
 */
function getSaturationMultiplier(zoom: number): number {
  // At zoom 0.5 (zoomed out): 0.25 saturation (very muted/pastel)
  // At zoom 1.0 (default): 0.6 saturation (moderate)
  // At zoom 2.0 (zoomed in): 1.0 saturation (full neon)

  // Normalize zoom to 0-1 range
  const normalizedZoom =
    (zoom - ZOOM_CONFIG.MIN_ZOOM) / (ZOOM_CONFIG.MAX_ZOOM - ZOOM_CONFIG.MIN_ZOOM);
  const clampedZoom = Math.max(0, Math.min(1, normalizedZoom));

  // Linear interpolation
  return ZOOM_SATURATION.MIN + (ZOOM_SATURATION.MAX - ZOOM_SATURATION.MIN) * clampedZoom;
}

/**
 * Calculate lightness adjustment based on zoom level
 * When zoomed out, slightly increase lightness for better readability
 */
function getLightnessAdjustment(zoom: number): number {
  // At min zoom: +15 lightness (lighter/softer)
  // At max zoom: 0 lightness (original)
  const normalizedZoom =
    (zoom - ZOOM_CONFIG.MIN_ZOOM) / (ZOOM_CONFIG.MAX_ZOOM - ZOOM_CONFIG.MIN_ZOOM);
  const clampedZoom = Math.max(0, Math.min(1, normalizedZoom));

  return ZOOM_LIGHTNESS_ADJUSTMENT.AT_MIN_ZOOM * (1 - clampedZoom);
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

  // Handle rgba/rgb colors - extract hex part
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    return color; // Return as-is for now, could enhance later
  }

  // Convert to HSL
  const hsl = hexToHSL(color);

  // Adjust saturation based on zoom
  const saturationMultiplier = getSaturationMultiplier(zoom);
  const adjustedSaturation = hsl.s * saturationMultiplier;

  // Adjust lightness based on zoom (lighter when zoomed out)
  const lightnessAdjustment = getLightnessAdjustment(zoom);
  const adjustedLightness = Math.min(95, hsl.l + lightnessAdjustment);

  // Convert back to hex
  return hslToHex(hsl.h, adjustedSaturation, adjustedLightness);
}

/**
 * Adjust opacity based on zoom level
 * Some elements should be more transparent when zoomed out
 */
export function adjustOpacityForZoom(baseOpacity: number, zoom: number): number {
  // At min zoom: reduce opacity by 20%
  // At max zoom: full opacity
  const normalizedZoom =
    (zoom - ZOOM_CONFIG.MIN_ZOOM) / (ZOOM_CONFIG.MAX_ZOOM - ZOOM_CONFIG.MIN_ZOOM);
  const clampedZoom = Math.max(0, Math.min(1, normalizedZoom));

  const opacityMultiplier =
    ZOOM_OPACITY.MIN_MULTIPLIER +
    (ZOOM_OPACITY.MAX_MULTIPLIER - ZOOM_OPACITY.MIN_MULTIPLIER) * clampedZoom;

  return baseOpacity * opacityMultiplier;
}

/**
 * Get stroke width that adapts to zoom
 * Thinner strokes when zoomed out for cleaner look
 */
export function getZoomAwareStrokeWidth(baseWidth: number, zoom: number): number {
  const normalizedZoom =
    (zoom - ZOOM_CONFIG.MIN_ZOOM) / (ZOOM_CONFIG.MAX_ZOOM - ZOOM_CONFIG.MIN_ZOOM);
  const clampedZoom = Math.max(0, Math.min(1, normalizedZoom));

  // At min zoom: 70% of base width
  // At max zoom: 100% of base width
  return (
    baseWidth *
    (ZOOM_STROKE_WIDTH.MIN_MULTIPLIER +
      (ZOOM_STROKE_WIDTH.MAX_MULTIPLIER - ZOOM_STROKE_WIDTH.MIN_MULTIPLIER) * clampedZoom)
  );
}
