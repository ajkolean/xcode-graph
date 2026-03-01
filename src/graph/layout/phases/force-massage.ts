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
 * This helps to relax the rigid grid/layer structure from ELK and reduce
 * overlaps or awkward gaps while maintaining the general relative positions.
 */
export function applyForceMassage(
  clusterPositions: Map<string, ClusterPosition>,
  clusterGraph: ClusterGraph,
  config: LayoutConfig,
): Map<string, ClusterPosition> {
  // d3-force modifies nodes in place, so we create a working copy
  const nodes: ClusterSimNode[] = Array.from(clusterPositions.values()).map((pos) => ({
    id: pos.id,
    x: pos.x,
    y: pos.y,
    width: pos.width,
    height: pos.height,
    // Tether to ELK-computed position
    ox: pos.x,
    oy: pos.y,
  }));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const links = clusterGraph.edges
    .map((e) => ({
      source: nodeMap.get(e.source),
      target: nodeMap.get(e.target),
      strength: e.tieStrength,
    }))
    .filter((l) => l.source && l.target); // Filter broken links

  const simulation = forceSimulation<ClusterSimNode>(nodes)
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
    .force('x', forceX<ClusterSimNode>((d) => d.ox).strength(0.05))
    .force('y', forceY<ClusterSimNode>((d) => d.oy).strength(0.05))
    .stop();

  const TICKS = 100;
  simulation.tick(TICKS);

  const newPositions = new Map<string, ClusterPosition>();
  for (const node of nodes) {
    // Preserve the original width/height/id, just update x/y
    const original = clusterPositions.get(node.id);
    if (!original) continue;
    newPositions.set(node.id, {
      ...original,
      x: node.x,
      y: node.y,
      vx: node.vx ?? 0,
      vy: node.vy ?? 0,
    });
  }

  return newPositions;
}
