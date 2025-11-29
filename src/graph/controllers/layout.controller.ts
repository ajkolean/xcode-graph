/**
 * Layout Controller - Deterministic graph layout computation
 *
 * Handles deterministic layout computation only, separated from physics
 * and animation for single responsibility principle compliance.
 *
 * **Responsibilities:**
 * - Cluster grouping and analysis
 * - Deterministic position calculation
 * - Initial layout state preparation
 *
 * **Architecture:**
 * This controller only computes static positions. Physics and animation
 * are handled by separate controllers (PhysicsController, AnimationController).
 *
 * @module controllers/layout
 */

import { analyzeCluster } from '@graph/layout/cluster-analysis';
import { groupIntoClusters } from '@graph/layout/cluster-grouping';
import { computeHierarchicalLayout } from '@graph/layout/hierarchical';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

// ==================== Type Definitions ====================

/**
 * Result of layout computation
 */
export interface LayoutResult {
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  clusters: Cluster[];
}

// ==================== Controller Class ====================

/**
 * Reactive controller for deterministic graph layout
 *
 * Computes cluster-based hierarchical layouts with caching for performance.
 * Positions are initialized with zero velocity for physics simulation.
 */
export class LayoutController implements ReactiveController {
  // Cached layout result
  private cachedResult: LayoutResult | null = null;
  private cachedNodes: GraphNode[] = [];
  private cachedEdges: GraphEdge[] = [];

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Compute deterministic layout positions
   * Returns positions with velocities initialized to 0
   *
   * @param nodes - All graph nodes
   * @param edges - All graph edges
   * @param forceRecompute - Force recomputation even if cached
   * @returns Layout result with positions and clusters
   */
  computeLayout(nodes: GraphNode[], edges: GraphEdge[], forceRecompute = false): LayoutResult {
    // Return cached result if inputs haven't changed
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

    // Step 1: Group nodes into clusters
    const analyzedClusters = groupIntoClusters(nodes, edges);

    // Step 2: Analyze each cluster for metadata
    analyzedClusters.forEach((cluster) => {
      analyzeCluster(cluster, edges);
    });

    // Step 3: Compute hierarchical layout positions
    const {
      clusterPositions: initialClusterPos,
      nodePositions: initialNodePos,
      clusters: layoutClusters,
    } = computeHierarchicalLayout(nodes, edges, analyzedClusters);

    // Step 4: Add velocity properties for physics simulation
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
    };

    this.cacheResult(result, nodes, edges);
    return result;
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

  // ========================================
  // Private Helpers
  // ========================================

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

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {}

  hostDisconnected(): void {
    this.clearCache();
  }
}
