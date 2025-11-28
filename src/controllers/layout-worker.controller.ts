/**
 * LayoutWorkerController
 *
 * Uses Web Worker for non-blocking layout computation.
 * Offloads heavy calculations to separate thread for smooth UI.
 *
 * Benefits:
 * - Main thread never blocks during layout
 * - Animations run smoothly even with large graphs
 * - Better user experience with complex graphs
 */

import { type Remote, wrap } from 'comlink';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import type { LayoutProgress, LayoutWorkerAPI } from '@/workers/layout-api';

export interface LayoutWorkerConfig {
  enableAnimation?: boolean;
  animationTicks?: number;
  useWorker?: boolean; // Allow fallback to main thread
}

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
      // Fallback to main thread (use existing AnimatedLayoutController logic)
      throw new Error('Main thread fallback not implemented in this controller');
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
