/**
 * Cluster-to-cluster forces
 *
 * - Weighted anisotropic repulsion: Prevents overlap, respects cross-cluster edges
 * - Cluster attraction: Pulls connected clusters together to form neighborhoods
 */

interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

/**
 * Create a pair key for two cluster IDs (alphabetically sorted for consistency)
 */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Weighted anisotropic cluster repulsion force
 *
 * Key features:
 * - Y-axis force is scaled down (anisotropic) so strata can dominate vertical layout
 * - Padding is reduced for clusters that share many edges (neighborhoods form)
 * - Respects cluster radii for proper non-overlap
 *
 * @param baseStrength Base repulsion strength
 * @param basePadding Base padding between clusters
 * @param crossClusterWeights Map of "clusterA|clusterB" -> edge count
 * @param yScale Scale factor for Y-axis force (0.0-1.0, lower = more horizontal spread)
 */
export function forceClusterRepulsion(
  baseStrength: number,
  basePadding: number,
  crossClusterWeights?: Map<string, number>,
  yScale = 0.25,
) {
  let clusterCenters: ClusterCenter[] = [];
  let weights = crossClusterWeights ?? new Map<string, number>();

  function force(alpha: number) {
    const effectiveStrength = baseStrength * alpha;

    for (let i = 0; i < clusterCenters.length; i++) {
      const a = clusterCenters[i]!;

      for (let j = i + 1; j < clusterCenters.length; j++) {
        const b = clusterCenters[j]!;

        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy) || 1e-6;

        // Get cross-cluster edge weight
        const key = pairKey(a.id, b.id);
        const w = weights.get(key) ?? 0;

        // Softness: more edges = less repulsion/padding (form neighborhoods)
        const softness = 1 / (1 + Math.log2(w + 1));
        const padding = basePadding * softness;

        // Minimum distance = sum of radii + weighted padding
        const minDist = a.radius + b.radius + padding;
        if (dist < minDist) dist = minDist;

        // Inverse square repulsion
        const forceVal = effectiveStrength / (dist * dist);
        const nx = dx / dist;
        const ny = dy / dist;

        // Anisotropic: scale down Y force so strata can control vertical position
        const fx = forceVal * nx;
        const fy = forceVal * ny * yScale;

        a.cx -= fx;
        a.cy -= fy;
        b.cx += fx;
        b.cy += fy;
      }
    }
  }

  // D3 force interface
  force.initialize = (centers: ClusterCenter[]) => {
    clusterCenters = centers;
  };

  force.strength = (s: number) => {
    baseStrength = s;
    return force;
  };

  force.padding = (p: number) => {
    basePadding = p;
    return force;
  };

  force.weights = (w: Map<string, number>) => {
    weights = w;
    return force;
  };

  force.yScale = (s: number) => {
    yScale = s;
    return force;
  };

  return force;
}

/**
 * Cluster attraction force
 *
 * Gently pulls connected clusters together to form neighborhoods.
 * Only activates when clusters are far apart to avoid fighting repulsion.
 *
 * @param baseStrength Base attraction strength
 * @param crossClusterWeights Map of "clusterA|clusterB" -> edge count
 * @param activationDistance Only attract when distance > this threshold
 */
export function forceClusterAttraction(
  baseStrength: number,
  crossClusterWeights: Map<string, number>,
  activationDistance = 400,
) {
  let clusterCenters: ClusterCenter[] = [];
  let weights = crossClusterWeights;

  function force(alpha: number) {
    const effectiveStrength = baseStrength * alpha;

    for (let i = 0; i < clusterCenters.length; i++) {
      const a = clusterCenters[i]!;

      for (let j = i + 1; j < clusterCenters.length; j++) {
        const b = clusterCenters[j]!;

        // Check if clusters share edges
        const key = pairKey(a.id, b.id);
        const w = weights.get(key) ?? 0;

        if (w === 0) continue; // No attraction for unconnected clusters

        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.hypot(dx, dy) || 1e-6;

        // Only attract when far apart (don't fight repulsion at close range)
        const minDist = a.radius + b.radius + activationDistance;
        if (dist <= minDist) continue;

        // Attraction strength proportional to log of edge count
        const attractionFactor = Math.log2(w + 1) * effectiveStrength;

        // Linear attraction (not inverse square) for gentle neighborhood formation
        const nx = dx / dist;
        const ny = dy / dist;
        const fx = attractionFactor * nx;
        const fy = attractionFactor * ny;

        a.cx += fx;
        a.cy += fy;
        b.cx -= fx;
        b.cy -= fy;
      }
    }
  }

  // D3 force interface
  force.initialize = (centers: ClusterCenter[]) => {
    clusterCenters = centers;
  };

  force.strength = (s: number) => {
    baseStrength = s;
    return force;
  };

  force.weights = (w: Map<string, number>) => {
    weights = w;
    return force;
  };

  force.activationDistance = (d: number) => {
    activationDistance = d;
    return force;
  };

  return force;
}
