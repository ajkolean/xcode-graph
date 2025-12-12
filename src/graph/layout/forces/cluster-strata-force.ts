/**
 * Cluster Strata Forces
 *
 * Forces that maintain the cluster-level strata layout:
 * - Strata anchor: Soft constraint pulling clusters toward their grid positions
 * - Bounding radius: Prevents clusters from drifting too far from origin
 * - Strata alignment: Keeps same-stratum clusters horizontally aligned
 */

interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

/**
 * Soft anchor force that pulls clusters toward their grid positions
 *
 * This prevents the physics simulation from completely undoing the
 * deterministic strata-based layout while still allowing minor adjustments
 * for neighborhood formation.
 *
 * @param targetPositions Map of cluster ID to target (x, y) position
 * @param strength Force strength (0.0-1.0, higher = more rigid)
 */
export function forceClusterStrataAnchor(
  targetPositions: Map<string, { x: number; y: number }>,
  strength = 0.15,
) {
  let clusterCenters: ClusterCenter[] = [];
  let targets = targetPositions;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of clusterCenters) {
      const target = targets.get(center.id);
      if (!target) continue;

      // Pull toward target position
      const dx = target.x - center.cx;
      const dy = target.y - center.cy;

      center.cx += dx * effectiveStrength;
      center.cy += dy * effectiveStrength;
    }
  }

  // D3 force interface
  force.initialize = (centers: ClusterCenter[]) => {
    clusterCenters = centers;
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  force.targets = (t: Map<string, { x: number; y: number }>) => {
    targets = t;
    return force;
  };

  return force;
}

/**
 * Bounding radius force that prevents clusters from drifting too far
 *
 * Applies an inward force when a cluster center exceeds the maximum radius
 * from the origin. This keeps the layout compact.
 *
 * @param maxRadius Maximum distance from origin
 * @param strength Force strength when outside boundary
 */
export function forceClusterBoundingRadius(maxRadius: number, strength = 0.1) {
  let clusterCenters: ClusterCenter[] = [];
  let boundingRadius = maxRadius;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of clusterCenters) {
      const dist = Math.hypot(center.cx, center.cy);

      if (dist > boundingRadius) {
        // Push inward toward origin
        const excess = dist - boundingRadius;
        const factor = (excess / dist) * effectiveStrength;

        center.cx -= center.cx * factor;
        center.cy -= center.cy * factor;
      }
    }
  }

  // D3 force interface
  force.initialize = (centers: ClusterCenter[]) => {
    clusterCenters = centers;
  };

  force.maxRadius = (r: number) => {
    boundingRadius = r;
    return force;
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  return force;
}

/**
 * Strata alignment force that keeps same-stratum clusters horizontally aligned
 *
 * Applies a weak Y-correction to maintain stratum bands, ensuring clusters
 * in the same stratum stay roughly at the same vertical position.
 *
 * @param clusterStratum Map of cluster ID to stratum number
 * @param strataSpacing Vertical spacing between strata
 * @param strength Force strength for alignment
 */
export function forceClusterStrataAlignment(
  clusterStratum: Map<string, number>,
  strataSpacing: number,
  strength = 0.08,
) {
  let clusterCenters: ClusterCenter[] = [];
  let strata = clusterStratum;
  let spacing = strataSpacing;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of clusterCenters) {
      const stratum = strata.get(center.id);
      if (stratum === undefined) continue;

      // Target Y based on stratum
      const targetY = stratum * spacing;

      // Pull toward target Y (maintain horizontal band)
      const dy = targetY - center.cy;
      center.cy += dy * effectiveStrength;
    }
  }

  // D3 force interface
  force.initialize = (centers: ClusterCenter[]) => {
    clusterCenters = centers;
  };

  force.stratum = (s: Map<string, number>) => {
    strata = s;
    return force;
  };

  force.spacing = (s: number) => {
    spacing = s;
    return force;
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  return force;
}

/**
 * Global X-centering force that keeps clusters compact around x=0
 *
 * Prevents horizontal drift by applying a weak force toward the center.
 * Unlike D3's forceCenter which moves the whole graph, this gradually
 * pulls individual clusters toward x=0.
 *
 * @param strength Force strength (should be very weak, e.g., 0.02)
 */
export function forceClusterXCentering(strength = 0.02) {
  let clusterCenters: ClusterCenter[] = [];

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of clusterCenters) {
      // Pull toward x=0
      center.cx -= center.cx * effectiveStrength;
    }
  }

  // D3 force interface
  force.initialize = (centers: ClusterCenter[]) => {
    clusterCenters = centers;
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  return force;
}
