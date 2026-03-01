/**
 * Graph Test Fixtures
 *
 * Reusable test data generators for graph components.
 * Provides consistent mock data for nodes, edges, clusters, and positions.
 */
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
/**
 * Create a small test graph with 3 nodes and 2 edges
 */
export declare function createSmallTestGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create a medium-sized test graph with multiple clusters
 */
export declare function createMediumTestGraph(): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create mock node positions for testing
 */
export declare function createMockNodePositions(nodeIds: string[]): Map<string, NodePosition>;
/**
 * Create mock cluster positions for testing
 */
export declare function createMockClusterPositions(clusterIds: string[]): Map<string, ClusterPosition>;
/**
 * Create mock clusters from nodes
 */
export declare function createMockClusters(nodes: GraphNode[]): Cluster[];
/**
 * Create a single test node
 */
export declare function createTestNode(overrides?: Partial<GraphNode>): GraphNode;
/**
 * Create a single test edge
 */
export declare function createTestEdge(source?: string, target?: string): GraphEdge;
/**
 * Create transitive dependency result (for view mode testing)
 */
export declare function createTransitiveResult(nodeIds: string[], edgeKeys: string[]): {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
};
/**
 * Create a large test graph for performance testing
 */
export declare function createLargeTestGraph(nodeCount?: number): {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
/**
 * Create viewport bounds for virtual rendering tests
 */
export interface ViewportBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export declare function createViewportBounds(width?: number, height?: number, panX?: number, panY?: number, zoom?: number): ViewportBounds;
/**
 * Create a node positioned inside viewport
 */
export declare function createNodeInViewport(id: string, viewport: ViewportBounds): {
    node: GraphNode;
    position: NodePosition;
};
/**
 * Create a node positioned outside viewport
 */
export declare function createNodeOutsideViewport(id: string, viewport: ViewportBounds): {
    node: GraphNode;
    position: NodePosition;
};
