import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type * as d3Force2D from 'd3-force';

/** Interface for simulation nodes */
export interface SimNode extends d3Force2D.SimulationNodeDatum {
  id: string;
  clusterId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
  /** Aggregated edges between clusters */
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

/** Cardinal direction for port placement on cluster boundary */
export type PortSide = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

/** A port on a cluster boundary where edges can exit/enter */
export interface ClusterPort {
  /** Unique port identifier (e.g., "cluster-A_EAST_0") */
  id: string;
  clusterId: string;
  side: PortSide;
  x: number;
  y: number;
  /** Order index on this side (0 = first) */
  index: number;
}

/** An edge routed through cluster boundary ports */
export interface RoutedEdge {
  sourceNodeId: string;
  targetNodeId: string;
  sourceClusterId: string;
  targetClusterId: string;
  sourcePort: ClusterPort;
  targetPort: ClusterPort;
  waypoints: Array<{ x: number; y: number }>;
  weight: number;
}

/** Extended cluster position with port information */
export interface ClusterPositionWithPorts extends ClusterPosition {
  /** Ports on this cluster's boundary */
  ports: ClusterPort[];
}

/**
 * Lifecycle hooks for layout customization.
 * Consumers can observe or modify data at key points during layout computation.
 */
export interface LayoutHooks {
  /** Called before layout computation starts */
  onBeforeLayout?: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  /** Called after micro-layout (per-cluster interior) completes */
  onAfterMicroLayout?: (clusters: Cluster[]) => void;
  /** Called when layout computation is fully complete */
  onLayoutComplete?: (result: HierarchicalLayoutResult) => void;
}
