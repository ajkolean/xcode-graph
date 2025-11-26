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

/**
 * Compute complete hierarchical layout
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
): HierarchicalLayoutResult {
  // Step 1: Extract cluster-level graph
  const clusterIds = clusters.map((c) => c.id);
  const clusterEdges: Array<{ from: string; to: string }> = [];

  // Build cluster-level edges from node edges
  const nodeToCluster = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      nodeToCluster.set(node.id, cluster.id);
    }
  }

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

  // Step 2: PRE-COMPUTE actual cluster dimensions using elastic shell
  const clusterDimensions = new Map<string, number>();

  console.log('🔍 Pre-computing cluster dimensions...');

  for (const cluster of clusters) {
    const clusterNodes = nodes.filter((n) => cluster.nodes.some((cn) => cn.id === n.id));

    if (clusterNodes.length === 0) {
      console.log(`  ⚠️ Cluster ${cluster.id}: No nodes, using minimum (180px)`);
      clusterDimensions.set(cluster.id, 180); // Minimum
      continue;
    }

    // Compute internal edges
    const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
    const internalEdges = edges.filter(
      (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target),
    );

    // Simple ring-based layout
    const positions = simpleClusterLayout(
      clusterNodes.map((n) => ({ id: n.id, type: n.type, name: n.name })),
      internalEdges.map((e) => ({ from: e.source, to: e.target })),
      0,
      0,
      {
        baseRadius: 25,
        ringSpacing: 40,
        maxDepth: 3,
        testOffset: 20,
      },
    );

    // Compute masses
    const masses = computeNodeMasses(
      clusterNodes.map((n) => ({ id: n.id, type: n.type })),
      internalEdges.map((e) => ({ from: e.source, to: e.target })),
    );

    // Compute MEC using elastic shell
    const mecRadius = computeMEC(positions, 0, 0, masses);
    const dimension = Math.max(140, mecRadius * 2 + 30); // Tighter minimum

    console.log(
      `  ✓ Cluster ${cluster.id}: ${clusterNodes.length} nodes → ${Math.round(dimension)}px (mecRadius: ${Math.round(mecRadius)})`,
    );

    clusterDimensions.set(cluster.id, dimension);
  }

  console.log(`📦 Total dimensions computed: ${clusterDimensions.size}`);
  console.log(
    '📊 Dimensions map:',
    Array.from(clusterDimensions.entries()).map(([id, dim]) => `${id}: ${Math.round(dim)}px`),
  );

  // Step 3: Compute cluster layout WITH actual dimensions
  const { layouts } = computeClusterLayout(clusterIds, clusterEdges, clusterDimensions);

  // Step 4: For each cluster, position nodes
  const clusterPositions = new Map<string, ClusterPosition>();
  const nodePositions = new Map<string, NodePosition>();

  for (const layout of layouts) {
    // Get nodes in this cluster (handling SCC members)
    const clusterNodes = nodes.filter((n) =>
      layout.projectIds.includes(nodeToCluster.get(n.id) || ''),
    );

    if (clusterNodes.length === 0) continue;

    // Compute internal edges
    const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
    const internalEdges = edges.filter(
      (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target),
    );

    // Simple ring-based layout centered in cluster
    const centerX = 0; // Relative to cluster
    const centerY = 0;

    const positions = simpleClusterLayout(
      clusterNodes.map((n) => ({ id: n.id, type: n.type, name: n.name })),
      internalEdges.map((e) => ({ from: e.source, to: e.target })),
      centerX,
      centerY,
      {
        baseRadius: 25, // Reduced from 40
        ringSpacing: 40, // Reduced from 65
        maxDepth: 3,
        testOffset: 20, // Reduced from 28
      },
    );

    // Compute masses for nodes in this cluster
    const masses = computeNodeMasses(
      clusterNodes.map((n) => ({ id: n.id, type: n.type })),
      internalEdges.map((e) => ({ from: e.source, to: e.target })),
    );

    // Compute MEC for dynamic cluster sizing using elastic shell
    const mecRadius = computeMEC(positions, centerX, centerY, masses);
    const clusterDimension = Math.max(140, mecRadius * 2 + 30); // Match pre-computation

    // Store cluster position using the ORIGINAL cluster IDs (not SCC IDs)
    for (const originalClusterId of layout.projectIds) {
      clusterPositions.set(originalClusterId, {
        x: layout.x,
        y: layout.y,
        width: clusterDimension,
        height: clusterDimension,
        vx: 0,
        vy: 0,
      });
    }

    // Store node positions (relative to cluster center)
    for (const pos of positions) {
      nodePositions.set(pos.id, {
        x: pos.x,
        y: pos.y,
        vx: 0,
        vy: 0,
      });
    }
  }

  return {
    clusterPositions,
    nodePositions,
    clusters,
  };
}
