/**
 * Utilities for calculating node sizes
 */

import { buildAdjacency } from '@graph/utils/traversal';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';

/**
 * Base sizes for different node types
 */
const BASE_NODE_SIZES: Record<string, number> = {
  app: 18,
  framework: 14,
  cli: 14,
  library: 12,
  package: 12,
  'test-unit': 8,
  'test-ui': 8,
};

const DEFAULT_BASE_SIZE = 10;

/**
 * Calculates the size of a node based on its type and transitive weight.
 * When weight is provided, uses log scale for smoother differentiation.
 * Falls back to direct edge count when weight is not available.
 */
export function getNodeSize(node: GraphNode, edges: GraphEdge[], weight?: number): number {
  const baseSize = BASE_NODE_SIZES[node.type] ?? DEFAULT_BASE_SIZE;

  if (weight !== undefined) {
    // Hyperbolic scale: weight 0 → 1x, weight 1 → 1.17x, weight 10 → 2x, weight 100 → 3x
    const scaleFactor = 1 + (2.25 * weight) / (weight + 12.5);
    return baseSize * Math.min(scaleFactor, 3.0);
  }

  // Fallback: direct edge count
  const depCount = edges.filter((e) => e.source === node.id || e.target === node.id).length;
  const scaleFactor = 1 + Math.min(depCount * 0.03, 0.3);
  return baseSize * scaleFactor;
}

/**
 * Gets the base size for a node type without connection scaling
 */
export function getBaseNodeSize(type: string): number {
  return BASE_NODE_SIZES[type] ?? DEFAULT_BASE_SIZE;
}

/**
 * Compute transitive dependency weight for every node in a single pass.
 *
 * Uses Kahn's topological sort, then accumulates bottom-up (leaves first).
 * Each node's weight = total number of transitive dependencies.
 * O(n + e) time complexity, called once when graph data changes.
 */
function buildAdjacencyData(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { outgoing: Map<string, string[]>; inDegree: Map<string, number> } {
  const { outgoing, incoming } = buildAdjacency(edges);

  // Ensure all nodes are present (topological sort requires every node in the map)
  for (const node of nodes) {
    if (!outgoing.has(node.id)) outgoing.set(node.id, []);
  }

  // Derive inDegree counts from the incoming adjacency list
  const inDegree = new Map<string, number>();
  for (const node of nodes) {
    inDegree.set(node.id, incoming.get(node.id)?.length ?? 0);
  }

  return { outgoing, inDegree };
}

function topologicalSort(outgoing: Map<string, string[]>, inDegree: Map<string, number>): string[] {
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const topoOrder: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    topoOrder.push(id);
    for (const neighbor of outgoing.get(id) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return topoOrder;
}

export function computeNodeWeights(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const { outgoing, inDegree } = buildAdjacencyData(nodes, edges);
  const topoOrder = topologicalSort(outgoing, inDegree);

  // Process in reverse topological order (leaves first)
  // weight = sum of (1 + child weight) for each outgoing edge
  const weights = new Map<string, number>();
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i]!;
    let weight = 0;
    for (const child of outgoing.get(id) ?? []) {
      weight += 1 + (weights.get(child) ?? 0);
    }
    weights.set(id, weight);
  }

  return weights;
}
