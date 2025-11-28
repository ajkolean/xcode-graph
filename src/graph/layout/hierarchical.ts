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
import { computeClusterLayout } from './cluster-dag';
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
const LAYOUT_OPTIONS = { baseRadius: 25, ringSpacing: 40, maxDepth: 3, testOffset: 20 };

/** Minimum cluster dimension */
const MIN_DIMENSION = 140;

/** Dimension padding added to MEC radius */
const DIMENSION_PADDING = 30;

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
    return { positions: [], dimension: 180 };
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
  const dimension = Math.max(MIN_DIMENSION, mecRadius * 2 + DIMENSION_PADDING);

  return { positions, dimension };
}

/**
 * Compute the visual dimension for a cluster based on its node layout
 */
function computeClusterDimension(cluster: Cluster, nodes: GraphNode[], edges: GraphEdge[]): number {
  const clusterNodes = nodes.filter((n) => cluster.nodes.some((cn) => cn.id === n.id));
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
): void {
  const clusterNodes = nodes.filter((n) =>
    layout.projectIds.includes(nodeToCluster.get(n.id) || ''),
  );

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
    clusterPositions.set(originalClusterId, {
      id: originalClusterId,
      x: layout.x,
      y: layout.y,
      width: clusterDimension,
      height: clusterDimension,
      vx: 0,
      vy: 0,
      nodeCount,
    });
  }

  for (const pos of positions) {
    nodePositions.set(pos.id, {
      id: pos.id,
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      clusterId: nodeToCluster.get(pos.id) ?? '',
      // Provide a sane default radius so collision/spacing math has data
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

  const { layouts } = computeClusterLayout(clusterIds, clusterEdges, clusterDimensions);

  const clusterPositions = new Map<string, ClusterPosition>();
  const nodePositions = new Map<string, NodePosition>();

  for (const layout of layouts) {
    positionNodesInLayout(layout, nodes, edges, nodeToCluster, clusterPositions, nodePositions);
  }

  return { clusterPositions, nodePositions, clusters };
}
