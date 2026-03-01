/**
 * Viewport Culling Utilities
 *
 * Efficiently filters edges and nodes to only render those visible in viewport.
 * Provides 5-10x performance improvement for large graphs by reducing DOM elements.
 */
export interface ViewportBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    margin?: number;
}
export interface Point {
    x: number;
    y: number;
}
export interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
/**
 * Calculate viewport bounds based on SVG dimensions, pan, and zoom.
 *
 * Transforms screen-space coordinates into graph-space, adding a margin
 * so that elements just outside the viewport are pre-rendered for smooth panning.
 *
 * @param svgWidth - Width of the SVG element in pixels
 * @param svgHeight - Height of the SVG element in pixels
 * @param panX - Horizontal pan offset in pixels
 * @param panY - Vertical pan offset in pixels
 * @param zoom - Current zoom level (1 = 100%)
 * @param margin - Extra graph-space padding around the viewport (default 200)
 * @returns Viewport bounds in graph-space coordinates
 *
 * @example
 * ```ts
 * const bounds = calculateViewportBounds(1920, 1080, 0, 0, 1);
 * // bounds.minX === -200, bounds.maxX === 2120
 * ```
 */
export declare function calculateViewportBounds(svgWidth: number, svgHeight: number, panX: number, panY: number, zoom: number, margin?: number): ViewportBounds;
/**
 * Check if a point is within viewport bounds.
 *
 * @param point - The point to test
 * @param bounds - The viewport bounds
 * @returns `true` if the point lies inside the bounds
 */
export declare function isPointInViewport(point: Point, bounds: ViewportBounds): boolean;
/**
 * Check if a bounding box intersects with the viewport.
 *
 * @param box - The axis-aligned bounding box to test
 * @param bounds - The viewport bounds
 * @returns `true` if the two rectangles overlap
 */
export declare function isBoundingBoxInViewport(box: BoundingBox, bounds: ViewportBounds): boolean;
/**
 * Check if a line segment intersects with viewport
 * Uses line-box intersection test
 */
export declare function isLineInViewport(start: Point, end: Point, bounds: ViewportBounds): boolean;
/**
 * Check if a circle (node) is within viewport.
 *
 * @param center - Center point of the circle
 * @param radius - Radius of the circle
 * @param bounds - The viewport bounds
 * @returns `true` if the circle's bounding box intersects the viewport
 */
export declare function isCircleInViewport(center: Point, radius: number, bounds: ViewportBounds): boolean;
/**
 * Filter edges to only those visible in the viewport.
 *
 * @param edges - Array of edges with `source` and `target` point properties
 * @param bounds - The viewport bounds used for culling
 * @returns Subset of edges whose line segments intersect the viewport
 */
export declare function cullEdges<T extends {
    source: Point;
    target: Point;
}>(edges: T[], bounds: ViewportBounds): T[];
/**
 * Filter nodes to only those visible in the viewport.
 *
 * @param nodes - Array of node positions (must have `x` and `y`)
 * @param radius - Node radius used for bounding-box intersection
 * @param bounds - The viewport bounds used for culling
 * @returns Subset of nodes whose bounding circles intersect the viewport
 */
export declare function cullNodes<T extends Point>(nodes: T[], radius: number, bounds: ViewportBounds): T[];
/**
 * Estimate the viewport culling performance improvement
 */
export declare function estimateCullingRatio(totalElements: number, viewportElements: number): {
    ratio: number;
    percentageSaved: number;
};
//# sourceMappingURL=viewport.d.ts.map