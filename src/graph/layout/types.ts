import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type * as d3Force2D from 'd3-force';
import type * as d3Force3D from 'd3-force-3d';

// ============================================================================
// Core Layout Types
// ============================================================================

/** Layout dimension: 2D or 3D */
export type LayoutDimension = '2d' | '3d';

/** Type for selecting 2D or 3D force module */
export type D3ForceModule = typeof d3Force2D | typeof d3Force3D;

/** Interface for simulation nodes */
export interface SimNode extends d3Force2D.SimulationNodeDatum {
  id: string;
  clusterId?: string;
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  vz?: number;
}

/** Interface for simulation links */
export interface SimLink extends d3Force2D.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  sameCluster: boolean;
}

/** Interface for cluster centers in simulation */
export interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

/** Aggregated edge between clusters for macro-level rendering */
export interface ClusterEdgeResult {
  source: string;
  target: string;
  weight: number;
}

/**
 * Result of the hierarchical layout computation
 */
export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
  bundledEdges?: Array<Array<{ x: number; y: number }>> | undefined;
  /** Aggregated edges between clusters (Arteries) */
  clusterEdges?: ClusterEdgeResult[];
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
  /** Routed cross-cluster edges with port assignments */
  routedEdges?: RoutedEdge[];
}

// ============================================================================
// Port-Based Edge Routing Types
// ============================================================================

/** Cardinal direction for port placement on cluster boundary */
export type PortSide = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

/** A port on a cluster boundary where edges can exit/enter */
export interface ClusterPort {
  /** Unique port identifier (e.g., "cluster-A_EAST_0") */
  id: string;
  /** Parent cluster ID */
  clusterId: string;
  /** Which boundary side the port is on */
  side: PortSide;
  /** World X coordinate of the port */
  x: number;
  /** World Y coordinate of the port */
  y: number;
  /** Order index on this side (0 = first) */
  index: number;
}

/** An edge routed through cluster boundary ports */
export interface RoutedEdge {
  /** Source node ID */
  sourceNodeId: string;
  /** Target node ID */
  targetNodeId: string;
  /** Source cluster ID */
  sourceClusterId: string;
  /** Target cluster ID */
  targetClusterId: string;
  /** Exit port on source cluster */
  sourcePort: ClusterPort;
  /** Entry port on target cluster */
  targetPort: ClusterPort;
  /** Intermediate bend points between ports */
  waypoints: Array<{ x: number; y: number }>;
  /** Edge weight (for rendering thickness) */
  weight: number;
}

/** Extended cluster position with port information */
export interface ClusterPositionWithPorts extends ClusterPosition {
  /** Ports on this cluster's boundary */
  ports: ClusterPort[];
}
