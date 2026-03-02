/**
 * Layout Controller - Deterministic graph layout computation
 *
 * This controller only computes static positions. Physics and animation
 * are handled by separate controllers (PhysicsController, AnimationController).
 *
 * @module controllers/layout
 */

import { groupIntoClusters } from '@graph/layout/cluster-grouping';
import type { LayoutOptions } from '@graph/layout/config';
import type { RoutedEdge } from '@graph/layout/types';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { computeHierarchicalLayout } from '@/graph/layout';

/**
 * Result of layout computation
 */
export interface LayoutResult {
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  clusters: Cluster[];
  /** Aggregated edges between clusters */
  clusterEdges?: { source: string; target: string; weight: number }[];
  /** Port-routed edges for cross-cluster connections */
  routedEdges?: RoutedEdge[];
  /** Nodes that are part of cycles (SCC size > 1) */
  cycleNodes?: Set<string>;
  /** SCC ID for each node (nodes in same SCC share an ID) - for cycle edge detection */
  nodeSccId?: Map<string, number>;
  /** Size of each SCC (size > 1 indicates a cycle) */
  sccSizes?: Map<number, number>;
}

/**
 * Reactive controller for deterministic graph layout
 *
 * Computes cluster-based hierarchical layouts with caching for performance.
 * Positions are initialized with zero velocity for physics simulation.
 */
export class LayoutController implements ReactiveController {
  private host: ReactiveControllerHost;

  // Cached layout result
  private cachedResult: LayoutResult | null = null;
  private cachedNodes: GraphNode[] = [];
  private cachedEdges: GraphEdge[] = [];

  // Loading state
  public isComputing = false;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  /**
   * Compute deterministic layout positions (Async)
   * Returns positions with velocities initialized to 0
   *
   * @param nodes - All graph nodes
   * @param edges - All graph edges
   * @param layoutOptions - Optional layout options with hooks and config overrides
   * @param forceRecompute - Force recomputation even if cached
   * @returns Promise resolving to Layout result with positions and clusters
   */
  async computeLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    layoutOptions?: LayoutOptions,
    forceRecompute = false,
  ): Promise<LayoutResult> {
    if (!forceRecompute && this.cachedResult && this.isSameInput(nodes, edges)) {
      return this.cachedResult;
    }

    // Empty graph
    if (nodes.length === 0) {
      const emptyResult: LayoutResult = {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
      };
      this.cacheResult(emptyResult, nodes, edges);
      return emptyResult;
    }

    this.isComputing = true;
    this.host.requestUpdate();

    try {
      // Step 1: Group nodes into clusters
      const analyzedClusters = groupIntoClusters(nodes, edges);

      // Step 2: Compute hierarchical layout positions using ELK (Async)
      const {
        clusterPositions: initialClusterPos,
        nodePositions: initialNodePos,
        clusters: layoutClusters,
        cycleNodes,
        nodeSccId,
        sccSizes,
        clusterEdges,
        routedEdges,
      } = await computeHierarchicalLayout(nodes, edges, analyzedClusters, layoutOptions);

      // Step 3: Add velocity properties for physics simulation
      const nodePositions = new Map<string, NodePosition>();
      initialNodePos.forEach((pos, id) => {
        nodePositions.set(id, { ...pos, vx: 0, vy: 0 });
      });

      const clusterPositions = new Map<string, ClusterPosition>();
      initialClusterPos.forEach((pos, id) => {
        clusterPositions.set(id, { ...pos, vx: 0, vy: 0 });
      });

      const result: LayoutResult = {
        nodePositions,
        clusterPositions,
        clusters: layoutClusters,
        cycleNodes,
        nodeSccId,
        sccSizes,
        clusterEdges,
        routedEdges,
      };

      this.cacheResult(result, nodes, edges);
      return result;
    } finally {
      this.isComputing = false;
      this.host.requestUpdate();
    }
  }

  /**
   * Clear cached layout (force recomputation on next call)
   */
  clearCache(): void {
    this.cachedResult = null;
    this.cachedNodes = [];
    this.cachedEdges = [];
  }

  /**
   * Get current cached result (if any)
   */
  getCachedResult(): LayoutResult | null {
    return this.cachedResult;
  }

  private isSameInput(nodes: GraphNode[], edges: GraphEdge[]): boolean {
    return (
      nodes.length === this.cachedNodes.length &&
      edges.length === this.cachedEdges.length &&
      nodes === this.cachedNodes &&
      edges === this.cachedEdges
    );
  }

  private cacheResult(result: LayoutResult, nodes: GraphNode[], edges: GraphEdge[]): void {
    this.cachedResult = result;
    this.cachedNodes = nodes;
    this.cachedEdges = edges;
  }

  hostConnected(): void {
    // skipcq: JS-0105
    // Required by ReactiveControllerHost interface - no initialization needed
  }

  hostDisconnected(): void {
    this.clearCache();
  }
}
