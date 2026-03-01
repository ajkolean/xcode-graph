/**
 * Layout Worker Controller
 *
 * Lit reactive controller that wraps a Comlink web worker for off-main-thread
 * layout computation. Manages the worker lifecycle (create on connect,
 * terminate on disconnect) and provides the same interface as LayoutController.
 *
 * @module controllers/layout-worker
 */

import type { LayoutOptions } from '@graph/layout/config';
import type { RoutedEdge } from '@graph/layout/types';
import type {
  LayoutWorkerRemoteAPI,
  SerializedCluster,
  SerializedLayoutResult,
} from '@graph/workers/layout.worker';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import * as Comlink from 'comlink';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Result of layout computation (same shape as LayoutController.LayoutResult)
 */
export interface LayoutResult {
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  clusters: Cluster[];
  clusterEdges?: { source: string; target: string; weight: number }[] | undefined;
  routedEdges?: RoutedEdge[] | undefined;
  cycleNodes?: Set<string> | undefined;
  nodeSccId?: Map<string, number> | undefined;
  sccSizes?: Map<number, number> | undefined;
}

/**
 * Serialize clusters for transfer to worker (convert Maps to arrays).
 */
function serializeClusters(clusters: Cluster[]): SerializedCluster[] {
  return clusters.map((c) => ({
    ...c,
    metadata: Array.from(c.metadata.entries()),
  }));
}

/**
 * Deserialize the layout result from worker (convert arrays back to Maps).
 */
function deserializeResult(serialized: SerializedLayoutResult): LayoutResult {
  return {
    nodePositions: new Map(serialized.nodePositions),
    clusterPositions: new Map(serialized.clusterPositions),
    clusters: serialized.clusters.map((sc) => ({
      ...sc,
      metadata: new Map(sc.metadata),
    })) as Cluster[],
    clusterEdges: serialized.clusterEdges,
    routedEdges: serialized.routedEdges,
    cycleNodes: serialized.cycleNodes ? new Set(serialized.cycleNodes) : undefined,
    nodeSccId: serialized.nodeSccId ? new Map(serialized.nodeSccId) : undefined,
    sccSizes: serialized.sccSizes ? new Map(serialized.sccSizes) : undefined,
  };
}

/**
 * Reactive controller for off-main-thread graph layout via Comlink.
 *
 * Delegates the full layout pipeline (cluster grouping, micro/macro layout,
 * force massage, port routing) to a web worker. Provides caching identical
 * to the main-thread LayoutController.
 */
export class LayoutWorkerController implements ReactiveController {
  private host: ReactiveControllerHost;

  private worker: Worker | null = null;
  private remote: Comlink.Remote<LayoutWorkerRemoteAPI> | null = null;

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
   * Compute layout using the web worker.
   *
   * The layout pipeline runs entirely off the main thread:
   * cluster grouping -> micro layout -> macro layout -> force massage -> port routing
   *
   * @param nodes - All graph nodes
   * @param edges - All graph edges
   * @param clusters - Pre-grouped clusters
   * @param opts - Layout options
   * @param forceRecompute - Force recomputation even if cached
   * @returns Layout result with positions and clusters
   */
  async computeLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    clusters: Cluster[],
    opts?: LayoutOptions,
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

    this.ensureWorker();

    if (!this.remote) {
      throw new Error('Layout worker failed to initialize');
    }

    this.isComputing = true;
    this.host.requestUpdate();

    try {
      const serializedClusters = serializeClusters(clusters);
      const serializedResult = await this.remote.computeLayout(
        nodes,
        edges,
        serializedClusters,
        opts,
      );

      const result = deserializeResult(serializedResult);

      // Match LayoutController's velocity initialization
      for (const [id, pos] of result.nodePositions) {
        result.nodePositions.set(id, { ...pos, vx: 0, vy: 0 });
      }
      for (const [id, pos] of result.clusterPositions) {
        result.clusterPositions.set(id, { ...pos, vx: 0, vy: 0 });
      }

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

  /**
   * Terminate the worker and release resources.
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.remote = null;
    }
  }

  private ensureWorker(): void {
    if (this.worker) return;

    this.worker = new Worker(new URL('../workers/layout.worker.ts', import.meta.url), {
      type: 'module',
    });
    this.remote = Comlink.wrap<LayoutWorkerRemoteAPI>(this.worker);
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
    // Worker is lazily created on first computeLayout call
  }

  hostDisconnected(): void {
    this.terminate();
    this.clearCache();
  }
}
