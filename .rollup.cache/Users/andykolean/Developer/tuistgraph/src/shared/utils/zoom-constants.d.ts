/**
 * Zoom configuration constants
 * Centralized zoom-related values to avoid duplication across the codebase
 */
/**
 * Zoom level configuration
 */
export declare const ZOOM_CONFIG: {
    /** Minimum zoom level (zoomed out) - allowing 1% for massive graphs */
    readonly MIN_ZOOM: 0.01;
    /** Maximum zoom level (zoomed in) - allowing 500% for detailed inspection */
    readonly MAX_ZOOM: 5;
};
/**
 * Saturation adjustment for zoom
 * Controls how saturated/muted colors appear at different zoom levels
 */
export declare const ZOOM_SATURATION: {
    /** Saturation multiplier at minimum zoom (very desaturated/pastel) */
    readonly MIN: 0.25;
    /** Saturation multiplier at maximum zoom (slightly desaturated to reduce bleed on dark bg) */
    readonly MAX: 0.8;
};
/**
 * Lightness adjustment for zoom
 * Controls how light/dark colors appear at different zoom levels
 */
export declare const ZOOM_LIGHTNESS_ADJUSTMENT: {
    /** Lightness increase at minimum zoom (lighter/softer) */
    readonly AT_MIN_ZOOM: 15;
    /** Lightness increase at maximum zoom (original) */
    readonly AT_MAX_ZOOM: 0;
};
/**
 * Opacity adjustment for zoom
 * Controls transparency at different zoom levels
 */
export declare const ZOOM_OPACITY: {
    /** Opacity multiplier at minimum zoom */
    readonly MIN_MULTIPLIER: 0.8;
    /** Opacity multiplier at maximum zoom */
    readonly MAX_MULTIPLIER: 1;
};
/**
 * Stroke width adjustment for zoom
 * Controls line thickness at different zoom levels
 */
export declare const ZOOM_STROKE_WIDTH: {
    /** Stroke width multiplier at minimum zoom */
    readonly MIN_MULTIPLIER: 0.7;
    /** Stroke width multiplier at maximum zoom */
    readonly MAX_MULTIPLIER: 1;
};
/**
 * Normalize a zoom value to the 0–1 range and clamp.
 * 0 = fully zoomed out (MIN_ZOOM), 1 = fully zoomed in (MAX_ZOOM).
 */
/**
 * Cluster label adaptive sizing configuration
 * Labels scale inversely with zoom to remain legible at low zoom levels
 */
export declare const CLUSTER_LABEL_CONFIG: {
    /** Target screen-apparent size for cluster name (px) */
    readonly NAME_SCREEN_SIZE: 24;
    /** Absolute max graph-space font size cap (prevents enormous values at tiny zoom) */
    readonly MAX_FONT_SIZE: 800;
};
export declare function normalizeZoom(zoom: number): number;
