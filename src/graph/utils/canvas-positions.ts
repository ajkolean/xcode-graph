/** Shared position resolution utilities for canvas renderers */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';

/**
 * Resolve a node's world position by combining layout position with manual overrides.
 * Returns null if the node or its cluster has no layout position.
 */
export function resolveNodeWorldPosition(
  nodeId: string,
  clusterId: string,
  layout: GraphLayoutController,
  manualNodePositions: Map<string, { x: number; y: number }>,
  manualClusterPositions: Map<string, { x: number; y: number }>,
): { x: number; y: number } | null {
  const layoutPos = layout.nodePositions.get(nodeId);
  const layoutClusterPos = layout.clusterPositions.get(clusterId);
  if (!layoutPos || !layoutClusterPos) return null;

  const manualClusterPos = manualClusterPositions.get(clusterId);
  const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
  const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;

  const manualPos = manualNodePositions.get(nodeId);
  return {
    x: clusterX + (manualPos?.x ?? layoutPos.x),
    y: clusterY + (manualPos?.y ?? layoutPos.y),
  };
}

/**
 * Resolve a cluster's world position with manual override.
 */
export function resolveClusterPosition(
  clusterId: string,
  layoutPos: { x: number; y: number },
  manualClusterPositions: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  const manual = manualClusterPositions.get(clusterId);
  return { x: manual?.x ?? layoutPos.x, y: manual?.y ?? layoutPos.y };
}
