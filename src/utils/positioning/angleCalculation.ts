/**
 * Angle calculation utilities for node positioning
 */

/**
 * Role-based angular sectors (in radians)
 */
export const ROLE_SECTORS: Record<string, { start: number; end: number }> = {
  entry: { start: -Math.PI / 2, end: Math.PI / 6 }, // Top (270° to 30°)
  'internal-framework': { start: Math.PI / 6, end: (2 * Math.PI) / 3 }, // Right (30° to 120°)
  'internal-lib': { start: (2 * Math.PI) / 3, end: (7 * Math.PI) / 6 }, // Bottom (120° to 210°)
  utility: { start: (7 * Math.PI) / 6, end: (3 * Math.PI) / 2 }, // Left (210° to 270°)
  tool: { start: (3 * Math.PI) / 2, end: 2 * Math.PI }, // Left-top (270° to 360°)
};

/**
 * Role order for consistent positioning
 */
export const ROLE_ORDER = ['entry', 'internal-framework', 'internal-lib', 'utility', 'tool'];

/**
 * Calculates angle distribution for nodes in a sector
 */
export function calculateAnglesInSector(
  startAngle: number,
  angleSpan: number,
  nodeCount: number,
  nodeIndex: number,
  edgePadding: number = 0.05,
): number {
  if (nodeCount === 1) {
    return startAngle + angleSpan / 2;
  }

  const usableSpan = angleSpan * (1 - edgePadding * 2);
  const step = usableSpan / (nodeCount - 1);
  return startAngle + angleSpan * edgePadding + step * nodeIndex;
}

/**
 * Normalizes angle to [0, 2π) range
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
}

/**
 * Gets angle span for a sector, handling wraparound
 */
export function getAngleSpan(startAngle: number, endAngle: number): number {
  let span = endAngle - startAngle;
  if (span < 0) span += 2 * Math.PI;
  return span;
}
