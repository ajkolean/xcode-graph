/**
 * Per-cluster boundary force wrapper
 * Handles coordinate system shifting (absolute ↔ cluster-relative)
 */

import forceBoundary from '../boundary';

export function createClusterBoundaryForce(
  clusterNodes: any[],
  centerRef: { cx: number; cy: number },
  maxRadius: number,
) {
  const baseForce = forceBoundary(-maxRadius, -maxRadius, maxRadius, maxRadius)
    .hardBoundary(true)
    .strength(1.0);

  baseForce.initialize(clusterNodes);

  // Return wrapped force that handles coordinate shifting
  return (alpha: number) => {
    // Shift nodes to cluster-relative coordinates
    for (const node of clusterNodes) {
      node.x = (node.x ?? 0) - centerRef.cx;
      node.y = (node.y ?? 0) - centerRef.cy;
    }

    // Apply boundary force (operates in relative space)
    baseForce(alpha);

    // Shift back to absolute coordinates
    for (const node of clusterNodes) {
      node.x = (node.x ?? 0) + centerRef.cx;
      node.y = (node.y ?? 0) + centerRef.cy;
    }
  };
}
