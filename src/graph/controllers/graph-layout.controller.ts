/** Default layout controller for graph layout computation. */

import type { LayoutOptions } from '@graph/layout/config';
import type { RoutedEdge } from '@graph/layout/types';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { LayoutController } from './layout.controller';

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

    this.layoutController = new LayoutController(host);
    host.addController(this);
  }

  /**
   * Compute layout - ELK runs asynchronously
   */
  async computeLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    layoutOptions?: LayoutOptions,
  ): Promise<void> {
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
    const layout = await this.layoutController.computeLayout(nodes, edges, layoutOptions);

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

  /** Sets whether layout animation is enabled. */
  setEnableAnimation(enabled: boolean): void {
    this.enableAnimation = enabled;
  }

  hostConnected(): void {
    // Sub-controllers handle their own lifecycle
  }

  hostDisconnected(): void {
    // ELK runs via Promise; no persistent handles to clean up.
  }
}
