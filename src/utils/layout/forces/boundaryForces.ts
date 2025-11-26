/**
 * Boundary constraint forces
 * Keeps nodes inside cluster boundaries
 */

import { NodePosition, ClusterPosition } from '../../../types/simulation';
import { ClusterLayoutConfig } from '../../../types/cluster';

/**
 * Constrains nodes to stay within cluster boundaries
 */
export function applyClusterBoundaries(
  nodes: Map<string, NodePosition>,
  clusters: Map<string, ClusterPosition>,
  config: ClusterLayoutConfig
): void {
  nodes.forEach(node => {
    const cluster = clusters.get(node.clusterId);
    if (!cluster) return;
    
    const maxRadius = Math.min(cluster.width, cluster.height) / 2 - 40;
    const dist = Math.sqrt(node.x * node.x + node.y * node.y);
    
    if (dist > maxRadius) {
      const scale = maxRadius / dist;
      node.x *= scale;
      node.y *= scale;
    }
  });
}
