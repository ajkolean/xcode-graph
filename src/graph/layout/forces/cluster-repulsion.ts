/**
 * Size-aware cluster-to-cluster repulsion force (proper D3 force interface)
 * Prevents cluster centers from collapsing into each other
 * Uses cluster radius for accurate collision detection
 */

interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number; // Half of cluster width/height
}

export function forceClusterRepulsion(strength: number, extraPadding: number) {
  let clusterCenters: ClusterCenter[] = [];

  function force(alpha: number) {
    const effectiveStrength = strength * alpha; // Scale by D3's alpha decay

    for (let i = 0; i < clusterCenters.length; i++) {
      const a = clusterCenters[i]!;

      for (let j = i + 1; j < clusterCenters.length; j++) {
        const b = clusterCenters[j]!;

        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy) || 1e-6;

        // Minimum distance = sum of radii + padding
        const minDist = a.radius + b.radius + extraPadding;
        if (dist < minDist) dist = minDist;

        // Inverse square repulsion
        const forceVal = effectiveStrength / (dist * dist);
        const nx = dx / dist;
        const ny = dy / dist;
        const fx = forceVal * nx;
        const fy = forceVal * ny;

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

  force.padding = (p: number) => {
    extraPadding = p;
    return force;
  };

  return force;
}
