/**
 * Utilities for calculating node sizes
 */
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
/**
 * Calculates the size of a node based on its type and transitive weight.
 * When weight is provided, uses a hyperbolic scale for smoother differentiation.
 * Falls back to direct edge count when weight is not available.
 *
 * @param node - The graph node to size
 * @param edges - All graph edges (used as fallback when weight is not provided)
 * @param weight - Optional pre-computed transitive dependency weight
 * @returns Computed radius in graph units
 */
export declare function getNodeSize(node: GraphNode, edges: GraphEdge[], weight?: number): number;
/**
 * Gets the base size for a node type without connection scaling.
 *
 * @param type - The node type string (e.g., `'app'`, `'framework'`)
 * @returns Base radius in graph units
 */
export declare function getBaseNodeSize(type: string): number;
/**
 * Compute transitive dependency weight for every node in a single pass.
 *
 * Uses Kahn's topological sort, then accumulates bottom-up (leaves first).
 * Each node's weight equals the total number of transitive dependencies.
 *
 * @param nodes - All graph nodes
 * @param edges - All graph edges
 * @returns Map from node ID to its transitive dependency count
 */
export declare function computeNodeWeights(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number>;
//# sourceMappingURL=sizing.d.ts.map