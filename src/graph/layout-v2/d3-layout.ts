/**
 * d3-force based clustered graph layout
 *
 * Replaces custom physics code with battle-tested d3-force simulation.
 * Uses d3-force-clustering for natural cluster grouping.
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import * as d3 from 'd3-force';
import forceClustering from 'd3-force-clustering';

export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
}

// Layout configuration
const CONFIG = {
  // Node-level forces
  nodeRadius: 6,
  nodeCollisionPadding: 8,
  linkDistance: 60,
  linkStrength: 0.55, // Increased for more coherent shapes
  nodeCharge: -80, // Reduced for tighter clusters

  // Cluster forces (using d3-force-clustering)
  clusterStrength: 0.3,
  clusterDistanceMin: 10,

  // Cluster-to-cluster repulsion (custom force)
  clusterRepulsionStrength: 2500,
  clusterRepulsionMinDist: 180,

  // Simulation
  iterations: 300,

  // Cluster sizing
  minClusterSize: 80,
  clusterNodeSpacing: 12,
  clusterPadding: 40,
};

/**
 * Build a map from node ID to cluster ID
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
 * Custom cluster-to-cluster repulsion force
 * Prevents clusters from piling up on top of each other
 */
function forceClusterRepulsion(
  clusterCenters: Array<{ id: string; cx: number; cy: number }>,
  strength: number,
  minDist: number,
) {
  return () => {
    for (let i = 0; i < clusterCenters.length; i++) {
      for (let j = i + 1; j < clusterCenters.length; j++) {
        const a = clusterCenters[i];
        const b = clusterCenters[j];

        let dx = b.cx - a.cx;
        let dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy);

        if (dist < minDist) dist = minDist;

        const force = strength / (dist * dist);

        const fx = force * dx;
        const fy = force * dy;

        a.cx -= fx;
        a.cy -= fy;
        b.cx += fx;
        b.cy += fy;
      }
    }
  };
}

/**
 * Main layout function using d3-force with d3-force-clustering
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

  // Build node-to-cluster mapping
  const nodeToCluster = buildNodeToClusterMap(clusters);

  // Prepare simulation nodes with cluster info
  const simNodes = nodes.map((n) => ({
    id: n.id,
    clusterId: nodeToCluster.get(n.id),
    x: Math.random() * 100 - 50, // Random initial positions
    y: Math.random() * 100 - 50,
  }));

  // Prepare edges for d3 (d3 needs source/target as objects or indices)
  const simLinks = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  // Build cluster centers array for cluster-to-cluster repulsion
  const clusterCenters = clusters.map((c) => ({
    id: c.id,
    cx: 0,
    cy: 0,
  }));

  // Update cluster centers each tick before applying repulsion
  function updateClusterCenters() {
    for (const cc of clusterCenters) {
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (const n of simNodes) {
        if (n.clusterId === cc.id) {
          sumX += n.x ?? 0;
          sumY += n.y ?? 0;
          count++;
        }
      }

      if (count > 0) {
        cc.cx = sumX / count;
        cc.cy = sumY / count;
      }
    }
  }

  // Create cluster repulsion force
  const clusterRepel = forceClusterRepulsion(
    clusterCenters,
    CONFIG.clusterRepulsionStrength,
    CONFIG.clusterRepulsionMinDist,
  );

  // Create force simulation
  const simulation = d3
    .forceSimulation(simNodes)
    // Link force: pulls connected nodes together
    .force(
      'link',
      d3
        .forceLink(simLinks)
        .id((d: any) => d.id)
        .distance(CONFIG.linkDistance)
        .strength(CONFIG.linkStrength),
    )

    // Charge force: repulsion between all nodes
    .force('charge', d3.forceManyBody().strength(CONFIG.nodeCharge))

    // Collision force: prevents node overlap
    .force('collision', d3.forceCollide().radius(CONFIG.nodeRadius + CONFIG.nodeCollisionPadding))

    // Cluster force: pulls nodes toward their cluster center
    // This replaces our custom forceClusterPacking implementation!
    .force(
      'cluster',
      forceClustering()
        .strength(CONFIG.clusterStrength)
        .distanceMin(CONFIG.clusterDistanceMin)
        .clusterId((d: any) => d.clusterId),
    )

    // Center force: keeps everything centered
    .force('center', d3.forceCenter(0, 0))

    .stop(); // Don't auto-tick, we'll run it manually

  // Run simulation to completion with cluster repulsion
  for (let i = 0; i < CONFIG.iterations; i++) {
    updateClusterCenters();
    clusterRepel();
    simulation.tick();
  }

  // Extract node positions
  const nodePositions = new Map<string, NodePosition>();
  for (const node of simNodes) {
    nodePositions.set(node.id, {
      id: node.id,
      x: node.x ?? 0,
      y: node.y ?? 0,
      vx: 0,
      vy: 0,
      clusterId: node.clusterId ?? '',
      radius: CONFIG.nodeRadius,
    });
  }

  // Calculate cluster bounds and positions
  const clusterPositions = new Map<string, ClusterPosition>();

  for (const cluster of clusters) {
    // Get all nodes in this cluster
    const clusterNodes = cluster.nodes
      .map((n) => nodePositions.get(n.id))
      .filter((p): p is NodePosition => p !== undefined);

    if (clusterNodes.length === 0) {
      // Empty cluster
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

    // Calculate bounding box
    const xs = clusterNodes.map((n) => n.x);
    const ys = clusterNodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Calculate center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate dimensions with padding
    const contentWidth = maxX - minX + CONFIG.nodeRadius * 2;
    const contentHeight = maxY - minY + CONFIG.nodeRadius * 2;

    // Size based on node count with minimum
    const nodeCountSize = CONFIG.minClusterSize + clusterNodes.length * CONFIG.clusterNodeSpacing;
    const width = Math.max(nodeCountSize, contentWidth + CONFIG.clusterPadding * 2);
    const height = Math.max(nodeCountSize, contentHeight + CONFIG.clusterPadding * 2);

    clusterPositions.set(cluster.id, {
      id: cluster.id,
      x: centerX,
      y: centerY,
      width,
      height,
      vx: 0,
      vy: 0,
      nodeCount: clusterNodes.length,
    });

    // Convert node positions to be RELATIVE to cluster center
    for (const node of clusterNodes) {
      node.x -= centerX;
      node.y -= centerY;
    }
  }

  return {
    nodePositions,
    clusterPositions,
    clusters,
  };
}
