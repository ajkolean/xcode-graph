/**
 * Cluster-to-cluster repulsion force (proper D3 force interface)
 * Prevents cluster centers from collapsing into each other
 */

interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
}

export function forceClusterRepulsion(strength: number, minDist: number) {
  let clusterCenters: ClusterCenter[] = [];

  function force(alpha: number) {
    const effectiveStrength = strength * alpha; // Scale by D3's alpha decay

    for (let i = 0; i < clusterCenters.length; i++) {
      const a = clusterCenters[i]!;

      for (let j = i + 1; j < clusterCenters.length; j++) {
        const b = clusterCenters[j]!;

        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy);

        // Prevent division by zero
        if (dist < minDist) dist = minDist;

        // Inverse square repulsion
        const forceVal = effectiveStrength / (dist * dist);
        const fx = forceVal * dx;
        const fy = forceVal * dy;

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
    strength = s;
    return force;
  };

  force.minDistance = (d: number) => {
    minDist = d;
    return force;
  };

  return force;
}
