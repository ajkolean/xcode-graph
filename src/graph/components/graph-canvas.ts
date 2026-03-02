import { AnimationLoopController } from '@graph/controllers/animation-loop.controller';
import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { TransitiveResult } from '@graph/utils';
import {
  type AnimatedValue,
  setAnimatedTarget,
  tickAnimationMap,
} from '@graph/utils/canvas-animation';
import { resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import { type CanvasTheme, resolveCanvasTheme } from '@graph/utils/canvas-theme';
import { getConnectedNodes } from '@graph/utils/connections';
import { IntersectionController } from '@lit-labs/observers/intersection-controller.js';
import { ResizeController } from '@lit-labs/observers/resize-controller.js';
import { ErrorCategory, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { setBaseZoom } from '@shared/signals/index';
import { ZOOM_CONFIG } from '@shared/utils/zoom-config';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { computeNodeWeights, getNodeSize } from '@ui/utils/sizing';
import { calculateViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ErrorService } from '@/services/error-service';
import { renderClusters } from './canvas/canvas-cluster-renderer';
import { renderEdges } from './canvas/canvas-edge-renderer';
import {
  type CanvasEventMap,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  type InteractionContext,
  type InteractionState,
} from './canvas/canvas-interaction-handler';
import { renderNodes } from './canvas/canvas-node-renderer';
import { renderClusterTooltip, renderNodeTooltip } from './canvas/canvas-tooltip-renderer';
import './graph-hidden-dom';

/**
 * Canvas-based graph visualization component. Renders nodes, edges, and clusters
 * on an HTML canvas with pan, zoom, and interactive selection support.
 *
 * @summary Canvas-based interactive graph visualization
 * @fires node-select - Dispatched when a node is selected or deselected (detail: { node })
 * @fires node-hover - Dispatched when a node is hovered (detail: { nodeId })
 * @fires cluster-select - Dispatched when a cluster is selected or deselected (detail: { clusterId })
 * @fires cluster-hover - Dispatched when a cluster is hovered (detail: { clusterId })
 * @fires zoom-change - Dispatched when the zoom level changes (detail: number)
 * @fires zoom-in - Dispatched when zoom in is requested via keyboard
 * @fires zoom-out - Dispatched when zoom out is requested via keyboard
 * @fires zoom-reset - Dispatched when zoom reset is requested via keyboard
 */
@customElement('xcode-graph-canvas')
export class GraphCanvas extends LitElement {
  /** Graph nodes to render */
  @property({ attribute: false })
  declare nodes: GraphNode[];

  /** Graph edges to render */
  @property({ attribute: false })
  declare edges: GraphEdge[];

  /** Currently selected node (highlighted with ring and connected edges) */
  @property({ attribute: false })
  declare selectedNode: GraphNode | null;

  /** Currently selected cluster ID (dims non-member nodes) */
  @property({ attribute: false })
  declare selectedCluster: string | null;

  /** Currently hovered node ID (shows tooltip) */
  @property({ attribute: false })
  declare hoveredNode: string | null;

  /** Active search query for dimming non-matching nodes */
  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string;

  /** Display mode affecting edge visibility */
  @property({ type: String, attribute: 'view-mode' })
  declare viewMode: ViewMode;

  /** Current zoom level (affects color saturation and label visibility) */
  @property({ type: Number })
  declare zoom: number;

  /** Whether physics animation is enabled for layout settling */
  @property({ type: Boolean, attribute: 'enable-animation' })
  declare enableAnimation: boolean;

  /** Transitive dependency chain for the selected node */
  @property({ attribute: false })
  declare transitiveDeps: TransitiveResult | undefined;

  /** Transitive dependent chain for the selected node */
  @property({ attribute: false })
  declare transitiveDependents: TransitiveResult | undefined;

  /** Active filter preview (dims non-matching nodes on hover) */
  @property({ attribute: false })
  declare previewFilter: PreviewFilter | undefined;

  /** Whether to highlight direct dependency edges */
  @property({ type: Boolean, attribute: 'show-direct-deps' })
  declare showDirectDeps: boolean;

  /** Whether to highlight transitive dependency edges */
  @property({ type: Boolean, attribute: 'show-transitive-deps' })
  declare showTransitiveDeps: boolean;

  /** Whether to highlight direct dependent edges */
  @property({ type: Boolean, attribute: 'show-direct-dependents' })
  declare showDirectDependents: boolean;

  /** Whether to highlight transitive dependent edges */
  @property({ type: Boolean, attribute: 'show-transitive-dependents' })
  declare showTransitiveDependents: boolean;

  /** Set of node IDs that should be visually dimmed */
  @property({ attribute: false })
  declare dimmedNodeIds: Set<string>;

  @query('canvas')
  private declare canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | undefined;

  private readonly layout = new GraphLayoutController(this, {
    enableAnimation: false,
    animationTicks: 30,
  });

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Lit ResizeController lifecycle manages this
  private readonly _resize = new ResizeController(this, {
    callback: () => this.resizeCanvas(),
  });

  private readonly _visibility = new IntersectionController(this, {
    callback: (entries) => entries.some((e) => e.isIntersecting),
  });

  // Interaction state (shared with interaction handler)
  private interactionState: InteractionState = {
    pan: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    zoom: 1,
    isDragging: false,
    draggedNodeId: null,
    draggedClusterId: null,
    lastMousePos: { x: 0, y: 0 },
    clickedEmptySpace: false,
    hasMoved: false,
    hoveredNode: null,
    hoveredCluster: null,
  };

  private manualNodePositions = new Map<string, { x: number; y: number }>();
  private manualClusterPositions = new Map<string, { x: number; y: number }>();
  private pathCache = new Map<string, Path2D>();
  private edgePathCache = new Map<string, Path2D>();
  private nodeWeights = new Map<string, number>();
  private nodeMap = new Map<string, GraphNode>();
  private connectedNodesCache: { nodeId: string; result: Set<string> } | null = null;
  private routedEdgeMapCache: Map<string, RoutedEdge> | null = null;
  private lastRoutedEdgesRef: RoutedEdge[] | undefined = undefined;
  private theme: CanvasTheme | undefined;

  // Animation & Render State
  private readonly animationLoop = new AnimationLoopController(this, {
    onRender: (timestamp, dt) => this.onFrame(timestamp, dt),
    shouldAnimate: () => this.isAnimating,
    isVisible: () => this._visibility.value !== false,
  });
  private time = 0;
  private didInitialFit = false;
  private isAnimating = false;

  // Smooth opacity transitions for selection/deselection
  private nodeAlphaMap = new Map<string, AnimatedValue>();

  // Fade-out animation for removed nodes
  private fadingOutNodes = new Map<string, { node: GraphNode; startTime: number }>();
  private static readonly FADE_OUT_DURATION = 250;

  constructor() {
    super();
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.selectedCluster = null;
    this.hoveredNode = null;
    this.searchQuery = '';
    this.viewMode = ViewMode.Full;
    this.zoom = 1;
    this.enableAnimation = false;
    this.showDirectDeps = false;
    this.showTransitiveDeps = false;
    this.showDirectDependents = false;
    this.showTransitiveDependents = false;
    this.dimmedNodeIds = new Set();
  }

  static override styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
      cursor: grab;
    }

    canvas:active {
      cursor: grabbing;
    }
  `;

  override firstUpdated(): void {
    this.theme = resolveCanvasTheme(this);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { alpha: true }) ?? undefined;
      this.resizeCanvas();
      this.centerGraph();
      this.isAnimating = true;
      this.animationLoop.requestRender();
    } else {
      console.error('Canvas element not found in firstUpdated');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.animationLoop.stop();
  }

  private trackRemovedNodesForFadeOut(changedProps: PropertyValues<this>) {
    const prevNodes = changedProps.get('nodes') as GraphNode[] | undefined;
    if (!prevNodes || prevNodes.length === 0) return;

    const currentIds = new Set(this.nodes.map((n) => n.id));
    const now = performance.now();
    for (const node of prevNodes) {
      if (!currentIds.has(node.id) && !this.fadingOutNodes.has(node.id)) {
        this.fadingOutNodes.set(node.id, { node, startTime: now });
      }
    }
    if (this.fadingOutNodes.size > 0) {
      this.isAnimating = true;
    }
  }

  override willUpdate(changedProps: PropertyValues<this>): void {
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      this.trackRemovedNodesForFadeOut(changedProps);

      const isFilterChange =
        this.layout.nodePositions.size > 0 &&
        this.nodes.every((n) => this.layout.nodePositions.has(n.id));

      if (!isFilterChange) {
        this.layout.enableAnimation = this.enableAnimation;
        this.layout.computeLayout(this.nodes, this.edges).catch((err) => {
          ErrorService.getInstance().handleError(err, {
            category: ErrorCategory.Layout,
            userMessage: 'Layout computation failed',
          });
        });
        this.manualNodePositions.clear();
        this.manualClusterPositions.clear();
        this.updatePathCache();
        this.didInitialFit = false;
      }

      this.nodeWeights = computeNodeWeights(this.nodes, this.edges);
      this.rebuildNodeMap();
      this.connectedNodesCache = null;
      this.routedEdgeMapCache = null;
    }

    if (changedProps.has('selectedNode') || changedProps.has('selectedCluster')) {
      this.connectedNodesCache = null;
      this.updateNodeAlphaTargets();
    }

    if (changedProps.has('enableAnimation')) {
      this.layout.enableAnimation = this.enableAnimation;
      if (this.enableAnimation && this.nodes.length > 0) {
        this.layout.computeLayout(this.nodes, this.edges).catch((err) => {
          ErrorService.getInstance().handleError(err, {
            category: ErrorCategory.Layout,
            userMessage: 'Layout computation failed',
          });
        });
      }
    }

    if (
      changedProps.has('selectedNode') ||
      changedProps.has('selectedCluster') ||
      changedProps.has('viewMode')
    ) {
      this.updateAnimatingState();
    }

    this.requestRender();
  }

  override updated(changedProps: PropertyValues<this>): void {
    super.updated(changedProps);

    if (!this.didInitialFit && this.layout.clusterPositions.size > 0) {
      this.fitToViewport();
      this.didInitialFit = true;
    }
  }

  private updatePathCache() {
    this.pathCache.clear();
    this.edgePathCache.clear();
  }

  private rebuildNodeMap() {
    this.nodeMap.clear();
    for (const node of this.nodes) {
      this.nodeMap.set(node.id, node);
    }
  }

  private updateNodeAlphaTargets() {
    const connected = this.selectedNode
      ? getConnectedNodes(this.selectedNode.id, this.edges)
      : null;
    for (const node of this.nodes) {
      const isSelected = this.selectedNode?.id === node.id;
      const isConnected = connected?.has(node.id) ?? false;
      const clusterId = node.project || 'External';
      const isClusterSelected = this.selectedCluster === clusterId;

      const shouldDim =
        (!!this.selectedNode && !isSelected && !isConnected) ||
        (!!this.selectedCluster && !isClusterSelected);

      setAnimatedTarget(this.nodeAlphaMap, node.id, shouldDim ? 0.3 : 1.0);
    }
    // Ensure animation loop runs to process the transitions
    if (this.nodeAlphaMap.size > 0) {
      this.isAnimating = true;
      this.animationLoop.requestRender();
    }
  }

  private getConnectedNodesSet(): Set<string> {
    if (!this.selectedNode) return new Set<string>();
    if (this.connectedNodesCache && this.connectedNodesCache.nodeId === this.selectedNode.id) {
      return this.connectedNodesCache.result;
    }
    const result = getConnectedNodes(this.selectedNode.id, this.edges);
    this.connectedNodesCache = { nodeId: this.selectedNode.id, result };
    return result;
  }

  private getRoutedEdgeMap(): Map<string, RoutedEdge> {
    const currentRouted = this.layout.routedEdges;
    if (this.routedEdgeMapCache && this.lastRoutedEdgesRef === currentRouted) {
      return this.routedEdgeMapCache;
    }
    const map = new Map<string, RoutedEdge>();
    if (currentRouted) {
      for (const re of currentRouted) {
        map.set(`${re.sourceNodeId}->${re.targetNodeId}`, re);
      }
    }
    this.routedEdgeMapCache = map;
    this.lastRoutedEdgesRef = currentRouted;
    return map;
  }

  private getPathForNode = (node: GraphNode): Path2D => {
    const key = `${node.type}-${node.platform}`;
    if (!this.pathCache.has(key)) {
      const pathString = getNodeIconPath(node.type, node.platform);
      this.pathCache.set(key, new Path2D(pathString));
    }
    return this.pathCache.get(key) as Path2D;
  };

  private centerGraph() {
    const rect = this.getBoundingClientRect();
    this.interactionState.pan = { x: rect.width / 2, y: rect.height / 2 };
  }

  fitToViewport(): void {
    if (!this.layout.clusterPositions.size) return;
    const rect = this.getBoundingClientRect();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.layout.clusterPositions.forEach((pos) => {
      const halfW = pos.width / 2;
      const halfH = pos.height / 2;
      minX = Math.min(minX, pos.x - halfW);
      maxX = Math.max(maxX, pos.x + halfW);
      minY = Math.min(minY, pos.y - halfH);
      maxY = Math.max(maxY, pos.y + halfH);
    });

    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(maxY)
    )
      return;

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const padding = 40;
    const scaleX = (rect.width - padding * 2) / graphWidth;
    const scaleY = (rect.height - padding * 2) / graphHeight;
    const fitZoom = Math.max(ZOOM_CONFIG.MIN_ZOOM, Math.min(1.5, Math.min(scaleX, scaleY)));

    this.zoom = fitZoom;
    this.interactionState.zoom = fitZoom;
    setBaseZoom(fitZoom);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    this.interactionState.pan = {
      x: rect.width / 2 - centerX * fitZoom,
      y: rect.height / 2 - centerY * fitZoom,
    };

    this.dispatchEvent(
      new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }),
    );
  }

  private getInteractionContext(): InteractionContext {
    return {
      state: this.interactionState,
      layout: this.layout,
      nodes: this.nodes,
      edges: this.edges,
      selectedNode: this.selectedNode,
      nodeWeights: this.nodeWeights,
      manualNodePositions: this.manualNodePositions,
      manualClusterPositions: this.manualClusterPositions,
      getMousePos: this.getMousePos,
      screenToWorld: this.screenToWorld,
      dispatchCanvasEvent: this.dispatchCanvasEvent,
      dispatchZoomChange: (zoom: number) => {
        this.zoom = zoom;
        this.dispatchEvent(
          new CustomEvent('zoom-change', { detail: zoom, bubbles: true, composed: true }),
        );
      },
    };
  }

  private resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.requestRender();
  }

  private dispatchCanvasEvent = <K extends keyof CanvasEventMap>(
    name: K,
    detail: CanvasEventMap[K],
  ) => {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  };

  private handleCanvasMouseDown = (e: MouseEvent) => {
    this.interactionState.zoom = this.zoom;
    handleMouseDown(e, this.getInteractionContext());
    this.requestRender();
  };

  private handleCanvasMouseMove = (e: MouseEvent) => {
    this.interactionState.zoom = this.zoom;
    handleMouseMove(e, this.getInteractionContext());
    this.hoveredNode = this.interactionState.hoveredNode;

    if (this.canvas) {
      if (this.interactionState.isDragging) {
        this.canvas.style.cursor = 'grabbing';
      } else if (this.interactionState.hoveredNode || this.interactionState.hoveredCluster) {
        this.canvas.style.cursor = 'pointer';
      } else {
        this.canvas.style.cursor = 'grab';
      }
    }

    this.requestRender();
  };

  private handleCanvasMouseUp = (e?: MouseEvent) => {
    handleMouseUp(e, this.getInteractionContext());
    this.hoveredNode = this.interactionState.hoveredNode;
    this.requestRender();
  };

  private handleCanvasWheel = (e: WheelEvent) => {
    this.interactionState.zoom = this.zoom;
    handleWheel(e, this.getInteractionContext());
    this.zoom = this.interactionState.zoom;
    this.requestRender();
  };

  private handleCanvasKeyDown = (e: KeyboardEvent) => {
    const PAN_STEP = 50;
    const ctx = this.getInteractionContext();

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.interactionState.pan.y += PAN_STEP;
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.interactionState.pan.y -= PAN_STEP;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.interactionState.pan.x += PAN_STEP;
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.interactionState.pan.x -= PAN_STEP;
        break;
      case '+':
      case '=':
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('zoom-in', { bubbles: true, composed: true }));
        return;
      case '-':
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('zoom-out', { bubbles: true, composed: true }));
        return;
      case '0':
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('zoom-reset', { bubbles: true, composed: true }));
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.interactionState.hoveredNode) {
          const node = this.nodes.find((n) => n.id === this.interactionState.hoveredNode);
          if (node) {
            const newSelection = this.selectedNode?.id === node.id ? null : node;
            ctx.dispatchCanvasEvent('node-select', { node: newSelection });
          }
        }
        return;
      case 'Escape':
        e.preventDefault();
        ctx.dispatchCanvasEvent('node-select', { node: null });
        ctx.dispatchCanvasEvent('cluster-select', { clusterId: null });
        return;
      default:
        return;
    }
    this.requestRender();
  };

  private requestRender() {
    this.animationLoop.requestRender();
  }

  /**
   * Frame callback invoked by AnimationLoopController when a render is needed.
   * Handles animation ticking and delegates to renderCanvas().
   */
  private onFrame(timestamp: number, dt: number): void {
    this.time = timestamp;

    // Tick opacity transition animations
    const alphaAnimating = tickAnimationMap(this.nodeAlphaMap, dt);
    if (alphaAnimating && !this.isAnimating) {
      this.isAnimating = true;
    }

    this.renderCanvas();

    // Re-check: if only alpha was animating and it settled, stop
    if (this.isAnimating && !alphaAnimating) {
      this.updateAnimatingState();
    }
  }

  private updateAnimatingState() {
    const hasSelectedNode = !!this.selectedNode;
    const hasSelectedCluster = !!this.selectedCluster;
    const hasCycleNodes = (this.layout.cycleNodes?.size ?? 0) > 0;
    const hasFadingNodes = this.fadingOutNodes.size > 0;

    const hasAlphaAnimations = this.nodeAlphaMap.size > 0;

    this.isAnimating =
      hasSelectedNode ||
      hasSelectedCluster ||
      hasCycleNodes ||
      hasFadingNodes ||
      hasAlphaAnimations;
  }

  private renderCanvas() {
    if (!this.ctx || !this.canvas || !this.theme) return;

    const pan = this.interactionState.pan;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, width, height);

    // Flat background fill
    this.ctx.fillStyle = this.theme.canvasBg;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.save();
    this.ctx.translate(pan.x, pan.y);
    this.ctx.scale(this.zoom, this.zoom);

    const viewport = calculateViewportBounds(width, height, pan.x, pan.y, this.zoom);

    renderClusters(
      {
        ctx: this.ctx,
        layout: this.layout,
        zoom: this.zoom,
        time: this.time,
        theme: this.theme,
        selectedCluster: this.selectedCluster,
        hoveredCluster: this.interactionState.hoveredCluster,
        manualClusterPositions: this.manualClusterPositions,
      },
      viewport,
    );

    renderEdges(
      {
        ctx: this.ctx,
        layout: this.layout,
        nodes: this.nodes,
        edges: this.edges,
        zoom: this.zoom,
        time: this.time,
        theme: this.theme,
        selectedNode: this.selectedNode,
        selectedCluster: this.selectedCluster,
        hoveredCluster: this.interactionState.hoveredCluster,
        viewMode: this.viewMode,
        transitiveDeps: this.transitiveDeps,
        transitiveDependents: this.transitiveDependents,
        manualNodePositions: this.manualNodePositions,
        manualClusterPositions: this.manualClusterPositions,
        nodeMap: this.nodeMap,
        routedEdgeMap: this.getRoutedEdgeMap(),
        edgePathCache: this.edgePathCache,
        showDirectDeps: this.showDirectDeps,
        showTransitiveDeps: this.showTransitiveDeps,
        showDirectDependents: this.showDirectDependents,
        showTransitiveDependents: this.showTransitiveDependents,
      },
      viewport,
    );

    const weights = Array.from(this.nodeWeights.values()).sort((a, b) => a - b);
    const hubWeightThreshold = weights[Math.floor(weights.length * 0.9)] ?? 0;

    renderNodes(
      {
        ctx: this.ctx,
        layout: this.layout,
        nodes: this.nodes,
        edges: this.edges,
        zoom: this.zoom,
        time: this.time,
        theme: this.theme,
        selectedNode: this.selectedNode,
        selectedCluster: this.selectedCluster,
        hoveredNode: this.hoveredNode,
        hoveredCluster: this.interactionState.hoveredCluster,
        searchQuery: this.searchQuery,
        viewMode: this.viewMode,
        transitiveDeps: this.transitiveDeps,
        transitiveDependents: this.transitiveDependents,
        previewFilter: this.previewFilter,
        dimmedNodeIds: this.dimmedNodeIds,
        nodeWeights: this.nodeWeights,
        manualNodePositions: this.manualNodePositions,
        manualClusterPositions: this.manualClusterPositions,
        getPathForNode: this.getPathForNode,
        connectedNodes: this.getConnectedNodesSet(),
        hubWeightThreshold,
        nodeAlphaMap: this.nodeAlphaMap,
        showDirectDeps: this.showDirectDeps,
        showTransitiveDeps: this.showTransitiveDeps,
        showDirectDependents: this.showDirectDependents,
        showTransitiveDependents: this.showTransitiveDependents,
      },
      viewport,
    );

    // Render fading-out nodes
    this.renderFadingNodes();

    this.ctx.restore();

    const tooltipCtx = {
      ctx: this.ctx,
      layout: this.layout,
      nodes: this.nodes,
      edges: this.edges,
      zoom: this.zoom,
      theme: this.theme,
      hoveredNode: this.hoveredNode,
      pan: this.interactionState.pan,
      nodeWeights: this.nodeWeights,
      manualNodePositions: this.manualNodePositions,
      manualClusterPositions: this.manualClusterPositions,
      hoveredCluster: this.interactionState.hoveredCluster,
    };
    renderNodeTooltip(tooltipCtx);
    renderClusterTooltip(tooltipCtx);
  }

  private renderFadingNodes() {
    if (this.fadingOutNodes.size === 0) return;

    const now = performance.now();
    const toRemove: string[] = [];

    for (const [nodeId, { node, startTime }] of this.fadingOutNodes) {
      const elapsed = now - startTime;
      if (elapsed >= GraphCanvas.FADE_OUT_DURATION) {
        toRemove.push(nodeId);
        continue;
      }

      const alpha = 1 - elapsed / GraphCanvas.FADE_OUT_DURATION;
      const clusterId = node.project || 'External';
      const pos = resolveNodeWorldPosition(
        nodeId,
        clusterId,
        this.layout,
        this.manualNodePositions,
        this.manualClusterPositions,
      );
      if (!pos) {
        toRemove.push(nodeId);
        continue;
      }

      const { x, y } = pos;
      const size = getNodeSize(node, this.edges, this.nodeWeights.get(nodeId));

      // Draw fading node icon
      this.ctx.globalAlpha = alpha * 0.5;
      const color = adjustColorForZoom(getNodeTypeColorFromTheme(node.type, this.theme), this.zoom);
      const scale = (size / 12) * 1.0;
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.scale(scale, scale);
      const path = this.getPathForNode(node);
      this.ctx.fillStyle = this.theme.tooltipBg;
      this.ctx.fill(path);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2 / scale;
      this.ctx.stroke(path);
      this.ctx.restore();
    }

    for (const id of toRemove) {
      this.fadingOutNodes.delete(id);
    }

    if (this.fadingOutNodes.size === 0) {
      this.updateAnimatingState();
    }

    this.ctx.globalAlpha = 1.0;
  }

  private getMousePos = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  private screenToWorld = (screenX: number, screenY: number) => {
    const pan = this.interactionState.pan;
    return {
      x: (screenX - pan.x) / this.zoom,
      y: (screenY - pan.y) / this.zoom,
    };
  };

  override render(): TemplateResult {
    return html`
      <canvas
        tabindex="-1"
        role="img"
        aria-hidden="true"
        aria-label="Dependency graph visualization"
        @mousedown=${this.handleCanvasMouseDown}
        @mousemove=${this.handleCanvasMouseMove}
        @mouseup=${this.handleCanvasMouseUp}
        @mouseleave=${this.handleCanvasMouseUp}
        @wheel=${this.handleCanvasWheel}
        @keydown=${this.handleCanvasKeyDown}
      ></canvas>
      <xcode-graph-hidden-dom
        .nodes=${this.nodes}
        .edges=${this.edges}
        .selectedNode=${this.selectedNode}
        @node-select=${(e: CustomEvent) =>
          this.dispatchEvent(
            new CustomEvent('node-select', {
              detail: e.detail,
              bubbles: true,
              composed: true,
            }),
          )}
      ></xcode-graph-hidden-dom>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-canvas': GraphCanvas;
  }
}
