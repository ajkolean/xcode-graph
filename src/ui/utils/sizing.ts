/**
 * Utilities for calculating node sizes
 */

import type { GraphNode } from '@shared/schemas/graph.types';

/** Base radii (in graph units) for each node type. Larger types are visually prominent. */
const BASE_NODE_SIZES: Record<string, number> = {
  app: 36,
  framework: 28,
  cli: 28,
  library: 24,
  package: 24,
  'test-unit': 16,
  'test-ui': 16,
};

/** Fallback radius used when the node type is not in the size map. */
const DEFAULT_BASE_SIZE = 20;

/**
 * Returns the size of a node based on its type.
 *
 * @param node - The graph node to size
 * @returns Radius in graph units
 *
 * @public
 */
export function getNodeSize(node: GraphNode): number {
  return BASE_NODE_SIZES[node.type] ?? DEFAULT_BASE_SIZE;
}

/**
 * Gets the base size for a node type without connection scaling.
 *
 * @param type - The node type string (e.g., `'app'`, `'framework'`)
 * @returns Base radius in graph units
 *
 * @public
 */
export function getBaseNodeSize(type: string): number {
  return BASE_NODE_SIZES[type] ?? DEFAULT_BASE_SIZE;
}
