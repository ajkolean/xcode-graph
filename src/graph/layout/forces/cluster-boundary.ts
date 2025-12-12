/**
 * Cluster boundary and radial interior forces
 *
 * - Circular boundary: Hard constraint keeping nodes inside cluster circle
 * - Radial interior: Soft constraint positioning nodes based on connectivity
 */

/**
 * Create a circular cluster boundary force
 * Keeps all nodes within a circular boundary around the cluster center
 */
export function createClusterBoundaryForce(
  clusterNodes: any[],
  centerRef: { cx: number; cy: number },
  maxRadius: number,
) {
  const strength = 1.0;

  return (alpha: number) => {
    for (const node of clusterNodes) {
      const dx = (node.x ?? 0) - centerRef.cx;
      const dy = (node.y ?? 0) - centerRef.cy;
      const r = Math.hypot(dx, dy) || 1e-6;

      if (r > maxRadius) {
        // Push node back inside the circle
        const k = ((r - maxRadius) / r) * strength * alpha;
        node.vx = (node.vx ?? 0) - dx * k;
        node.vy = (node.vy ?? 0) - dy * k;
      }
    }
  };
}

/**
 * Create a radial interior force for cluster nodes
 *
 * Positions nodes radially based on their connectivity:
 * - Anchors and high-degree nodes near center
 * - Low-degree/leaf nodes toward the edges
 *
 * @param clusterCenterMap Map of cluster ID to center position
 * @param radiusForNode Function that returns target radius for each node
 * @param strength Force strength (0.0 to 1.0)
 */
export function createClusterRadialForce(
  clusterCenterMap: Map<string, { cx: number; cy: number }>,
  radiusForNode: (nodeId: string) => number,
  strength: number,
) {
  let nodes: any[] = [];

  function force(alpha: number) {
    for (const node of nodes) {
      const clusterId = node.clusterId;
      if (!clusterId) continue;

      const center = clusterCenterMap.get(clusterId);
      if (!center) continue;

      const dx = (node.x ?? 0) - center.cx;
      const dy = (node.y ?? 0) - center.cy;
      const r = Math.hypot(dx, dy) || 1e-6;

      const targetRadius = radiusForNode(node.id);
      const err = r - targetRadius;

      // Apply force toward target radius
      // Positive err = too far out, pull inward
      // Negative err = too close, push outward
      const k = err * strength * alpha;

      node.vx = (node.vx ?? 0) - (dx / r) * k;
      node.vy = (node.vy ?? 0) - (dy / r) * k;
    }
  }

  force.initialize = (n: any[]) => {
    nodes = n;
  };

  return force;
}

/**
 * Compute target radius for a node within its cluster
 *
 * Based on:
 * - isAnchor: anchors go to center
 * - fanIn + fanOut: higher connectivity = smaller radius
 *
 * @param nodeId Node ID
 * @param metadata Cluster metadata for this node
 * @param clusterRadius Maximum cluster radius
 */
export function computeNodeTargetRadius(
  metadata: {
    isAnchor?: boolean;
    dependencyCount?: number;
    dependsOnCount?: number;
  } | null,
  clusterRadius: number,
): number {
  if (!metadata) {
    // Default to middle ring
    return clusterRadius * 0.5;
  }

  // Anchors go to center
  if (metadata.isAnchor) {
    return clusterRadius * 0.15;
  }

  // Calculate total degree
  const degree = (metadata.dependencyCount ?? 0) + (metadata.dependsOnCount ?? 0);

  // High degree nodes closer to center
  // r0 = 30 + 110 - log2(degree+1)*18, clamped to [25, clusterRadius*0.9]
  const baseRadius = 30 + 110 - Math.log2(degree + 1) * 18;
  const minRadius = 25;
  const maxRadius = clusterRadius * 0.85;

  return Math.max(minRadius, Math.min(maxRadius, baseRadius));
}
