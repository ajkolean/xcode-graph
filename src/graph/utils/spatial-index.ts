/**
 * Spatial Index Module
 *
 * O(log n) quadtree-based hit testing for canvas node lookups.
 * Replaces O(n) brute-force iteration on every mousemove.
 */

import type { GraphNode } from '@shared/schemas/graph.types';
import { type Quadtree, quadtree } from 'd3-quadtree';

/** @public */
export interface IndexedNode {
  x: number;
  y: number;
  node: GraphNode;
  hitRadius: number;
}

/**
 * Build a quadtree spatial index from positioned nodes.
 *
 * @param items - Nodes with world positions and hit radii
 * @returns A d3-quadtree for O(log n) nearest-neighbor lookups
 *
 * @public
 */
export function buildNodeQuadtree(items: IndexedNode[]): Quadtree<IndexedNode> {
  return quadtree<IndexedNode>()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll(items);
}

/**
 * Find the node closest to (worldX, worldY) within maxRadius.
 *
 * Uses quadtree.find() for O(log n) lookup, then verifies the hit
 * is within the node's individual hitRadius.
 *
 * @param tree - Quadtree spatial index
 * @param worldX - World X coordinate
 * @param worldY - World Y coordinate
 * @param maxRadius - Maximum search radius
 * @returns The matched GraphNode, or null if none within range
 *
 * @public
 */
export function findNodeAt(
  tree: Quadtree<IndexedNode>,
  worldX: number,
  worldY: number,
  maxRadius: number,
): GraphNode | null {
  const found = tree.find(worldX, worldY, maxRadius);
  if (!found) return null;

  // Verify within the specific node's hit radius
  const dx = worldX - found.x;
  const dy = worldY - found.y;
  if (dx * dx + dy * dy <= found.hitRadius * found.hitRadius) {
    return found.node;
  }
  return null;
}
