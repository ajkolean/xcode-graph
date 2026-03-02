/**
 * Data Actions - State mutation functions for data signals
 *
 * Contains actions for initializing and updating graph data.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/data.actions
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { edges, nodes } from './data.signals';

/**
 * Set graph data (nodes and edges)
 * @param newNodes - Array of graph nodes
 * @param newEdges - Array of graph edges
 *
 * @public
 */
export function setGraphData(newNodes: GraphNode[], newEdges: GraphEdge[]): void {
  nodes.set(newNodes);
  edges.set(newEdges);
}

/**
 * Clear all graph data
 *
 * @public
 */
export function clearGraphData(): void {
  nodes.set([]);
  edges.set([]);
}
