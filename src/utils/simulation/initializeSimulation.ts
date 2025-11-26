/**
 * Initialization logic for cluster simulation
 */

import type { Cluster, ClusterLayoutConfig, PositionedNode } from '../../types/cluster';
import type { ClusterPosition, NodePosition } from '../../types/simulation';

/**
 * Initializes node positions from positioned nodes
 */
export function initializeNodePositions(
  positionedNodes: PositionedNode[],
  existingPositions: Map<string, NodePosition>,
  config: ClusterLayoutConfig,
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  positionedNodes.forEach((posNode) => {
    const existing = existingPositions.get(posNode.node.id);
    const metadata = posNode.metadata;

    // Determine node radius based on role/type
    let nodeRadius = config.normalNodeSize;
    if (metadata.isAnchor) {
      nodeRadius = config.anchorNodeSize;
    } else if (metadata.role === 'test') {
      nodeRadius = config.testNodeSize;
    }

    positions.set(posNode.node.id, {
      id: posNode.node.id,
      x: existing?.x ?? posNode.localX!,
      y: existing?.y ?? posNode.localY!,
      vx: existing?.vx ?? 0,
      vy: existing?.vy ?? 0,
      clusterId: posNode.clusterId,
      radius: nodeRadius,
      targetRadius: posNode.targetRadius,
      targetAngle: posNode.targetAngle,
      isAnchor: metadata.isAnchor,
      isTest: metadata.role === 'test',
      testSubject: metadata.testSubjects?.[0],
    });
  });

  return positions;
}

/**
 * Initializes cluster positions
 */
export function initializeClusterPositions(
  clusters: Cluster[],
  clusterGridPositions: Map<string, { x: number; y: number }>,
  existingPositions: Map<string, ClusterPosition>,
): Map<string, ClusterPosition> {
  const positions = new Map<string, ClusterPosition>();

  clusters.forEach((cluster) => {
    const gridPos = clusterGridPositions.get(cluster.id) || { x: 0, y: 0 };
    const bounds = cluster.bounds || { width: 300, height: 300, x: 0, y: 0 };

    // Keep existing position if cluster already exists
    const existing = existingPositions.get(cluster.id);

    positions.set(cluster.id, {
      id: cluster.id,
      x: existing?.x ?? gridPos.x,
      y: existing?.y ?? gridPos.y,
      vx: existing?.vx ?? 0,
      vy: existing?.vy ?? 0,
      width: bounds.width,
      height: bounds.height,
      nodeCount: cluster.nodes.length,
    });
  });

  return positions;
}

/**
 * Gets nodes belonging to a specific cluster
 */
export function getClusterNodes(
  cluster: Cluster,
  nodePositions: Map<string, NodePosition>,
): NodePosition[] {
  return cluster.nodes.map((n) => nodePositions.get(n.id)!).filter(Boolean);
}
