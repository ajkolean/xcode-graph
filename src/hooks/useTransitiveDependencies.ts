/**
 * Custom hook for calculating transitive dependency chains
 * Extracted from App.tsx for better modularity
 * Now tracks depth for visual fade-out effect
 */

import { useMemo } from 'react';
import { GraphNode, GraphEdge } from '../data/mockGraphData';
import { ViewMode } from '../types/app';

interface UseTransitiveDependenciesProps {
  viewMode: ViewMode;
  selectedNode: GraphNode | null;
  edges: GraphEdge[];
}

export function useTransitiveDependencies({ 
  viewMode, 
  selectedNode, 
  edges 
}: UseTransitiveDependenciesProps) {
  // Calculate transitive dependencies when in focused mode
  const transitiveDeps = useMemo(() => {
    if ((viewMode !== 'focused' && viewMode !== 'both') || !selectedNode) {
      return { 
        nodes: new Set<string>(), 
        edges: new Set<string>(),
        edgeDepths: new Map<string, number>(),
        maxDepth: 0
      };
    }

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const edgeDepths = new Map<string, number>();
    let maxDepth = 0;

    // DFS to traverse all dependencies until reaching leaf nodes
    const traverse = (nodeId: string, depth: number) => {
      if (visitedNodes.has(nodeId)) return; // Already visited (handles cycles)
      visitedNodes.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);

      // Find all outgoing edges (dependencies)
      edges.forEach(edge => {
        if (edge.source === nodeId) {
          const edgeKey = `${edge.source}->${edge.target}`;
          visitedEdges.add(edgeKey);
          edgeDepths.set(edgeKey, depth);

          // Recursively traverse this dependency
          traverse(edge.target, depth + 1);
        }
      });
    };

    // Start traversal from selected node at depth 0
    traverse(selectedNode.id, 0);

    return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
  }, [viewMode, selectedNode, edges]);

  // Calculate transitive dependents when in dependents mode (reverse direction)
  const transitiveDependents = useMemo(() => {
    if ((viewMode !== 'dependents' && viewMode !== 'both') || !selectedNode) {
      return { 
        nodes: new Set<string>(), 
        edges: new Set<string>(),
        edgeDepths: new Map<string, number>(),
        maxDepth: 0
      };
    }

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const edgeDepths = new Map<string, number>();
    let maxDepth = 0;

    // DFS to traverse all dependents until reaching root nodes
    const traverse = (nodeId: string, depth: number) => {
      if (visitedNodes.has(nodeId)) return; // Already visited (handles cycles)
      visitedNodes.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);

      // Find all incoming edges (dependents)
      edges.forEach(edge => {
        if (edge.target === nodeId) {
          const edgeKey = `${edge.source}->${edge.target}`;
          visitedEdges.add(edgeKey);
          edgeDepths.set(edgeKey, depth);

          // Recursively traverse this dependent
          traverse(edge.source, depth + 1);
        }
      });
    };

    // Start traversal from selected node at depth 0
    traverse(selectedNode.id, 0);

    return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, maxDepth };
  }, [viewMode, selectedNode, edges]);

  return {
    transitiveDeps,
    transitiveDependents
  };
}