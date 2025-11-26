/**
 * Force calculations for radial cluster simulation
 */

import type { ClusterLayoutConfig } from '../../types/cluster';
import type { NodePosition } from '../../types/simulation';

/**
 * Applies anchor pinning force to keep entry points centered
 */
export function applyAnchorForce(
  node: NodePosition,
  nodeAlpha: number,
  config: ClusterLayoutConfig,
  draggedNode: string | null,
): void {
  if (draggedNode && node.id === draggedNode) return;
  if (!node.isAnchor) return;

  const centerX = 0;
  const centerY = 0;
  node.vx += (centerX - node.x) * config.forceStrength.anchor * nodeAlpha;
  node.vy += (centerY - node.y) * config.forceStrength.anchor * nodeAlpha;
}

/**
 * Applies radial position force to maintain node positions in their target layer/angle
 */
export function applyRadialPositionForce(
  node: NodePosition,
  nodeAlpha: number,
  config: ClusterLayoutConfig,
  draggedNode: string | null,
): void {
  if (draggedNode && node.id === draggedNode) return;
  if (node.isTest || node.isAnchor) return;
  if (node.targetRadius === undefined || node.targetAngle === undefined) return;

  const targetX = node.targetRadius * Math.cos(node.targetAngle);
  const targetY = node.targetRadius * Math.sin(node.targetAngle);

  node.vx += (targetX - node.x) * config.forceStrength.radial * nodeAlpha;
  node.vy += (targetY - node.y) * config.forceStrength.radial * nodeAlpha;
}

/**
 * Applies test satellite tether force to bind test nodes to their subjects
 */
export function applyTestSatelliteForce(
  node: NodePosition,
  nodePositions: Map<string, NodePosition>,
  nodeAlpha: number,
  config: ClusterLayoutConfig,
  draggedNode: string | null,
): void {
  if (draggedNode && node.id === draggedNode) return;
  if (!node.isTest || !node.testSubject) return;

  const subjectPos = nodePositions.get(node.testSubject);
  if (!subjectPos) return;

  const dx = node.x - subjectPos.x;
  const dy = node.y - subjectPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const targetDist = config.testOrbitRadius;

  const force = (distance - targetDist) * config.forceStrength.testSatellite * nodeAlpha;
  const fx = (dx / distance) * force;
  const fy = (dy / distance) * force;

  node.vx -= fx;
  node.vy -= fy;
}

/**
 * Applies collision force between two nodes
 */
export function applyCollisionForce(
  a: NodePosition,
  b: NodePosition,
  nodeAlpha: number,
  config: ClusterLayoutConfig,
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance === 0) return;

  // Account for vertical label space below nodes (~30px)
  const verticalLabelSpace = Math.abs(dy) < 5 ? 25 : 0;
  const minSeparation = a.radius + b.radius + 12 + verticalLabelSpace;

  if (distance < minSeparation) {
    const overlap = minSeparation - distance;
    const force = overlap * config.forceStrength.collision * nodeAlpha;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    a.vx -= fx;
    a.vy -= fy;
    b.vx += fx;
    b.vy += fy;
  }
}

/**
 * Applies boundary constraints to keep nodes inside cluster
 */
export function applyBoundaryConstraints(
  node: NodePosition,
  maxX: number,
  maxY: number,
  nodeAlpha: number,
  config: ClusterLayoutConfig,
  draggedNode: string | null,
): void {
  if (draggedNode && node.id === draggedNode) return;

  // Strong boundary constraints - clamp position and add repelling force
  if (Math.abs(node.x) > maxX) {
    node.x = Math.sign(node.x) * maxX;
    node.vx *= -0.5;
    const excess = Math.abs(node.x) - maxX;
    node.vx -= Math.sign(node.x) * excess * 0.1;
  }

  if (Math.abs(node.y) > maxY) {
    node.y = Math.sign(node.y) * maxY;
    node.vy *= -0.5;
    const excess = Math.abs(node.y) - maxY;
    node.vy -= Math.sign(node.y) * excess * 0.1;
  }

  // Additional soft boundary force before hitting edge
  const softBoundaryPadding = 20;
  const softMaxX = maxX - softBoundaryPadding;
  const softMaxY = maxY - softBoundaryPadding;

  if (Math.abs(node.x) > softMaxX) {
    const excess = Math.abs(node.x) - softMaxX;
    const force = excess * config.forceStrength.boundary * nodeAlpha;
    node.vx -= Math.sign(node.x) * force;
  }

  if (Math.abs(node.y) > softMaxY) {
    const excess = Math.abs(node.y) - softMaxY;
    const force = excess * config.forceStrength.boundary * nodeAlpha;
    node.vy -= Math.sign(node.y) * force;
  }
}
