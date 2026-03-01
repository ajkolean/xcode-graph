/**
 * Utility functions for zoom-dependent color adjustments
 * Implements professional UX pattern: muted colors when zoomed out, vibrant when zoomed in
 * Similar to Figma, VSCode minimap, GitHub dependency graph, JetBrains tools
 */
/**
 * Adjust color based on zoom level
 * Zoomed out = pastel/muted colors
 * Zoomed in = vibrant/neon colors
 *
 * @param color - Hex color string
 * @param zoom - Current zoom level (0.5 to 2.0)
 * @returns Adjusted hex color string
 */
export declare function adjustColorForZoom(color: string, zoom: number): string;
/**
 * Adjust opacity based on zoom level
 * Some elements should be more transparent when zoomed out
 */
export declare function adjustOpacityForZoom(baseOpacity: number, zoom: number): number;
/**
 * Get stroke width that adapts to zoom
 * Thinner strokes when zoomed out for cleaner look
 */
export declare function getZoomAwareStrokeWidth(baseWidth: number, zoom: number): number;
