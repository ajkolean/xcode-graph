/**
 * Hierarchical Graph Layout - Main orchestrator
 *
 * Combines multiple layout phases for complete graph visualization:
 * 1. Cluster-level DAG layout (position clusters)
 * 2. Intra-cluster ring layout (position nodes within clusters)
 * 3. Mass and MEC calculations (size clusters appropriately)
 *
 * @module utils/layout/hierarchical
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { computeMEC, simpleClusterLayout } from './intra-cluster';
import { computeNodeMasses } from './mass';

// ==================== Type Definitions ====================

/**
 * Result of hierarchical layout computation
 */
export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
}

// ==================== Helper Functions ====================

/**
 * Build a mapping from node IDs to their containing cluster ID
 */
function buildNodeToClusterMap(clusters: Cluster[]): Map<string, string> {
  const nodeToCluster = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      nodeToCluster.set(node.id, cluster.id);
    }
  }
  return nodeToCluster;
}

/**
 * Extract edges between clusters (ignoring intra-cluster edges)
 */
function extractClusterEdges(
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
): Array<{ from: string; to: string }> {
  const clusterEdges: Array<{ from: string; to: string }> = [];
  const clusterEdgeSet = new Set<string>();

  for (const edge of edges) {
    const fromCluster = nodeToCluster.get(edge.source);
    const toCluster = nodeToCluster.get(edge.target);
    if (fromCluster && toCluster && fromCluster !== toCluster) {
      const key = `${fromCluster}->${toCluster}`;
      if (!clusterEdgeSet.has(key)) {
        clusterEdgeSet.add(key);
        clusterEdges.push({ from: fromCluster, to: toCluster });
      }
    }
  }

  return clusterEdges;
}

/** Shared layout options */
const LAYOUT_OPTIONS = { baseRadius: 24, ringSpacing: 48, maxDepth: 4, testOffset: 18 };

/** Minimum cluster dimension */
const MIN_DIMENSION = 90;
const MAX_DIMENSION = 900;

/** Dimension padding added to MEC radius */
const DIMENSION_PADDING = 16;

/**
 * Simple force relaxation for nodes inside a single cluster.
 * Keeps nodes within a bounding radius while spacing them apart and following internal links.
 */
function relaxNodesWithinCluster(
  positions: Array<{ id: string; x: number; y: number }>,
  internalEdges: Array<{ from: string; to: string }>,
  boundRadius: number,
  iterations = 120,
) {
  const linkStrength = 0.025;
  const linkDist = 50;
  const collisionRadius = 14;
  const collisionPadding = 6;
  const gravity = 0.01;
  const margin = 8;
  const clampRadius = Math.max(boundRadius - margin, collisionRadius);

  const nodes = positions.map((p) => ({ ...p, vx: 0, vy: 0 }));
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    // Link attraction
    for (const edge of internalEdges) {
      const a = nodeMap.get(edge.from);
      const b = nodeMap.get(edge.to);
      if (!a || !b) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy) || 0.001;
      const delta = dist - linkDist;
      const force = delta * linkStrength;
      dx /= dist;
      dy /= dist;
      a.vx += dx * force;
      a.vy += dy * force;
      b.vx -= dx * force;
      b.vy -= dy * force;
    }

    // Collision
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy) || 0.001;
        const minDist = collisionRadius * 2 + collisionPadding;
        const overlap = minDist - dist;
        if (overlap > 0) {
          dx /= dist;
          dy /= dist;
          const force = overlap * 0.5;
          a.x -= dx * force;
          a.y -= dy * force;
          b.x += dx * force;
          b.y += dy * force;
        }
      }
    }

    // Integrate + gravity and clamp
    for (const n of nodes) {
      n.vx -= n.x * gravity;
      n.vy -= n.y * gravity;
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= 0.85;
      n.vy *= 0.85;

      const d = Math.hypot(n.x, n.y);
      if (d > clampRadius) {
        const scale = clampRadius / d;
        n.x *= scale;
        n.y *= scale;
        n.vx *= 0.5;
        n.vy *= 0.5;
      }
    }
  }

  return nodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
}

/**
 * Force-based cluster packing layout.
 *
 * Treat each cluster as a circle (radius derived from dimension) and:
 * - Apply link (edge) forces to keep connected clusters closer.
 * - Apply collision forces to prevent overlap (with padding).
 * - Apply mild gravity to keep everything centered.
 */
function forceClusterPacking(
  clusterIds: string[],
  clusterEdges: Array<{ from: string; to: string }>,
  clusterDimensions: Map<string, number>,
  iterations = 400,
) {
  const padding = 32; // extra space around cluster bounds
  const edgePadding = 24;
  const collisionPadding = 26;
  const linkStrength = 0.02;
  const collisionStrength = 0.9;
  const gravity = 0.002;

  const nodes = clusterIds.map((id, idx) => {
    const dim = clusterDimensions.get(id) ?? 140;
    const r = dim / 2 + padding;
    const angle = (idx / Math.max(1, clusterIds.length)) * Math.PI * 2;
    const radius = Math.sqrt(clusterIds.length) * (dim + padding);
    return {
      id,
      r,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    // Link attraction
    for (const edge of clusterEdges) {
      const a = nodeMap.get(edge.from);
      const b = nodeMap.get(edge.to);
      if (!a || !b) continue;

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy) || 0.001;
      const desired = a.r + b.r + edgePadding;
      const delta = dist - desired;
      const force = delta * linkStrength;
      dx /= dist;
      dy /= dist;

      a.vx += dx * force;
      a.vy += dy * force;
      b.vx -= dx * force;
      b.vy -= dy * force;
    }

    // Collision (pairwise)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy) || 0.001;
        const minDist = a.r + b.r + collisionPadding;
        const overlap = minDist - dist;
        if (overlap > 0) {
          dx /= dist;
          dy /= dist;
          const force = (overlap / 2) * collisionStrength;
          a.x -= dx * force;
          a.y -= dy * force;
          b.x += dx * force;
          b.y += dy * force;
        }
      }
    }

    // Apply velocities and gravity
    for (const n of nodes) {
      n.vx -= n.x * gravity;
      n.vy -= n.y * gravity;
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= 0.85;
      n.vy *= 0.85;
    }
  }

  // Normalize to center around origin
  const minX = Math.min(...nodes.map((n) => n.x - n.r));
  const maxX = Math.max(...nodes.map((n) => n.x + n.r));
  const minY = Math.min(...nodes.map((n) => n.y - n.r));
  const maxY = Math.max(...nodes.map((n) => n.y + n.r));
  const offsetX = (minX + maxX) / 2;
  const offsetY = (minY + maxY) / 2;

  const positions = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    positions.set(n.id, { x: n.x - offsetX, y: n.y - offsetY });
  }

  return positions;
}

/**
 * Post-process to resolve rectangle overlaps using iterative separation.
 */
function resolveClusterCollisions(
  centers: Map<string, { x: number; y: number }>,
  dimensions: Map<string, number>,
  iterations = 140,
) {
  const padding = 20;
  const ids = Array.from(centers.keys());

  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      const idA = ids[i];
      const centerA = centers.get(idA);
      const dimA = dimensions.get(idA) ?? MIN_DIMENSION;
      if (!centerA) continue;
      const halfA = dimA / 2;
      for (let j = i + 1; j < ids.length; j++) {
        const idB = ids[j];
        const centerB = centers.get(idB);
        const dimB = dimensions.get(idB) ?? MIN_DIMENSION;
        if (!centerB) continue;
        const halfB = dimB / 2;

        const dx = centerB.x - centerA.x;
        const dy = centerB.y - centerA.y;
        const overlapX = halfA + halfB + padding - Math.abs(dx);
        const overlapY = halfA + halfB + padding - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          moved = true;
          // Push along the larger overlap axis to separate quickly
          if (overlapX > overlapY) {
            const push = overlapX / 2;
            const dir = dx === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dx);
            centerA.x -= dir * push;
            centerB.x += dir * push;
          } else {
            const push = overlapY / 2;
            const dir = dy === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dy);
            centerA.y -= dir * push;
            centerB.y += dir * push;
          }
        }
      }
    }
    if (!moved) break;
  }
}

/**
 * Compute layout and dimension for a set of nodes
 * Shared logic used by both computeClusterDimension and positionNodesInLayout
 */
interface ClusterLayoutResult {
  positions: Array<{ id: string; x: number; y: number; ring: number; isTest: boolean }>;
  dimension: number;
}

function computeClusterLayoutAndDimension(
  clusterNodes: GraphNode[],
  edges: GraphEdge[],
): ClusterLayoutResult {
  if (clusterNodes.length === 0) {
    return { positions: [], dimension: MIN_DIMENSION };
  }

  const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
  const internalEdges = edges.filter(
    (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target),
  );

  const positions = simpleClusterLayout(
    clusterNodes.map((n) => ({ id: n.id, type: n.type, name: n.name })),
    internalEdges.map((e) => ({ from: e.source, to: e.target })),
    0,
    0,
    LAYOUT_OPTIONS,
  );

  const masses = computeNodeMasses(
    clusterNodes.map((n) => ({ id: n.id, type: n.type })),
    internalEdges.map((e) => ({ from: e.source, to: e.target })),
  );

  const mecRadius = computeMEC(positions, 0, 0, masses);
  const nodeCount = clusterNodes.length;

  // Linear scale with node count, but never below MEC-based size
  const linearDimension = MIN_DIMENSION + nodeCount * 12;
  const radialDimension = mecRadius * 2 + DIMENSION_PADDING;
  const rawDimension = Math.max(linearDimension, radialDimension);
  const dimension = Math.max(MIN_DIMENSION, Math.min(rawDimension, MAX_DIMENSION));

  return { positions, dimension };
}

/**
 * Compute the visual dimension for a cluster based on its node layout
 */
function computeClusterDimension(cluster: Cluster, nodes: GraphNode[], edges: GraphEdge[]): number {
  // Optimization: Use Set for O(1) lookup instead of O(m) .some()
  const clusterNodeIds = new Set(cluster.nodes.map((n) => n.id));
  const clusterNodes = nodes.filter((n) => clusterNodeIds.has(n.id));
  return computeClusterLayoutAndDimension(clusterNodes, edges).dimension;
}

/**
 * Pre-compute dimensions for all clusters (cached for efficiency)
 */
function preComputeClusterDimensions(
  clusters: Cluster[],
  nodes: GraphNode[],
  edges: GraphEdge[],
): Map<string, number> {
  const dimensions = new Map<string, number>();

  for (const cluster of clusters) {
    dimensions.set(cluster.id, computeClusterDimension(cluster, nodes, edges));
  }

  return dimensions;
}

/**
 * Position all nodes within a single cluster layout
 */
function positionNodesInLayout(
  layout: { projectIds: string[]; x: number; y: number },
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
  clusterPositions: Map<string, ClusterPosition>,
  nodePositions: Map<string, NodePosition>,
  clusterDimensionHints?: Map<string, number>,
): void {
  const clusterNodes = nodes.filter((n) => layout.projectIds.includes(nodeToCluster.get(n.id) || ''));

  if (clusterNodes.length === 0) return;

  // Use shared layout computation
  const { positions, dimension: clusterDimension } = computeClusterLayoutAndDimension(
    clusterNodes,
    edges,
  );

  for (const originalClusterId of layout.projectIds) {
    const nodeCount = clusterNodes.filter(
      (n) => nodeToCluster.get(n.id) === originalClusterId,
    ).length;
    const widthHeight = clusterDimensionHints?.get(originalClusterId) ?? clusterDimension;
    clusterPositions.set(originalClusterId, {
      id: originalClusterId,
      x: layout.x,
      y: layout.y,
      width: widthHeight,
      height: widthHeight,
      vx: 0,
      vy: 0,
      nodeCount,
    });
  }

  for (const pos of positions) {
    const clusterId = nodeToCluster.get(pos.id) ?? '';
    nodePositions.set(pos.id, {
      id: pos.id,
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      clusterId,
      radius: 12,
    });
  }
}

// ==================== Main Layout Function ====================

/**
 * Compute complete hierarchical layout for a clustered graph
 *
 * Orchestrates:
 * 1. Building cluster mappings
 * 2. Extracting inter-cluster edges
 * 3. Computing cluster dimensions
 * 4. Running DAG layout for cluster positions
 * 5. Running intra-cluster layout for node positions
 *
 * @param nodes - All graph nodes
 * @param edges - All graph edges
 * @param clusters - Pre-grouped cluster definitions
 * @returns Complete layout with cluster and node positions
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
): HierarchicalLayoutResult {
  const clusterIds = clusters.map((c) => c.id);
  const nodeToCluster = buildNodeToClusterMap(clusters);
  const clusterEdges = extractClusterEdges(edges, nodeToCluster);
  const clusterDimensions = preComputeClusterDimensions(clusters, nodes, edges);

  // Force-pack clusters to avoid overlap while keeping related clusters closer
  const clusterCenters = forceClusterPacking(clusterIds, clusterEdges, clusterDimensions);
  resolveClusterCollisions(clusterCenters, clusterDimensions);

  const clusterPositions = new Map<string, ClusterPosition>();
  const nodePositions = new Map<string, NodePosition>();

  for (const cluster of clusters) {
    const center = clusterCenters.get(cluster.id) ?? { x: 0, y: 0 };
    positionNodesInLayout(
      { projectIds: [cluster.id], x: center.x, y: center.y },
      nodes,
      edges,
      nodeToCluster,
      clusterPositions,
      nodePositions,
      clusterDimensions,
    );
  }

  return { clusterPositions, nodePositions, clusters };
}
