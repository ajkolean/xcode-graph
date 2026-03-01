/**
 * Graph structure fixtures - common graph patterns for testing
 */
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
/**
 * Create a simple linear dependency chain: A -> B -> C -> D
 * Supports arbitrary lengths with numeric IDs for chains > 26 nodes
 */
export declare function createLinearChain(length?: number): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a diamond dependency pattern:
 *     A
 *    / \
 *   B   C
 *    \ /
 *     D
 */
export declare function createDiamondGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a graph with a cycle: A -> B -> C -> A
 */
export declare function createCyclicGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a realistic project-like graph with multiple node types
 */
export declare function createProjectGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create an empty graph
 */
export declare function createEmptyGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a graph with a single isolated node
 */
export declare function createSingleNodeGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a graph with multiple SCCs (Strongly Connected Components)
 * Useful for testing cycle detection and highlighting
 *
 * Structure:
 * - Cycle 1: A -> B -> C -> A (3-node cycle)
 * - Cycle 2: D -> E -> D (2-node cycle)
 * - Linear: F -> G -> H (no cycle)
 * - Cross-component edges connecting them
 */
export declare function createMultiCycleGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a layered graph with clear strata structure
 * Each layer depends on the next, creating a clean hierarchical layout
 *
 * @param layers Number of horizontal layers
 * @param nodesPerLayer Number of nodes in each layer
 */
export declare function createLayeredGraph(layers?: number, nodesPerLayer?: number): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a multi-cluster graph with cross-cluster dependencies
 * Useful for testing cluster layout and edge bundling
 *
 * @param clusterCount Number of clusters to create
 * @param nodesPerCluster Number of nodes in each cluster
 */
export declare function createMultiClusterGraph(clusterCount?: number, nodesPerCluster?: number): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
