/**
 * SVG Path Utilities
 *
 * Functions for generating SVG path strings.
 *
 * @module utils/rendering/paths
 */

/**
 * Generate a bezier curve path between two points
 *
 * Creates a smooth S-curve using cubic bezier with control points
 * positioned based on the distance between endpoints.
 *
 * @param x1 - Start X coordinate
 * @param y1 - Start Y coordinate
 * @param x2 - End X coordinate
 * @param y2 - End Y coordinate
 * @returns SVG path string (M ... C ...)
 */
export function generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Control point offset (creates gentle curve)
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;

  // Control points for smooth S-curve
  const cx1 = x1 + offset;
  const cy1 = y1;
  const cx2 = x2 - offset;
  const cy2 = y2;

  return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
}
