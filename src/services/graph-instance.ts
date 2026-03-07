/**
 * Graph Instance Factory
 *
 * Thin adapter that converts our GraphNode[] + GraphEdge[] into a typed
 * graphology DirectedGraph for use by analysis and traversal utilities.
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { DirectedGraph } from 'graphology';

export type GraphNodeAttrs = Omit<GraphNode, 'id'>;
export type GraphEdgeAttrs = { kind?: string | undefined; platformConditions?: string[] | undefined };
export type AppGraph = DirectedGraph<GraphNodeAttrs, GraphEdgeAttrs>;

export function buildGraph(nodes: GraphNode[], edges: GraphEdge[]): AppGraph {
  const graph = new DirectedGraph<GraphNodeAttrs, GraphEdgeAttrs>();
  for (const node of nodes) {
    const { id, ...attrs } = node;
    graph.addNode(id, attrs);
  }
  for (const edge of edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.addEdge(edge.source, edge.target, {
        kind: edge.kind,
        platformConditions: edge.platformConditions,
      });
    }
  }
  return graph;
}
