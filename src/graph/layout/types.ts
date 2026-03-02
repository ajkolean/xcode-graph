import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type * as d3Force2D from 'd3-force'; // skipcq: JS-C1003

/**
 * D3 simulation node extended with cluster membership
 *
 * @public
 */
export interface SimNode extends d3Force2D.SimulationNodeDatum {
  id: string;
  clusterId?: string | undefined;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * D3 simulation link with intra/inter-cluster flag
 *
 * @public
 */
export interface SimLink extends d3Force2D.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  sameCluster: boolean;
}

/**
 * Interface for cluster centers in simulation
 *
 * @public
 */
export interface ClusterCenter {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

/**
 * Aggregated edge between clusters for macro-level rendering
 *
 * @public
 */
export interface ClusterEdgeResult {
  source: string;
  target: string;
  weight: number;
}

/**
 * Result of the hierarchical layout computation
 *
 * @public
 */
export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
  bundledEdges?: Array<Array<{ x: number; y: number }>> | undefined;
  /** Aggregated edges between clusters */
  clusterEdges?: ClusterEdgeResult[] | undefined;
  /** Nodes that are part of cycles (SCC size \> 1) */
  cycleNodes?: Set<string> | undefined;
  /** SCC ID for each node (nodes in same SCC share an ID) - for cycle edge detection */
  nodeSccId?: Map<string, number> | undefined;
  /** Size of each SCC (size \> 1 indicates a cycle) */
  sccSizes?: Map<number, number> | undefined;
  /** Maximum stratum value (for rendering stratum bands) */
  maxStratum?: number | undefined;
  /** Maximum cluster stratum value */
  maxClusterStratum?: number | undefined;
  /** Routed cross-cluster edges with port assignments */
  routedEdges?: RoutedEdge[] | undefined;
}

/**
 * Cardinal direction for port placement on cluster boundary
 *
 * @public
 */
export type PortSide = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

/**
 * A port on a cluster boundary where edges can exit/enter
 *
 * @public
 */
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

/**
 * An edge routed through cluster boundary ports
 *
 * @public
 */
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

/**
 * Extended cluster position with port information
 *
 * @public
 */
export interface ClusterPositionWithPorts extends ClusterPosition {
  /** Ports on this cluster's boundary */
  ports: ClusterPort[];
}

/**
 * Lifecycle hooks for layout customization.
 * Consumers can observe or modify data at key points during layout computation.
 *
 * @public
 */
export interface LayoutHooks {
  /** Called before layout computation starts */
  onBeforeLayout?: ((nodes: GraphNode[], edges: GraphEdge[]) => void) | undefined;
  /** Called after micro-layout (per-cluster interior) completes */
  onAfterMicroLayout?: ((clusters: Cluster[]) => void) | undefined;
  /** Called when layout computation is fully complete */
  onLayoutComplete?: ((result: HierarchicalLayoutResult) => void) | undefined;
}
