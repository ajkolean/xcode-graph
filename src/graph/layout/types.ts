import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import * as d3Force2D from 'd3-force';
import * as d3Force3D from 'd3-force-3d';

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
}