import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.schema';
import type { LayoutConfig, LayoutOptions } from '../config';
import type { SimNode, HierarchicalLayoutResult } from '../types';
import type { PreparationResult } from './preparation';
import { forceEdgeBundling } from '../edge-bundling';

// ============================================================================
// Helper Functions
// ============================================================================

function computeClusterZCenter(nodes: SimNode[]): number {
  if (nodes.length === 0) return 0;
  const sum = nodes.reduce((acc, n) => acc + (n.z ?? 0), 0);
  return sum / nodes.length;
}

function computeClusterZDepth(nodes: SimNode[]): number {
  if (nodes.length === 0) return 0;
  const zValues = nodes.map((n) => n.z ?? 0);
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  return Math.max(maxZ - minZ, 50);
}

// ============================================================================
// Main Post-Processing Function
// ============================================================================

export function processResults(
  data: PreparationResult,
  nodes: any[], // Original nodes (unused here but good for API consistency?)
  edges: GraphEdge[],
  clusters: Cluster[],
  config: LayoutConfig,
  options: LayoutOptions
): HierarchicalLayoutResult {
  const { simNodes, clusterCenters, nodeToCluster, clusterSizes, strataResult, clusterStrataResult } = data;
  const dimension = options.dimension ?? '2d';

  // 1. Extract Node Positions (Absolute)
  const nodePositions = new Map<string, NodePosition>();
  const nodeMap: Record<string, { x: number; y: number }> = {};

  for (const node of simNodes) {
    nodePositions.set(node.id, {
      id: node.id,
      x: node.x,
      y: node.y,
      ...(dimension === '3d' ? { z: node.z ?? 0 } : {}),
      vx: 0,
      vy: 0,
      ...(dimension === '3d' ? { vz: 0 } : {}),
      clusterId: node.clusterId ?? '',
      radius: config.nodeRadius,
    });
    
    // For edge bundling
    nodeMap[node.id] = { x: node.x, y: node.y };
  }

  // 2. Edge Bundling
  // Bundle only cross-cluster edges
  const crossClusterEdges = edges
    .filter((e) => nodeToCluster.get(e.source) !== nodeToCluster.get(e.target))
    .map((e) => ({ source: e.source, target: e.target }));

  let bundledEdges: Array<Array<{ x: number; y: number }>> | undefined;

  if (crossClusterEdges.length > 0) {
    const budget = config.bundlingBudget;
    const dynamicIterations = Math.max(10, Math.floor(budget / crossClusterEdges.length));
    const dynamicCycles = Math.min(config.bundlingCycles, Math.ceil(dynamicIterations / 15));

    bundledEdges = forceEdgeBundling(nodeMap, crossClusterEdges, {
      K: 0.1,
      C: dynamicCycles,
      I_initial: Math.min(config.bundlingIterations, dynamicIterations),
      compatibility_threshold: config.compatibilityThreshold,
    });
  }

  // 3. Extract Cluster Positions and Convert Nodes to Relative
  const clusterPositions = new Map<string, ClusterPosition>();

  for (const cluster of clusters) {
    const clusterNodes = cluster.nodes
      .map((n) => nodePositions.get(n.id))
      .filter((p): p is NodePosition => p !== undefined);

    const clusterSimNodes = simNodes.filter((n) => n.clusterId === cluster.id);

    if (clusterNodes.length === 0) {
      clusterPositions.set(cluster.id, {
        id: cluster.id,
        x: 0,
        y: 0,
        width: config.minClusterSize,
        height: config.minClusterSize,
        vx: 0,
        vy: 0,
        nodeCount: 0,
      });
      continue;
    }

    const center = clusterCenters.get(cluster.id);
    if (!center) continue;

    const size = clusterSizes.get(cluster.id) ?? config.minClusterSize;

    // Calculate 3D cluster z-center and depth
    const clusterZ = dimension === '3d' ? computeClusterZCenter(clusterSimNodes) : undefined;
    const clusterDepth = dimension === '3d' ? computeClusterZDepth(clusterSimNodes) : undefined;

    clusterPositions.set(cluster.id, {
      id: cluster.id,
      x: center.cx,
      y: center.cy,
      ...(dimension === '3d' && clusterZ !== undefined && clusterDepth !== undefined
        ? { z: clusterZ, vz: 0, depth: clusterDepth }
        : {}),
      width: size,
      height: size,
      vx: 0,
      vy: 0,
      nodeCount: clusterNodes.length,
    });

    // Convert node positions from ABSOLUTE to RELATIVE (cluster-local)
    for (const node of clusterNodes) {
      node.x -= center.cx;
      node.y -= center.cy;
      if (dimension === '3d' && clusterZ !== undefined) {
        node.z = (node.z ?? 0) - clusterZ;
      }
    }
  }

  return {
    nodePositions,
    clusterPositions,
    clusters,
    bundledEdges,
    cycleNodes: strataResult.cycleNodes,
    nodeSccId: strataResult.nodeSccId,
    sccSizes: strataResult.sccSizes,
    maxStratum: strataResult.maxStratum,
    maxClusterStratum: clusterStrataResult.maxClusterStratum,
  };
}
