/**
 * Cluster Strata Computation
 *
 * Computes cluster-level strata for the "geological strata" layout.
 * Clusters are arranged in horizontal layers based on their position
 * in the cluster dependency DAG.
 *
 * Edge direction: if any node in Cluster A depends on any node in Cluster B,
 * then A -> B (A requires B)
 *
 * Visual rule: dependent clusters above dependency clusters
 * Stratum 0 = entry clusters (nothing depends on them)
 * Higher stratum = deeper in dependency tree
 */

import type { GraphEdge } from "@shared/schemas/graph.schema";

export interface ClusterStrataResult {
  /** Stratum for each cluster (0 = top-level, higher = deeper dependency) */
  clusterStratum: Map<string, number>;
  /** Maximum stratum value */
  maxClusterStratum: number;
  /** Cluster DAG: cluster ID -> set of clusters it depends on */
  clusterDag: Map<string, Set<string>>;
  /** Reverse DAG: cluster ID -> set of clusters that depend on it */
  clusterReverseDag: Map<string, Set<string>>;
}

/**
 * Build cluster-level DAG from cross-cluster edges
 *
 * @param edges - All graph edges
 * @param nodeToCluster - Map from node ID to cluster ID
 * @returns Cluster DAG where A -> B means cluster A depends on cluster B
 */
export function buildClusterDag(
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
): Map<string, Set<string>> {
  const clusterDag = new Map<string, Set<string>>();

  // Initialize all clusters with empty dependency sets
  for (const clusterId of new Set(nodeToCluster.values())) {
    clusterDag.set(clusterId, new Set());
  }

  // Build directed edges between clusters
  for (const edge of edges) {
    const sourceCluster = nodeToCluster.get(edge.source);
    const targetCluster = nodeToCluster.get(edge.target);

    // Skip if either node isn't in a cluster or they're in the same cluster
    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }

    // source depends on target, so sourceCluster depends on targetCluster
    clusterDag.get(sourceCluster)?.add(targetCluster);
  }

  return clusterDag;
}

/**
 * Compute cluster strata using topological sort on cluster DAG
 *
 * Uses Kahn's algorithm variant for longest path computation.
 * Clusters with no dependents (nothing depends on them) are at stratum 0.
 *
 * @param clusterIds - All cluster IDs
 * @param clusterDag - Cluster dependency DAG (A -> B means A depends on B)
 * @returns Strata result with cluster positions and metadata
 */
export function computeClusterStrata(
  clusterIds: string[],
  clusterDag: Map<string, Set<string>>,
): ClusterStrataResult {
  const clusterSet = new Set(clusterIds);

  // Build reverse DAG (who depends on me?)
  const clusterReverseDag = new Map<string, Set<string>>();
  for (const clusterId of clusterIds) {
    clusterReverseDag.set(clusterId, new Set());
  }

  for (const [sourceCluster, targets] of clusterDag) {
    for (const targetCluster of targets) {
      if (clusterSet.has(targetCluster)) {
        clusterReverseDag.get(targetCluster)?.add(sourceCluster);
      }
    }
  }

  // Calculate in-degree (number of clusters that depend on this cluster)
  const inDegree = new Map<string, number>();
  for (const clusterId of clusterIds) {
    inDegree.set(clusterId, clusterReverseDag.get(clusterId)?.size ?? 0);
  }

  // Use Kahn's algorithm variant for longest path
  const clusterStratum = new Map<string, number>();
  const queue: string[] = [];

  // Clusters with no dependents start at stratum 0 (entry points)
  for (const clusterId of clusterIds) {
    if (inDegree.get(clusterId) === 0) {
      queue.push(clusterId);
      clusterStratum.set(clusterId, 0);
    }
  }

  // Process in topological order, propagating max depths
  // Track remaining edges for cycle detection
  const remainingInDegree = new Map(inDegree);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentStratum = clusterStratum.get(current)!;

    // For each cluster that "current" depends on, update its stratum
    for (const targetCluster of clusterDag.get(current) ?? []) {
      if (!clusterSet.has(targetCluster)) continue;

      const newStratum = currentStratum + 1;
      const existingStratum = clusterStratum.get(targetCluster) ?? -1;

      if (newStratum > existingStratum) {
        clusterStratum.set(targetCluster, newStratum);
      }

      // Decrement in-degree for topological processing
      const newInDegree = (remainingInDegree.get(targetCluster) ?? 1) - 1;
      remainingInDegree.set(targetCluster, newInDegree);

      // Add to queue when all dependents have been processed
      if (newInDegree === 0) {
        queue.push(targetCluster);
      }
    }
  }

  // Handle disconnected clusters or cycles (assign stratum 0 if not computed)
  for (const clusterId of clusterIds) {
    if (!clusterStratum.has(clusterId)) {
      clusterStratum.set(clusterId, 0);
    }
  }

  // Calculate max stratum
  let maxClusterStratum = 0;
  for (const stratum of clusterStratum.values()) {
    maxClusterStratum = Math.max(maxClusterStratum, stratum);
  }

  return {
    clusterStratum,
    maxClusterStratum,
    clusterDag,
    clusterReverseDag,
  };
}

/**
 * Compute grid positions for clusters based on their strata
 *
 * Places clusters in horizontal bands (strata) with barycentric ordering
 * to minimize edge crossings.
 *
 * @param clusters - Array of cluster objects with id
 * @param clusterStrataResult - Result from computeClusterStrata
 * @param clusterSizes - Map of cluster ID to size (diameter)
 * @param config - Layout configuration
 * @returns Map of cluster ID to initial (x, y) position
 */
export function seedClustersByStrata(
  clusters: Array<{ id: string }>,
  clusterStrataResult: ClusterStrataResult,
  clusterSizes: Map<string, number>,
  config: {
    strataSpacing: number;
    horizontalSpacing: number;
  },
): Map<string, { x: number; y: number }> {
  const { clusterStratum, maxClusterStratum, clusterDag, clusterReverseDag } =
    clusterStrataResult;
  const positions = new Map<string, { x: number; y: number }>();

  // Group clusters by stratum
  const strataGroups = new Map<number, string[]>();
  for (let i = 0; i <= maxClusterStratum; i++) {
    strataGroups.set(i, []);
  }

  for (const cluster of clusters) {
    const stratum = clusterStratum.get(cluster.id) ?? 0;
    strataGroups.get(stratum)?.push(cluster.id);
  }

  // For each stratum, order clusters using barycentric heuristic
  // Process from top (stratum 0) to bottom
  const clusterOrder = new Map<string, number>(); // cluster -> horizontal position index

  for (let stratum = 0; stratum <= maxClusterStratum; stratum++) {
    const clustersInStratum = strataGroups.get(stratum) ?? [];

    if (stratum === 0) {
      // First layer: sort by number of dependencies (more deps = more central)
      clustersInStratum.sort((a, b) => {
        const aDeps = clusterDag.get(a)?.size ?? 0;
        const bDeps = clusterDag.get(b)?.size ?? 0;
        return bDeps - aDeps; // Descending by dependency count
      });

      // Assign initial order
      for (let i = 0; i < clustersInStratum.length; i++) {
        clusterOrder.set(clustersInStratum[i]!, i);
      }
    } else {
      // Subsequent layers: use barycenter method
      // Position is average of connected nodes in previous layer
      const barycenters: Array<{ id: string; barycenter: number }> = [];

      for (const clusterId of clustersInStratum) {
        // Get clusters in previous stratum that depend on this cluster
        const dependents = clusterReverseDag.get(clusterId) ?? new Set();
        let sum = 0;
        let count = 0;

        for (const dependent of dependents) {
          const depStratum = clusterStratum.get(dependent);
          if (depStratum !== undefined && depStratum < stratum) {
            const order = clusterOrder.get(dependent);
            if (order !== undefined) {
              sum += order;
              count++;
            }
          }
        }

        // Barycenter is average position of connected nodes
        // If no connections, use a large value to push to the right
        const barycenter = count > 0 ? sum / count : Number.MAX_SAFE_INTEGER;
        barycenters.push({ id: clusterId, barycenter });
      }

      // Sort by barycenter, then by ID for stability
      barycenters.sort((a, b) => {
        if (a.barycenter !== b.barycenter) {
          return a.barycenter - b.barycenter;
        }
        return a.id.localeCompare(b.id);
      });

      // Assign order
      for (let i = 0; i < barycenters.length; i++) {
        clusterOrder.set(barycenters[i]!.id, i);
      }
    }
  }

  // Convert order to actual positions
  for (let stratum = 0; stratum <= maxClusterStratum; stratum++) {
    const clustersInStratum = strataGroups.get(stratum) ?? [];
    const n = clustersInStratum.length;

    if (n === 0) continue;

    // Y position based on stratum (higher stratum = lower Y = further down)
    const y = stratum * config.strataSpacing;

    // Sort clusters by their computed order
    const sortedClusters = [...clustersInStratum].sort((a, b) => {
      return (clusterOrder.get(a) ?? 0) - (clusterOrder.get(b) ?? 0);
    });

    // Calculate total width needed for this stratum
    let totalWidth = 0;
    for (const clusterId of sortedClusters) {
      const size = clusterSizes.get(clusterId) ?? 100;
      totalWidth += size + config.horizontalSpacing;
    }
    totalWidth -= config.horizontalSpacing; // Remove last spacing

    // Center the stratum around x = 0
    let currentX = -totalWidth / 2;

    for (const clusterId of sortedClusters) {
      const size = clusterSizes.get(clusterId) ?? 100;
      const x = currentX + size / 2; // Center of cluster
      positions.set(clusterId, { x, y });
      currentX += size + config.horizontalSpacing;
    }
  }

  return positions;
}
