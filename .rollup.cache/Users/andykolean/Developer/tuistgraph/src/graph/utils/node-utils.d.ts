/**
 * Node Computation Utilities
 *
 * Framework-agnostic utilities for node-related computations.
 * Converted from React hooks to pure functions for Lit compatibility.
 *
 * @module utils/graph/node-utils
 */
import type { FilterState } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
/**
 * A node with its associated edge information
 */
export interface NodeWithEdge {
    node: GraphNode;
    edge: GraphEdge;
}
/**
 * Statistics about a cluster's connectivity
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
 */
export declare function computeNodeDependencies(node: GraphNode | null, allNodes: GraphNode[], edges: GraphEdge[], filteredEdges?: GraphEdge[]): {
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
};
/**
 * Compute statistics for a cluster
 *
 * Calculates connectivity metrics and platform distribution.
 *
 * @param clusterNodes - Nodes in the cluster
 * @param edges - All graph edges
 * @param filteredEdges - Optional filtered edges for metrics
 * @returns Cluster connectivity statistics
 */
export declare function computeClusterStats(clusterNodes: GraphNode[], edges: GraphEdge[], filteredEdges?: GraphEdge[]): ClusterStatsResult;
/**
 * Compute filter counts and utilities from node data
 *
 * Analyzes nodes to determine available filter options and counts.
 *
 * @param allNodes - All graph nodes
 * @returns Filter counts and utility functions
 */
export declare function computeFilters(allNodes: GraphNode[]): {
    typeCounts: Map<string, number>;
    platformCounts: Map<string, number>;
    projectCounts: Map<string, number>;
    packageCounts: Map<string, number>;
    hasActiveFilters: (filters: FilterState) => boolean;
    createClearFilters: (onFiltersChange: (filters: FilterState) => void) => () => void;
};
