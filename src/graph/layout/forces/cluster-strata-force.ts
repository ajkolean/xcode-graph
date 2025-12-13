import { type SimulationNodeDatum } from 'd3-force';
import type { ClusterCenter } from '../types';

/**
 * Soft anchor force that pulls clusters toward their grid positions
 */
export function forceClusterStrataAnchor() {
  let nodes: ClusterCenter[] = [];
  let targets = new Map<string, { x: number; y: number }>();
  let strength = 0.15;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of nodes) {
      const target = targets.get(center.id);
      if (!target) continue;

      const dx = target.x - center.cx;
      const dy = target.y - center.cy;

      center.cx += dx * effectiveStrength;
      center.cy += dy * effectiveStrength;
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as unknown as ClusterCenter[];
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
 */
export function forceClusterBoundingRadius() {
  let nodes: ClusterCenter[] = [];
  let maxRadius = 1200;
  let strength = 0.1;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of nodes) {
      const dist = Math.hypot(center.cx, center.cy);

      if (dist > maxRadius) {
        const excess = dist - maxRadius;
        const factor = (excess / dist) * effectiveStrength;
        center.cx -= center.cx * factor;
        center.cy -= center.cy * factor;
      }
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as unknown as ClusterCenter[];
  };

  force.maxRadius = (r: number) => {
    maxRadius = r;
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
 */
export function forceClusterStrataAlignment() {
  let nodes: ClusterCenter[] = [];
  let strata = new Map<string, number>();
  let spacing = 800;
  let strength = 0.08;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;

    for (const center of nodes) {
      const stratum = strata.get(center.id);
      if (stratum === undefined) continue;

      const targetY = stratum * spacing;
      const dy = targetY - center.cy;
      center.cy += dy * effectiveStrength;
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as unknown as ClusterCenter[];
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
 */
export function forceClusterXCentering() {
  let nodes: ClusterCenter[] = [];
  let strength = 0.02;

  function force(alpha: number) {
    const effectiveStrength = strength * alpha;
    for (const center of nodes) {
      center.cx -= center.cx * effectiveStrength;
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as unknown as ClusterCenter[];
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  return force;
}