/**
 * Utility functions for node computations
 * Converted from React hooks to framework-agnostic utilities
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { FilterState } from '../types/app';

export interface ClusterStatsResult {
  filteredDependencies: number;
  totalDependencies: number;
  filteredDependents: number;
  totalDependents: number;
  filteredTargetsCount: number;
  platforms: Set<string>;
}

/**
 * Compute node dependencies and dependents
 * Converted from useNodeDependencies hook
 */
export function computeNodeDependencies(
  node: GraphNode | null,
  allNodes: GraphNode[],
  edges: GraphEdge[],
  filteredEdges?: GraphEdge[],
) {
  if (!node) {
    return {
      dependencies: [],
      dependents: [],
      metrics: {
        dependencyCount: 0,
        dependentCount: 0,
        totalDependencyCount: 0,
        totalDependentCount: 0,
        isHighFanIn: false,
        isHighFanOut: false,
        totalConnections: 0,
      },
    };
  }

  const edgesToUse = filteredEdges || edges;

  // Dependencies (outgoing edges)
  const dependencies = edgesToUse
    .filter((e) => e.source === node.id)
    .map((e) => allNodes.find((n) => n.id === e.target))
    .filter((n): n is GraphNode => n !== undefined);

  // Dependents (incoming edges)
  const dependents = edgesToUse
    .filter((e) => e.target === node.id)
    .map((e) => allNodes.find((n) => n.id === e.source))
    .filter((n): n is GraphNode => n !== undefined);

  // Total counts (unfiltered)
  const totalDependencies = edges
    .filter((e) => e.source === node.id)
    .map((e) => allNodes.find((n) => n.id === e.target))
    .filter((n): n is GraphNode => n !== undefined);

  const totalDependents = edges
    .filter((e) => e.target === node.id)
    .map((e) => allNodes.find((n) => n.id === e.source))
    .filter((n): n is GraphNode => n !== undefined);

  const depCount = dependencies.length;
  const depsCount = dependents.length;

  return {
    dependencies,
    dependents,
    metrics: {
      dependencyCount: depCount,
      dependentCount: depsCount,
      totalDependencyCount: totalDependencies.length,
      totalDependentCount: totalDependents.length,
      isHighFanIn: depsCount > 3,
      isHighFanOut: depCount > 3,
      totalConnections: depCount + depsCount,
    },
  };
}

/**
 * Compute cluster statistics
 * Converted from useClusterStats hook
 */
export function computeClusterStats(
  clusterNodes: GraphNode[],
  edges: GraphEdge[],
  filteredEdges?: GraphEdge[],
): ClusterStatsResult {
  const edgesToUse = filteredEdges || edges;

  // Filtered stats
  const filteredDependencies = edgesToUse.filter((e) => clusterNodes.some((n) => n.id === e.source)).length;
  const filteredDependents = edgesToUse.filter((e) => clusterNodes.some((n) => n.id === e.target)).length;

  // Total stats
  const totalDependencies = edges.filter((e) => clusterNodes.some((n) => n.id === e.source)).length;
  const totalDependents = edges.filter((e) => clusterNodes.some((n) => n.id === e.target)).length;

  // Filtered targets count
  const filteredClusterNodeIds = new Set(
    filteredEdges
      ? clusterNodes
          .filter((node) => filteredEdges.some((e) => e.source === node.id || e.target === node.id))
          .map((n) => n.id)
      : clusterNodes.map((n) => n.id),
  );
  const filteredTargetsCount = filteredClusterNodeIds.size;

  // Platforms
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

/**
 * Compute filter counts and utilities
 * Converted from useFilters hook
 */
export function computeFilters(allNodes: GraphNode[]) {
  const typeCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    typeCounts.set(node.type, (typeCounts.get(node.type) || 0) + 1);
  });

  const platformCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    platformCounts.set(node.platform, (platformCounts.get(node.platform) || 0) + 1);
  });

  const projectCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    if (node.project && node.type !== 'package') {
      projectCounts.set(node.project, (projectCounts.get(node.project) || 0) + 1);
    }
  });

  const packageCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    if (node.type === 'package') {
      packageCounts.set(node.name, (packageCounts.get(node.name) || 0) + 1);
    }
  });

  const hasActiveFilters = (filters: FilterState): boolean => {
    return (
      filters.nodeTypes.size < typeCounts.size ||
      filters.platforms.size < platformCounts.size ||
      filters.projects.size < projectCounts.size ||
      filters.packages.size < packageCounts.size
    );
  };

  const createClearFilters = (onFiltersChange: (filters: FilterState) => void) => {
    return () => {
      onFiltersChange({
        nodeTypes: new Set(typeCounts.keys()),
        platforms: new Set(platformCounts.keys()),
        origins: new Set(['local', 'external']),
        projects: new Set(projectCounts.keys()),
        packages: new Set(packageCounts.keys()),
      });
    };
  };

  return {
    typeCounts,
    platformCounts,
    projectCounts,
    packageCounts,
    hasActiveFilters,
    createClearFilters,
  };
}
