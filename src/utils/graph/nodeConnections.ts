/**
 * Utilities for analyzing node connections
 */

import type { GraphEdge } from '../../data/mockGraphData';

/**
 * Get all nodes connected to a given node (both dependencies and dependents)
 */
export function getConnectedNodes(nodeId: string, edges: GraphEdge[]): Set<string> {
  const connected = new Set<string>();

  for (const edge of edges) {
    if (edge.source === nodeId) {
      connected.add(edge.target);
    } else if (edge.target === nodeId) {
      connected.add(edge.source);
    }
  }

  return connected;
}

/**
 * Counts the number of connections for a node
 */
export function getConnectionCount(nodeId: string, edges: GraphEdge[]): number {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId).length;
}

/**
 * Gets dependency count (outgoing edges)
 */
export function getDependencyCount(nodeId: string, edges: GraphEdge[]): number {
  return edges.filter((e) => e.source === nodeId).length;
}

/**
 * Gets dependent count (incoming edges)
 */
export function getDependentCount(nodeId: string, edges: GraphEdge[]): number {
  return edges.filter((e) => e.target === nodeId).length;
}
