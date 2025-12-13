import type { Cluster } from '@shared/schemas';
import { NodeRole } from '@shared/schemas/cluster.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import * as d3 from 'd3-force';
import type { LayoutConfig } from '../config';
import type { NodePosition } from '@shared/schemas';

export interface MicroLayoutResult {
  clusterId: string;
  width: number;
  height: number;
  relativePositions: Map<string, NodePosition>;
}

/**
 * Role-based radius mapping (solar system model)
 * Normalized radius factors (0.0 = center, 1.0 = boundary)
 */
const ROLE_ORBIT: Record<NodeRole, number> = {
  [NodeRole.Entry]: 0.0, // Star
  [NodeRole.InternalFramework]: 0.3, // Inner
  [NodeRole.InternalLib]: 0.6, // Mid
  [NodeRole.Utility]: 0.8, // Outer
  [NodeRole.Test]: 0.95, // Halo
  [NodeRole.Tool]: 0.95, // Halo
};

/**
 * Compute micro-layout for a single cluster using "Solar System" physics
 */
export function computeClusterInterior(
  cluster: Cluster,
  config: LayoutConfig,
): MicroLayoutResult {
  const nodes = cluster.nodes;
  const n = nodes.length;

  if (n === 0) {
    return {
      clusterId: cluster.id,
      width: config.minClusterSize,
      height: config.minClusterSize,
      relativePositions: new Map(),
    };
  }

  // 1. Determine Cluster Size (Square-root scaling)
  // R = sqrt(N) * spacing * paddingFactor
  // We add a base size to ensure small clusters aren't too cramped
  const baseR = Math.sqrt(n) * (config.nodeRadius * 2 + config.clusterNodeSpacing);
  const padding = 40;
  const radius = Math.max(config.minClusterSize / 2, baseR + padding);
  const size = radius * 2;

  // 2. Initialize Simulation Nodes
  const simNodes = nodes.map((node) => ({
    id: node.id,
    x: (Math.random() - 0.5) * 10, // Start near center
    y: (Math.random() - 0.5) * 10,
    vx: 0,
    vy: 0,
    role: cluster.metadata?.get(node.id)?.role ?? NodeRole.InternalLib,
    radius: config.nodeRadius,
  }));

  // 3. Create Forces
  const simulation = d3.forceSimulation(simNodes as any)
    // A. Collision (prevent overlap)
    .force(
      'collide',
      d3.forceCollide().radius((d: any) => d.radius + config.nodeCollisionPadding),
    )
    // B. Solar System Orbit (Radial positioning based on role)
    .force(
      'orbit',
      (alpha) => {
        const k = alpha * 0.5; // Strength
        for (const node of simNodes) {
          const targetR = ROLE_ORBIT[node.role] * (radius - 20); // 20px padding from edge
          
          // Current distance
          const d = Math.hypot(node.x, node.y) || 1e-6;
          
          // Pull/Push to target radius
          const diff = d - targetR;
          const fx = (node.x / d) * diff * k;
          const fy = (node.y / d) * diff * k;
          
          node.vx -= fx;
          node.vy -= fy;
        }
      }
    )
    // C. Center Gravity (keep things coherent)
    .force('center', d3.forceCenter(0, 0).strength(0.05))
    // D. Many Body (prevent clumps, but weak)
    .force('charge', d3.forceManyBody().strength(-10));

  // 4. Run Simulation
  // Micro-layout is small (dozens of nodes), so we can run enough ticks quickly
  simulation.tick(150);
  simulation.stop();

  // 5. Extract Positions
  const relativePositions = new Map<string, NodePosition>();
  for (const node of simNodes) {
    relativePositions.set(node.id, {
      id: node.id,
      clusterId: cluster.id,
      x: node.x,
      y: node.y,
      vx: 0,
      vy: 0,
      radius: node.radius,
    });
  }

  return {
    clusterId: cluster.id,
    width: size,
    height: size,
    relativePositions,
  };
}
