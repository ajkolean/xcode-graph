/**
 * Hierarchical graph layout orchestrator
 * Combines cluster-level DAG layout with simple ring-based intra-cluster layout
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { Cluster } from '../types/cluster';
import type { ClusterPosition, NodePosition } from '../types/simulation';
import { computeClusterLayout } from './clusterLayout';
import { computeNodeMasses } from './massCalculation';
import { computeMEC, simpleClusterLayout } from './simpleClusterLayout';

export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
}

// Helper: Build node to cluster mapping
function buildNodeToClusterMap(clusters: Cluster[]): Map<string, string> {
  const nodeToCluster = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      nodeToCluster.set(node.id, cluster.id);
    }
  }
  return nodeToCluster;
}

// Helper: Extract cluster-level edges
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

// Helper: Compute dimension for a single cluster
function computeClusterDimension(
  cluster: Cluster,
  nodes: GraphNode[],
  edges: GraphEdge[],
): number {
  const clusterNodes = nodes.filter((n) => cluster.nodes.some((cn) => cn.id === n.id));

  if (clusterNodes.length === 0) {
    return 180;
  }

  const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
  const internalEdges = edges.filter(
    (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target),
  );

  const positions = simpleClusterLayout(
    clusterNodes.map((n) => ({ id: n.id, type: n.type, name: n.name })),
    internalEdges.map((e) => ({ from: e.source, to: e.target })),
    0, 0,
    { baseRadius: 25, ringSpacing: 40, maxDepth: 3, testOffset: 20 },
  );

  const masses = computeNodeMasses(
    clusterNodes.map((n) => ({ id: n.id, type: n.type })),
    internalEdges.map((e) => ({ from: e.source, to: e.target })),
  );

  const mecRadius = computeMEC(positions, 0, 0, masses);
  const dimension = Math.max(140, mecRadius * 2 + 30);

  return dimension;
}

// Helper: Pre-compute all cluster dimensions
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

// Helper: Position nodes within a single layout
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

  const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
  const internalEdges = edges.filter(
    (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target),
  );

  const positions = simpleClusterLayout(
    clusterNodes.map((n) => ({ id: n.id, type: n.type, name: n.name })),
    internalEdges.map((e) => ({ from: e.source, to: e.target })),
    0, 0,
    { baseRadius: 25, ringSpacing: 40, maxDepth: 3, testOffset: 20 },
  );

  const masses = computeNodeMasses(
    clusterNodes.map((n) => ({ id: n.id, type: n.type })),
    internalEdges.map((e) => ({ from: e.source, to: e.target })),
  );

  const mecRadius = computeMEC(positions, 0, 0, masses);
  const clusterDimension = Math.max(140, mecRadius * 2 + 30);

  for (const originalClusterId of layout.projectIds) {
    const nodeCount = clusterNodes.filter((n) => nodeToCluster.get(n.id) === originalClusterId).length;
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

/**
 * Compute complete hierarchical layout
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
