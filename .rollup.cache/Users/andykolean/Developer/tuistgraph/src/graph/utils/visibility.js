/**
 * Node Visibility Utilities
 *
 * Functions for determining node and edge visibility based on
 * selection, search queries, and filtering criteria.
 *
 * @module utils/graph/visibility
 */
import { getConnectedNodes } from './connections';
// ==================== Search Matching ====================
/**
 * Check if a node matches the search query
 *
 * Searches node name, type, and project fields (case-insensitive).
 *
 * @param node - The node to check
 * @param searchQuery - Search string
 * @returns True if node matches query
 */
export function matchesSearch(node, searchQuery) {
    if (!searchQuery)
        return true;
    const query = searchQuery.toLowerCase();
    return (node.name.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query) ||
        node.project?.toLowerCase().includes(query) ||
        false);
}
// ==================== Connection Analysis ====================
/**
 * Get IDs of all nodes connected to the selected node
 *
 * Includes the selected node itself plus all its dependencies and dependents.
 *
 * @param selectedNode - Currently selected node (or null)
 * @param edges - All graph edges
 * @returns Set of connected node IDs
 */
export function getConnectedNodeIds(selectedNode, edges) {
    if (!selectedNode)
        return new Set();
    const connected = getConnectedNodes(selectedNode.id, edges);
    connected.add(selectedNode.id);
    return connected;
}
// ==================== Visibility Logic ====================
/**
 * Determine if a node should be dimmed (de-emphasized)
 *
 * Nodes are dimmed when:
 * - There's a search query and the node doesn't match
 * - A node is selected and this node is not connected to it
 *
 * @param node - The node to check
 * @param selectedNode - Currently selected node (or null)
 * @param connectedNodes - Set of node IDs connected to selection
 * @param searchQuery - Current search string
 * @returns True if node should be dimmed
 */
export function shouldDimNode(node, selectedNode, connectedNodes, searchQuery) {
    // If there's a search query and node doesn't match, dim it
    if (searchQuery && !matchesSearch(node, searchQuery)) {
        return true;
    }
    // If a node is selected and this node is not connected, dim it
    if (selectedNode && !connectedNodes.has(node.id)) {
        return true;
    }
    return false;
}
/**
 * Determine if an edge should be visible
 *
 * Edge visibility rules:
 * - With search: both connected nodes must match query
 * - With selection: edge must connect to selected node
 * - Otherwise: always visible
 *
 * @param edge - The edge to check
 * @param selectedNode - Currently selected node (or null)
 * @param searchQuery - Current search string
 * @param nodes - All graph nodes
 * @returns True if edge should be shown
 */
export function shouldShowEdge(edge, selectedNode, searchQuery, nodes) {
    // If there's a search query, only show edges where both nodes match
    if (searchQuery) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode)
            return false;
        const sourceMatches = matchesSearch(sourceNode, searchQuery);
        const targetMatches = matchesSearch(targetNode, searchQuery);
        return sourceMatches && targetMatches;
    }
    // If a node is selected, only show edges connected to it
    if (selectedNode) {
        return edge.source === selectedNode.id || edge.target === selectedNode.id;
    }
    return true;
}
//# sourceMappingURL=visibility.js.map