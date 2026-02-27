/**
 * Zoom configuration constants
 * Centralized zoom-related values to avoid duplication across the codebase
 */

/**
 * Zoom level configuration
 */
export const ZOOM_CONFIG = {
  /** Minimum zoom level (zoomed out) - allowing 1% for massive graphs */
  MIN_ZOOM: 0.01,
  /** Maximum zoom level (zoomed in) - allowing 500% for detailed inspection */
  MAX_ZOOM: 5.0,
} as const;

/**
 * Saturation adjustment for zoom
 * Controls how saturated/muted colors appear at different zoom levels
 */
export const ZOOM_SATURATION = {
  /** Saturation multiplier at minimum zoom (very desaturated/pastel) */
  MIN: 0.25,
  /** Saturation multiplier at maximum zoom (slightly desaturated to reduce bleed on dark bg) */
  MAX: 0.8,
} as const;

/**
 * Lightness adjustment for zoom
 * Controls how light/dark colors appear at different zoom levels
 */
export const ZOOM_LIGHTNESS_ADJUSTMENT = {
  /** Lightness increase at minimum zoom (lighter/softer) */
  AT_MIN_ZOOM: 15,
  /** Lightness increase at maximum zoom (original) */
  AT_MAX_ZOOM: 0,
} as const;

/**
 * Opacity adjustment for zoom
 * Controls transparency at different zoom levels
 */
export const ZOOM_OPACITY = {
  /** Opacity multiplier at minimum zoom */
  MIN_MULTIPLIER: 0.8,
  /** Opacity multiplier at maximum zoom */
  MAX_MULTIPLIER: 1,
} as const;

/**
 * Stroke width adjustment for zoom
 * Controls line thickness at different zoom levels
 */
export const ZOOM_STROKE_WIDTH = {
  /** Stroke width multiplier at minimum zoom */
  MIN_MULTIPLIER: 0.7,
  /** Stroke width multiplier at maximum zoom */
  MAX_MULTIPLIER: 1,
} as const;

/**
 * Normalize a zoom value to the 0–1 range and clamp.
 * 0 = fully zoomed out (MIN_ZOOM), 1 = fully zoomed in (MAX_ZOOM).
 */
/**
 * Cluster label adaptive sizing configuration
 * Labels scale inversely with zoom to remain legible at low zoom levels
 */
export const CLUSTER_LABEL_CONFIG = {
  /** Target screen-apparent size for cluster name (px) */
  NAME_SCREEN_SIZE: 24,
  /** Absolute max graph-space font size cap (prevents enormous values at tiny zoom) */
  MAX_FONT_SIZE: 800,
} as const;

export function normalizeZoom(zoom: number): number {
  const t = (zoom - ZOOM_CONFIG.MIN_ZOOM) / (ZOOM_CONFIG.MAX_ZOOM - ZOOM_CONFIG.MIN_ZOOM);
  return Math.max(0, Math.min(1, t));
}
