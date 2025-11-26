/**
 * Boundary constraint forces
 * Keeps nodes inside cluster boundaries
 */

import type { ClusterLayoutConfig } from '../../../types/cluster';
import type { ClusterPosition, NodePosition } from '../../../types/simulation';

/**
 * Constrains nodes to stay within cluster boundaries
 */
export function applyClusterBoundaries(
  nodes: Map<string, NodePosition>,
  clusters: Map<string, ClusterPosition>,
  _config: ClusterLayoutConfig,
): void {
  nodes.forEach((node) => {
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
