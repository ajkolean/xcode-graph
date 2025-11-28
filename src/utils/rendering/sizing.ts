/**
 * Utilities for calculating node sizes
 */

import type { GraphEdge, GraphNode } from '../../data/mockGraphData';

/**
 * Base sizes for different node types
 */
const BASE_NODE_SIZES: Record<string, number> = {
  app: 18,
  framework: 14,
  cli: 14,
  library: 12,
  package: 12,
  'test-unit': 8,
  'test-ui': 8,
};

const DEFAULT_BASE_SIZE = 10;

/**
 * Calculates the size of a node based on its type and connection count
 */
export function getNodeSize(node: GraphNode, edges: GraphEdge[]): number {
  const depCount = edges.filter((e) => e.source === node.id || e.target === node.id).length;

  const baseSize = BASE_NODE_SIZES[node.type] ?? DEFAULT_BASE_SIZE;

  // Scale based on connection count (max 30% increase)
  const scaleFactor = 1 + Math.min(depCount * 0.03, 0.3);
  return baseSize * scaleFactor;
}

/**
 * Gets the base size for a node type without connection scaling
 */
export function getBaseNodeSize(type: string): number {
  return BASE_NODE_SIZES[type] ?? DEFAULT_BASE_SIZE;
}
