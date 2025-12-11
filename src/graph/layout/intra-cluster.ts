/**
 * Intra-cluster layout: Complete graph force-directed positioning
 *
 * Each cluster is treated as a complete graph where every node has invisible
 * edges to every other node. This creates natural, even spacing.
 */

import type { AdjacencyList } from './algorithms';
import { LAYOUT_CONSTANTS } from './layout-constants';

export interface NodeCartesian {
  id: string;
  x: number;
  y: number;
  ring: number;
  isTest: boolean;
}

export interface SimpleLayoutOptions {
  idealDistance?: number;
  maxRadius?: number;
}

/**
 * Run a simple force-directed simulation treating the cluster as a complete graph.
 * Every node has an invisible edge to every other node, creating natural spacing.
 */
function runForceSimulation(
  nodes: Array<{ id: string; name: string; type: string }>,
  _adj: AdjacencyList,
  _anchors: string[],
  centerX: number,
  centerY: number,
  _options: SimpleLayoutOptions,
): NodeCartesian[] {
  const nodeCount = nodes.length;
  if (nodeCount === 0) return [];
  if (nodeCount === 1) {
    return [
      {
        id: nodes[0].id,
        x: centerX,
        y: centerY,
        ring: 0,
        isTest: nodes[0].type.startsWith('test'),
      },
    ];
  }

  // Initialize nodes in a circle around origin (0,0) - we'll translate later
  const simNodes = nodes.map((node, i) => {
    const angle = (i / nodeCount) * Math.PI * 2;
    const startRadius = 20;
    return {
      id: node.id,
      x: startRadius * Math.cos(angle),
      y: startRadius * Math.sin(angle),
      vx: 0,
      vy: 0,
      isTest: node.type.startsWith('test'),
    };
  });

  // Layout parameters - scale with node count
  const ITERATIONS = 150;
  const IDEAL_DISTANCE = 35; // Compact spacing
  const REPULSION = 500;
  const ATTRACTION = 0.08;
  const CENTER_GRAVITY = 0.015;
  const DAMPING = 0.88;

  // Cluster boundary - needs to fit all nodes at ideal spacing
  // For n nodes in circle: circumference ≈ n * IDEAL_DISTANCE
  // radius ≈ n * IDEAL_DISTANCE / (2π)
  const estimatedRadius = Math.max(30, (nodeCount * IDEAL_DISTANCE) / (2 * Math.PI));
  const maxRadius = estimatedRadius * 1.3; // 30% padding

  // Simulation loop
  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Apply forces
    for (const node of simNodes) {
      let fx = 0;
      let fy = 0;

      // Center gravity - pull toward origin
      fx += -node.x * CENTER_GRAVITY;
      fy += -node.y * CENTER_GRAVITY;

      // Complete graph: every node interacts with every other
      for (const other of simNodes) {
        if (node.id === other.id) continue;

        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.hypot(dx, dy) || 0.1;
        const nx = dx / dist;
        const ny = dy / dist;

        // Repulsion (inverse square)
        const repForce = REPULSION / (dist * dist + 1);
        fx -= nx * repForce;
        fy -= ny * repForce;

        // Attraction (spring toward ideal distance) - the "invisible edges"
        const springForce = (dist - IDEAL_DISTANCE) * ATTRACTION;
        fx += nx * springForce;
        fy += ny * springForce;
      }

      // Update velocity
      node.vx = (node.vx + fx) * DAMPING;
      node.vy = (node.vy + fy) * DAMPING;
    }

    // Apply velocity and enforce boundary
    for (const node of simNodes) {
      node.x += node.vx;
      node.y += node.vy;

      // Clamp to cluster boundary (around origin)
      const dist = Math.hypot(node.x, node.y);
      if (dist > maxRadius) {
        const scale = maxRadius / dist;
        node.x *= scale;
        node.y *= scale;
        node.vx *= 0.2;
        node.vy *= 0.2;
      }
    }
  }

  // Return positions relative to origin - caller will translate to cluster center
  return simNodes.map((n) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    isTest: n.isTest,
    ring: 0,
  }));
}

// ========================================
// Public API
// ========================================

export function simpleClusterLayout(
  nodes: Array<{ id: string; name: string; type: string }>,
  _edges: Array<{ from: string; to: string }>,
  centerX: number,
  centerY: number,
  options: SimpleLayoutOptions = {},
): NodeCartesian[] {
  if (nodes.length === 0) return [];

  // Run complete graph simulation (edges not used - every node connects to every other)
  return runForceSimulation(nodes, {} as AdjacencyList, [], centerX, centerY, options);
}

/**
 * Compute minimum enclosing circle radius for a set of positioned nodes
 */
export function computeMEC(
  positions: NodeCartesian[],
  centerX: number,
  centerY: number,
  _masses?: Map<string, import('./mass').NodeMass>,
): number {
  if (positions.length === 0) return 50;

  let maxDistance = 0;
  for (const pos of positions) {
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const distance = Math.hypot(dx, dy);
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance + LAYOUT_CONSTANTS.CLUSTER_PADDING;
}
