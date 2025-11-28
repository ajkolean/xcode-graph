/**
 * Edge fixtures
 */

import { pairwise } from '@shared/pairwise';
import type { GraphEdge } from '@shared/schemas/graph.schema';

/**
 * Convert edges from {from, to} format to {source, target} format
 */
export function convertEdgeFormat(edges: Array<{ from: string; to: string }>): GraphEdge[] {
  return edges.map((e) => ({ source: e.from, target: e.to }));
}

/**
 * Create edges for a set of nodes (fully connected)
 */
export function createFullyConnectedEdges(nodeIds: string[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (const [source, target] of pairwise(nodeIds)) {
    edges.push({ source, target });
  }
  return edges;
}
