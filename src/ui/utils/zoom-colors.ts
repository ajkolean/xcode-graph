/**
 * Zoom-Dependent Color Adjustments
 *
 * Implements a professional UX pattern where colors are muted/pastel when
 * zoomed out and become vibrant/neon when zoomed in. This reduces visual
 * noise at overview levels while preserving detail at close range.
 *
 * Similar patterns are found in Figma, VS Code minimap, GitHub dependency
 * graph, and JetBrains tools.
 *
 */

import {
  normalizeZoom,
  ZOOM_LIGHTNESS_ADJUSTMENT,
  ZOOM_OPACITY,
  ZOOM_SATURATION,
} from '@shared/utils/zoom-config';
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
 * Calculate lightness adjustment based on zoom level.
 * When zoomed out, slightly increase lightness for better readability.
 *
 * @param zoom - Current zoom level (0.5 to 2.0)
 * @returns Lightness offset to add (higher when zoomed out, 0 when zoomed in)
 */
function getLightnessAdjustment(zoom: number): number {
  return ZOOM_LIGHTNESS_ADJUSTMENT.AT_MIN_ZOOM * (1 - normalizeZoom(zoom));
}

// Two-bucket LRU cache: keeps the current and previous zoom bucket to avoid
// thrashing during smooth zoom (scrolling back and forth between two buckets).
let currentBucket = -1;
let previousBucket = -1;
let currentCache = new Map<string, string>();
let previousCache = new Map<string, string>();

function bucketZoom(zoom: number): number {
  // 0.25 increments — wide buckets minimize cache misses during smooth zoom
  return Math.round(zoom * 4) / 4;
}

/** Rotates the two-bucket cache so `currentCache` always holds the active bucket. */
function rotateBucket(bucket: number): void {
  if (bucket === previousBucket) {
    // Swap references — O(1) instead of O(N) map copy
    const tmp = currentCache;
    currentCache = previousCache;
    previousCache = tmp;
  } else {
    // New bucket: demote current to previous, start fresh
    const tmp = previousCache;
    previousCache = currentCache;
    currentCache = tmp;
    currentCache.clear();
  }
  previousBucket = currentBucket;
  currentBucket = bucket;
}

/**
 * Adjust color based on zoom level
 * Zoomed out = pastel/muted colors
 * Zoomed in = vibrant/neon colors
 *
 * @param color - Hex color string
 * @param zoom - Current zoom level (0.5 to 2.0)
 * @returns Adjusted hex color string
 *
 */
/** Pre-compiled regex for parsing rgba/rgb color strings */
const RGBA_ZOOM_RE = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/;

/** @public */
export function adjustColorForZoom(color: string, zoom: number): string {
  // Safety check for undefined or invalid colors
  if (!color || typeof color !== 'string') {
    return '#6F2CFF'; // Default purple color
  }

  const bucket = bucketZoom(zoom);
  if (bucket !== currentBucket) {
    rotateBucket(bucket);
  }

  const cached = currentCache.get(color);
  if (cached) return cached;

  const saturationMultiplier = getSaturationMultiplier(zoom);
  const lightnessAdjustment = getLightnessAdjustment(zoom);

  let result: string;

  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const match = color.match(RGBA_ZOOM_RE);
    if (!match) return color;

    const r = Number(match[1]) / 255;
    const g = Number(match[2]) / 255;
    const b = Number(match[3]) / 255;
    const a = match[4] !== undefined ? Number(match[4]) : 1;

    const hsl = rgbToHsl(r, g, b);
    const adjS = hsl.s * saturationMultiplier;
    const adjL = Math.min(0.95, hsl.l + lightnessAdjustment / 100);
    const rgb = hslToRgb(hsl.h, adjS, adjL);

    result = `rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, ${a})`;
  } else {
    const hsl = hexToHSL(color);
    const adjustedSaturation = hsl.s * saturationMultiplier;
    const adjustedLightness = Math.min(95, hsl.l + lightnessAdjustment);
    result = hslToHex(hsl.h, adjustedSaturation, adjustedLightness);
  }

  currentCache.set(color, result);
  return result;
}

/**
 * Adjust opacity based on zoom level.
 * Elements become more transparent when zoomed out to reduce visual clutter.
 *
 * @param baseOpacity - Base opacity value (0-1)
 * @param zoom - Current zoom level
 * @returns Adjusted opacity value (0-1)
 *
 * @public
 */
export function adjustOpacityForZoom(baseOpacity: number, zoom: number): number {
  const t = normalizeZoom(zoom);
  const opacityMultiplier =
    ZOOM_OPACITY.MIN_MULTIPLIER + (ZOOM_OPACITY.MAX_MULTIPLIER - ZOOM_OPACITY.MIN_MULTIPLIER) * t;
  return baseOpacity * opacityMultiplier;
}
