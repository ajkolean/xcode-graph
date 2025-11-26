/**
 * Radial "bullseye" arrangement for clusters based on connectivity
 * Highly connected clusters are positioned in center, less connected on edges
 */

import type { GraphEdge } from '../data/mockGraphData';
import type { Cluster } from '../types/cluster';

interface ClusterConnectivity {
  cluster: Cluster;
  edgeCount: number;
}

/**
 * Calculates the number of cross-cluster edges for each cluster
 */
function calculateClusterConnectivity(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Map<string, number> {
  const connectivity = new Map<string, number>();

  clusters.forEach((cluster) => {
    const nodeIds = new Set(cluster.nodes.map((n) => n.id));
    let crossClusterEdges = 0;

    // Count edges that cross cluster boundaries
    allEdges.forEach((edge) => {
      const sourceInCluster = nodeIds.has(edge.source);
      const targetInCluster = nodeIds.has(edge.target);

      // Count if exactly one end is in this cluster (cross-cluster edge)
      if (sourceInCluster !== targetInCluster) {
        crossClusterEdges++;
      }
    });

    connectivity.set(cluster.id, crossClusterEdges);
  });

  return connectivity;
}

/**
 * Arranges clusters in a radial "bullseye" pattern based on connectivity
 * More connected clusters in center, less connected on edges
 */
export function arrangeClustersBullseye(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (clusters.length === 0) return positions;

  // Single cluster - center it
  if (clusters.length === 1) {
    positions.set(clusters[0].id, { x: 0, y: 0 });
    return positions;
  }

  // Calculate connectivity for each cluster
  const connectivity = calculateClusterConnectivity(clusters, allEdges);

  // Sort clusters by connectivity (descending)
  const sortedClusters: ClusterConnectivity[] = clusters
    .map((cluster) => ({
      cluster,
      edgeCount: connectivity.get(cluster.id) || 0,
    }))
    .sort((a, b) => b.edgeCount - a.edgeCount);

  // Distribute clusters into rings based on connectivity
  // Aim for 4-6 clusters per ring for good distribution
  const clustersPerRing = Math.min(6, Math.max(4, Math.ceil(Math.sqrt(clusters.length))));
  const numRings = Math.ceil(clusters.length / clustersPerRing);

  let clusterIndex = 0;

  for (let ring = 0; ring < numRings; ring++) {
    const clustersInThisRing = Math.min(clustersPerRing, sortedClusters.length - clusterIndex);

    if (ring === 0 && clustersInThisRing === 1) {
      // Single cluster in center ring
      const cluster = sortedClusters[0].cluster;
      positions.set(cluster.id, { x: 0, y: 0 });
      clusterIndex++;
      continue;
    }

    // Calculate radius for this ring
    // Inner rings are closer together, outer rings spread out more
    const baseSpacing = 450;
    const ringRadius =
      ring === 0
        ? baseSpacing * 0.5 // First ring closer to center
        : baseSpacing * (ring + 0.5);

    // Distribute clusters evenly around the ring
    for (let i = 0; i < clustersInThisRing; i++) {
      if (clusterIndex >= sortedClusters.length) break;

      const cluster = sortedClusters[clusterIndex].cluster;

      // Calculate angle for this position
      // Add offset based on ring to create a spiral-like effect
      const angleOffset = ring * (Math.PI / 8); // Offset each ring slightly
      const angle = (i / clustersInThisRing) * Math.PI * 2 + angleOffset;

      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius;

      positions.set(cluster.id, { x, y });
      clusterIndex++;
    }
  }

  return positions;
}

/**
 * Gets connectivity stats for debugging/display
 */
export function getClusterConnectivityStats(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): { clusterId: string; name: string; edgeCount: number }[] {
  const connectivity = calculateClusterConnectivity(clusters, allEdges);

  return clusters
    .map((cluster) => ({
      clusterId: cluster.id,
      name: cluster.id,
      edgeCount: connectivity.get(cluster.id) || 0,
    }))
    .sort((a, b) => b.edgeCount - a.edgeCount);
}
