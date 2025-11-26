/**
 * Force-directed layout for nodes within a cluster
 * Runs simulation to completion, then freezes - no continuous animation
 */

import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import type { Cluster, ClusterLayoutConfig, PositionedNode } from '../../types/cluster';

interface ForceNode {
  id: string;
  node: GraphNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  metadata: Record<string, unknown>;
}

/**
 * Runs a complete force simulation and returns frozen positions
 */
export function layoutNodesWithForce(
  cluster: Cluster,
  edges: GraphEdge[],
  config: ClusterLayoutConfig,
): PositionedNode[] {
  const nodes = cluster.nodes;

  // Create force nodes with initial random positions
  const forceNodes: ForceNode[] = nodes.map((node) => {
    const metadata = cluster.metadata.get(node.id)!;

    // Determine node radius
    let radius: number;
    if (metadata.isAnchor) {
      radius = config.anchorNodeSize;
    } else if (metadata.role === 'test') {
      radius = config.testNodeSize;
    } else {
      radius = config.normalNodeSize;
    }

    // Initial position: random but centered
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;

    return {
      id: node.id,
      node,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      vx: 0,
      vy: 0,
      radius,
      metadata,
    };
  });

  // Find internal edges (within this cluster)
  const internalEdges = edges.filter((edge) => {
    const sourceInCluster = nodes.find((n) => n.id === edge.source);
    const targetInCluster = nodes.find((n) => n.id === edge.target);
    return sourceInCluster && targetInCluster;
  });

  // Calculate ideal link distance based on cluster density
  const nodeCount = nodes.length;
  let linkDistance: number;
  if (nodeCount <= 3) {
    linkDistance = 60; // Very tight for tiny clusters
  } else if (nodeCount <= 6) {
    linkDistance = 80; // Tight for small clusters
  } else if (nodeCount <= 10) {
    linkDistance = 100; // Medium spacing
  } else if (nodeCount <= 15) {
    linkDistance = 120; // More room for larger clusters
  } else {
    linkDistance = 140; // Spacious for big clusters
  }

  // Run simulation for fixed iterations
  const iterations = 200;

  for (let i = 0; i < iterations; i++) {
    const alpha = Math.max(0, 1 - i / iterations); // Decay from 1 to 0

    // Apply forces
    applyCenteringForce(forceNodes, alpha * 0.1);
    applyLinkForce(forceNodes, internalEdges, linkDistance, alpha * 0.3);
    applyChargeForce(forceNodes, alpha * 0.5);
    applyCollisionForce(forceNodes, alpha * 0.8);

    // Update positions
    updatePositions(forceNodes, alpha);
  }

  // Convert to PositionedNode
  return forceNodes.map((fn) => ({
    node: fn.node,
    clusterId: cluster.id,
    localX: fn.x,
    localY: fn.y,
    x: fn.x,
    y: fn.y,
    metadata: fn.metadata,
  }));
}

/**
 * Centering force - pulls nodes toward origin
 */
function applyCenteringForce(nodes: ForceNode[], strength: number): void {
  // Calculate centroid
  let cx = 0;
  let cy = 0;
  nodes.forEach((n) => {
    cx += n.x;
    cy += n.y;
  });
  cx /= nodes.length;
  cy /= nodes.length;

  // Pull toward origin
  nodes.forEach((n) => {
    n.vx -= (n.x - cx) * strength;
    n.vy -= (n.y - cy) * strength;
  });
}

/**
 * Link force - pulls connected nodes together
 */
function applyLinkForce(
  nodes: ForceNode[],
  edges: GraphEdge[],
  targetDistance: number,
  strength: number,
): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  edges.forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);

    if (!source || !target) return;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    // Spring force
    const force = ((distance - targetDistance) / distance) * strength;
    const fx = dx * force;
    const fy = dy * force;

    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  });
}

/**
 * Charge force - repels nodes from each other
 */
function applyChargeForce(nodes: ForceNode[], strength: number): void {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;

      if (distSq === 0) continue;

      // Repulsion force (inverse square)
      const force = (-strength * 800) / distSq;
      const distance = Math.sqrt(distSq);
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }
}

/**
 * Collision force - prevents node overlap
 */
function applyCollisionForce(nodes: ForceNode[], strength: number): void {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Min distance includes node radii + label space
      const minDist = a.radius + b.radius + 35;

      if (distance < minDist && distance > 0) {
        const force = ((minDist - distance) / distance) * strength;
        const fx = dx * force * 0.5;
        const fy = dy * force * 0.5;

        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
  }
}

/**
 * Update positions based on velocities
 */
function updatePositions(nodes: ForceNode[], alpha: number): void {
  const damping = 0.6;

  nodes.forEach((node) => {
    // Apply damping
    node.vx *= damping;
    node.vy *= damping;

    // Update position
    node.x += node.vx * alpha;
    node.y += node.vy * alpha;
  });
}
