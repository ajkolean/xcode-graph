/**
 * Mock GraphEdge data for tests and fixtures
 */
import type { GraphEdge } from '@shared/schemas/graph.types';
export declare const mockEdge: GraphEdge;
export declare const mockEdgeReverse: GraphEdge;
export declare const mockGraphEdges: GraphEdge[];
export declare const fewEdges: GraphEdge[];
export declare const manyEdges: GraphEdge[];
/**
 * Get edges for a specific source node
 */
export declare function getEdgesForSource(sourceId: string): GraphEdge[];
/**
 * Get edges for a specific target node (dependents)
 */
export declare function getEdgesForTarget(targetId: string): GraphEdge[];
/**
 * Get all edges connected to a node (both source and target)
 */
export declare function getConnectedEdges(nodeId: string): GraphEdge[];
//# sourceMappingURL=mockEdges.d.ts.map