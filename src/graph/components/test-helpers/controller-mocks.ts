/**
 * Controller Mocks for Testing
 *
 * Mock implementations of graph controllers for isolated component testing.
 * Allows testing components without heavy controller dependencies.
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.schema';
import { type GraphEdge, type GraphNode, Origin } from '@shared/schemas/graph.schema';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphInteractionConfig } from '../../../graph/controllers/graph-interaction-full.controller';
import type { GraphLayoutConfig } from '../../../graph/controllers/graph-layout.controller';

/**
 * Mock Graph Layout Controller
 */
export class MockGraphLayoutController implements ReactiveController {
  host: ReactiveControllerHost;
  enableAnimation: boolean;
  nodePositions: Map<string, NodePosition> = new Map();
  clusterPositions: Map<string, ClusterPosition> = new Map();
  clusters: Cluster[] = [];
  isSettling = false;

  // Track method calls for testing
  computeLayoutCalls: Array<{ nodes: GraphNode[]; edges: GraphEdge[] }> = [];
  stopAnimationCalls = 0;

  constructor(host: ReactiveControllerHost, config: GraphLayoutConfig = {}) {
    this.host = host;
    this.enableAnimation = config.enableAnimation ?? false;
    host.addController(this);
  }

  hostConnected(): void {
    // Mock lifecycle
  }

  hostDisconnected(): void {
    // Mock lifecycle
  }

  /**
   * Mock layout computation - just creates simple positions
   */
  computeLayout(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.computeLayoutCalls.push({ nodes, edges });

    // Create simple grid positions
    this.nodePositions.clear();
    nodes.forEach((node, index) => {
      this.nodePositions.set(node.id, {
        id: node.id,
        clusterId: node.project || 'External',
        x: 100 + (index % 5) * 100,
        y: 100 + Math.floor(index / 5) * 100,
        radius: 24,
        vx: 0,
        vy: 0,
      });
    });

    // Create cluster positions
    const clusterMap = new Map<string, GraphNode[]>();
    nodes.forEach((node) => {
      const clusterId = node.project || 'External';
      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, []);
      }
      clusterMap.get(clusterId)!.push(node);
    });

    this.clusters = Array.from(clusterMap.entries()).map(([id, clusterNodes]) => ({
      id,
      name: id,
      type: ClusterType.Project,
      origin: Origin.Local,
      nodeIds: clusterNodes.map((n) => n.id),
      nodes: clusterNodes,
      anchors: [],
      metadata: new Map(),
    }));

    this.clusterPositions.clear();
    this.clusters.forEach((cluster, index) => {
      this.clusterPositions.set(cluster.id, {
        id: cluster.id,
        x: index * 300,
        y: index * 250,
        width: 280,
        height: 230,
        vx: 0,
        vy: 0,
        nodeCount: cluster.nodes.length,
      });
    });

    this.host.requestUpdate();
  }

  /**
   * Mock animation stop
   */
  stopAnimation(): void {
    this.stopAnimationCalls++;
    this.isSettling = false;
  }

  /**
   * Set mock positions (for testing)
   */
  setNodePositions(positions: Map<string, NodePosition>): void {
    this.nodePositions = positions;
  }

  /**
   * Set mock cluster positions (for testing)
   */
  setClusterPositions(positions: Map<string, ClusterPosition>): void {
    this.clusterPositions = positions;
  }

  /**
   * Set mock clusters (for testing)
   */
  setClusters(clusters: Cluster[]): void {
    this.clusters = clusters;
  }
}

/**
 * Mock Graph Interaction Controller
 */
export class MockGraphInteractionController implements ReactiveController {
  host: ReactiveControllerHost;
  zoom: number;
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;

  pan = { x: 400, y: 300 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  draggedNode: string | null = null;
  manualNodePositions: Map<string, { x: number; y: number }> = new Map<
    string,
    { x: number; y: number }
  >();
  hasMoved = false;

  private svgElement: SVGSVGElement | null = null;

  // Track method calls for testing
  updateConfigCalls: Array<Partial<GraphInteractionConfig>> = [];
  setSvgElementCalls = 0;
  handleMouseDownCalls = 0;
  handleMouseMoveCalls = 0;
  handleMouseUpCalls = 0;
  handleNodeMouseDownCalls: Array<{ nodeId: string }> = [];

  constructor(host: ReactiveControllerHost, config: GraphInteractionConfig) {
    this.host = host;
    this.zoom = config.zoom;
    this.finalNodePositions = config.finalNodePositions;
    this.clusterPositions = config.clusterPositions;
    host.addController(this);
  }

  hostConnected(): void {
    // Mock lifecycle
  }

  hostDisconnected(): void {
    // Mock lifecycle
  }

  setSvgElement(element: SVGSVGElement): void {
    this.svgElement = element;
    this.setSvgElementCalls++;
  }

  hasSvgElement(): boolean {
    return this.svgElement !== null;
  }

  updateConfig(config: Partial<GraphInteractionConfig>): void {
    this.updateConfigCalls.push(config);
    if (config.zoom !== undefined) this.zoom = config.zoom;
    if (config.finalNodePositions) this.finalNodePositions = config.finalNodePositions;
    if (config.clusterPositions) this.clusterPositions = config.clusterPositions;
  }

  handleMouseDown = (_e: MouseEvent): void => {
    this.handleMouseDownCalls++;
    this.isDragging = true;
    this.hasMoved = false;
  };

  handleMouseMove = (_e: MouseEvent): void => {
    this.handleMouseMoveCalls++;
    if (this.isDragging) {
      this.hasMoved = true;
    }
  };

  handleMouseUp = (): void => {
    this.handleMouseUpCalls++;
    this.isDragging = false;
    this.draggedNode = null;
  };

  handleNodeMouseDown(nodeId: string, _e: MouseEvent): void {
    this.handleNodeMouseDownCalls.push({ nodeId });
    this.draggedNode = nodeId;
  }

  /**
   * Set mock pan (for testing)
   */
  setPan(x: number, y: number): void {
    this.pan = { x, y };
  }

  /**
   * Set mock dragging state (for testing)
   */
  setDragging(isDragging: boolean): void {
    this.isDragging = isDragging;
  }
}

/**
 * Create a mock host for controller testing
 */
export class MockReactiveHost implements ReactiveControllerHost {
  controllers: ReactiveController[] = [];
  updateRequests = 0;

  addController(controller: ReactiveController): void {
    this.controllers.push(controller);
    controller.hostConnected?.();
  }

  removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);
    if (index !== -1) {
      this.controllers.splice(index, 1);
      controller.hostDisconnected?.();
    }
  }

  requestUpdate(): void {
    this.updateRequests++;
  }

  updateComplete: Promise<boolean> = Promise.resolve(true);

  /**
   * Reset counters for testing
   */
  reset(): void {
    this.updateRequests = 0;
  }
}
