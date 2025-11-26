/**
 * Deterministic cluster layout - no continuous forces
 * Uses dependency scoring and grid/radial placement
 */

import type { GraphEdge } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';

interface ClusterScore {
  cluster: Cluster;
  score: number;
  inbound: number;
  outbound: number;
}

/**
 * Calculates dependency score for a cluster
 * Higher score = more central/core to the architecture
 */
function calculateClusterScore(
  cluster: Cluster,
  allEdges: GraphEdge[],
): { score: number; inbound: number; outbound: number } {
  const nodeIds = new Set(cluster.nodes.map((n) => n.id));

  let inbound = 0;
  let outbound = 0;

  allEdges.forEach((edge) => {
    const sourceInCluster = nodeIds.has(edge.source);
    const targetInCluster = nodeIds.has(edge.target);

    // Cross-cluster edges only
    if (sourceInCluster && !targetInCluster) {
      outbound++;
    } else if (!sourceInCluster && targetInCluster) {
      inbound++;
    }
  });

  // Core clusters have high inbound (many depend on them)
  // Leaf clusters have high outbound (they depend on many)
  // Score: inbound * 2 + outbound gives core clusters higher scores
  const score = inbound * 2 + outbound;

  return { score, inbound, outbound };
}

/**
 * Deterministic grid layout with dependency-aware ordering
 * Most depended-on clusters in center, leaves on periphery
 */
export function layoutClustersGrid(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (clusters.length === 0) return positions;
  if (clusters.length === 1) {
    positions.set(clusters[0].id, { x: 0, y: 0 });
    return positions;
  }

  // Calculate scores
  const scoredClusters: ClusterScore[] = clusters.map((cluster) => {
    const { score, inbound, outbound } = calculateClusterScore(cluster, allEdges);
    return { cluster, score, inbound, outbound };
  });

  // Sort by score (descending) - core first
  scoredClusters.sort((a, b) => b.score - a.score);

  // Grid layout parameters
  const clusterSpacing = 500; // Space between cluster centers
  const cols = Math.ceil(Math.sqrt(clusters.length));

  // Place in grid, row by row
  scoredClusters.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Center the grid around origin
    const offsetX = -((cols - 1) * clusterSpacing) / 2;
    const offsetY = -((Math.ceil(clusters.length / cols) - 1) * clusterSpacing) / 2;

    const x = offsetX + col * clusterSpacing;
    const y = offsetY + row * clusterSpacing;

    positions.set(item.cluster.id, { x, y });
  });

  return positions;
}

/**
 * Deterministic radial layout with dependency-aware rings
 * Most connected clusters in center rings, leaves on outer rings
 */
export function layoutClustersRadial(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (clusters.length === 0) return positions;
  if (clusters.length === 1) {
    positions.set(clusters[0].id, { x: 0, y: 0 });
    return positions;
  }

  // Calculate scores
  const scoredClusters: ClusterScore[] = clusters.map((cluster) => {
    const { score, inbound, outbound } = calculateClusterScore(cluster, allEdges);
    return { cluster, score, inbound, outbound };
  });

  // Sort by score (descending)
  scoredClusters.sort((a, b) => b.score - a.score);

  // Distribute into rings (4-6 clusters per ring)
  const clustersPerRing = Math.min(6, Math.max(4, Math.ceil(Math.sqrt(clusters.length))));
  const numRings = Math.ceil(clusters.length / clustersPerRing);

  let clusterIndex = 0;

  for (let ring = 0; ring < numRings; ring++) {
    const clustersInThisRing = Math.min(clustersPerRing, scoredClusters.length - clusterIndex);

    // First ring with single cluster = center
    if (ring === 0 && clustersInThisRing === 1) {
      positions.set(scoredClusters[0].cluster.id, { x: 0, y: 0 });
      clusterIndex++;
      continue;
    }

    // Calculate ring radius
    const baseRadius = 450;
    const radius = ring === 0 ? baseRadius * 0.5 : baseRadius * (ring + 0.5);

    // Distribute evenly around ring
    for (let i = 0; i < clustersInThisRing; i++) {
      if (clusterIndex >= scoredClusters.length) break;

      const cluster = scoredClusters[clusterIndex].cluster;

      // Stagger each ring slightly for visual interest
      const angleOffset = ring * (Math.PI / 8);
      const angle = (i / clustersInThisRing) * Math.PI * 2 + angleOffset;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      positions.set(cluster.id, { x, y });
      clusterIndex++;
    }
  }

  return positions;
}

/**
 * Gets cluster connectivity info for debugging/UI
 */
export function getClusterConnectivityInfo(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Array<{
  clusterId: string;
  score: number;
  inbound: number;
  outbound: number;
  tier: 'core' | 'mid' | 'leaf';
}> {
  const scored = clusters.map((cluster) => {
    const { score, inbound, outbound } = calculateClusterScore(cluster, allEdges);

    let tier: 'core' | 'mid' | 'leaf' = 'mid';
    if (inbound > outbound * 1.5) tier = 'core';
    else if (outbound > inbound * 1.5) tier = 'leaf';

    return {
      clusterId: cluster.id,
      score,
      inbound,
      outbound,
      tier,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
