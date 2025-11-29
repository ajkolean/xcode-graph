/**
 * Animation Controller - Physics-based animation loop orchestration
 *
 * Orchestrates physics-based animation loop using requestAnimationFrame.
 * Separated from layout and physics for single responsibility compliance.
 *
 * **Responsibilities:**
 * - Animation timing and tick management
 * - RequestAnimationFrame loop coordination
 * - Alpha decay calculation (force strength over time)
 * - Position updates and velocity damping
 * - Animation lifecycle management (start/stop)
 *
 * **Usage:**
 * Used by GraphLayoutController to animate layout settling after
 * initial position computation.
 *
 * @module controllers/animation
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.schema';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { updatePositions } from '../utils/physics/collision';
import type { PhysicsController } from './physics.controller';

// ==================== Type Definitions ====================

/**
 * Animation configuration options
 */
export interface AnimationConfig {
  totalTicks?: number;
  damping?: number;
  autoStart?: boolean;
}

/**
 * Callbacks for animation progress tracking
 */
export interface AnimationCallbacks {
  /** Called on each animation frame with tick count and alpha */
  onTick?: (tickCount: number, alpha: number) => void;
  /** Called when animation completes */
  onComplete?: () => void;
}

// ==================== Controller Class ====================

/**
 * Reactive controller for physics-based animation
 *
 * Manages requestAnimationFrame loop with configurable tick count and damping.
 * Uses alpha decay for gradual force reduction over animation duration.
 */
export class AnimationController implements ReactiveController {
  private host: ReactiveControllerHost;

  // Configuration
  private totalTicks: number;
  private damping: number;

  // Animation state
  private animationId: number | null = null;
  private tickCount = 0;
  private isAnimating = false;

  // Callbacks
  private callbacks: AnimationCallbacks = {};

  constructor(host: ReactiveControllerHost, config: AnimationConfig = {}) {
    this.host = host;
    this.totalTicks = config.totalTicks ?? 30;
    this.damping = config.damping ?? 0.7;
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Start physics animation
   *
   * @param nodePositions - Node positions to animate (mutated in place)
   * @param clusterPositions - Cluster positions to animate (mutated in place)
   * @param edges - Graph edges for link forces
   * @param clusters - Clusters for collision detection
   * @param physicsController - Physics controller to apply forces
   * @param callbacks - Optional callbacks for progress tracking
   */
  startAnimation(
    nodePositions: Map<string, NodePosition>,
    clusterPositions: Map<string, ClusterPosition>,
    edges: GraphEdge[],
    clusters: Cluster[],
    physicsController: PhysicsController,
    callbacks: AnimationCallbacks = {},
  ): void {
    this.stop();
    this.callbacks = callbacks;
    this.isAnimating = true;
    this.tickCount = 0;

    const animate = () => {
      if (this.tickCount >= this.totalTicks || !this.isAnimating) {
        this.completeAnimation(nodePositions, clusterPositions);
        return;
      }

      // Calculate alpha (strength decay over time)
      const alpha = this.calculateAlpha();

      // Apply physics forces
      physicsController.applyForces(nodePositions, clusterPositions, edges, clusters, alpha);

      // Update positions based on velocities
      this.updateAllPositions(nodePositions, clusterPositions, alpha);

      this.tickCount++;

      // Callback for progress tracking
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.tickCount, alpha);
      }

      // Request UI update
      this.host.requestUpdate();

      // Continue animation
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
    this.tickCount = 0;
  }

  /**
   * Check if currently animating
   */
  get isActive(): boolean {
    return this.isAnimating;
  }

  /**
   * Get current tick count
   */
  get currentTick(): number {
    return this.tickCount;
  }

  /**
   * Get total ticks
   */
  get maxTicks(): number {
    return this.totalTicks;
  }

  /**
   * Get animation progress (0-1)
   */
  get progress(): number {
    return this.totalTicks > 0 ? this.tickCount / this.totalTicks : 0;
  }

  // ========================================
  // Configuration
  // ========================================

  setTotalTicks(ticks: number): void {
    this.totalTicks = Math.max(1, ticks);
  }

  setDamping(damping: number): void {
    this.damping = Math.max(0, Math.min(1, damping));
  }

  // ========================================
  // Private Helpers
  // ========================================

  private calculateAlpha(): number {
    // Linear decay from 1 to 0
    return 1 - this.tickCount / this.totalTicks;
  }

  private updateAllPositions(
    nodePositions: Map<string, NodePosition>,
    clusterPositions: Map<string, ClusterPosition>,
    alpha: number,
  ): void {
    // Update node positions
    const nodes = Array.from(nodePositions.values());
    updatePositions(nodes, alpha, this.damping);

    // Update cluster positions
    const clusters = Array.from(clusterPositions.values());
    updatePositions(clusters, alpha, this.damping);
  }

  private completeAnimation(
    nodePositions: Map<string, NodePosition>,
    clusterPositions: Map<string, ClusterPosition>,
  ): void {
    this.isAnimating = false;

    // Zero out all velocities
    nodePositions.forEach((pos) => {
      pos.vx = 0;
      pos.vy = 0;
    });
    clusterPositions.forEach((pos) => {
      pos.vx = 0;
      pos.vy = 0;
    });

    // Final update
    this.host.requestUpdate();

    // Callback
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {
    // Required by ReactiveControllerHost interface - no initialization needed
  }

  hostDisconnected(): void {
    try {
      this.stop();
    } catch (error) {
      console.error('[AnimationController] Error during cleanup:', error);
      // Force cleanup
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.isAnimating = false;
    }
  }
}
