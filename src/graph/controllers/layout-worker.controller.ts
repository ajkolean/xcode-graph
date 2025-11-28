/**
 * Layout Worker Controller - Web Worker-based layout computation
 *
 * Alternative to {@link GraphLayoutController} that offloads layout computation
 * to a Web Worker thread. Use this for performance-critical scenarios with
 * large graphs where main thread blocking would be noticeable.
 *
 * ## When to Use This Controller
 *
 * **Use LayoutWorkerController when:**
 * - Graph has 1000+ nodes where layout computation takes >100ms
 * - UI responsiveness is critical during layout (e.g., drag interactions)
 * - You need progress callbacks during animated layout
 *
 * **Use {@link GraphLayoutController} instead when:**
 * - Graph has <1000 nodes (most use cases)
 * - You don't need progress updates during computation
 * - Simpler API is preferred
 *
 * ## Benefits
 * - Main thread never blocks during layout
 * - Animations run smoothly even with large graphs
 * - Progress callbacks for animated layout
 *
 * ## Architecture
 * Uses Comlink for type-safe worker communication.
 * Falls back to error state if worker initialization fails.
 *
 * @module controllers/layout-worker
 * @see {@link GraphLayoutController} - Default/recommended controller for most use cases
 */

import type { LayoutProgress, LayoutWorkerAPI } from '@graph/workers/layout-api';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { type Remote, wrap } from 'comlink';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

// ==================== Type Definitions ====================

/**
 * Configuration for worker-based layout computation
 */
export interface LayoutWorkerConfig {
  enableAnimation?: boolean;
  animationTicks?: number;
  useWorker?: boolean; // Allow fallback to main thread
}

// ==================== Controller Class ====================

/**
 * Reactive controller for Web Worker-based layout
 *
 * Computes graph layout in a separate thread to avoid blocking the UI.
 * Supports progress callbacks during animated layout computation.
 */
export class LayoutWorkerController implements ReactiveController {
  private host: ReactiveControllerHost;

  // Configuration
  enableAnimation: boolean;
  animationTicks: number;
  useWorker: boolean;

  // State
  nodePositions = new Map<string, NodePosition>();
  clusterPositions = new Map<string, ClusterPosition>();
  clusters: Cluster[] = [];
  isSettling = false;

  // Worker
  private worker: Worker | null = null;
  private workerAPI: Remote<LayoutWorkerAPI> | null = null;

  constructor(host: ReactiveControllerHost, config: LayoutWorkerConfig = {}) {
    this.host = host;
    this.enableAnimation = config.enableAnimation ?? true;
    this.animationTicks = config.animationTicks ?? 30;
    this.useWorker = config.useWorker ?? true;
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  async computeLayout(nodes: GraphNode[], edges: GraphEdge[]) {
    if (nodes.length === 0) {
      this.nodePositions = new Map();
      this.clusterPositions = new Map();
      this.clusters = [];
      return;
    }

    if (!this.useWorker) {
      // Fallback to main thread (use GraphLayoutController instead)
      throw new Error('Main thread fallback not implemented - use GraphLayoutController');
    }

    try {
      // Initialize worker if not already created
      if (!this.worker) {
        await this.initializeWorker();
      }

      if (!this.workerAPI) {
        throw new Error('Worker failed to initialize');
      }

      // Run layout computation in worker
      if (!this.enableAnimation) {
        const result = await this.workerAPI.computeInitialLayout({
          nodes,
          edges,
          enableAnimation: false,
        });

        this.nodePositions = result.nodePositions;
        this.clusterPositions = result.clusterPositions;
        this.clusters = result.clusters;
        this.isSettling = false;
        this.host.requestUpdate();
      } else {
        this.isSettling = true;
        const result = await this.workerAPI.computeAnimatedLayout(
          {
            nodes,
            edges,
            enableAnimation: true,
            animationTicks: this.animationTicks,
          },
          (progress: LayoutProgress) => {
            // Update on each animation frame
            if (progress.nodePositions && progress.clusterPositions) {
              this.nodePositions = progress.nodePositions;
              this.clusterPositions = progress.clusterPositions;
              this.host.requestUpdate();
            }

            if (progress.type === 'complete') {
              this.isSettling = false;
            }
          },
        );

        this.nodePositions = result.nodePositions;
        this.clusterPositions = result.clusterPositions;
        this.clusters = result.clusters;
        this.isSettling = false;
        this.host.requestUpdate();
      }
    } catch (error) {
      console.error('[LayoutWorkerController] Error computing layout:', error);
      // Fallback to empty state
      this.nodePositions = new Map();
      this.clusterPositions = new Map();
      this.clusters = [];
      this.isSettling = false;
      this.host.requestUpdate();
    }
  }

  async stopAnimation() {
    if (this.workerAPI) {
      await this.workerAPI.cancelAnimation();
    }
    this.isSettling = false;
  }

  // ========================================
  // Worker Management
  // ========================================

  private async initializeWorker() {
    try {
      // Create worker using Vite's worker import
      this.worker = new Worker(new URL('../workers/layout.worker.ts', import.meta.url), {
        type: 'module',
      });

      // Wrap worker with Comlink for type-safe communication
      this.workerAPI = wrap<LayoutWorkerAPI>(this.worker);

      console.log('[LayoutWorkerController] Worker initialized');
    } catch (error) {
      console.error('[LayoutWorkerController] Failed to initialize worker:', error);
      this.useWorker = false; // Disable worker on error
    }
  }

  private terminateWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerAPI = null;
      console.log('[LayoutWorkerController] Worker terminated');
    }
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {
    // Worker initialization is lazy (happens on first computeLayout call)
  }

  hostDisconnected(): void {
    try {
      this.stopAnimation();
      this.terminateWorker();
    } catch (error) {
      console.error('[LayoutWorkerController] Error during cleanup:', error);
      // Force cleanup
      if (this.worker) {
        try {
          this.worker.terminate();
        } catch {
          // Silent fail on terminate
        }
        this.worker = null;
        this.workerAPI = null;
      }
    }
  }
}
