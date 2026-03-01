/**
 * SVG Path Utilities
 *
 * Functions for generating SVG path strings with caching for performance.
 *
 * @module utils/rendering/paths
 */
/**
 * Generate a bezier curve path between two points (with caching)
 *
 * Creates a smooth S-curve using cubic bezier with control points
 * positioned based on the distance between endpoints.
 *
 * Performance: Caches results to avoid recalculating same paths.
 * Uses rounded coordinates for better cache hit rate.
 *
 * @param x1 - Start X coordinate
 * @param y1 - Start Y coordinate
 * @param x2 - End X coordinate
 * @param y2 - End Y coordinate
 * @returns SVG path string (M ... C ...)
 */
export declare function generateBezierPath(x1: number, y1: number, x2: number, y2: number): string;
/**
 * Clear the path cache (useful for testing or memory management)
 */
export declare function clearPathCache(): void;
interface Point {
    x: number;
    y: number;
}
/**
 * Generate a smooth path through multiple waypoints using quadratic bezier curves.
 *
 * Creates smooth transitions at each waypoint by using quadratic curves
 * that meet at the waypoints with continuous tangent direction.
 *
 * @param start - Starting point
 * @param waypoints - Intermediate points to pass through
 * @param end - Ending point
 * @returns SVG path string
 */
export declare function generateWaypointPath(start: Point, waypoints: Point[], end: Point): string;
/**
 * Generate a complete port-routed edge path.
 *
 * Creates a smooth path from source node through exit port,
 * across to entry port, and into target node.
 *
 * Path structure:
 * - Exit leg: sourceNode → sourcePort (smooth curve exiting cluster)
 * - Highway: sourcePort → waypoints → targetPort (orthogonal route)
 * - Entry leg: targetPort → targetNode (smooth curve entering cluster)
 *
 * @param sourceNode - Position of source node (relative to cluster center)
 * @param sourcePort - Exit port position (world coordinates)
 * @param targetPort - Entry port position (world coordinates)
 * @param targetNode - Position of target node (relative to cluster center)
 * @param waypoints - Intermediate bend points between ports
 * @param sourceClusterCenter - Center of source cluster
 * @param targetClusterCenter - Center of target cluster
 * @param options - Styling options
 * @returns SVG path string
 */
export declare function generatePortRoutedPath(sourceNode: Point, sourcePort: Point, targetPort: Point, targetNode: Point, waypoints: Point[], sourceClusterCenter: Point, targetClusterCenter: Point, options?: {
    curvature?: number;
}): string;
export {};
