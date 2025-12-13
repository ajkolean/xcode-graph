/**
 * Graph Layout Controller - Unified layout orchestration
 *
 * **This is the default/recommended controller for graph layout.**
 *
 * Unified controller that composes Layout, Physics, and Animation controllers
 * for graph layout computation with optional physics-based settling animation.
 * Runs on the main thread, which is suitable for most graphs (<1000 nodes).
 *
 * ## When to Use This Controller
 *
 * **Use GraphLayoutController when:**
 * - Graph has <1000 nodes (most use cases)
 * - You want a simpler, synchronous API
 * - Main thread blocking is acceptable (~10-50ms for typical graphs)
 *
 * **Use {@link LayoutWorkerController} instead when:**
 * - Graph has 1000+ nodes where layout computation takes >100ms
 * - UI responsiveness is critical during layout (e.g., concurrent drag interactions)
 * - You need progress callbacks during animated layout
 *
 * ## Architecture
 * - Single Responsibility Principle (each sub-controller has one job)
 * - DRY (no duplicate collision code)
 * - Better testability (each controller tested independently)
 * - Lower cognitive complexity
 *
 * ## Sub-Controllers
 * - `LayoutController`: Computes initial deterministic positions
 * - `PhysicsController`: Calculates physics forces
 * - `AnimationController`: Manages animation loop
 *
 * @module controllers/graph-layout
 * @see {@link LayoutWorkerController} - Alternative for large graphs (1000+ nodes)
 */

import type { RoutedEdge } from '@graph/layout/types';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { LayoutController } from './layout.controller';

// ==================== Type Definitions ====================

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
 * Unified layout controller with composed sub-controllers
 */
export class GraphLayoutController implements ReactiveController {
  private readonly host: ReactiveControllerHost;

  // Sub-controllers
  private readonly layoutController: LayoutController;

  // Configuration (kept for backwards compatibility but ignored)
  enableAnimation: boolean;

  // State (delegated from sub-controllers)
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
    return this.layoutController.isComputing;
  }

  /** Nodes that are part of cycles (SCC size > 1) */
  get cycleNodes(): Set<string> | undefined {
    return this._cycleNodes;
  }

  /** SCC ID for each node - nodes in same SCC share an ID */
  get nodeSccId(): Map<string, number> | undefined {
    return this._nodeSccId;
  }

  /** Size of each SCC (size > 1 indicates a cycle) */
  get sccSizes(): Map<number, number> | undefined {
    return this._sccSizes;
  }

  /** Aggregated edges between clusters (Arteries) */
  get clusterEdges(): { source: string; target: string; weight: number }[] | undefined {
    return this._clusterEdges;
  }

  /** Port-routed edges for cross-cluster connections */
  get routedEdges(): RoutedEdge[] | undefined {
    return this._routedEdges;
  }

  private _nodePositions = new Map<string, NodePosition>();
  private _clusterPositions = new Map<string, ClusterPosition>();
  private _clusters: Cluster[] = [];
  private _cycleNodes: Set<string> | undefined;
  private _nodeSccId: Map<string, number> | undefined;
  private _sccSizes: Map<number, number> | undefined;
  private _clusterEdges: { source: string; target: string; weight: number }[] | undefined;
  private _routedEdges: RoutedEdge[] | undefined;

  constructor(host: ReactiveControllerHost, config: GraphLayoutConfig = {}) {
    this.host = host;
    this.enableAnimation = config.enableAnimation ?? true;

    // Initialize layout controller (D3 handles physics/animation)
    this.layoutController = new LayoutController(host);
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Compute layout - ELK runs asynchronously
   */
  async computeLayout(nodes: GraphNode[], edges: GraphEdge[]): Promise<void> {
    if (nodes.length === 0) {
      this._nodePositions = new Map();
      this._clusterPositions = new Map();
      this._clusters = [];
      this._cycleNodes = undefined;
      this._nodeSccId = undefined;
      this._sccSizes = undefined;
      this._clusterEdges = undefined;
      this._routedEdges = undefined;
      return;
    }

    // ELK layout runs asynchronously
    const layout = await this.layoutController.computeLayout(nodes, edges);

    this._clusters = layout.clusters;
    this._nodePositions = layout.nodePositions;
    this._clusterPositions = layout.clusterPositions;
    this._cycleNodes = layout.cycleNodes;
    this._nodeSccId = layout.nodeSccId;
    this._sccSizes = layout.sccSizes;
    this._clusterEdges = layout.clusterEdges;
    this._routedEdges = layout.routedEdges;

    this.host.requestUpdate();
  }

  /**
   * Stop animation - no-op (D3 runs synchronously)
   */
  stopAnimation(): void {
    // No-op
  }

  /**
   * Get animation progress - always complete
   */
  getProgress(): number {
    return 1;
  }

  /**
   * Check if animation is active - always false
   */
  isAnimationActive(): boolean {
    return false;
  }

  // ========================================
  // Configuration
  // ========================================

  setEnableAnimation(enabled: boolean): void {
    this.enableAnimation = enabled;
    // Ignored - animation always disabled with D3
  }

  setAnimationTicks(_ticks: number): void {
    // No-op
  }

  setNodeCollisionStrength(_strength: number): void {
    // No-op - D3 handles collision
  }

  setClusterCollisionStrength(_strength: number): void {
    // No-op - D3 handles collision
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {
    // Sub-controllers handle their own lifecycle
  }

  hostDisconnected(): void {
    // No cleanup needed - D3 runs synchronously
  }
}
