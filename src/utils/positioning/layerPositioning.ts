/**
 * Layer-based radial positioning for nodes
 */

import type { GraphNode } from '../../data/mockGraphData';
import type { Cluster, ClusterLayoutConfig } from '../../types/cluster';

/**
 * Calculates adjusted radius for a layer based on node count
 */
export function calculateLayerRadius(
  layer: number,
  nodeCount: number,
  config: ClusterLayoutConfig,
): number {
  if (layer === 0) return 0;

  const baseRadius = config.layerSpacing * layer;
  const nodeSpacing = config.minNodeSpacing;
  const requiredCircumference = nodeCount * nodeSpacing;
  const minRadiusForSpacing = requiredCircumference / (2 * Math.PI);

  return Math.max(baseRadius, minRadiusForSpacing);
}

/**
 * Groups nodes by their role
 */
export function groupNodesByRole(nodes: GraphNode[], cluster: Cluster): Map<string, GraphNode[]> {
  const nodesByRole = new Map<string, GraphNode[]>();

  nodes.forEach((node) => {
    const metadata = cluster.metadata.get(node.id)!;
    const role = metadata.role;
    if (!nodesByRole.has(role)) {
      nodesByRole.set(role, []);
    }
    nodesByRole.get(role)!.push(node);
  });

  return nodesByRole;
}

/**
 * Determines if role-based sectors should be used
 */
export function shouldUseSectors(activeRoles: string[], totalNodes: number): boolean {
  return activeRoles.length > 1 || totalNodes <= 6;
}
