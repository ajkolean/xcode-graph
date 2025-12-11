/**
 * D3-force based clustered graph layout
 *
 * Main orchestration of force simulation with cluster boundaries and edge bundling.
 * Uses d3-force-clustering for natural cluster grouping.
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import * as d3Force2D from 'd3-force';
import * as d3Force3D from 'd3-force-3d';
import forceClustering from 'd3-force-clustering';
import { forceEdgeBundling } from './edge-bundling';
import { createClusterBoundaryForce, forceClusterRepulsion } from './forces';

// Type for selecting 2D or 3D force module
type D3ForceModule = typeof d3Force2D;

/** Layout dimension: 2D or 3D */
export type LayoutDimension = '2d' | '3d';

/**
 * Get the appropriate d3-force module based on dimension
 */
function getD3(dimension: LayoutDimension): D3ForceModule {
  return (dimension === '3d' ? d3Force3D : d3Force2D) as unknown as D3ForceModule;
}

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
  nodeCollisionPadding: 16,
  linkDistance: 65,
  linkStrength: 0.35,
  nodeCharge: -90,

  // Cluster forces
  clusterStrength: 0.25,
  clusterDistanceMin: 20,
  clusterRepulsionStrength: 20000,
  clusterPadding: 140,

  // Layer biasing (gentle vertical structure)
  layerSpacing: 70,
  layerStrength: 0.25,

  // Simulation
  iterations: 300,

  // 3D-specific
  initialZSpread: 200,
  zCenterStrength: 0.05,

  // Cluster sizing
  minClusterSize: 80,
  clusterNodeSpacing: 16,

  // Edge bundling
  bundlingCycles: 5,
  bundlingIterations: 80,
  compatibilityThreshold: 0.8,
} as const;

// Simulation node type
interface SimNode {
  id: string;
  clusterId?: string;
  x: number;
  y: number;
  z?: number; // 3D only
  vx: number;
  vy: number;
  vz?: number; // 3D only
}

// Cluster center type
interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

/**
 * Compute average z-center for a cluster's nodes
 */
function computeClusterZCenter(nodes: SimNode[]): number {
  if (nodes.length === 0) return 0;
  const sum = nodes.reduce((acc, n) => acc + (n.z ?? 0), 0);
  return sum / nodes.length;
}

/**
 * Compute z-depth (extent) for a cluster's nodes
 */
function computeClusterZDepth(nodes: SimNode[]): number {
  if (nodes.length === 0) return 0;
  const zValues = nodes.map((n) => n.z ?? 0);
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  return Math.max(maxZ - minZ, 50); // minimum depth of 50
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

/** Options for layout computation */
export interface LayoutOptions {
  /** Layout dimension: 2D or 3D (default: '2d') */
  dimension?: LayoutDimension;
}

/**
 * Main layout computation
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  opts: LayoutOptions = {},
): HierarchicalLayoutResult {
  const dimension: LayoutDimension = opts.dimension ?? '2d';
  const d3 = getD3(dimension);

  if (nodes.length === 0) {
    return {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
    };
  }

  // Build mappings
  const nodeToCluster = buildNodeToClusterMap(clusters);

  // Extract layer information from cluster metadata
  const nodeLayer = new Map<string, number>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      const metadata = cluster.metadata?.get(node.id);
      if (metadata?.layer != null) {
        nodeLayer.set(node.id, metadata.layer);
      }
    }
  }

  // Pre-calculate cluster sizes
  const clusterSizes = new Map<string, number>();
  for (const cluster of clusters) {
    const size = CONFIG.minClusterSize + cluster.nodes.length * CONFIG.clusterNodeSpacing;
    clusterSizes.set(cluster.id, size);
  }

  // Create simulation nodes with type safety
  const simNodes = nodes.map(
    (n): SimNode => ({
      id: n.id,
      clusterId: nodeToCluster.get(n.id),
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: dimension === '3d' ? (Math.random() - 0.5) * CONFIG.initialZSpread : 0,
      vx: 0,
      vy: 0,
      vz: 0,
    }),
  );

  // Create edges for D3 with cluster awareness
  const simLinks = edges.map((e) => {
    const sourceCluster = nodeToCluster.get(e.source);
    const targetCluster = nodeToCluster.get(e.target);
    const sameCluster = sourceCluster === targetCluster;

    return {
      source: e.source,
      target: e.target,
      sameCluster,
    };
  });

  // Create cluster centers with radius (using Map for O(1) lookups)
  // Use grid-based initial positioning to reduce overlap
  const clusterCenterMap = new Map<string, ClusterCenter>();
  const cols = Math.ceil(Math.sqrt(clusters.length));
  const initialSpacing = 300;

  clusters.forEach((cluster, i) => {
    const size = clusterSizes.get(cluster.id) ?? CONFIG.minClusterSize;

    const colIndex = i % cols;
    const rowIndex = Math.floor(i / cols);

    clusterCenterMap.set(cluster.id, {
      id: cluster.id,
      cx: (colIndex - (cols - 1) / 2) * initialSpacing,
      cy: (rowIndex - 0.5) * initialSpacing,
      radius: size / 2,
    });
  });

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

  // Create cluster repulsion force (size-aware, proper D3 force)
  const clusterRepelForce = forceClusterRepulsion(
    CONFIG.clusterRepulsionStrength,
    CONFIG.clusterPadding,
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
    const clusterNodes = simNodes.filter((n) => n.clusterId === cluster.id);

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
        .distance((l: any) => (l.sameCluster ? CONFIG.linkDistance : CONFIG.linkDistance * 3.5))
        .strength((l: any) => (l.sameCluster ? CONFIG.linkStrength : CONFIG.linkStrength * 0.05)),
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
    // Layer biasing: gently pull nodes into horizontal bands by layer
    .force(
      'layerY',
      d3
        .forceY((d: any) => {
          const layer = nodeLayer.get(d.id);
          return layer != null ? layer * CONFIG.layerSpacing : 0;
        })
        .strength(CONFIG.layerStrength),
    )
    .stop();

  // Add z-centering force for 3D mode
  if (dimension === '3d' && 'forceZ' in d3) {
    (simulation as any).force('z', (d3 as any).forceZ(0).strength(CONFIG.zCenterStrength));
  }

  // Run simulation to completion
  for (let i = 0; i < CONFIG.iterations; i++) {
    // Track cluster centers before repulsion
    const previousCenters = new Map<string, { cx: number; cy: number }>();
    for (const [id, center] of clusterCenterMap) {
      previousCenters.set(id, { cx: center.cx, cy: center.cy });
    }

    updateClusterCenters();
    clusterRepelForce(simulation.alpha());

    // Move nodes with their cluster centers (crisp cluster movement)
    for (const [clusterId, center] of clusterCenterMap) {
      const prev = previousCenters.get(clusterId);
      if (!prev) continue;

      const dx = center.cx - prev.cx;
      const dy = center.cy - prev.cy;

      // Shift all nodes in this cluster by the center delta
      for (const node of simNodes) {
        if (node.clusterId === clusterId) {
          node.x += dx;
          node.y += dy;
        }
      }
    }

    simulation.tick();
  }

  // Extract node positions (STILL ABSOLUTE at this point!)
  const nodePositions = new Map<string, NodePosition>();
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
      radius: CONFIG.nodeRadius,
    });
  }

  // CRITICAL: Run edge bundling BEFORE converting to relative coordinates
  // Bundling needs global coordinate system for cross-cluster edges
  const nodeMap: Record<string, { x: number; y: number }> = {};
  for (const [nodeId, pos] of nodePositions) {
    nodeMap[nodeId] = { x: pos.x, y: pos.y };
  }

  // Bundle only cross-cluster edges (cleaner visual separation)
  const crossClusterEdges = edges
    .filter((e) => nodeToCluster.get(e.source) !== nodeToCluster.get(e.target))
    .map((e) => ({ source: e.source, target: e.target }));

  let bundledEdges: Array<Array<{ x: number; y: number }>> | undefined;

  if (crossClusterEdges.length > 0 && crossClusterEdges.length < 500) {
    bundledEdges = forceEdgeBundling(nodeMap, crossClusterEdges, {
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

    // Get sim nodes for z calculations (needed for 3D)
    const clusterSimNodes = simNodes.filter((n) => n.clusterId === cluster.id);

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

    // ⚠️ CRITICAL COORDINATE SYSTEM CHANGE ⚠️
    // Converting node positions from ABSOLUTE to RELATIVE (cluster-local)
    // Downstream rendering MUST compute: absoluteX = cluster.x + node.x
    for (const node of clusterNodes) {
      node.x -= center.cx;
      node.y -= center.cy;
      // Convert z to cluster-relative in 3D mode
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
  };
}
