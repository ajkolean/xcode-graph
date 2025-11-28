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

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphEdge, GraphNode } from '../schemas/graph.schema';
import type { Cluster } from '../schemas';
import type { ClusterPosition, NodePosition } from '../schemas';
import { AnimationController } from './animation.controller';
import { LayoutController } from './layout.controller';
import { PhysicsController } from './physics.controller';

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
  private host: ReactiveControllerHost;

  // Sub-controllers (single responsibility)
  private layoutController: LayoutController;
  private physicsController: PhysicsController;
  private animationController: AnimationController;

  // Configuration
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
    return this.animationController.isActive;
  }

  private _nodePositions = new Map<string, NodePosition>();
  private _clusterPositions = new Map<string, ClusterPosition>();
  private _clusters: Cluster[] = [];

  constructor(host: ReactiveControllerHost, config: GraphLayoutConfig = {}) {
    this.host = host;
    this.enableAnimation = config.enableAnimation ?? true;

    // Initialize sub-controllers
    this.layoutController = new LayoutController(host);
    this.physicsController = new PhysicsController(host, {
      nodeCollisionStrength: config.nodeCollisionStrength,
      clusterCollisionStrength: config.clusterCollisionStrength,
    });
    this.animationController = new AnimationController(host, {
      totalTicks: config.animationTicks ?? 30,
    });

    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Compute layout with optional animation
   */
  computeLayout(nodes: GraphNode[], edges: GraphEdge[]): void {
    if (nodes.length === 0) {
      this._nodePositions = new Map();
      this._clusterPositions = new Map();
      this._clusters = [];
      return;
    }

    // Step 1: Compute deterministic layout (LayoutController)
    const layout = this.layoutController.computeLayout(nodes, edges);

    this._clusters = layout.clusters;

    // If animation disabled, use positions directly
    if (!this.enableAnimation) {
      this._nodePositions = layout.nodePositions;
      this._clusterPositions = layout.clusterPositions;
      this.host.requestUpdate();
      return;
    }

    // Step 2: Start physics animation (AnimationController + PhysicsController)
    this.animationController.startAnimation(
      layout.nodePositions,
      layout.clusterPositions,
      edges,
      layout.clusters,
      this.physicsController,
      {
        onTick: () => {
          // Positions are mutated in place by AnimationController
          // We just need to ensure our references are up to date (though they shouldn't change)
          this._nodePositions = layout.nodePositions;
          this._clusterPositions = layout.clusterPositions;
        },
        onComplete: () => {
          this._nodePositions = layout.nodePositions;
          this._clusterPositions = layout.clusterPositions;
        },
      },
    );
  }

  /**
   * Stop ongoing animation
   */
  stopAnimation(): void {
    this.animationController.stop();
  }

  /**
   * Get animation progress (0-1)
   */
  getProgress(): number {
    return this.animationController.progress;
  }

  /**
   * Check if animation is active
   */
  isAnimationActive(): boolean {
    return this.animationController.isActive;
  }

  // ========================================
  // Configuration
  // ========================================

  setEnableAnimation(enabled: boolean): void {
    this.enableAnimation = enabled;
  }

  setAnimationTicks(ticks: number): void {
    this.animationController.setTotalTicks(ticks);
  }

  setNodeCollisionStrength(strength: number): void {
    this.physicsController.setNodeCollisionStrength(strength);
  }

  setClusterCollisionStrength(strength: number): void {
    this.physicsController.setClusterCollisionStrength(strength);
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {
    // Sub-controllers handle their own lifecycle
  }

  hostDisconnected(): void {
    try {
      this.stopAnimation();
    } catch (error) {
      console.error('[GraphLayoutController] Error during cleanup:', error);
      // Force stop
      this.animationController.stop();
    }
  }
}
