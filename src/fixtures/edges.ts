/**
 * Edge fixtures
 */

import type { GraphEdge } from '@/schemas/graph.schema';

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
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      edges.push({ source: nodeIds[i], target: nodeIds[j] });
    }
  }
  return edges;
}
