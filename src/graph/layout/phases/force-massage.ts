import type { ClusterPosition } from '@shared/schemas';
import {
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { ClusterGraph } from '../cluster-graph';
import type { LayoutConfig } from '../config';

/** Simulation node for cluster force-massage */
interface ClusterSimNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ox: number;
  oy: number;
}

/** Simulation link for cluster force-massage */
interface ClusterSimLink extends SimulationLinkDatum<ClusterSimNode> {
  strength: number;
}

/**
 * Apply a short force-directed simulation to "massage" cluster positions.
 * This relaxes the rigid grid/layer structure from ELK to reduce
 * overlaps or awkward gaps while preserving the general topology.
 *
 * @param clusterPositions - Initial cluster positions from ELK macro-layout
 * @param clusterGraph - Cluster meta-graph (used for link forces)
 * @param config - Layout configuration with spacing parameters
 * @returns Updated cluster positions after force relaxation
 */
export function applyForceMassage(
  clusterPositions: Map<string, ClusterPosition>,
  clusterGraph: ClusterGraph,
  config: LayoutConfig,
): Map<string, ClusterPosition> {
  // 1. Prepare simulation nodes
  // d3-force modifies nodes in place, so we create a working copy
  // We need to store width/height for collision radius
  const nodes: ClusterSimNode[] = Array.from(clusterPositions.values()).map((pos) => ({
    id: pos.id,
    x: pos.x,
    y: pos.y,
    width: pos.width,
    height: pos.height,
    // Store original position to keep them somewhat tethered?
    ox: pos.x,
    oy: pos.y,
  }));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 2. Prepare links
  const links = clusterGraph.edges
    .map((e) => ({
      source: nodeMap.get(e.source),
      target: nodeMap.get(e.target),
      strength: e.tieStrength,
    }))
    .filter((l) => l.source && l.target); // Filter broken links

  // 3. Configure Simulation
  const simulation = forceSimulation<ClusterSimNode>(nodes)
    // Link force to keep related clusters together
    .force(
      'link',
      forceLink<ClusterSimNode, ClusterSimLink>(links as ClusterSimLink[])
        .id((d) => d.id)
        .distance((d) => {
          // Ideal distance based on size of connected nodes
          // r1 + r2 + buffer
          const s = d.source as ClusterSimNode;
          const t = d.target as ClusterSimNode;
          const r1 = Math.max(s.width, s.height) / 2;
          const r2 = Math.max(t.width, t.height) / 2;
          return r1 + r2 + config.elkLayerSpacing;
        })
        .strength(0.1), // Gentle pull
    )
    // Collision force to prevent overlap
    .force(
      'collide',
      forceCollide<ClusterSimNode>()
        .radius((d) => {
          // Use circumscribed circle or slightly larger
          return Math.max(d.width, d.height) / 2 + config.elkNodeSpacing / 2;
        })
        .strength(1) // Hard collision
        .iterations(2),
    )
    // Tether to initial positions (to preserve ELK's general structure)
    // This acts like "gravity" keeping them near where ELK put them,
    // but allowing local relaxation.
    .force('x', forceX<ClusterSimNode>((d) => d.ox).strength(0.05))
    .force('y', forceY<ClusterSimNode>((d) => d.oy).strength(0.05))
    .stop();

  // 4. Run Simulation
  // A small number of ticks to just "nudge" things, with early exit on convergence
  const TICKS = 100;
  for (let i = 0; i < TICKS; i++) {
    simulation.tick();
    if (simulation.alpha() < 0.001) break;
  }

  // 5. Update positions
  const newPositions = new Map<string, ClusterPosition>();
  for (const node of nodes) {
    // Preserve the original width/height/id, just update x/y
    const original = clusterPositions.get(node.id);
    if (!original) continue;
    newPositions.set(node.id, {
      ...original,
      x: node.x,
      y: node.y,
      vx: node.vx ?? 0, // Save velocity if we ever want to animate continued settling
      vy: node.vy ?? 0,
    });
  }

  return newPositions;
}
