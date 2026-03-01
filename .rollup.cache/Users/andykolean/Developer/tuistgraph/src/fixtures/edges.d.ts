/**
 * Edge fixtures
 */
import type { GraphEdge } from '@shared/schemas/graph.types';
/**
 * Convert edges from {from, to} format to {source, target} format
 */
export declare function convertEdgeFormat(edges: Array<{
    from: string;
    to: string;
}>): GraphEdge[];
/**
 * Create edges for a set of nodes (fully connected)
 */
export declare function createFullyConnectedEdges(nodeIds: string[]): GraphEdge[];
//# sourceMappingURL=edges.d.ts.map