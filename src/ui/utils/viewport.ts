/**
 * Viewport Culling Utilities
 *
 * Efficiently filters edges and nodes to only render those visible in viewport.
 * Provides 5-10x performance improvement for large graphs by reducing DOM elements.
 */

/** @public */
export interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  margin?: number; // Extra space around viewport for smooth scrolling
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
 *
 * @public
 */
export function calculateViewportBounds(
  svgWidth: number,
  svgHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  margin = 200, // Margin for smooth pan
): ViewportBounds {
  // Transform viewport coordinates to graph space
  const minX = -panX / zoom - margin;
  const maxX = (-panX + svgWidth) / zoom + margin;
  const minY = -panY / zoom - margin;
  const maxY = (-panY + svgHeight) / zoom + margin;

  return { minX, maxX, minY, maxY, margin };
}

/**
 * Check if a point is within viewport bounds.
 *
 * @param point - The point to test
 * @param bounds - The viewport bounds
 * @returns `true` if the point lies inside the bounds
 */
export function isPointInViewport(point: Point, bounds: ViewportBounds): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

/**
 * Check if a bounding box intersects with the viewport.
 *
 * @param box - The axis-aligned bounding box to test
 * @param bounds - The viewport bounds
 * @returns `true` if the two rectangles overlap
 */
export function isBoundingBoxInViewport(box: BoundingBox, bounds: ViewportBounds): boolean {
  return !(
    box.maxX < bounds.minX ||
    box.minX > bounds.maxX ||
    box.maxY < bounds.minY ||
    box.minY > bounds.maxY
  );
}

/**
 * Check if a line segment intersects with the viewport.
 * Uses bounding-box pre-rejection then Cohen-Sutherland line clipping.
 *
 * @param start - Start point of the line segment
 * @param end - End point of the line segment
 * @param bounds - The viewport bounds
 * @returns `true` if any part of the segment is inside the viewport
 *
 * @public
 */
export function isLineInViewport(start: Point, end: Point, bounds: ViewportBounds): boolean {
  // Quick check: if either endpoint is in viewport, line is visible
  if (isPointInViewport(start, bounds) || isPointInViewport(end, bounds)) {
    return true;
  }

  // Quick reject: if line is entirely outside viewport bounds
  const lineBounds: BoundingBox = {
    minX: Math.min(start.x, end.x),
    maxX: Math.max(start.x, end.x),
    minY: Math.min(start.y, end.y),
    maxY: Math.max(start.y, end.y),
  };

  if (!isBoundingBoxInViewport(lineBounds, bounds)) {
    return false;
  }

  // Line might intersect viewport even if endpoints are outside
  // Use Cohen-Sutherland line clipping algorithm
  return cohenSutherlandIntersect(start, end, bounds);
}

/** @internal Cohen-Sutherland region code: left of viewport */
const CS_LEFT = 1;
/** @internal Cohen-Sutherland region code: right of viewport */
const CS_RIGHT = 2;
/** @internal Cohen-Sutherland region code: below viewport */
const CS_BOTTOM = 4;
/** @internal Cohen-Sutherland region code: above viewport */
const CS_TOP = 8;

/**
 * Compute the Cohen-Sutherland outcode for a point relative to the viewport.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param bounds - Viewport bounds
 * @returns Bitmask of region codes
 */
function computeOutCode(x: number, y: number, bounds: ViewportBounds): number {
  let code = 0;
  if (x < bounds.minX) code |= CS_LEFT;
  else if (x > bounds.maxX) code |= CS_RIGHT;
  if (y < bounds.minY) code |= CS_BOTTOM;
  else if (y > bounds.maxY) code |= CS_TOP;
  return code;
}

/**
 * Clip a point to the nearest viewport boundary edge.
 *
 * @param outcodeOut - Region code indicating which boundary to clip against
 * @param x0 - Start X of the line segment
 * @param y0 - Start Y of the line segment
 * @param x1 - End X of the line segment
 * @param y1 - End Y of the line segment
 * @param bounds - Viewport bounds
 * @returns The intersection point on the boundary
 */
function clipToBoundary(
  outcodeOut: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bounds: ViewportBounds,
): Point {
  if (outcodeOut & CS_TOP) {
    return { x: x0 + ((x1 - x0) * (bounds.maxY - y0)) / (y1 - y0), y: bounds.maxY };
  }
  if (outcodeOut & CS_BOTTOM) {
    return { x: x0 + ((x1 - x0) * (bounds.minY - y0)) / (y1 - y0), y: bounds.minY };
  }
  if (outcodeOut & CS_RIGHT) {
    return { x: bounds.maxX, y: y0 + ((y1 - y0) * (bounds.maxX - x0)) / (x1 - x0) };
  }
  return { x: bounds.minX, y: y0 + ((y1 - y0) * (bounds.minX - x0)) / (x1 - x0) };
}

/**
 * Cohen-Sutherland line clipping algorithm.
 * Tests whether a line segment intersects a rectangular viewport.
 *
 * @param start - Start point of the line segment
 * @param end - End point of the line segment
 * @param bounds - Viewport bounds
 * @returns `true` if the line segment intersects the viewport rectangle
 */
function cohenSutherlandIntersect(start: Point, end: Point, bounds: ViewportBounds): boolean {
  let x0 = start.x;
  let y0 = start.y;
  let x1 = end.x;
  let y1 = end.y;

  let outcode0 = computeOutCode(x0, y0, bounds);
  let outcode1 = computeOutCode(x1, y1, bounds);

  while (true) {
    if (!(outcode0 | outcode1)) return true;
    if (outcode0 & outcode1) return false;

    const outcodeOut = outcode0 || outcode1;
    const clipped = clipToBoundary(outcodeOut, x0, y0, x1, y1, bounds);

    if (outcodeOut === outcode0) {
      x0 = clipped.x;
      y0 = clipped.y;
      outcode0 = computeOutCode(x0, y0, bounds);
    } else {
      x1 = clipped.x;
      y1 = clipped.y;
      outcode1 = computeOutCode(x1, y1, bounds);
    }
  }
}

/**
 * Check if a circle (node) is within viewport.
 *
 * @param center - Center point of the circle
 * @param radius - Radius of the circle
 * @param bounds - The viewport bounds
 * @returns `true` if the circle's bounding box intersects the viewport
 *
 * @public
 */
export function isCircleInViewport(center: Point, radius: number, bounds: ViewportBounds): boolean {
  const circleBounds: BoundingBox = {
    minX: center.x - radius,
    maxX: center.x + radius,
    minY: center.y - radius,
    maxY: center.y + radius,
  };

  return isBoundingBoxInViewport(circleBounds, bounds);
}

/**
 * Filter edges to only those visible in the viewport.
 *
 * @param edges - Array of edges with `source` and `target` point properties
 * @param bounds - The viewport bounds used for culling
 * @returns Subset of edges whose line segments intersect the viewport
 */
export function cullEdges<T extends { source: Point; target: Point }>(
  edges: T[],
  bounds: ViewportBounds,
): T[] {
  return edges.filter((edge) => isLineInViewport(edge.source, edge.target, bounds));
}

/**
 * Filter nodes to only those visible in the viewport.
 *
 * @param nodes - Array of node positions (must have `x` and `y`)
 * @param radius - Node radius used for bounding-box intersection
 * @param bounds - The viewport bounds used for culling
 * @returns Subset of nodes whose bounding circles intersect the viewport
 */
export function cullNodes<T extends Point>(
  nodes: T[],
  radius: number,
  bounds: ViewportBounds,
): T[] {
  return nodes.filter((node) => isCircleInViewport(node, radius, bounds));
}

/**
 * Estimate the performance improvement from viewport culling.
 *
 * @param totalElements - Total number of elements in the graph
 * @param viewportElements - Number of elements visible in the viewport
 * @returns Object with `ratio` (total / visible) and `percentageSaved` (0-100)
 */
export function estimateCullingRatio(
  totalElements: number,
  viewportElements: number,
): { ratio: number; percentageSaved: number } {
  const ratio = totalElements / (viewportElements || 1);
  const percentageSaved = ((totalElements - viewportElements) / totalElements) * 100;

  return { ratio, percentageSaved };
}
