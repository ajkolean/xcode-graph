/**
 * Node Connection Utilities
 *
 * Functions for analyzing direct connections between graph nodes.
 * Operates on edge lists to find dependencies and dependents.
 *
 * @module utils/graph/connections
 */
// ==================== Connection Analysis ====================
/**
 * Get all nodes connected to a given node
 *
 * Returns both dependencies (outgoing) and dependents (incoming).
 *
 * @param nodeId - The node to find connections for
 * @param edges - All graph edges
 * @returns Set of connected node IDs
 */
export function getConnectedNodes(nodeId, edges) {
    const connected = new Set();
    for (const edge of edges) {
        if (edge.source === nodeId) {
            connected.add(edge.target);
        }
        else if (edge.target === nodeId) {
            connected.add(edge.source);
        }
    }
    return connected;
}
/**
 * Count total connections for a node (both directions)
 *
 * @param nodeId - The node to count connections for
 * @param edges - All graph edges
 * @returns Total number of connections
 */
export function getConnectionCount(nodeId, edges) {
    return edges.filter((e) => e.source === nodeId || e.target === nodeId).length;
}
/**
 * Count outgoing edges (dependencies)
 *
 * @param nodeId - The node to count dependencies for
 * @param edges - All graph edges
 * @returns Number of dependencies
 */
export function getDependencyCount(nodeId, edges) {
    return edges.filter((e) => e.source === nodeId).length;
}
/**
 * Count incoming edges (dependents)
 *
 * @param nodeId - The node to count dependents for
 * @param edges - All graph edges
 * @returns Number of dependents
 */
export function getDependentCount(nodeId, edges) {
    return edges.filter((e) => e.target === nodeId).length;
}
//# sourceMappingURL=connections.js.map