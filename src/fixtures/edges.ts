/**
 * Edge fixtures
 */

import { pairwise } from '@shared/pairwise';
import type { GraphEdge } from '@shared/schemas/graph.types';

/**
 * Convert edges from {from, to} format to {source, target} format
 */
export function convertEdgeFormat(edges: Array<{ from: string; to: string }>): GraphEdge[] {
  return edges.map((e) => ({ source: e.from, target: e.to }));
}

/**
 * Create a linear chain of edges between consecutive nodes (A->B, B->C, ...)
 */
export function createChainedEdges(nodeIds: string[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (const [source, target] of pairwise(nodeIds)) {
    edges.push({ source, target });
  }
  return edges;
}
