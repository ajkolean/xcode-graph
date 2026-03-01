/**
 * Node Connection Utilities
 *
 * Functions for analyzing direct connections between graph nodes.
 * Operates on edge lists to find dependencies and dependents.
 *
 * @module utils/graph/connections
 */
import type { GraphEdge } from '@shared/schemas/graph.types';
/**
 * Get all nodes connected to a given node
 *
 * Returns both dependencies (outgoing) and dependents (incoming).
 *
 * @param nodeId - The node to find connections for
 * @param edges - All graph edges
 * @returns Set of connected node IDs
 */
export declare function getConnectedNodes(nodeId: string, edges: GraphEdge[]): Set<string>;
/**
 * Count total connections for a node (both directions)
 *
 * @param nodeId - The node to count connections for
 * @param edges - All graph edges
 * @returns Total number of connections
 */
export declare function getConnectionCount(nodeId: string, edges: GraphEdge[]): number;
/**
 * Count outgoing edges (dependencies)
 *
 * @param nodeId - The node to count dependencies for
 * @param edges - All graph edges
 * @returns Number of dependencies
 */
export declare function getDependencyCount(nodeId: string, edges: GraphEdge[]): number;
/**
 * Count incoming edges (dependents)
 *
 * @param nodeId - The node to count dependents for
 * @param edges - All graph edges
 * @returns Number of dependents
 */
export declare function getDependentCount(nodeId: string, edges: GraphEdge[]): number;
//# sourceMappingURL=connections.d.ts.map