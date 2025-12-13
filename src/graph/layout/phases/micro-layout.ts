import type { Cluster } from "@shared/schemas";
import { NodeRole } from "@shared/schemas/cluster.schema";
import type { GraphEdge, GraphNode } from "@shared/schemas/graph.schema";
import * as d3 from "d3-force";
import type { LayoutConfig } from "../config";
import type { NodePosition } from "@shared/schemas";

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

  // 1. Calculate Dynamic Bands based on node distribution
  // Each role gets an area proportional to its node count
  const roleCounts = new Map<NodeRole, number>();
  for (const node of nodes) {
    const role = cluster.metadata?.get(node.id)?.role ?? NodeRole.InternalLib;
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }

  let cumulativeCount = 0;
  const dynamicBands = new Map<NodeRole, { min: number; max: number }>();

  for (const role of ROLE_ORDER) {
    const count = roleCounts.get(role) ?? 0;

    const prevR = Math.sqrt(cumulativeCount / n);
    cumulativeCount += count;
    const nextR = Math.sqrt(cumulativeCount / n);

    // Add a tiny buffer to empty bands to prevent division by zero in force calculations
    // if a node somehow ends up there or just for safety
    if (count === 0) {
      dynamicBands.set(role, { min: prevR, max: prevR });
    } else {
      dynamicBands.set(role, { min: prevR, max: nextR });
    }
  }

  // 2. Determine Cluster Size
  // Use power 0.6 instead of 0.5 (sqrt) to make large clusters sparser (more breathing room)
  // This scales area slightly super-linearly with N, reducing density as N grows
  const spacingFactor = 1.3;
  const nodeSpace = config.nodeRadius * 2 + config.clusterNodeSpacing;
  const baseR = Math.pow(n, 0.6) * nodeSpace * spacingFactor;

  // Add extra padding for large clusters
  const congestionPadding = Math.max(0, n - 15) * 2.0;
  const padding = 50 + congestionPadding;

  const radius = Math.max(config.minClusterSize / 2, baseR + padding);
  const size = radius * 2;

  // 3. Initialize Simulation Nodes
  const simNodes = nodes.map((node) => ({
    id: node.id,
    x: (Math.random() - 0.5) * 10, // Start near center
    y: (Math.random() - 0.5) * 10,
    vx: 0,
    vy: 0,
    role: cluster.metadata?.get(node.id)?.role ?? NodeRole.InternalLib,
    radius: config.nodeRadius,
  }));

  // 4. Create Forces
  const simulation = d3
    .forceSimulation(simNodes as any)
    // A. Collision (prevent overlap)
    .force(
      "collide",
      d3
        .forceCollide()
        .radius((d: any) => d.radius + config.nodeCollisionPadding),
    )
    // B. Solar System Orbit (Band-based positioning)
    .force("orbit", (alpha) => {
      const k = alpha * 0.8; // Strong confinement to band
      for (const node of simNodes) {
        const band = dynamicBands.get(node.role) ?? { min: 0, max: 1 };
        const minR = band.min * (radius - 20);
        const maxR = band.max * (radius - 20);

        // Current distance
        const d = Math.hypot(node.x, node.y) || 1e-6;

        // Only apply force if outside band
        if (d < minR) {
          const diff = d - minR; // Negative
          // Push out
          const fx = (node.x / d) * diff * k;
          const fy = (node.y / d) * diff * k;
          node.vx -= fx;
          node.vy -= fy;
        } else if (d > maxR) {
          const diff = d - maxR; // Positive
          // Pull in
          const fx = (node.x / d) * diff * k;
          const fy = (node.y / d) * diff * k;
          node.vx -= fx;
          node.vy -= fy;
        }
        // Inside band? Drift freely (repulsion handles spacing)
      }
    })
    // C. Center Gravity (keep things coherent but loose)
    .force("center", d3.forceCenter(0, 0).strength(0.02))
    // D. Many Body (stronger repulsion to use available space)
    .force("charge", d3.forceManyBody().strength(config.nodeCharge));

  // 5. Run Simulation
  // Micro-layout is small (dozens of nodes), so we can run enough ticks quickly
  simulation.tick(150);
  simulation.stop();

  // 6. Extract Positions
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
