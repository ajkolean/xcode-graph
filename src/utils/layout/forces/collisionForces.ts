/**
 * Collision force calculations
 * Prevents nodes and clusters from overlapping
 */

import type { ClusterPosition, NodePosition } from '../../../types/simulation';

/**
 * Applies collision force between nodes in the same cluster
 */
export function applyNodeCollisions(
  nodes: Map<string, NodePosition>,
  clusters: Map<string, ClusterPosition>,
  strength: number,
): void {
  const nodeArray = Array.from(nodes.values());

  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const a = nodeArray[i];
      const b = nodeArray[j];

      // Only collide nodes in same cluster
      if (a.clusterId !== b.clusterId) continue;

      const clusterPos = clusters.get(a.clusterId);
      if (!clusterPos) continue;

      const ax = clusterPos.x + a.x;
      const ay = clusterPos.y + a.y;
      const bx = clusterPos.x + b.x;
      const by = clusterPos.y + b.y;

      const dx = bx - ax;
      const dy = by - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Add extra space for labels
      const minDist = (a.radius || 8) + (b.radius || 8) + 30;

      if (dist < minDist && dist > 0) {
        const force = ((minDist - dist) / dist) * strength;
        const fx = dx * force;
        const fy = dy * force;

        a.vx! -= fx;
        a.vy! -= fy;
        b.vx! += fx;
        b.vy! += fy;
      }
    }
  }
}

/**
 * Applies collision force between clusters
 */
export function applyClusterCollisions(
  clusters: Map<string, ClusterPosition>,
  strength: number,
): void {
  const clusterArray = Array.from(clusters.values());

  for (let i = 0; i < clusterArray.length; i++) {
    for (let j = i + 1; j < clusterArray.length; j++) {
      const a = clusterArray[i];
      const b = clusterArray[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const minDist = (a.width + b.width) / 2 + 100; // Padding between clusters

      if (dist < minDist && dist > 0) {
        const force = ((minDist - dist) / dist) * strength;
        const fx = dx * force * 0.5;
        const fy = dy * force * 0.5;

        a.vx! -= fx;
        a.vy! -= fy;
        b.vx! += fx;
        b.vy! += fy;
      }
    }
  }
}
