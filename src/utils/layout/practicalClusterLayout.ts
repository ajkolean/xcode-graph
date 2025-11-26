/**
 * Practical cluster layout v1: grid-based with coreScore
 * No DAG layering, no crossing minimization - just works
 */

import type { GraphEdge } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';

interface ClusterScore {
  cluster: Cluster;
  fanIn: number;
  fanOut: number;
  coreScore: number;
}

/**
 * Grid-based cluster layout with coreScore sorting
 * Core projects (high fanIn/fanOut) appear first
 */
export function layoutClustersGrid(
  clusters: Cluster[],
  allEdges: GraphEdge[],
  viewportWidth: number = 2400,
): Map<string, { x: number; y: number }> {
  if (clusters.length === 0) {
    return new Map();
  }

  if (clusters.length === 1) {
    return new Map([[clusters[0].id, { x: 0, y: 0 }]]);
  }

  // Step 1: Build cluster graph (cross-project dependencies)
  const nodeToCluster = new Map<string, string>();
  clusters.forEach((cluster) => {
    cluster.nodes.forEach((node) => {
      nodeToCluster.set(node.id, cluster.id);
    });
  });

  // Count fanIn/fanOut for each cluster
  const fanIn = new Map<string, number>();
  const fanOut = new Map<string, number>();

  clusters.forEach((c) => {
    fanIn.set(c.id, 0);
    fanOut.set(c.id, 0);
  });

  allEdges.forEach((edge) => {
    const srcCluster = nodeToCluster.get(edge.source);
    const tgtCluster = nodeToCluster.get(edge.target);

    if (srcCluster && tgtCluster && srcCluster !== tgtCluster) {
      fanOut.set(srcCluster, (fanOut.get(srcCluster) || 0) + 1);
      fanIn.set(tgtCluster, (fanIn.get(tgtCluster) || 0) + 1);
    }
  });

  // Step 2: Compute coreScore = fanIn * 2 + fanOut
  const scored: ClusterScore[] = clusters.map((cluster) => ({
    cluster,
    fanIn: fanIn.get(cluster.id) || 0,
    fanOut: fanOut.get(cluster.id) || 0,
    coreScore: (fanIn.get(cluster.id) || 0) * 2 + (fanOut.get(cluster.id) || 0),
  }));

  // Sort by coreScore descending (core projects first)
  scored.sort((a, b) => {
    if (b.coreScore !== a.coreScore) {
      return b.coreScore - a.coreScore;
    }
    // Tie-breaker: alphabetical for determinism
    return a.cluster.id.localeCompare(b.cluster.id);
  });

  // Step 3: Place in grid
  const tileWidth = 400; // Base size, will use actual bounds
  const tileHeight = 400;
  const hGap = 120;
  const vGap = 120;

  const cols = Math.max(2, Math.floor((viewportWidth + hGap) / (tileWidth + hGap)));

  const positions = new Map<string, { x: number; y: number }>();

  scored.forEach((entry, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Use actual cluster bounds if available
    const bounds = entry.cluster.bounds;
    const _actualWidth = bounds?.width || tileWidth;
    const _actualHeight = bounds?.height || tileHeight;

    const x = col * (tileWidth + hGap);
    const y = row * (tileHeight + vGap);

    positions.set(entry.cluster.id, { x, y });
  });

  return positions;
}
