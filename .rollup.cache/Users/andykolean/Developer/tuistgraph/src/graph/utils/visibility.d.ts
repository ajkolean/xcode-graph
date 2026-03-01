/**
 * Node Visibility Utilities
 *
 * Functions for determining node and edge visibility based on
 * selection, search queries, and filtering criteria.
 *
 * @module utils/graph/visibility
 */
import type { GraphEdge, GraphNode as GraphNodeType } from '@shared/schemas/graph.types';
/**
 * Check if a node matches the search query
 *
 * Searches node name, type, and project fields (case-insensitive).
 *
 * @param node - The node to check
 * @param searchQuery - Search string
 * @returns True if node matches query
 */
export declare function matchesSearch(node: GraphNodeType, searchQuery: string): boolean;
/**
 * Get IDs of all nodes connected to the selected node
 *
 * Includes the selected node itself plus all its dependencies and dependents.
 *
 * @param selectedNode - Currently selected node (or null)
 * @param edges - All graph edges
 * @returns Set of connected node IDs
 */
export declare function getConnectedNodeIds(selectedNode: GraphNodeType | null, edges: GraphEdge[]): Set<string>;
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
export declare function shouldDimNode(node: GraphNodeType, selectedNode: GraphNodeType | null, connectedNodes: Set<string>, searchQuery: string): boolean;
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
export declare function shouldShowEdge(edge: GraphEdge, selectedNode: GraphNodeType | null, searchQuery: string, nodes: GraphNodeType[]): boolean;
//# sourceMappingURL=visibility.d.ts.map