/**
 * Node Computation Utilities
 *
 * Framework-agnostic utilities for node-related computations.
 * Converted from React hooks to pure functions for Lit compatibility.
 *
 * @module utils/graph/node-utils
 */

import type { FilterState } from '@shared/schemas';
import {
  type GraphEdge,
  type GraphNode,
  NodeType,
  Origin,
  type Platform,
} from '@shared/schemas/graph.types';
import { DirectedGraph } from 'graphology';

/**
 * A node with its associated edge information
 *
 * @public
 */
export interface NodeWithEdge {
  node: GraphNode;
  edge: GraphEdge;
}

/**
 * Statistics about a cluster's connectivity
 *
 * @public
 */
export interface ClusterStatsResult {
  filteredDependencies: number;
  totalDependencies: number;
  filteredDependents: number;
  totalDependents: number;
  filteredTargetsCount: number;
  platforms: Set<string>;
}

/**
 * Compute dependencies and dependents for a node.
 *
 * Analyzes both filtered and total edge counts for metrics.
 * Returns nodes with their associated edge information for displaying dependency kinds.
 *
 * @param node - The node to analyze (or null)
 * @param allNodes - All graph nodes for lookup
 * @param edges - All graph edges
 * @param filteredEdges - Optional filtered edges for metrics
 * @returns Dependencies, dependents (with edge info), and connection metrics
 *
 * @example
 * ```ts
 * const { dependencies, dependents, metrics } = computeNodeDependencies(
 *   selectedNode,
 *   allNodes,
 *   edges,
 * );
 * console.log(`${metrics.transitiveDependencyCount} transitive deps`);
 * ```
 *
 * @public
 */
export function computeNodeDependencies(
  node: GraphNode | null,
  allNodes: GraphNode[],
  edges: GraphEdge[],
  filteredEdges?: GraphEdge[],
): {
  dependencies: NodeWithEdge[];
  dependents: NodeWithEdge[];
  metrics: {
    dependencyCount: number;
    dependentCount: number;
    totalDependencyCount: number;
    totalDependentCount: number;
    transitiveDependencyCount: number;
    transitiveDependentCount: number;
    isHighFanIn: boolean;
    isHighFanOut: boolean;
    totalConnections: number;
  };
} {
  if (!node) {
    return {
      dependencies: [],
      dependents: [],
      metrics: {
        dependencyCount: 0,
        dependentCount: 0,
        totalDependencyCount: 0,
        totalDependentCount: 0,
        transitiveDependencyCount: 0,
        transitiveDependentCount: 0,
        isHighFanIn: false,
        isHighFanOut: false,
        totalConnections: 0,
      },
    };
  }

  const edgesToUse = filteredEdges || edges;
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  // Dependencies (outgoing edges) - include edge info
  const dependencies: NodeWithEdge[] = edgesToUse
    .filter((e) => e.source === node.id)
    .map((edge) => {
      const targetNode = nodeMap.get(edge.target);
      return targetNode ? { node: targetNode, edge } : null;
    })
    .filter((item): item is NodeWithEdge => item !== null);

  // Dependents (incoming edges) - include edge info
  const dependents: NodeWithEdge[] = edgesToUse
    .filter((e) => e.target === node.id)
    .map((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      return sourceNode ? { node: sourceNode, edge } : null;
    })
    .filter((item): item is NodeWithEdge => item !== null);

  // Total counts (unfiltered direct)
  const totalDependencyCount = edges.filter(
    (e) => e.source === node.id && nodeMap.has(e.target),
  ).length;
  const totalDependentCount = edges.filter(
    (e) => e.target === node.id && nodeMap.has(e.source),
  ).length;

  // Transitive counts using graphology for adjacency
  const graph = new DirectedGraph();
  for (const e of edges) {
    if (!graph.hasNode(e.source)) graph.addNode(e.source);
    if (!graph.hasNode(e.target)) graph.addNode(e.target);
    graph.addEdge(e.source, e.target);
  }

  /** BFS traversal to count all transitive nodes in the given direction. */
  const countTransitive = (startId: string, direction: 'out' | 'in'): number => {
    const visited = new Set<string>([startId]);
    const queue = [startId];
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) break;
      const neighbors = direction === 'out' ? graph.outNeighbors(id) : graph.inNeighbors(id);
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return visited.size - 1; // exclude start node
  };

  const transitiveDependencyCount = graph.hasNode(node.id) ? countTransitive(node.id, 'out') : 0;
  const transitiveDependentCount = graph.hasNode(node.id) ? countTransitive(node.id, 'in') : 0;

  const depCount = dependencies.length;
  const depsCount = dependents.length;

  return {
    dependencies,
    dependents,
    metrics: {
      dependencyCount: depCount,
      dependentCount: depsCount,
      totalDependencyCount,
      totalDependentCount,
      transitiveDependencyCount,
      transitiveDependentCount,
      isHighFanIn: depsCount > 3,
      isHighFanOut: depCount > 3,
      totalConnections: depCount + depsCount,
    },
  };
}

/**
 * Compute statistics for a cluster
 *
 * Calculates connectivity metrics and platform distribution.
 *
 * @param clusterNodes - Nodes in the cluster
 * @param edges - All graph edges
 * @param filteredEdges - Optional filtered edges for metrics
 * @returns Cluster connectivity statistics
 *
 * @public
 */
export function computeClusterStats(
  clusterNodes: GraphNode[],
  edges: GraphEdge[],
  filteredEdges?: GraphEdge[],
): ClusterStatsResult {
  const edgesToUse = filteredEdges || edges;
  const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));

  // Filtered stats
  const filteredDependencies = edgesToUse.filter((e) => clusterNodeIds.has(e.source)).length;
  const filteredDependents = edgesToUse.filter((e) => clusterNodeIds.has(e.target)).length;

  // Total stats
  const totalDependencies = edges.filter((e) => clusterNodeIds.has(e.source)).length;
  const totalDependents = edges.filter((e) => clusterNodeIds.has(e.target)).length;

  // Filtered targets count
  const filteredClusterNodeIds = new Set(
    filteredEdges
      ? clusterNodes
          .filter((node) => filteredEdges.some((e) => e.source === node.id || e.target === node.id))
          .map((n) => n.id)
      : clusterNodes.map((n) => n.id),
  );
  const filteredTargetsCount = filteredClusterNodeIds.size;

  // Platforms — use deploymentTargets keys when available for multi-platform support
  const platforms = new Set<string>();
  clusterNodes.forEach((node) => {
    if (node.deploymentTargets) {
      for (const platform of Object.keys(node.deploymentTargets)) {
        platforms.add(platform);
      }
    } else if (node.platform) {
      platforms.add(node.platform);
    }
  });

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
 * Compute filter counts and utilities from node data
 *
 * Analyzes nodes to determine available filter options and counts.
 *
 * @param allNodes - All graph nodes
 * @returns Filter counts and utility functions
 *
 * @public
 */
export function computeFilters(allNodes: GraphNode[]): {
  typeCounts: Map<string, number>;
  platformCounts: Map<string, number>;
  projectCounts: Map<string, number>;
  packageCounts: Map<string, number>;
  hasActiveFilters: (filters: FilterState) => boolean;
  createClearFilters: (onFiltersChange: (filters: FilterState) => void) => () => void;
} {
  const typeCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    typeCounts.set(node.type, (typeCounts.get(node.type) || 0) + 1);
  });

  const platformCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    // Count all platforms from deploymentTargets if available, otherwise fall back to single platform
    if (node.deploymentTargets) {
      for (const platform of Object.keys(node.deploymentTargets)) {
        platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
      }
    } else {
      platformCounts.set(node.platform, (platformCounts.get(node.platform) || 0) + 1);
    }
  });

  const projectCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    if (node.project && node.type !== NodeType.Package) {
      projectCounts.set(node.project, (projectCounts.get(node.project) || 0) + 1);
    }
  });

  const packageCounts = new Map<string, number>();
  allNodes.forEach((node) => {
    if (node.type === NodeType.Package) {
      packageCounts.set(node.name, (packageCounts.get(node.name) || 0) + 1);
    }
  });

  /** Returns `true` if any filter category has fewer items selected than available. */
  const hasActiveFilters = (filters: FilterState): boolean => {
    return (
      filters.nodeTypes.size < typeCounts.size ||
      filters.platforms.size < platformCounts.size ||
      filters.projects.size < projectCounts.size ||
      filters.packages.size < packageCounts.size
    );
  };

  /** Creates a callback that resets all filters to include every available option. */
  const createClearFilters = (onFiltersChange: (filters: FilterState) => void) => {
    return () => {
      onFiltersChange({
        nodeTypes: new Set(typeCounts.keys()) as Set<NodeType>,
        platforms: new Set(platformCounts.keys()) as Set<Platform>,
        origins: new Set([Origin.Local, Origin.External]),
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
