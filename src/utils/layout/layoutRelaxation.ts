/**
 * Short fixed-duration force relaxation for polish
 * Runs 30-50 ticks then FREEZES - no continuous simulation
 * Refactored to use modular force functions
 */

import type { GraphEdge } from '../../data/mockGraphData';
import type { ClusterLayoutConfig } from '../../types/cluster';
import type { ClusterPosition, NodePosition } from '../../types/simulation';
import { applyClusterBoundaries } from './forces/boundaryForces';
import { applyClusterCollisions, applyNodeCollisions } from './forces/collisionForces';
import { applyMildLinkForce } from './forces/linkForces';

interface RelaxationConfig {
  iterations: number;
  nodeCollisionStrength: number;
  clusterCollisionStrength: number;
  linkStrength: number;
}

const DEFAULT_RELAXATION_CONFIG: RelaxationConfig = {
  iterations: 30,
  nodeCollisionStrength: 0.8,
  clusterCollisionStrength: 1.0,
  linkStrength: 0.1,
};

/**
 * Runs a short relaxation pass to smooth out overlaps
 * Returns final frozen positions
 */
export function relaxNodePositions(
  initialNodes: Map<string, NodePosition>,
  initialClusters: Map<string, ClusterPosition>,
  edges: GraphEdge[],
  layoutConfig: ClusterLayoutConfig,
  relaxConfig: RelaxationConfig = DEFAULT_RELAXATION_CONFIG,
): {
  nodes: Map<string, NodePosition>;
  clusters: Map<string, ClusterPosition>;
} {
  // Clone positions
  const nodes = new Map(
    Array.from(initialNodes.entries()).map(([id, pos]) => [id, { ...pos, vx: 0, vy: 0 }]),
  );

  const clusters = new Map(
    Array.from(initialClusters.entries()).map(([id, pos]) => [id, { ...pos, vx: 0, vy: 0 }]),
  );

  // Run fixed iterations
  for (let i = 0; i < relaxConfig.iterations; i++) {
    const alpha = 1 - i / relaxConfig.iterations; // Decay from 1 to 0

    // Apply forces
    applyNodeCollisions(nodes, clusters, relaxConfig.nodeCollisionStrength * alpha);
    applyClusterCollisions(clusters, relaxConfig.clusterCollisionStrength * alpha);
    applyMildLinkForce(nodes, clusters, edges, relaxConfig.linkStrength * alpha);
    applyClusterBoundaries(nodes, clusters, layoutConfig);

    // Update positions
    updateNodePositions(nodes, alpha);
    updateClusterPositions(clusters, alpha);
  }

  // Zero out velocities - FREEZE
  nodes.forEach((node) => {
    node.vx = 0;
    node.vy = 0;
  });

  clusters.forEach((cluster) => {
    cluster.vx = 0;
    cluster.vy = 0;
  });

  return { nodes, clusters };
}

/**
 * Update node positions with damping
 */
function updateNodePositions(nodes: Map<string, NodePosition>, alpha: number) {
  const damping = 0.8;

  nodes.forEach((node) => {
    node.vx! *= damping;
    node.vy! *= damping;

    node.x += node.vx! * alpha;
    node.y += node.vy! * alpha;
  });
}

/**
 * Update cluster positions with damping
 */
function updateClusterPositions(clusters: Map<string, ClusterPosition>, alpha: number) {
  const damping = 0.9;

  clusters.forEach((cluster) => {
    cluster.vx! *= damping;
    cluster.vy! *= damping;

    cluster.x += cluster.vx! * alpha;
    cluster.y += cluster.vy! * alpha;
  });
}

/**
 * No relaxation - just freeze positions as-is
 */
export function freezePositions(
  nodes: Map<string, NodePosition>,
  clusters: Map<string, ClusterPosition>,
): {
  nodes: Map<string, NodePosition>;
  clusters: Map<string, ClusterPosition>;
} {
  // Zero velocities
  nodes.forEach((node) => {
    node.vx = 0;
    node.vy = 0;
  });

  clusters.forEach((cluster) => {
    cluster.vx = 0;
    cluster.vy = 0;
  });

  return { nodes, clusters };
}
