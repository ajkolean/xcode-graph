/**
 * Utilities for determining node and edge visibility in the graph
 */

import { GraphNode as GraphNodeType, GraphEdge } from '../../data/mockGraphData';

/**
 * Determines if a node matches the search query
 */
export function matchesSearch(node: GraphNodeType, searchQuery: string): boolean {
  if (!searchQuery) return true;
  
  const query = searchQuery.toLowerCase();
  return (
    node.name.toLowerCase().includes(query) ||
    node.type.toLowerCase().includes(query) ||
    node.project?.toLowerCase().includes(query) ||
    false
  );
}

/**
 * Gets all nodes that are connected to the selected node (dependencies and dependents)
 */
export function getConnectedNodeIds(
  selectedNode: GraphNodeType | null,
  edges: GraphEdge[]
): Set<string> {
  if (!selectedNode) return new Set();

  const connected = new Set<string>();
  connected.add(selectedNode.id);

  edges.forEach(edge => {
    if (edge.source === selectedNode.id) {
      connected.add(edge.target);
    }
    if (edge.target === selectedNode.id) {
      connected.add(edge.source);
    }
  });

  return connected;
}

/**
 * Determines if a node should be dimmed based on selection and search
 */
export function shouldDimNode(
  node: GraphNodeType,
  selectedNode: GraphNodeType | null,
  connectedNodes: Set<string>,
  searchQuery: string
): boolean {
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
 * Determines if an edge should be visible based on selection and search
 */
export function shouldShowEdge(
  edge: GraphEdge,
  selectedNode: GraphNodeType | null,
  searchQuery: string,
  nodes: GraphNodeType[]
): boolean {
  // If there's a search query, only show edges where both nodes match
  if (searchQuery) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return false;
    
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
