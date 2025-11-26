/**
 * Custom hook for querying node dependencies and dependents
 */

import { useMemo } from 'react';
import { GraphNode, GraphEdge } from '../data/mockGraphData';

export function useNodeDependencies(
  node: GraphNode | null,
  allNodes: GraphNode[],
  edges: GraphEdge[],
  filteredEdges?: GraphEdge[]
) {
  const dependencies = useMemo(() => {
    if (!node) return [];
    
    const edgesToUse = filteredEdges || edges;
    return edgesToUse
      .filter(e => e.source === node.id)
      .map(e => allNodes.find(n => n.id === e.target))
      .filter((n): n is GraphNode => n !== undefined);
  }, [node, allNodes, edges, filteredEdges]);

  const dependents = useMemo(() => {
    if (!node) return [];
    
    const edgesToUse = filteredEdges || edges;
    return edgesToUse
      .filter(e => e.target === node.id)
      .map(e => allNodes.find(n => n.id === e.source))
      .filter((n): n is GraphNode => n !== undefined);
  }, [node, allNodes, edges, filteredEdges]);

  // Total counts (unfiltered)
  const totalDependencies = useMemo(() => {
    if (!node) return [];
    
    return edges
      .filter(e => e.source === node.id)
      .map(e => allNodes.find(n => n.id === e.target))
      .filter((n): n is GraphNode => n !== undefined);
  }, [node, allNodes, edges]);

  const totalDependents = useMemo(() => {
    if (!node) return [];
    
    return edges
      .filter(e => e.target === node.id)
      .map(e => allNodes.find(n => n.id === e.source))
      .filter((n): n is GraphNode => n !== undefined);
  }, [node, allNodes, edges]);

  const metrics = useMemo(() => {
    const depCount = dependencies.length;
    const depsCount = dependents.length;
    
    return {
      dependencyCount: depCount,
      dependentCount: depsCount,
      totalDependencyCount: totalDependencies.length,
      totalDependentCount: totalDependents.length,
      isHighFanIn: depsCount > 3,
      isHighFanOut: depCount > 3,
      totalConnections: depCount + depsCount
    };
  }, [dependencies, dependents, totalDependencies, totalDependents]);

  return {
    dependencies,
    dependents,
    metrics
  };
}