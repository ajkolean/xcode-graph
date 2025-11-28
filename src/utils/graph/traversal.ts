/**
 * Graph traversal utilities
 * Converted from useTransitiveDependencies hook
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { ViewMode } from '../types/app';

export interface TransitiveResult {
  nodes: Set<string>;
  edges: Set<string>;
  edgeDepths: Map<string, number>;
  maxDepth: number;
}

function buildAdjacency(edges: GraphEdge[]) {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  for (const edge of edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);

    outgoing.get(edge.source)!.push(edge.target);
    incoming.get(edge.target)!.push(edge.source);
  }

  return { outgoing, incoming };
}

export function computeTransitiveDependencies(
  viewMode: ViewMode,
  selectedNode: GraphNode | null,
  edges: GraphEdge[],
): { transitiveDeps: TransitiveResult; transitiveDependents: TransitiveResult } {
  const { outgoing, incoming } = buildAdjacency(edges);

  // Dependencies (outgoing)
  const transitiveDeps = (() => {
    if ((viewMode !== 'focused' && viewMode !== 'both') || !selectedNode) {
      return {
        nodes: new Set<string>(),
        edges: new Set<string>(),
        edgeDepths: new Map(),
        maxDepth: 0,
      };
    }

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const edgeDepths = new Map<string, number>();
    let maxDepth = 0;

    const stack: Array<{ id: string; depth: number }> = [{ id: selectedNode.id, depth: 0 }];

    while (stack.length > 0) {
      const { id, depth } = stack.pop()!;
      if (visitedNodes.has(id)) continue;
      visitedNodes.add(id);
      maxDepth = Math.max(maxDepth, depth);

      const neighbors = outgoing.get(id) ?? [];
      for (const target of neighbors) {
        const edgeKey = `${id}->${target}`;
        if (!visitedEdges.has(edgeKey)) {
          visitedEdges.add(edgeKey);
          edgeDepths.set(edgeKey, depth);
        }
        stack.push({ id: target, depth: depth + 1 });
      }
    }

    return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
  })();

  // Dependents (incoming)
  const transitiveDependents = (() => {
    if ((viewMode !== 'dependents' && viewMode !== 'both') || !selectedNode) {
      return {
        nodes: new Set<string>(),
        edges: new Set<string>(),
        edgeDepths: new Map(),
        maxDepth: 0,
      };
    }

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const edgeDepths = new Map<string, number>();
    let maxDepth = 0;

    const stack: Array<{ id: string; depth: number }> = [{ id: selectedNode.id, depth: 0 }];

    while (stack.length > 0) {
      const { id, depth } = stack.pop()!;
      if (visitedNodes.has(id)) continue;
      visitedNodes.add(id);
      maxDepth = Math.max(maxDepth, depth);

      const neighbors = incoming.get(id) ?? [];
      for (const source of neighbors) {
        const edgeKey = `${source}->${id}`;
        if (!visitedEdges.has(edgeKey)) {
          visitedEdges.add(edgeKey);
          edgeDepths.set(edgeKey, depth);
        }
        stack.push({ id: source, depth: depth + 1 });
      }
    }

    return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
  })();

  return { transitiveDeps, transitiveDependents };
}
