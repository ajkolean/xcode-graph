/**
 * SVG Path Utilities
 *
 * Functions for generating SVG path strings with caching for performance.
 *
 * @module utils/rendering/paths
 */

// LRU cache for bezier paths
const pathCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key from coordinates
 * Rounds to nearest integer to improve cache hits
 */
function getPathCacheKey(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
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
export function generateBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const cacheKey = getPathCacheKey(x1, y1, x2, y2);

  // Check cache
  const cached = pathCache.get(cacheKey);
  if (cached) return cached;

  // Generate path
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

  // LRU eviction if cache is full
  if (pathCache.size >= MAX_CACHE_SIZE) {
    const firstKey = pathCache.keys().next().value;
    if (firstKey) pathCache.delete(firstKey);
  }

  pathCache.set(cacheKey, path);
  return path;
}

/**
 * Clear the path cache (useful for testing or memory management)
 */
export function clearPathCache(): void {
  pathCache.clear();
}
