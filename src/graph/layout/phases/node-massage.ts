import { forceSimulation, forceCollide, forceX, forceY, forceManyBody } from 'd3-force';
import type { LayoutConfig } from '../config';
import type { MicroLayoutResult } from './micro-layout';
import type { NodePosition } from '@shared/schemas';

/**
 * Apply a gentle force-directed "massage" to nodes within a cluster.
 * This runs after the main "Solar System" layout to improve spacing
 * and resolve any local congestions while preserving the overall structure.
 */
export function applyNodeMassage(
  micro: MicroLayoutResult,
  config: LayoutConfig
): MicroLayoutResult {
  const nodes = Array.from(micro.relativePositions.values()).map(pos => ({
    ...pos,
    // Store original positions for tethering
    ox: pos.x,
    oy: pos.y
  }));

  if (nodes.length === 0) return micro;

  const simulation = forceSimulation(nodes as any)
    // 1. Anchor to original positions (preserve Solar System bands)
    .force('x', forceX((d: any) => d.ox).strength(0.1))
    .force('y', forceY((d: any) => d.oy).strength(0.1))
    
    // 2. Gentle repulsion to "fluff" the cluster
    .force('charge', forceManyBody().strength(-30))
    
    // 3. Hard collision to ensure no overlaps
    .force('collide', forceCollide()
      .radius((d: any) => (d.radius ?? config.nodeRadius) + config.clusterNodeSpacing)
      .strength(0.9)
      .iterations(2)
    )
    .stop();

  // Run a short burst
  simulation.tick(50);

  // Update positions and recalculate bounds
  const newPositions = new Map<string, NodePosition>();
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const node of nodes) {
    newPositions.set(node.id, {
      ...micro.relativePositions.get(node.id)!,
      x: node.x,
      y: node.y,
    });

    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.y > maxY) maxY = node.y;
  }

  // Recalculate size if nodes pushed out
  // The original size is centered at 0,0, so width = max dimension * 2 usually?
  // But here we can just take the bounding box size + padding
  const currentW = maxX - minX;
  const currentH = maxY - minY;
  
  // Ensure we don't shrink below original calculated size (which had "breathing room" logic)
  // but do expand if needed.
  // Actually, let's keep it simple: Expand if bounding box exceeds original size.
  // Assuming 0,0 center, the radius is max(abs(min), abs(max))
  const maxDim = Math.max(
    Math.abs(minX), Math.abs(maxX),
    Math.abs(minY), Math.abs(maxY)
  );
  
  const neededSize = (maxDim * 2) + 100; // + padding
  const finalSize = Math.max(micro.width, neededSize);

  return {
    ...micro,
    relativePositions: newPositions,
    width: finalSize,
    height: finalSize
  };
}
