/**
 * Utilities for analyzing node connections
 */

import type { GraphEdge } from '../../data/mockGraphData';
import { getConnectedNodes as getConnectedNodesService } from '../../services/graphService';

/**
 * Get all nodes connected to a given node (both dependencies and dependents)
 * @deprecated Use graphService.getConnectedNodes instead for more detailed info
 */
export function getConnectedNodes(nodeId: string, edges: GraphEdge[]): Set<string> {
  const { dependencies, dependents } = getConnectedNodesService(nodeId, edges);
  return new Set([...dependencies, ...dependents]);
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
