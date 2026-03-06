/**
 * Zoom Configuration Constants
 *
 * Centralized zoom-related values used by canvas rendering, color adjustment,
 * and UI controls. Avoids duplication of magic numbers across the codebase.
 *
 * @module shared/utils/zoom-config
 */

/** Zoom level bounds for the canvas viewport. */
export const ZOOM_CONFIG = {
  /** Minimum zoom level (zoomed out) - allowing 1% for massive graphs */
  MIN_ZOOM: 0.01,
  /** Maximum zoom level (zoomed in) - allowing 500% for detailed inspection */
  MAX_ZOOM: 5.0,
} as const;

/** Saturation multiplier range applied to node colors at different zoom levels. */
export const ZOOM_SATURATION = {
  /** Saturation multiplier at minimum zoom (very desaturated/pastel) */
  MIN: 0.25,
  /** Saturation multiplier at maximum zoom (slightly desaturated to reduce bleed on dark bg) */
  MAX: 0.8,
} as const;

/** Lightness offset (in percentage points) added at different zoom levels. */
export const ZOOM_LIGHTNESS_ADJUSTMENT = {
  /** Lightness increase at minimum zoom (lighter/softer) */
  AT_MIN_ZOOM: 15,
  /** Lightness increase at maximum zoom (original) */
  AT_MAX_ZOOM: 0,
} as const;

/** Opacity multiplier range for fade effects at different zoom levels. */
export const ZOOM_OPACITY = {
  /** Opacity multiplier at minimum zoom */
  MIN_MULTIPLIER: 0.8,
  /** Opacity multiplier at maximum zoom */
  MAX_MULTIPLIER: 1,
} as const;

/** Stroke width multiplier range for edge rendering at different zoom levels. */
export const ZOOM_STROKE_WIDTH = {
  /** Stroke width multiplier at minimum zoom */
  MIN_MULTIPLIER: 0.7,
  /** Stroke width multiplier at maximum zoom */
  MAX_MULTIPLIER: 1,
} as const;

/**
 * Cluster label sizing configuration
 * Fixed graph-space values — labels scale naturally with the canvas zoom
 * transform like every other element (no per-frame counter-scaling).
 */
export const CLUSTER_LABEL_CONFIG = {
  /** Fixed font size in graph-space pixels */
  FONT_SIZE: 28,
  /** Fixed gap between cluster border and label arc in graph-space pixels */
  LABEL_PADDING: 20,
} as const;

/**
 * Level-of-detail thresholds — below these zoom levels, expensive rendering
 * operations are skipped because the elements are too small to see.
 */
export const LOD_THRESHOLDS = {
  /** Skip arrowhead triangles per edge (~9 draw ops each) */
  ARROWHEADS: 0.5,
  /** Replace individual edges with cluster-to-cluster arteries */
  CLUSTER_ARTERIES: 0.08,
  /** Skip per-node text labels (~3 canvas text ops each) */
  NODE_LABELS: 0.2,
  /** Skip per-character arc text for cluster labels */
  CLUSTER_ARC_LABELS: 0.15,
} as const;

/**
 * Normalize a zoom value to the 0-1 range and clamp.
 * 0 = fully zoomed out (MIN_ZOOM), 1 = fully zoomed in (MAX_ZOOM).
 *
 * @param zoom - Raw zoom level
 * @returns Normalized value between 0 and 1
 */
export function normalizeZoom(zoom: number): number {
  const t = (zoom - ZOOM_CONFIG.MIN_ZOOM) / (ZOOM_CONFIG.MAX_ZOOM - ZOOM_CONFIG.MIN_ZOOM);
  return Math.max(0, Math.min(1, t));
}
