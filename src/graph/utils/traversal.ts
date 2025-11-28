/**
 * Graph traversal utilities
 * Converted from useTransitiveDependencies hook
 */

import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';

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

/**
 * Generic graph traversal using DFS
 *
 * @param startId - Starting node ID
 * @param getNeighbors - Function to get neighboring node IDs
 * @param getEdgeKey - Function to construct edge key from current and neighbor IDs
 * @returns Traversal result with visited nodes, edges, depths, and max depth
 */
function traverseGraph(
  startId: string,
  getNeighbors: (id: string) => string[],
  getEdgeKey: (currentId: string, neighborId: string) => string,
): TransitiveResult {
  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();
  const edgeDepths = new Map<string, number>();
  let maxDepth = 0;

  const stack: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (stack.length > 0) {
    const { id, depth } = stack.pop()!;
    if (visitedNodes.has(id)) continue;
    visitedNodes.add(id);
    maxDepth = Math.max(maxDepth, depth);

    for (const neighbor of getNeighbors(id)) {
      const edgeKey = getEdgeKey(id, neighbor);
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.add(edgeKey);
        edgeDepths.set(edgeKey, depth);
      }
      stack.push({ id: neighbor, depth: depth + 1 });
    }
  }

  return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
}

/** Empty result for when traversal is not needed */
const EMPTY_RESULT: TransitiveResult = {
  nodes: new Set<string>(),
  edges: new Set<string>(),
  edgeDepths: new Map(),
  maxDepth: 0,
};

export function computeTransitiveDependencies(
  viewMode: ViewMode,
  selectedNode: GraphNode | null,
  edges: GraphEdge[],
): { transitiveDeps: TransitiveResult; transitiveDependents: TransitiveResult } {
  const { outgoing, incoming } = buildAdjacency(edges);

  // Dependencies (outgoing edges)
  const transitiveDeps =
    (viewMode === 'focused' || viewMode === 'both') && selectedNode
      ? traverseGraph(
          selectedNode.id,
          (id) => outgoing.get(id) ?? [],
          (current, neighbor) => `${current}->${neighbor}`,
        )
      : EMPTY_RESULT;

  // Dependents (incoming edges)
  const transitiveDependents =
    ['dependents', 'both', 'impact'].includes(viewMode) && selectedNode
      ? traverseGraph(
          selectedNode.id,
          (id) => incoming.get(id) ?? [],
          (current, neighbor) => `${neighbor}->${current}`,
        )
      : EMPTY_RESULT;

  return { transitiveDeps, transitiveDependents };
}
