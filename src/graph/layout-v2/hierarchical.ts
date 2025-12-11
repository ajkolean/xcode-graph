/**
 * Two-level hierarchical layout - simplified
 *
 * 1. Layout nodes within each cluster → get size
 * 2. Layout clusters as complete graph
 * 3. Translate node positions to cluster centers
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { layoutCompleteGraph } from './complete-graph';

export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
}

/**
 * Layout nodes within a cluster and calculate cluster size
 */
function layoutCluster(cluster: Cluster) {
  if (cluster.nodes.length === 0) {
    return { id: cluster.id, nodePositions: new Map(), size: 80 };
  }

  const nodeCount = cluster.nodes.length;

  // Fixed cluster size
  const size = Math.max(100, 80 + nodeCount * 12);
  const clusterRadius = size / 2;
  const layoutRadius = clusterRadius - 15; // Keep nodes inside

  // Simple circular layout - nodes arranged in circle at exact radius
  const positions = layoutCompleteGraph(
    cluster.nodes.map((n) => ({ id: n.id, radius: 6 })),
    { maxRadius: layoutRadius },
  );

  const nodePositions = new Map(positions.map((p) => [p.id, { x: p.x, y: p.y }]));

  return { id: cluster.id, nodePositions, size };
}

/**
 * Main layout
 */
export function computeHierarchicalLayout(
  _nodes: GraphNode[],
  _edges: GraphEdge[],
  clusters: Cluster[],
): HierarchicalLayoutResult {
  // Step 1: Layout each cluster
  const clusterLayouts = clusters.map((c) => layoutCluster(c));

  // Step 2: Layout clusters in circle
  const avgSize = clusterLayouts.reduce((sum, cl) => sum + cl.size, 0) / clusterLayouts.length;
  const clusterLayoutRadius = (clusterLayouts.length * (avgSize + 60)) / (2 * Math.PI);

  const clusterPositions = layoutCompleteGraph(
    clusterLayouts.map((cl) => ({ id: cl.id, radius: cl.size / 2 })),
    { maxRadius: clusterLayoutRadius },
  );

  // Step 3: Build result
  const clusterPosMap = new Map<string, ClusterPosition>();
  const nodePosMap = new Map<string, NodePosition>();

  for (const clLayout of clusterLayouts) {
    const center = clusterPositions.find((p) => p.id === clLayout.id);
    if (!center) continue;

    // Store cluster
    clusterPosMap.set(clLayout.id, {
      id: clLayout.id,
      x: center.x,
      y: center.y,
      width: clLayout.size,
      height: clLayout.size,
      vx: 0,
      vy: 0,
      nodeCount: clLayout.nodePositions.size,
    });

    // Store nodes with RELATIVE positions
    for (const [nodeId, relPos] of clLayout.nodePositions) {
      nodePosMap.set(nodeId, {
        id: nodeId,
        x: relPos.x, // RELATIVE to cluster center
        y: relPos.y, // RELATIVE to cluster center
        vx: 0,
        vy: 0,
        clusterId: clLayout.id,
        radius: 6,
      });
    }
  }

  return { clusterPositions: clusterPosMap, nodePositions: nodePosMap, clusters };
}
