/**
 * Data Actions - State mutation functions for data signals
 *
 * Contains actions for initializing and updating graph data.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/data.actions
 */
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
/**
 * Set graph data (nodes and edges)
 * @param newNodes - Array of graph nodes
 * @param newEdges - Array of graph edges
 */
export declare function setGraphData(newNodes: GraphNode[], newEdges: GraphEdge[]): void;
/**
 * Clear all graph data
 */
export declare function clearGraphData(): void;
//# sourceMappingURL=data.actions.d.ts.map