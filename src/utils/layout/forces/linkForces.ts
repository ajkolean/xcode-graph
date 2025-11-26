/**
 * Link force calculations
 * Keeps connected nodes closer together
 */

import type { GraphEdge } from '../../../data/mockGraphData';
import type { ClusterPosition, NodePosition } from '../../../types/simulation';

/**
 * Applies mild link force to keep connected nodes closer
 * Only applies to intra-cluster edges
 */
export function applyMildLinkForce(
  nodes: Map<string, NodePosition>,
  clusters: Map<string, ClusterPosition>,
  edges: GraphEdge[],
  strength: number,
): void {
  edges.forEach((edge) => {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);

    if (!source || !target) return;
    if (source.clusterId !== target.clusterId) return; // Only intra-cluster

    const cluster = clusters.get(source.clusterId);
    if (!cluster) return;

    const sx = cluster.x + source.x;
    const sy = cluster.y + source.y;
    const tx = cluster.x + target.x;
    const ty = cluster.y + target.y;

    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const force = dist * strength * 0.1; // Very weak
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx! += fx;
      source.vy! += fy;
      target.vx! -= fx;
      target.vy! -= fy;
    }
  });
}
