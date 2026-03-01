/**
 * Data Actions - State mutation functions for data signals
 *
 * Contains actions for initializing and updating graph data.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/data.actions
 */
import { edges, nodes } from './data.signals';
/**
 * Set graph data (nodes and edges)
 * @param newNodes - Array of graph nodes
 * @param newEdges - Array of graph edges
 */
export function setGraphData(newNodes, newEdges) {
    nodes.set(newNodes);
    edges.set(newEdges);
}
/**
 * Clear all graph data
 */
export function clearGraphData() {
    nodes.set([]);
    edges.set([]);
}
//# sourceMappingURL=data.actions.js.map