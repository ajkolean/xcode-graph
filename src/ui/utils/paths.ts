/**
 * SVG Path Utilities
 *
 * Functions for generating SVG path strings with caching for performance.
 *
 * @module utils/rendering/paths
 */

// FIFO cache for bezier paths
const pathCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key from coordinates
 * Rounds to nearest integer to improve cache hits
 */
function getPathCacheKey(x1: number, y1: number, x2: number, y2: number): string {
  const rx1 = Math.round(x1);
  const ry1 = Math.round(y1);
  const rx2 = Math.round(x2);
  const ry2 = Math.round(y2);
  return `${rx1},${ry1}-${rx2},${ry2}`;
}

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
export function generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cacheKey = getPathCacheKey(x1, y1, x2, y2);

  const cached = pathCache.get(cacheKey);
  if (cached) return cached;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // Control point offset (creates gentle curve)
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;

  // Control points for smooth S-curve
  const cx1 = x1 + offset;
  const cy1 = y1;
  const cx2 = x2 - offset;
  const cy2 = y2;

  const path = `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;

  // FIFO eviction if cache is full
  if (pathCache.size >= MAX_CACHE_SIZE) {
    const firstKey = pathCache.keys().next().value;
    if (firstKey) pathCache.delete(firstKey);
  }

  pathCache.set(cacheKey, path);
  return path;
}

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
function buildSegment(curr: Point, next: Point, end: Point, isLast: boolean): string {
  const target = isLast ? end : { x: (curr.x + next.x) / 2, y: (curr.y + next.y) / 2 };
  return `Q ${curr.x},${curr.y} ${target.x},${target.y}`;
}

export function generateWaypointPath(start: Point, waypoints: Point[], end: Point): string {
  if (waypoints.length === 0) {
    return generateBezierPath(start.x, start.y, end.x, end.y);
  }

  const parts: string[] = [`M ${start.x},${start.y}`];
  const points = [start, ...waypoints, end];

  if (points.length === 2) {
    parts.push(`L ${end.x},${end.y}`);
  } else if (points.length === 3) {
    const wp = points[1] ?? start;
    parts.push(`Q ${wp.x},${wp.y} ${end.x},${end.y}`);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const curr = points[i] ?? start;
      const next = points[i + 1] ?? end;
      const isLast = i === points.length - 2;
      parts.push(buildSegment(curr, next, end, isLast));
    }
  }

  return parts.join(' ');
}

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
export function generatePortRoutedPath(
  sourceNode: Point,
  sourcePort: Point,
  targetPort: Point,
  targetNode: Point,
  waypoints: Point[],
  sourceClusterCenter: Point,
  targetClusterCenter: Point,
  options: { curvature?: number } = {},
): string {
  const curvature = options.curvature ?? 0.3;

  // Convert relative node positions to world coordinates
  const sourceWorld = {
    x: sourceClusterCenter.x + sourceNode.x,
    y: sourceClusterCenter.y + sourceNode.y,
  };
  const targetWorld = {
    x: targetClusterCenter.x + targetNode.x,
    y: targetClusterCenter.y + targetNode.y,
  };

  const parts: string[] = [];

  // 1. Exit leg: Source node to source port (curved exit from cluster)
  const exitDx = sourcePort.x - sourceWorld.x;
  const exitDy = sourcePort.y - sourceWorld.y;
  const exitOffset = Math.min(Math.abs(exitDx), Math.abs(exitDy)) * curvature;

  parts.push(`M ${sourceWorld.x},${sourceWorld.y}`);
  parts.push(
    `C ${sourceWorld.x + exitOffset},${sourceWorld.y} ${sourcePort.x - exitOffset * Math.sign(exitDx)},${sourcePort.y} ${sourcePort.x},${sourcePort.y}`,
  );

  // 2. Highway: Source port through waypoints to target port
  if (waypoints.length > 0) {
    // Use smooth waypoint path
    const waypointPath = generateWaypointPath(sourcePort, waypoints, targetPort);
    // Extract everything after the M command since we already have our starting point
    const waypointCommands = waypointPath.replace(/^M\s+[\d.,-]+\s*/, '');
    if (waypointCommands) {
      parts.push(waypointCommands);
    }
  } else {
    // Direct line to target port
    parts.push(`L ${targetPort.x},${targetPort.y}`);
  }

  // 3. Entry leg: Target port to target node (curved entry into cluster)
  const entryDx = targetWorld.x - targetPort.x;
  const entryDy = targetWorld.y - targetPort.y;
  const entryOffset = Math.min(Math.abs(entryDx), Math.abs(entryDy)) * curvature;

  parts.push(
    `C ${targetPort.x + entryOffset * Math.sign(entryDx)},${targetPort.y} ${targetWorld.x - entryOffset},${targetWorld.y} ${targetWorld.x},${targetWorld.y}`,
  );

  return parts.join(' ');
}
