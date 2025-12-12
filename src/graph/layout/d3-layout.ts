/**
 * D3-force based "Dependency Atlas" layout
 *
 * Key design principles:
 * - Strata dominate: Y-axis reflects architectural depth (dependents above dependencies)
 * - Clusters are circular: Radial interiors with bounded circular boundaries
 * - Neighborhoods emerge: Connected clusters attract, forming regional groupings
 * - Cycles scream: Nodes in cycles (SCCs > 1) are visually distinct
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import { NodeRole } from '@shared/schemas/cluster.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import * as d3Force2D from 'd3-force';
import * as d3Force3D from 'd3-force-3d';
import forceClustering from 'd3-force-clustering';
import { forceEdgeBundling } from './edge-bundling';
import {
  buildClusterDag,
  computeClusterStrata,
  seedClustersByStrata,
} from './cluster-strata';
import {
  computeNodeTargetRadius,
  createClusterBoundaryForce,
  createClusterRadialForce,
  forceClusterAttraction,
  forceClusterBoundingRadius,
  forceClusterRepulsion,
  forceClusterStrataAlignment,
  forceClusterStrataAnchor,
  forceClusterXCentering,
} from './forces';
import {
  computeCrossClusterWeights,
  computeFanIn,
  computeNodeStrata,
} from './graph-strata';

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
  /** Nodes that are part of cycles (SCC size > 1) */
  cycleNodes?: Set<string>;
  /** SCC ID for each node (nodes in same SCC share an ID) - for cycle edge detection */
  nodeSccId?: Map<string, number>;
  /** Size of each SCC (size > 1 indicates a cycle) */
  sccSizes?: Map<number, number>;
  /** Maximum stratum value (for rendering stratum bands) */
  maxStratum?: number;
  /** Maximum cluster stratum value */
  maxClusterStratum?: number;
}

// ============================================================================
// Atlas Layout Configuration
// ============================================================================

/**
 * Default layout configuration
 * Exported for parameter sweep testing
 */
export const DEFAULT_CONFIG = {
  // Node-level forces
  nodeRadius: 6,
  nodeCollisionPadding: 12, // Reduced from 16 - tighter node packing
  linkDistance: 45, // Reduced from 55 - tighter links
  linkStrength: 0.35, // Increased from 0.30 - stronger links to keep clusters together
  nodeCharge: -35, // Reduced from -60 - much less repulsion between nodes

  // Cross-cluster link handling
  crossClusterDistanceMul: 3.5,
  crossClusterStrengthMul: 0.02, // Very weak cross-cluster links

  // Cluster forces
  clusterStrength: 0.30, // Increased from 0.25 - stronger cluster cohesion
  clusterDistanceMin: 20,
  clusterRepulsionStrength: 8000, // Reduced from 15000 - much less horizontal push
  clusterPadding: 120, // Reduced from 180 - much tighter packing
  clusterAttractionStrength: 0.20, // Increased from 0.15 - stronger attraction
  clusterAttractionActivationDist: 500, // Reduced from 600
  clusterRepulsionYScale: 0.2, // Reduced from 0.3 - prefer Y-axis spread more

  // Stratum configuration (the key to atlas layout)
  layerSpacing: 120, // Up from 50
  layerStrength: 0.35, // Up from 0.08 (authoritative)

  // Dependency hang force (gentle nudge)
  hangGap: 72, // layerSpacing * 0.6
  hangStrength: 0.08,

  // Radial interior force
  radialStrength: 0.25,

  // Simulation
  iterations: 300, // Reduced from 450 - less time for forces to spread layout

  // 3D-specific
  initialZSpread: 400,
  zCenterStrength: 0.02,
  zStratumStrength: 0.18,
  zFanInStrength: 0.16,

  // Cluster sizing
  minClusterSize: 60, // Reduced from 80 - smaller clusters
  clusterNodeSpacing: 12, // Reduced from 16 - tighter node spacing in clusters

  // Edge bundling
  bundlingCycles: 5,
  bundlingIterations: 80,
  compatibilityThreshold: 0.65, // Down from 0.8 (more bundling)
  bundlingBudget: 40000, // Total edge-iterations budget for dynamic scaling

  // Cluster strata configuration (Phase 2: geological strata)
  clusterStrataSpacing: 800, // Increased from 600 - much more vertical spread between strata
  clusterHorizontalSpacing: 120, // Reduced from 150 - even tighter horizontal packing
  clusterMaxRowWidth: 900, // Reduced from 1200 - force even more rows per stratum
  clusterStrataAnchorStrength: 0.80, // Increased from 0.70 - very strong anchor to grid

  // Drift prevention (Phase 4)
  clusterCenteringStrength: 0.75, // Increased from 0.6 - very strong X-centering
  clusterBoundingRadius: 1200, // Reduced from 1800 - much tighter boundary
  clusterBoundingStrength: 0.5, // Increased from 0.35 - strong boundary enforcement
  clusterStrataAlignmentStrength: 0.45, // Increased from 0.35 - strong Y alignment

  // 3D Z-axis role-based refinement (Phase 5)
  zRoleStrength: 0.12, // How strongly role affects Z
  zClampMin: -300, // Minimum Z value
  zClampMax: 300, // Maximum Z value
} as const;

/** Type for layout configuration */
export type LayoutConfig = typeof DEFAULT_CONFIG;

// Internal reference to config (allows tests to override)
const CONFIG = DEFAULT_CONFIG;

/**
 * Role-based Z-axis offsets (solar system depth model)
 *
 * Positions nodes in 3D based on their architectural role:
 * - Entry/Test/Tool nodes pushed back (less prominent visually)
 * - Framework nodes pulled forward (more prominent)
 */
const ROLE_Z_OFFSET: Record<NodeRole, number> = {
  [NodeRole.Entry]: -100, // Push back (background "sun")
  [NodeRole.InternalFramework]: +50, // Pull forward (prominent)
  [NodeRole.InternalLib]: +20, // Slightly forward
  [NodeRole.Utility]: 0, // Neutral
  [NodeRole.Test]: -100, // Push back (supporting)
  [NodeRole.Tool]: -100, // Push back (supporting)
};

// ============================================================================
// Simulation Types
// ============================================================================

interface SimNode {
  id: string;
  clusterId?: string;
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  vz?: number;
}

interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

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
  return Math.max(maxZ - minZ, 50);
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
 * Simple hash function for deterministic initial positioning
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Deterministic "random" number from hash (0 to 1)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Dependency hang force
 *
 * Enforces that dependencies hang below dependents:
 * If A -> B (A depends on B), then y(B) >= y(A) + gap
 */
function forceDependencyHang(
  links: Array<{ source: any; target: any }>,
  gap: number,
  strength: number,
) {
  let nodeById = new Map<string, any>();

  function idOf(x: any): string {
    return typeof x === 'string' ? x : x.id;
  }

  function force(alpha: number) {
    for (const l of links) {
      const sId = idOf(l.source);
      const tId = idOf(l.target);
      const s = nodeById.get(sId);
      const t = nodeById.get(tId);
      if (!s || !t) continue;

      // source depends on target, so target should be below (higher Y)
      const desiredTy = (s.y ?? 0) + gap;
      const err = desiredTy - (t.y ?? 0);

      if (err > 0) {
        // Target is above where it should be, push it down (and source up)
        const push = err * strength * alpha;
        s.vy = (s.vy ?? 0) - push * 0.5;
        t.vy = (t.vy ?? 0) + push * 0.5;
      }
    }
  }

  force.initialize = (nodes: any[]) => {
    nodeById = new Map(nodes.map((n) => [n.id, n]));
  };

  return force;
}

// ============================================================================
// Layout Options
// ============================================================================

/** Options for layout computation */
export interface LayoutOptions {
  /** Layout dimension: 2D or 3D (default: '2d') */
  dimension?: LayoutDimension;
  /** Override specific config values (for parameter sweep testing) */
  configOverrides?: Partial<LayoutConfig>;
}

// ============================================================================
// Main Layout Function
// ============================================================================

/**
 * Main layout computation - "Dependency Atlas" style
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  opts: LayoutOptions = {},
): HierarchicalLayoutResult {
  const dimension: LayoutDimension = opts.dimension ?? '2d';
  const d3 = getD3(dimension);

  // Merge config overrides (for parameter sweep testing)
  const config = opts.configOverrides
    ? { ...DEFAULT_CONFIG, ...opts.configOverrides }
    : CONFIG;

  if (nodes.length === 0) {
    return {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
    };
  }

  // ========================================================================
  // Phase 1: Analysis
  // ========================================================================

  const nodeToCluster = buildNodeToClusterMap(clusters);

  // Compute global strata using SCC-based analysis
  const strataResult = computeNodeStrata(nodes, edges);
  const { nodeStratum, cycleNodes, nodeSccId, sccSizes, maxStratum } = strataResult;

  // Compute fan-in for 3D z-positioning
  const fanIn = computeFanIn(nodes, edges);

  // ========================================================================
  // Phase 2: Initialize Simulation
  // ========================================================================

  // Pre-compute cluster strata positions FIRST (needed for node seeding)
  const clusterDag = buildClusterDag(edges, nodeToCluster);
  const clusterStrataResult = computeClusterStrata(
    clusters.map((c) => c.id),
    clusterDag,
  );

  // Compute cross-cluster edge weights for neighborhood formation
  const crossClusterWeights = computeCrossClusterWeights(edges, nodeToCluster);

  // Build node metadata lookup for radial positioning (solar system model)
  const nodeMetadata = new Map<
    string,
    {
      isAnchor?: boolean;
      role?: NodeRole;
      dependencyCount?: number;
      dependsOnCount?: number;
    }
  >();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      const metadata = cluster.metadata?.get(node.id);
      if (metadata) {
        nodeMetadata.set(node.id, {
          isAnchor: metadata.isAnchor,
          role: metadata.role,
          dependencyCount: metadata.dependencyCount,
          dependsOnCount: metadata.dependsOnCount,
        });
      }
    }
  }

  // Pre-calculate cluster sizes (needed for strata seeding)
  const clusterSizes = new Map<string, number>();
  for (const cluster of clusters) {
    const size = config.minClusterSize + cluster.nodes.length * config.clusterNodeSpacing;
    clusterSizes.set(cluster.id, size);
  }

  // Seed clusters by their strata for deterministic layered positioning
  const strataPositions = seedClustersByStrata(
    clusters,
    clusterStrataResult,
    clusterSizes,
    {
      strataSpacing: config.clusterStrataSpacing,
      horizontalSpacing: config.clusterHorizontalSpacing,
      maxRowWidth: config.clusterMaxRowWidth,
    },
  );

  // Create simulation nodes with positions relative to their cluster's strata position
  const simNodes = nodes.map((n): SimNode => {
    const hash = hashString(n.id);
    const clusterId = nodeToCluster.get(n.id);
    const clusterPos = clusterId ? strataPositions.get(clusterId) : null;

    // Position nodes around their cluster's strata position with small random offset
    // This ensures nodes start near their cluster's correct Y layer
    const baseX = clusterPos?.x ?? 0;
    const baseY = clusterPos?.y ?? 0;

    return {
      id: n.id,
      clusterId,
      x: baseX + (seededRandom(hash) - 0.5) * 60,
      y: baseY + (seededRandom(hash + 1) - 0.5) * 60,
      z: dimension === '3d' ? (seededRandom(hash + 2) - 0.5) * config.initialZSpread : 0,
      vx: 0,
      vy: 0,
      vz: 0,
    };
  });

  // Create node ID set for validation
  const nodeIdSet = new Set(nodes.map((n) => n.id));

  // Create edges for D3 with cluster awareness
  // Filter out edges that reference non-existent nodes (defensive)
  const simLinks = edges
    .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target))
    .map((e) => {
      const sourceCluster = nodeToCluster.get(e.source);
      const targetCluster = nodeToCluster.get(e.target);
      const sameCluster = sourceCluster === targetCluster;

      return {
        source: e.source,
        target: e.target,
        sameCluster,
      };
    });

  // Create cluster centers with strata-based grid positioning (Phase 2)
  const clusterCenterMap = new Map<string, ClusterCenter>();

  // Store target positions for anchor force (Phase 4) - strataPositions already computed above
  const clusterTargetPositions = new Map(strataPositions);

  for (const cluster of clusters) {
    const size = clusterSizes.get(cluster.id) ?? config.minClusterSize;
    const pos = strataPositions.get(cluster.id) ?? { x: 0, y: 0 };

    clusterCenterMap.set(cluster.id, {
      id: cluster.id,
      cx: pos.x,
      cy: pos.y,
      radius: size / 2,
    });
  }

  // ========================================================================
  // Phase 3: Create Forces
  // ========================================================================

  // Update cluster centers based on node positions
  function updateClusterCenters() {
    // Reset accumulators
    const sums = new Map<string, { sumX: number; sumY: number; count: number }>();
    
    // Initialize for all known clusters to ensure coverage
    for (const id of clusterCenterMap.keys()) {
      sums.set(id, { sumX: 0, sumY: 0, count: 0 });
    }

    // Single pass over nodes to accumulate positions
    for (const node of simNodes) {
      if (!node.clusterId) continue;
      
      const acc = sums.get(node.clusterId);
      if (acc) {
        acc.sumX += node.x;
        acc.sumY += node.y;
        acc.count++;
      }
    }

    // Update center positions
    for (const [clusterId, center] of clusterCenterMap) {
      const acc = sums.get(clusterId);
      if (acc && acc.count > 0) {
        center.cx = acc.sumX / acc.count;
        center.cy = acc.sumY / acc.count;
      }
    }
  }

  // Cluster repulsion with weights and anisotropic behavior
  const clusterRepelForce = forceClusterRepulsion(
    config.clusterRepulsionStrength,
    config.clusterPadding,
    crossClusterWeights,
    config.clusterRepulsionYScale,
  );
  clusterRepelForce.initialize(Array.from(clusterCenterMap.values()));

  // Cluster attraction for neighborhood formation
  const clusterAttractForce = forceClusterAttraction(
    config.clusterAttractionStrength,
    crossClusterWeights,
    config.clusterAttractionActivationDist,
  );
  clusterAttractForce.initialize(Array.from(clusterCenterMap.values()));

  // Cluster strata forces (Phase 2 & 4)
  const clusterStrataAnchorForce = forceClusterStrataAnchor(
    clusterTargetPositions,
    config.clusterStrataAnchorStrength,
  );
  clusterStrataAnchorForce.initialize(Array.from(clusterCenterMap.values()));

  const clusterBoundingForce = forceClusterBoundingRadius(
    config.clusterBoundingRadius,
    config.clusterBoundingStrength,
  );
  clusterBoundingForce.initialize(Array.from(clusterCenterMap.values()));

  const clusterAlignmentForce = forceClusterStrataAlignment(
    clusterStrataResult.clusterStratum,
    config.clusterStrataSpacing,
    config.clusterStrataAlignmentStrength,
  );
  clusterAlignmentForce.initialize(Array.from(clusterCenterMap.values()));

  const clusterXCenteringForce = forceClusterXCentering(config.clusterCenteringStrength);
  clusterXCenteringForce.initialize(Array.from(clusterCenterMap.values()));

  // Per-cluster circular boundary forces
  const boundaryForceData: Array<{
    clusterId: string;
    force: (alpha: number) => void;
  }> = [];

  for (const cluster of clusters) {
    const size = clusterSizes.get(cluster.id) ?? config.minClusterSize;
    const maxRadius = size / 2 - config.nodeRadius - 10;
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

  // Radial interior force
  function radiusForNode(nodeId: string): number {
    const clusterId = nodeToCluster.get(nodeId);
    if (!clusterId) return 50;

    const clusterSize = clusterSizes.get(clusterId) ?? config.minClusterSize;
    const clusterRadius = clusterSize / 2 - config.nodeRadius - 10;
    const metadata = nodeMetadata.get(nodeId) ?? null;

    return computeNodeTargetRadius(metadata, clusterRadius);
  }

  const radialForce = createClusterRadialForce(
    clusterCenterMap,
    radiusForNode,
    config.radialStrength,
  );
  radialForce.initialize(simNodes);

  // Dependency hang force
  const hangForce = forceDependencyHang(simLinks, config.hangGap, config.hangStrength);
  hangForce.initialize(simNodes);

  // ========================================================================
  // Phase 4: Create D3 Simulation
  // ========================================================================

  const simulation = d3
    .forceSimulation(simNodes)
    .force(
      'link',
      d3
        .forceLink(simLinks)
        .id((d: any) => d.id)
        .distance((l: any) =>
          l.sameCluster ? config.linkDistance : config.linkDistance * config.crossClusterDistanceMul,
        )
        .strength((l: any) =>
          l.sameCluster ? config.linkStrength : config.linkStrength * config.crossClusterStrengthMul,
        ),
    )
    .force('charge', d3.forceManyBody().strength(config.nodeCharge))
    .force('collision', d3.forceCollide().radius(config.nodeRadius + config.nodeCollisionPadding))
    .force(
      'cluster',
      forceClustering()
        .strength(config.clusterStrength)
        .distanceMin(config.clusterDistanceMin)
        .clusterId((d: any) => d.clusterId),
    )
    .force('boundaries', applyAllClusterBoundaries)
    .force('radial', radialForce)
    .force('center', d3.forceCenter(0, 0))
    // Authoritative strata force
    .force(
      'strataY',
      d3
        .forceY((d: any) => {
          const stratum = nodeStratum.get(d.id) ?? 0;
          return stratum * config.layerSpacing;
        })
        .strength(config.layerStrength),
    )
    .force('hang', hangForce)
    .stop();

  // Enable 3D mode
  if (dimension === '3d') {
    if ('numDimensions' in simulation) {
      (simulation as any).numDimensions(3);
    }

    if ('forceZ' in d3) {
      // Meaningful Z: combines fan-in, stratum, and role-based positioning
      (simulation as any).force(
        'meaningfulZ',
        (d3 as any)
          .forceZ((d: any) => {
            const fi = fanIn.get(d.id) ?? 0;
            const stratum = nodeStratum.get(d.id) ?? 0;
            const meta = nodeMetadata.get(d.id);
            const roleOffset = meta?.role ? ROLE_Z_OFFSET[meta.role] : 0;

            // Higher fan-in = closer (positive Z)
            // Higher stratum = further back (negative Z)
            // Role-based offset for architectural prominence
            return Math.log2(fi + 1) * 80 - stratum * 25 + roleOffset * config.zRoleStrength;
          })
          .strength(config.zStratumStrength),
      );

      // Weak z-centering to prevent drift
      (simulation as any).force(
        'zCenter',
        (d3 as any).forceZ(0).strength(config.zCenterStrength),
      );
    }
  }

  // ========================================================================
  // Phase 5: Run Simulation
  // ========================================================================

  for (let i = 0; i < config.iterations; i++) {
    // Track cluster centers before forces
    const previousCenters = new Map<string, { cx: number; cy: number }>();
    for (const [id, center] of clusterCenterMap) {
      previousCenters.set(id, { cx: center.cx, cy: center.cy });
    }

    updateClusterCenters();

    // Apply cluster-level forces
    clusterRepelForce(simulation.alpha());
    clusterAttractForce(simulation.alpha());

    // Apply cluster strata forces (Phase 2 & 4)
    clusterStrataAnchorForce(simulation.alpha());
    clusterAlignmentForce(simulation.alpha());
    clusterBoundingForce(simulation.alpha());
    clusterXCenteringForce(simulation.alpha());

    // Calculate cluster movement deltas
    const clusterDeltas = new Map<string, { dx: number; dy: number }>();
    for (const [clusterId, center] of clusterCenterMap) {
      const prev = previousCenters.get(clusterId);
      if (!prev) continue;

      const dx = center.cx - prev.cx;
      const dy = center.cy - prev.cy;
      
      if (dx !== 0 || dy !== 0) {
        clusterDeltas.set(clusterId, { dx, dy });
      }
    }

    // Move nodes with their cluster centers (Single pass O(N))
    for (const node of simNodes) {
      if (node.clusterId) {
        const delta = clusterDeltas.get(node.clusterId);
        if (delta) {
          node.x += delta.dx;
          node.y += delta.dy;
        }
      }
    }

    simulation.tick();
  }

  // Apply Z clamping to prevent extreme depth values (Phase 5)
  if (dimension === '3d') {
    for (const node of simNodes) {
      if (node.z !== undefined) {
        node.z = Math.max(config.zClampMin, Math.min(config.zClampMax, node.z));
      }
    }
  }

  // ========================================================================
  // Phase 6: Extract Results
  // ========================================================================

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
      radius: config.nodeRadius,
    });
  }

  // Run edge bundling BEFORE converting to relative coordinates
  const nodeMap: Record<string, { x: number; y: number }> = {};
  for (const [nodeId, pos] of nodePositions) {
    nodeMap[nodeId] = { x: pos.x, y: pos.y };
  }

  // Bundle only cross-cluster edges
  const crossClusterEdges = edges
    .filter((e) => nodeToCluster.get(e.source) !== nodeToCluster.get(e.target))
    .map((e) => ({ source: e.source, target: e.target }));

  let bundledEdges: Array<Array<{ x: number; y: number }>> | undefined;

  // Phase 7: Scalable edge bundling with dynamic budget
  // Instead of a hard edge count cutoff, use a dynamic budget that scales
  // iterations based on edge count to maintain reasonable performance
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

  // Calculate cluster positions and convert node positions to relative
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

    const center = clusterCenterMap.get(cluster.id);
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
    cycleNodes,
    nodeSccId,
    sccSizes,
    maxStratum,
    maxClusterStratum: clusterStrataResult.maxClusterStratum,
  };
}
