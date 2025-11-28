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

// Helper: Sort clusters by connectivity
function sortClustersByConnectivity(
  clusters: Cluster[],
  connectivity: Map<string, number>,
): ClusterConnectivity[] {
  return clusters
    .map((cluster) => ({
      cluster,
      edgeCount: connectivity.get(cluster.id) || 0,
    }))
    .sort((a, b) => b.edgeCount - a.edgeCount);
}

// Helper: Calculate ring radius
function calculateRingRadius(ring: number, baseSpacing: number): number {
  return ring === 0 ? baseSpacing * 0.5 : baseSpacing * (ring + 0.5);
}

// Helper: Position clusters in a single ring
function positionClustersInRing(
  sortedClusters: ClusterConnectivity[],
  ring: number,
  clustersInThisRing: number,
  startIndex: number,
  ringRadius: number,
  positions: Map<string, { x: number; y: number }>,
): number {
  let clusterIndex = startIndex;

  for (let i = 0; i < clustersInThisRing; i++) {
    if (clusterIndex >= sortedClusters.length) break;

    const cluster = sortedClusters[clusterIndex].cluster;
    const angleOffset = ring * (Math.PI / 8);
    const angle = (i / clustersInThisRing) * Math.PI * 2 + angleOffset;

    positions.set(cluster.id, {
      x: Math.cos(angle) * ringRadius,
      y: Math.sin(angle) * ringRadius,
    });
    clusterIndex++;
  }

  return clusterIndex;
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

  if (clusters.length === 1) {
    positions.set(clusters[0].id, { x: 0, y: 0 });
    return positions;
  }

  const connectivity = calculateClusterConnectivity(clusters, allEdges);
  const sortedClusters = sortClustersByConnectivity(clusters, connectivity);

  const clustersPerRing = Math.min(6, Math.max(4, Math.ceil(Math.sqrt(clusters.length))));
  const numRings = Math.ceil(clusters.length / clustersPerRing);
  const baseSpacing = 450;

  let clusterIndex = 0;

  for (let ring = 0; ring < numRings; ring++) {
    const clustersInThisRing = Math.min(clustersPerRing, sortedClusters.length - clusterIndex);

    if (ring === 0 && clustersInThisRing === 1) {
      positions.set(sortedClusters[0].cluster.id, { x: 0, y: 0 });
      clusterIndex++;
      continue;
    }

    const ringRadius = calculateRingRadius(ring, baseSpacing);
    clusterIndex = positionClustersInRing(
      sortedClusters,
      ring,
      clustersInThisRing,
      clusterIndex,
      ringRadius,
      positions,
    );
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
