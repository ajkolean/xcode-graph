/**
 * Custom hook for cluster statistics calculation
 * Extracts stats logic from ClusterDetailsPanel
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';

interface ClusterStatsResult {
  filteredDependencies: number;
  totalDependencies: number;
  filteredDependents: number;
  totalDependents: number;
  filteredTargetsCount: number;
  platforms: Set<string>;
}

export function useClusterStats(
  clusterNodes: GraphNode[],
  edges: GraphEdge[],
  filteredEdges?: GraphEdge[],
): ClusterStatsResult {
  // Use filtered edges if available, otherwise use all edges
  const edgesToUse = filteredEdges || edges;

  // Calculate filtered/current stats
  const filteredDependencies = edgesToUse.filter((e) =>
    clusterNodes.some((n) => n.id === e.source),
  ).length;

  const filteredDependents = edgesToUse.filter((e) =>
    clusterNodes.some((n) => n.id === e.target),
  ).length;

  // Calculate total stats (always use all edges for totals)
  const totalDependencies = edges.filter((e) => clusterNodes.some((n) => n.id === e.source)).length;

  const totalDependents = edges.filter((e) => clusterNodes.some((n) => n.id === e.target)).length;

  // Count filtered targets
  const filteredClusterNodeIds = new Set(
    filteredEdges
      ? clusterNodes
          .filter((node) => {
            // A node is visible if it has any edges in filteredEdges
            return filteredEdges.some((e) => e.source === node.id || e.target === node.id);
          })
          .map((n) => n.id)
      : clusterNodes.map((n) => n.id),
  );
  const filteredTargetsCount = filteredClusterNodeIds.size;

  // Count platforms
  const platforms = new Set(clusterNodes.flatMap((n) => n.platforms || []).filter(Boolean));

  return {
    filteredDependencies,
    totalDependencies,
    filteredDependents,
    totalDependents,
    filteredTargetsCount,
    platforms,
  };
}
