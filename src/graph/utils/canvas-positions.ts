/** Shared position resolution utilities for canvas renderers */

import type { LayoutController as GraphLayoutController } from '@graph/controllers/layout.controller';

// Reusable point objects to avoid per-call allocations in hot paths.
// Safe because callers consume the values immediately within the same frame.
const _nodePos = { x: 0, y: 0 };
const _clusterPos = { x: 0, y: 0 };

/**
 * Resolve a node's world position by combining layout position with manual overrides.
 * Returns null if the node or its cluster has no layout position.
 *
 * NOTE: Returns a reusable object — callers must consume values before the next call.
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
  _nodePos.x = clusterX + (manualPos?.x ?? layoutPos.x);
  _nodePos.y = clusterY + (manualPos?.y ?? layoutPos.y);
  return _nodePos;
}

/**
 * Resolve a cluster's world position with manual override.
 *
 * NOTE: Returns a reusable object — callers must consume values before the next call.
 */
export function resolveClusterPosition(
  clusterId: string,
  layoutPos: { x: number; y: number },
  manualClusterPositions: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  const manual = manualClusterPositions.get(clusterId);
  _clusterPos.x = manual?.x ?? layoutPos.x;
  _clusterPos.y = manual?.y ?? layoutPos.y;
  return _clusterPos;
}
