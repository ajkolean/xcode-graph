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
import { setSeed } from '@shared/utils/random';

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
 * Select the anchor cluster (sun) based on node count.
 *
 * The largest cluster (most nodes) becomes the center of the layout.
 */
function selectClusterAnchor(
  clusters: Cluster[],
  _allEdges: GraphEdge[]
): string | null {
    if (clusters.length === 0) return null;

    let maxNodes = -Infinity;
    let anchor: string | null = null;

    for (const cluster of clusters) {
        const nodeCount = cluster.nodes.length;

        if (nodeCount > maxNodes) {
            maxNodes = nodeCount;
            anchor = cluster.id;
        }
    }

    return anchor;
}

/**
 * Complete graph cluster layout.
 *
 * Treat clusters as a complete graph where every cluster has invisible edges
 * to every other cluster. This creates natural, even spacing regardless of
 * actual dependency edges.
 */
function forceClusterPacking(
  clusterIds: string[],
  _clusterEdges: Array<{ from: string; to: string }>,
  clusterDimensions: Map<string, number>,
  anchors: string[] = [],
  iterations = 300,
) {
  if (clusterIds.length === 0) return new Map<string, { x: number; y: number }>();
  if (clusterIds.length === 1) {
    return new Map([[clusterIds[0], { x: 0, y: 0 }]]);
  }

  // Initialize clusters in a circle
  const nodes = clusterIds.map((id, idx) => {
    const dim = clusterDimensions.get(id) ?? 140;
    const r = dim / 2 + 20;
    const isAnchor = anchors.includes(id);

    // Start in circle pattern
    const angle = (idx / clusterIds.length) * Math.PI * 2;
    const startRadius = isAnchor ? 0 : 100;

    return {
      id,
      r,
      x: Math.cos(angle) * startRadius,
      y: Math.sin(angle) * startRadius,
      vx: 0,
      vy: 0,
      isAnchor,
    };
  });

  // Layout parameters - keep clusters compact
  const avgRadius = nodes.reduce((sum, n) => sum + n.r, 0) / nodes.length;
  const GAP_BETWEEN_CLUSTERS = 40; // Minimum gap between cluster edges
  const IDEAL_DISTANCE = avgRadius * 2 + GAP_BETWEEN_CLUSTERS; // Center-to-center distance
  const REPULSION = 15000; // Fixed repulsion
  const ATTRACTION = 0.06;
  const ANCHOR_GRAVITY = 0.2;
  const DAMPING = 0.85;

  for (let iter = 0; iter < iterations; iter++) {
    // Apply forces
    for (const node of nodes) {
      let fx = 0;
      let fy = 0;

      // Anchor stays at center with strong gravity
      if (node.isAnchor) {
        fx += -node.x * ANCHOR_GRAVITY;
        fy += -node.y * ANCHOR_GRAVITY;
      }

      // Complete graph: every cluster interacts with every other
      for (const other of nodes) {
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

        // Attraction to ideal distance (invisible edges)
        // Ideal distance already includes both radii + gap
        const springForce = (dist - IDEAL_DISTANCE) * ATTRACTION;
        fx += nx * springForce;
        fy += ny * springForce;

        // Hard collision prevention
        const minDist = node.r + other.r + 20;
        if (dist < minDist) {
          const push = (minDist - dist) * 0.8;
          fx -= nx * push;
          fy -= ny * push;
        }
      }

      // Update velocity
      node.vx = (node.vx + fx) * DAMPING;
      node.vy = (node.vy + fy) * DAMPING;
    }

    // Apply velocity
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // Keep anchor very close to center in later iterations
      if (n.isAnchor && iter > iterations * 0.7) {
        n.x *= 0.2;
        n.y *= 0.2;
        n.vx *= 0.1;
        n.vy *= 0.1;
      }
    }
  }

  // Normalize to center around origin
  // If we have an anchor, we usually want THAT at (0,0), not the geometric center of all nodes
  let offsetX = 0;
  let offsetY = 0;
  
  const anchorNode = nodes.find(n => n.isAnchor);
  if (anchorNode) {
      offsetX = anchorNode.x;
      offsetY = anchorNode.y;
  } else {
      const minX = Math.min(...nodes.map((n) => n.x - n.r));
      const maxX = Math.max(...nodes.map((n) => n.x + n.r));
      const minY = Math.min(...nodes.map((n) => n.y - n.r));
      const maxY = Math.max(...nodes.map((n) => n.y + n.r));
      offsetX = (minX + maxX) / 2;
      offsetY = (minY + maxY) / 2;
  }

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
          // Use deterministic direction based on cluster IDs when positions are equal
          if (overlapX > overlapY) {
            const push = overlapX / 2;
            const dir = dx === 0 ? (idA < idB ? 1 : -1) : Math.sign(dx);
            centerA.x -= dir * push;
            centerB.x += dir * push;
          } else {
            const push = overlapY / 2;
            const dir = dy === 0 ? (idA < idB ? 1 : -1) : Math.sign(dy);
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
      x: layout.x + pos.x, // FIXED: Added cluster offset
      y: layout.y + pos.y, // FIXED: Added cluster offset
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
  // Reset random seed for deterministic layout
  setSeed(12345);

  const clusterIds = clusters.map((c) => c.id);
  const nodeToCluster = buildNodeToClusterMap(clusters);
  const clusterEdges = extractClusterEdges(edges, nodeToCluster);
  const clusterDimensions = preComputeClusterDimensions(clusters, nodes, edges);

  // Identify anchor cluster using custom heuristic (prioritizing total incoming edges)
  const anchorId = selectClusterAnchor(clusters, edges); // Pass ALL edges
  const anchors = anchorId ? [anchorId] : [];

  // Force-pack clusters to avoid overlap while keeping related clusters closer
  const clusterCenters = forceClusterPacking(clusterIds, clusterEdges, clusterDimensions, anchors);
  resolveClusterCollisions(clusterCenters, clusterDimensions);

  // Re-center on anchor after collision resolution (which may have displaced it)
  if (anchorId) {
    const anchorPos = clusterCenters.get(anchorId);
    if (anchorPos && (anchorPos.x !== 0 || anchorPos.y !== 0)) {
      const offsetX = anchorPos.x;
      const offsetY = anchorPos.y;
      for (const [id, pos] of clusterCenters) {
        clusterCenters.set(id, { x: pos.x - offsetX, y: pos.y - offsetY });
      }
    }
  }

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
