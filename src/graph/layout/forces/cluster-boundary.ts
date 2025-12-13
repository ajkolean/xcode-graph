import { type SimulationNodeDatum } from 'd3-force';
import type { SimNode } from '../types';

/**
 * Create a circular cluster boundary force
 * Keeps all nodes within a circular boundary around the cluster center
 */
export function forceClusterBoundary() {
  let nodes: SimNode[] = [];
  let clusterCenters = new Map<string, { cx: number; cy: number; radius: number }>();
  let strength = 1.0;
  let padding = 10;

  function force(alpha: number) {
    for (const node of nodes) {
      if (!node.clusterId) continue;
      
      const center = clusterCenters.get(node.clusterId);
      if (!center) continue;

      const dx = (node.x ?? 0) - center.cx;
      const dy = (node.y ?? 0) - center.cy;
      const r = Math.hypot(dx, dy) || 1e-6;
      
      const maxRadius = center.radius - (node.radius || 6) - padding;

      if (r > maxRadius) {
        // Push node back inside the circle
        const k = ((r - maxRadius) / r) * strength * alpha;
        node.vx = (node.vx ?? 0) - dx * k;
        node.vy = (node.vy ?? 0) - dy * k;
      }
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as SimNode[];
  };

  force.centers = (centers: Map<string, { cx: number; cy: number; radius: number }>) => {
    clusterCenters = centers;
    return force;
  };
  
  force.padding = (p: number) => {
    padding = p;
    return force;
  };

  return force;
}

/**
 * Create a radial interior force for cluster nodes
 * Positions nodes radially based on their connectivity/role
 */
export function forceClusterRadial() {
  let nodes: SimNode[] = [];
  let clusterCenters = new Map<string, { cx: number; cy: number }>();
  let strength = 0.25;
  let radiusCallback: (nodeId: string, clusterRadius: number) => number = () => 50;
  let clusterSizes = new Map<string, number>(); // Map ID -> Diameter

  function force(alpha: number) {
    for (const node of nodes) {
      if (!node.clusterId) continue;

      const center = clusterCenters.get(node.clusterId);
      if (!center) continue;

      const dx = (node.x ?? 0) - center.cx;
      const dy = (node.y ?? 0) - center.cy;
      const r = Math.hypot(dx, dy) || 1e-6;

      const clusterSize = clusterSizes.get(node.clusterId) ?? 100;
      const clusterRadius = clusterSize / 2;
      
      const targetRadius = radiusCallback(node.id, clusterRadius);
      const err = r - targetRadius;

      const k = err * strength * alpha;

      node.vx = (node.vx ?? 0) - (dx / r) * k;
      node.vy = (node.vy ?? 0) - (dy / r) * k;
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as SimNode[];
  };

  force.centers = (centers: Map<string, { cx: number; cy: number }>) => {
    clusterCenters = centers;
    return force;
  };
  
  force.clusterSizes = (sizes: Map<string, number>) => {
    clusterSizes = sizes;
    return force;
  };

  force.radius = (callback: (nodeId: string, clusterRadius: number) => number) => {
    radiusCallback = callback;
    return force;
  };
  
  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  return force;
}