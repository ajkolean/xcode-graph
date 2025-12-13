import { type SimulationNodeDatum } from 'd3-force';
import type { ClusterCenter } from '../types';

/**
 * Weighted anisotropic cluster repulsion force
 *
 * Key features:
 * - Y-axis force is scaled down (anisotropic) so strata can dominate vertical layout
 * - Padding is reduced for clusters that share many edges (neighborhoods form)
 * - Respects cluster radii for proper non-overlap
 */
export function forceClusterRepulsion() {
  let nodes: ClusterCenter[] = [];
  let strength = 8000;
  let padding = 120;
  let yScale = 0.25;
  let weights = new Map<string, number>();

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;

        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy) || 1e-6;

        // Get cross-cluster edge weight
        const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
        const w = weights.get(key) ?? 0;

        // Softness: more edges = less repulsion/padding (form neighborhoods)
        const softness = 1 / (1 + Math.log2(w + 1));
        const effectivePadding = padding * softness;

        // Minimum distance = sum of radii + weighted padding
        const minDist = a.radius + b.radius + effectivePadding;
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

  force.initialize = (n: SimulationNodeDatum[]) => {
    // We expect the nodes passed here to be ClusterCenters
    // In a standard D3 force, this receives the simulation nodes.
    // However, this specific force operates on *Clusters*, not *Nodes*.
    // The previous implementation manually passed ClusterCenters.
    // To make this standard, we either:
    // 1. Make the simulation run on Clusters (meta-simulation)
    // 2. Or keep this as a manual force if it doesn't run on the main nodes.
    
    // DECISION: This force operates on Cluster Centers, which are distinct from SimNodes.
    // If the main simulation is for SimNodes, this force cannot be a standard force() *of that simulation*
    // unless we adapt it. 
    // BUT, the architecture in d3-layout.ts suggests we are updating cluster centers *alongside* nodes.
    // The cleanest way is to just store the reference.
    nodes = n as unknown as ClusterCenter[]; 
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  force.padding = (p: number) => {
    padding = p;
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
 * Gently pulls connected clusters together to form neighborhoods.
 */
export function forceClusterAttraction() {
  let nodes: ClusterCenter[] = [];
  let strength = 0.20;
  let activationDistance = 400;
  let weights = new Map<string, number>();

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;

        const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
        const w = weights.get(key) ?? 0;

        if (w === 0) continue;

        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.hypot(dx, dy) || 1e-6;

        const minDist = a.radius + b.radius + activationDistance;
        if (dist <= minDist) continue;

        const attractionFactor = Math.log2(w + 1) * effectiveStrength;
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

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as unknown as ClusterCenter[];
  };

  force.strength = (s: number) => {
    strength = s;
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