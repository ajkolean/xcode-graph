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

export function computeTransitiveDependencies(
  viewMode: ViewMode,
  selectedNode: GraphNode | null,
  edges: GraphEdge[],
): { transitiveDeps: TransitiveResult; transitiveDependents: TransitiveResult } {
  // Dependencies (outgoing)
  const transitiveDeps = (() => {
    if ((viewMode !== 'focused' && viewMode !== 'both') || !selectedNode) {
      return { nodes: new Set<string>(), edges: new Set<string>(), edgeDepths: new Map(), maxDepth: 0 };
    }

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const edgeDepths = new Map<string, number>();
    let maxDepth = 0;

    const traverse = (nodeId: string, depth: number) => {
      if (visitedNodes.has(nodeId)) return;
      visitedNodes.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);

      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          const edgeKey = `${edge.source}->${edge.target}`;
          visitedEdges.add(edgeKey);
          edgeDepths.set(edgeKey, depth);
          traverse(edge.target, depth + 1);
        }
      });
    };

    traverse(selectedNode.id, 0);
    return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
  })();

  // Dependents (incoming)
  const transitiveDependents = (() => {
    if ((viewMode !== 'dependents' && viewMode !== 'both') || !selectedNode) {
      return { nodes: new Set<string>(), edges: new Set<string>(), edgeDepths: new Map(), maxDepth: 0 };
    }

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const edgeDepths = new Map<string, number>();
    let maxDepth = 0;

    const traverse = (nodeId: string, depth: number) => {
      if (visitedNodes.has(nodeId)) return;
      visitedNodes.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);

      edges.forEach((edge) => {
        if (edge.target === nodeId) {
          const edgeKey = `${edge.source}->${edge.target}`;
          visitedEdges.add(edgeKey);
          edgeDepths.set(edgeKey, depth);
          traverse(edge.source, depth + 1);
        }
      });
    };

    traverse(selectedNode.id, 0);
    return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
  })();

  return { transitiveDeps, transitiveDependents };
}
