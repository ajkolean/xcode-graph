import type { Cluster, NodePosition } from '@shared/schemas';
import { NodeRole } from '@shared/schemas/cluster.types';
import type { SimulationNodeDatum } from 'd3-force';
import * as d3 from 'd3-force';
import type { LayoutConfig } from '../config';

/** Simulation node for micro-layout within a cluster */
interface MicroSimNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  role: NodeRole;
  radius: number;
}

export interface MicroLayoutResult {
  clusterId: string;
  width: number;
  height: number;
  relativePositions: Map<string, NodePosition>;
}

/**
 * Role order for dynamic band calculation (center to outside)
 */
const ROLE_ORDER = [
  NodeRole.Entry,
  NodeRole.InternalFramework,
  NodeRole.InternalLib,
  NodeRole.Utility,
  NodeRole.Test,
  NodeRole.Tool,
];

/**
 * Count how many nodes belong to each role within a cluster.
 */
function countRoles(cluster: Cluster): Map<NodeRole, number> {
  const roleCounts = new Map<NodeRole, number>();
  for (const node of cluster.nodes) {
    const role = cluster.metadata?.get(node.id)?.role ?? NodeRole.InternalLib;
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }
  return roleCounts;
}

/**
 * Calculate radial bands where each role's band area is proportional to its node count.
 */
function computeDynamicBands(
  n: number,
  roleCounts: Map<NodeRole, number>,
): Map<NodeRole, { min: number; max: number }> {
  const bands = new Map<NodeRole, { min: number; max: number }>();
  let cumulativeCount = 0;

  for (const role of ROLE_ORDER) {
    const count = roleCounts.get(role) ?? 0;
    const prevR = Math.sqrt(cumulativeCount / n);
    cumulativeCount += count;
    const nextR = Math.sqrt(cumulativeCount / n);

    // Empty bands get zero-width range; non-empty bands span prevR→nextR
    bands.set(role, { min: prevR, max: count === 0 ? prevR : nextR });
  }

  return bands;
}

/**
 * Determine cluster radius from node count and config.
 * Uses power 0.6 (super-linear) so large clusters are sparser.
 */
function computeClusterRadius(n: number, config: LayoutConfig): number {
  const spacingFactor = 1.3;
  const nodeSpace = config.nodeRadius * 2 + config.clusterNodeSpacing;
  const baseR = n ** 0.6 * nodeSpace * spacingFactor;
  const congestionPadding = Math.max(0, n - 15) * 2.0;
  const padding = 50 + congestionPadding;
  return Math.max(config.minClusterSize / 2, baseR + padding);
}

/**
 * Create an orbit force that confines nodes to their role's radial band.
 */
function createOrbitForce(
  simNodes: MicroSimNode[],
  dynamicBands: Map<NodeRole, { min: number; max: number }>,
  radius: number,
): (alpha: number) => void {
  return (alpha) => {
    const k = alpha * 0.8;
    for (const node of simNodes) {
      const band = dynamicBands.get(node.role) ?? { min: 0, max: 1 };
      const minR = band.min * (radius - 20);
      const maxR = band.max * (radius - 20);
      const d = Math.hypot(node.x, node.y) || 1e-6;

      // Only apply force if outside band
      if (d < minR || d > maxR) {
        const target = d < minR ? minR : maxR;
        const diff = d - target;
        const fx = (node.x / d) * diff * k;
        const fy = (node.y / d) * diff * k;
        node.vx -= fx;
        node.vy -= fy;
      }
    }
  };
}

/**
 * Compute micro-layout for a single cluster using "Solar System" physics
 */
export function computeClusterInterior(cluster: Cluster, config: LayoutConfig): MicroLayoutResult {
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

  const roleCounts = countRoles(cluster);
  const dynamicBands = computeDynamicBands(n, roleCounts);
  const radius = computeClusterRadius(n, config);

  const simNodes: MicroSimNode[] = nodes.map((node) => ({
    id: node.id,
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    vx: 0,
    vy: 0,
    role: cluster.metadata?.get(node.id)?.role ?? NodeRole.InternalLib,
    radius: config.nodeRadius,
  }));

  const simulation = d3
    .forceSimulation<MicroSimNode>(simNodes)
    .force(
      'collide',
      d3.forceCollide<MicroSimNode>().radius((d) => d.radius + config.nodeCollisionPadding),
    )
    .force('orbit', createOrbitForce(simNodes, dynamicBands, radius))
    .force('center', d3.forceCenter(0, 0).strength(0.02))
    .force('charge', d3.forceManyBody().strength(config.nodeCharge));

  simulation.tick(150);
  simulation.stop();

  // Extract positions
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
    width: radius * 2,
    height: radius * 2,
    relativePositions,
  };
}
