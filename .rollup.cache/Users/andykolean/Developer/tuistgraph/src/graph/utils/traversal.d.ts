/**
 * Graph traversal utilities with memoization
 * Converted from useTransitiveDependencies hook
 *
 * Performance optimization: Caches transitive dependency computations
 * to avoid repeated DFS traversals on the same graph structure.
 */
import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
export interface TransitiveResult {
    /** Set of visited node IDs */
    nodes: Set<string>;
    /** Set of visited edge keys (formatted as `"source->target"`) */
    edges: Set<string>;
    /** Map from edge key to its depth in the traversal */
    edgeDepths: Map<string, number>;
    /** Map from node ID to its depth in the traversal */
    nodeDepths: Map<string, number>;
    /** Maximum depth reached during traversal */
    maxDepth: number;
}
/**
 * Build outgoing and incoming adjacency lists from a list of edges.
 *
 * @param edges - The graph edges to index
 * @returns An object with `outgoing` (source → targets) and `incoming` (target → sources) maps
 *
 * @example
 * ```ts
 * const edges = [{ source: 'A', target: 'B' }, { source: 'A', target: 'C' }];
 * const { outgoing, incoming } = buildAdjacency(edges);
 * outgoing.get('A'); // ['B', 'C']
 * incoming.get('B'); // ['A']
 * ```
 */
export declare function buildAdjacency(edges: GraphEdge[]): {
    outgoing: Map<string, string[]>;
    incoming: Map<string, string[]>;
};
/**
 * Generic graph traversal using DFS
 *
 * @param startId - Starting node ID
 * @param getNeighbors - Function to get neighboring node IDs
 * @param getEdgeKey - Function to construct edge key from current and neighbor IDs
 * @returns Traversal result with visited nodes, edges, depths, and max depth
 */
export declare function traverseGraph(startId: string, getNeighbors: (id: string) => string[], getEdgeKey: (currentId: string, neighborId: string) => string): TransitiveResult;
/**
 * Compute transitive dependencies and/or dependents for a selected node.
 *
 * Results are memoized via an internal LRU cache keyed by edge identity.
 *
 * @param viewMode - Which direction to traverse (`'focused'` for deps, `'dependents'`, or `'both'`)
 * @param selectedNode - The node to start traversal from (or `null` for empty result)
 * @param edges - All graph edges
 * @returns Object containing `transitiveDeps` and `transitiveDependents` traversal results
 */
export declare function computeTransitiveDependencies(viewMode: ViewMode, selectedNode: GraphNode | null, edges: GraphEdge[]): {
    transitiveDeps: TransitiveResult;
    transitiveDependents: TransitiveResult;
};
/**
 * Export cache stats for debugging and testing
 */
export declare function getTransitiveCacheStats(): {
    size: number;
    maxSize: number;
    version: number;
};
//# sourceMappingURL=traversal.d.ts.map