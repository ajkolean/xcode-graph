/**
 * Force calculations for cluster-level simulation
 */

import { ClusterPosition } from '../../types/simulation';
import { ClusterLayoutConfig } from '../../types/cluster';

/**
 * Applies collision force between two clusters
 */
export function applyClusterCollision(
  a: ClusterPosition,
  b: ClusterPosition,
  clusterAlpha: number,
  config: ClusterLayoutConfig
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 1) return;
  
  const aRadius = Math.sqrt(a.width * a.width + a.height * a.height) / 2;
  const bRadius = Math.sqrt(b.width * b.width + b.height * b.height) / 2;
  const minSeparation = aRadius + bRadius + config.clusterSpacing;
  
  const overlap = minSeparation - distance;
  if (overlap > 0) {
    const force = overlap * 1.0 * clusterAlpha;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;
    
    a.vx -= fx;
    a.vy -= fy;
    b.vx += fx;
    b.vy += fy;
  }
}

/**
 * Applies weak center force to clusters
 */
export function applyClusterCenterForce(
  cluster: ClusterPosition,
  clusterAlpha: number
): void {
  cluster.vx -= cluster.x * 0.008 * clusterAlpha;
  cluster.vy -= cluster.y * 0.008 * clusterAlpha;
}

/**
 * Updates cluster position based on velocity
 */
export function updateClusterPosition(cluster: ClusterPosition): void {
  cluster.x += cluster.vx;
  cluster.y += cluster.vy;
  cluster.vx *= 0.82;
  cluster.vy *= 0.82;
}
