/**
 * Layout Controller - Deterministic graph layout computation
 *
 * This controller only computes static positions. Physics and animation
 * are handled by separate controllers (PhysicsController, AnimationController).
 *
 * @module controllers/layout
 */

import { computeHierarchicalLayout } from '@graph/layout';
import { groupIntoClusters } from '@graph/layout/cluster-grouping';
import type { LayoutOptions } from '@graph/layout/config';
import type { RoutedEdge } from '@graph/layout/types';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Configuration for graph layout with optional animation
 */
export interface GraphLayoutConfig {
  enableAnimation?: boolean;
  animationTicks?: number;
  nodeCollisionStrength?: number;
  clusterCollisionStrength?: number;
}

/**
 * Result of layout computation
 */
export interface LayoutResult {
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  clusters: Cluster[];
  /** Aggregated edges between clusters */
  clusterEdges?: { source: string; target: string; weight: number }[] | undefined;
  /** Port-routed edges for cross-cluster connections */
  routedEdges?: RoutedEdge[] | undefined;
  /** Nodes that are part of cycles (SCC size > 1) */
  cycleNodes?: Set<string> | undefined;
  /** SCC ID for each node (nodes in same SCC share an ID) - for cycle edge detection */
  nodeSccId?: Map<string, number> | undefined;
  /** Size of each SCC (size > 1 indicates a cycle) */
  sccSizes?: Map<number, number> | undefined;
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
  private cachedNodeIds: Set<string> = new Set();
  private cachedEdgeKeys: Set<string> = new Set();

  // Loading state
  public isComputing = false;

  // Configuration (kept for backwards compatibility but ignored)
  enableAnimation: boolean;

  // --- Public state (previously exposed by GraphLayoutController) ---

  private _nodePositions = new Map<string, NodePosition>();
  private _clusterPositions = new Map<string, ClusterPosition>();
  private _clusters: Cluster[] = [];
  private _cycleNodes: Set<string> | undefined;
  private _nodeSccId: Map<string, number> | undefined;
  private _sccSizes: Map<number, number> | undefined;
  private _clusterEdges: { source: string; target: string; weight: number }[] | undefined;
  private _routedEdges: RoutedEdge[] | undefined;

  get nodePositions(): Map<string, NodePosition> {
    return this._nodePositions;
  }

  get clusterPositions(): Map<string, ClusterPosition> {
    return this._clusterPositions;
  }

  get clusters(): Cluster[] {
    return this._clusters;
  }

  get isSettling(): boolean {
    return this.isComputing;
  }

  /** Nodes that are part of cycles (SCC size > 1) */
  get cycleNodes(): Set<string> | undefined {
    /* v8 ignore next */
    return this._cycleNodes;
  }

  /** SCC ID for each node - nodes in same SCC share an ID */
  get nodeSccId(): Map<string, number> | undefined {
    /* v8 ignore next */
    return this._nodeSccId;
  }

  /** Size of each SCC (size > 1 indicates a cycle) */
  get sccSizes(): Map<number, number> | undefined {
    /* v8 ignore next */
    return this._sccSizes;
  }

  /** Aggregated edges between clusters (Arteries) */
  get clusterEdges(): { source: string; target: string; weight: number }[] | undefined {
    /* v8 ignore next */
    return this._clusterEdges;
  }

  /** Port-routed edges for cross-cluster connections */
  get routedEdges(): RoutedEdge[] | undefined {
    /* v8 ignore next */
    return this._routedEdges;
  }

  constructor(host: ReactiveControllerHost, config: GraphLayoutConfig = {}) {
    this.host = host;
    this.enableAnimation = config.enableAnimation ?? true;
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
    // Empty graph - clear state and return early
    if (nodes.length === 0) {
      const emptyResult: LayoutResult = {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
      };
      this._nodePositions = new Map();
      this._clusterPositions = new Map();
      this._clusters = [];
      this._cycleNodes = undefined;
      this._nodeSccId = undefined;
      this._sccSizes = undefined;
      this._clusterEdges = undefined;
      this._routedEdges = undefined;
      this.cacheResult(emptyResult, nodes, edges);
      return emptyResult;
    }

    if (!forceRecompute && this.cachedResult && this.isSameInput(nodes, edges)) {
      return this.cachedResult;
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
        elkDebug,
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

      /* v8 ignore start -- debug logging only in dev mode */
      if (import.meta.env.DEV && elkDebug) {
        console.groupCollapsed('[layout] ELK debug');
        if (elkDebug.elkLogging) console.log('phases:', elkDebug.elkLogging);
        if (elkDebug.optionWarnings?.length)
          console.warn('option warnings:', elkDebug.optionWarnings);
        if (elkDebug.elkDurationMs != null)
          console.log(`duration: ${elkDebug.elkDurationMs.toFixed(1)}ms`);
        console.groupEnd();
      }
      /* v8 ignore stop */

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

      // Update public state
      this._clusters = result.clusters;
      this._nodePositions = result.nodePositions;
      this._clusterPositions = result.clusterPositions;
      this._cycleNodes = result.cycleNodes;
      this._nodeSccId = result.nodeSccId;
      this._sccSizes = result.sccSizes;
      this._clusterEdges = result.clusterEdges;
      this._routedEdges = result.routedEdges;

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
    this.cachedNodeIds = new Set();
    this.cachedEdgeKeys = new Set();
  }

  /**
   * Get current cached result (if any)
   */
  getCachedResult(): LayoutResult | null {
    return this.cachedResult;
  }

  /** Sets whether layout animation is enabled. */
  setEnableAnimation(enabled: boolean): void {
    this.enableAnimation = enabled;
  }

  /** Checks whether the given nodes and edges have the same content as the cached input. */
  private isSameInput(nodes: GraphNode[], edges: GraphEdge[]): boolean {
    if (nodes.length !== this.cachedNodeIds.size || edges.length !== this.cachedEdgeKeys.size) {
      return false;
    }
    for (const node of nodes) {
      if (!this.cachedNodeIds.has(node.id)) return false;
    }
    for (const edge of edges) {
      if (!this.cachedEdgeKeys.has(`${edge.source}->${edge.target}`)) return false;
    }
    return true;
  }

  /** Stores the layout result and input content fingerprint for cache hit comparison. */
  private cacheResult(result: LayoutResult, nodes: GraphNode[], edges: GraphEdge[]): void {
    this.cachedResult = result;
    this.cachedNodeIds = new Set(nodes.map((n) => n.id));
    this.cachedEdgeKeys = new Set(edges.map((e) => `${e.source}->${e.target}`));
  }

  hostConnected(): void {
    // Required by ReactiveControllerHost interface - no initialization needed
  }

  /** Clears the layout cache when the host element disconnects. */
  hostDisconnected(): void {
    this.clearCache();
  }
}
