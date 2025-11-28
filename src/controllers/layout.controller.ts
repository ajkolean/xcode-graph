/**
 * LayoutController
 *
 * Handles deterministic layout computation only.
 * Separated from physics and animation for single responsibility.
 *
 * Responsibilities:
 * - Cluster grouping and analysis
 * - Deterministic position calculation
 * - Initial layout state preparation
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import { analyzeCluster } from '@/utils/clusterAnalysis';
import { groupIntoClusters } from '@/utils/clusterGrouping';
import { computeHierarchicalLayout } from '@/utils/hierarchicalLayout';

export interface LayoutResult {
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  clusters: Cluster[];
}

export class LayoutController implements ReactiveController {
  private host: ReactiveControllerHost;

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
