/**
 * D3-force based clustered graph layout
 *
 * Main orchestration of force simulation with cluster boundaries and edge bundling.
 * Uses d3-force-clustering for natural cluster grouping.
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import * as d3 from 'd3-force';
import forceClustering from 'd3-force-clustering';
import { forceEdgeBundling } from './edge-bundling';
import { forceClusterRepulsion, createClusterBoundaryForce } from './forces';

export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
  bundledEdges?: Array<Array<{ x: number; y: number }>> | undefined;
}

// Layout configuration
const CONFIG = {
  // Node-level forces
  nodeRadius: 6,
  nodeCollisionPadding: 12,
  linkDistance: 50,
  linkStrength: 0.4,
  nodeCharge: -120,

  // Cluster forces
  clusterStrength: 0.3,
  clusterDistanceMin: 10,
  clusterRepulsionStrength: 2500,
  clusterRepulsionMinDist: 180,

  // Simulation
  iterations: 300,

  // Cluster sizing
  minClusterSize: 80,
  clusterNodeSpacing: 12,
  clusterPadding: 40,

  // Edge bundling
  bundlingCycles: 4,
  bundlingIterations: 60,
  compatibilityThreshold: 0.7,
} as const;

// Simulation node type
interface SimNode {
  id: string;
  clusterId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Cluster center type
interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
}

/**
 * Build node-to-cluster mapping
 */
function buildNodeToClusterMap(clusters: Cluster[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      map.set(node.id, cluster.id);
    }
  }
  return map;
}

/**
 * Main layout computation
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
): HierarchicalLayoutResult {
  if (nodes.length === 0) {
    return {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
    };
  }

  // Build mappings
  const nodeToCluster = buildNodeToClusterMap(clusters);

  // Pre-calculate cluster sizes
  const clusterSizes = new Map<string, number>();
  for (const cluster of clusters) {
    const size = CONFIG.minClusterSize + cluster.nodes.length * CONFIG.clusterNodeSpacing;
    clusterSizes.set(cluster.id, size);
  }

  // Create simulation nodes with type safety
  const simNodes = nodes.map((n): SimNode => ({
    id: n.id,
    clusterId: nodeToCluster.get(n.id),
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    vx: 0,
    vy: 0,
  }));

  // Create edges for D3
  const simLinks = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  // Create cluster centers (using Map for O(1) lookups)
  const clusterCenterMap = new Map<string, ClusterCenter>();
  for (const cluster of clusters) {
    clusterCenterMap.set(cluster.id, { id: cluster.id, cx: 0, cy: 0 });
  }

  // Update cluster centers based on node positions
  function updateClusterCenters() {
    for (const [clusterId, center] of clusterCenterMap) {
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (const node of simNodes) {
        if (node.clusterId === clusterId) {
          sumX += node.x;
          sumY += node.y;
          count++;
        }
      }

      if (count > 0) {
        center.cx = sumX / count;
        center.cy = sumY / count;
      }
    }
  }

  // Create cluster repulsion force (proper D3 force)
  const clusterRepelForce = forceClusterRepulsion(
    CONFIG.clusterRepulsionStrength,
    CONFIG.clusterRepulsionMinDist,
  );
  clusterRepelForce.initialize(Array.from(clusterCenterMap.values()));

  // Create per-cluster boundary forces
  const boundaryForceData: Array<{
    clusterId: string;
    force: (alpha: number) => void;
  }> = [];

  for (const cluster of clusters) {
    const size = clusterSizes.get(cluster.id) ?? CONFIG.minClusterSize;
    const maxRadius = size / 2 - CONFIG.nodeRadius - 10;
    const clusterNodes = simNodes.filter(n => n.clusterId === cluster.id);

    if (clusterNodes.length === 0) continue;

    const center = clusterCenterMap.get(cluster.id)!;
    const boundaryForce = createClusterBoundaryForce(clusterNodes, center, maxRadius);

    boundaryForceData.push({
      clusterId: cluster.id,
      force: boundaryForce,
    });
  }

  // Combined boundary force for all clusters
  function applyAllClusterBoundaries(alpha: number) {
    for (const { force } of boundaryForceData) {
      force(alpha);
    }
  }

  // Create D3 force simulation
  const simulation = d3
    .forceSimulation(simNodes)
    .force(
      'link',
      d3
        .forceLink(simLinks)
        .id((d: any) => d.id)
        .distance(CONFIG.linkDistance)
        .strength(CONFIG.linkStrength),
    )
    .force('charge', d3.forceManyBody().strength(CONFIG.nodeCharge))
    .force('collision', d3.forceCollide().radius(CONFIG.nodeRadius + CONFIG.nodeCollisionPadding))
    .force(
      'cluster',
      forceClustering()
        .strength(CONFIG.clusterStrength)
        .distanceMin(CONFIG.clusterDistanceMin)
        .clusterId((d: any) => d.clusterId),
    )
    .force('boundaries', applyAllClusterBoundaries)
    .force('center', d3.forceCenter(0, 0))
    .stop();

  // Run simulation to completion
  for (let i = 0; i < CONFIG.iterations; i++) {
    updateClusterCenters();
    // Note: clusterRepelForce operates on cluster centers, not nodes
    // This is called manually because it affects cluster metadata, not node positions directly
    clusterRepelForce(simulation.alpha());
    simulation.tick();
  }

  // Extract node positions (STILL ABSOLUTE at this point!)
  const nodePositions = new Map<string, NodePosition>();
  for (const node of simNodes) {
    nodePositions.set(node.id, {
      id: node.id,
      x: node.x,
      y: node.y,
      vx: 0,
      vy: 0,
      clusterId: node.clusterId ?? '',
      radius: CONFIG.nodeRadius,
    });
  }

  // CRITICAL: Run edge bundling BEFORE converting to relative coordinates
  // Bundling needs global coordinate system for cross-cluster edges
  const nodeMap: Record<string, { x: number; y: number }> = {};
  for (const [nodeId, pos] of nodePositions) {
    nodeMap[nodeId] = { x: pos.x, y: pos.y };
  }

  let bundledEdges: Array<Array<{ x: number; y: number }>> | undefined;

  if (edges.length < 500) {
    const bundlingEdges = edges.map(e => ({ source: e.source, target: e.target }));
    bundledEdges = forceEdgeBundling(nodeMap, bundlingEdges, {
      K: 0.1,
      C: CONFIG.bundlingCycles,
      I_initial: CONFIG.bundlingIterations,
      compatibility_threshold: CONFIG.compatibilityThreshold,
    });
  }

  // Calculate cluster positions and bounds
  const clusterPositions = new Map<string, ClusterPosition>();

  for (const cluster of clusters) {
    const clusterNodes = cluster.nodes
      .map((n) => nodePositions.get(n.id))
      .filter((p): p is NodePosition => p !== undefined);

    if (clusterNodes.length === 0) {
      clusterPositions.set(cluster.id, {
        id: cluster.id,
        x: 0,
        y: 0,
        width: CONFIG.minClusterSize,
        height: CONFIG.minClusterSize,
        vx: 0,
        vy: 0,
        nodeCount: 0,
      });
      continue;
    }

    // Get cluster center from simulation
    const center = clusterCenterMap.get(cluster.id);
    if (!center) continue;

    const size = clusterSizes.get(cluster.id) ?? CONFIG.minClusterSize;

    clusterPositions.set(cluster.id, {
      id: cluster.id,
      x: center.cx,
      y: center.cy,
      width: size,
      height: size,
      vx: 0,
      vy: 0,
      nodeCount: clusterNodes.length,
    });

    // ⚠️ CRITICAL COORDINATE SYSTEM CHANGE ⚠️
    // Converting node positions from ABSOLUTE to RELATIVE (cluster-local)
    // Downstream rendering MUST compute: absoluteX = cluster.x + node.x
    for (const node of clusterNodes) {
      node.x -= center.cx;
      node.y -= center.cy;
    }
  }

  return {
    nodePositions,
    clusterPositions,
    clusters,
    bundledEdges,
  };
}
