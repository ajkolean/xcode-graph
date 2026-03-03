import { AnimationLoopController } from '@graph/controllers/animation-loop.controller';
import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import {
  type AnimatedValue,
  setAnimatedTarget,
  tickAnimationMap,
} from '@graph/utils/canvas-animation';
import { type CanvasTheme, resolveCanvasTheme } from '@graph/utils/canvas-theme';
import { getConnectedNodes } from '@graph/utils/connections';
import type { PerfOverlay } from '@graph/utils/dev-perf-overlay';
import { ErrorCategory, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { setBaseZoom } from '@shared/signals/index';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { calculateViewportBounds } from '@ui/utils/viewport';
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
import { type FadingNode, renderFadingNodes } from './canvas/canvas-fade-renderer';
import {
  type CanvasEventMap,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  type InteractionContext,
  type InteractionState,
} from './canvas/canvas-interaction-handler';
import { handleKeyDown } from './canvas/canvas-keyboard-handler';
import { renderNodes } from './canvas/canvas-node-renderer';
import { renderClusterTooltip, renderNodeTooltip } from './canvas/canvas-tooltip-renderer';
import { computeFitToViewport, getCanvasMousePos, screenToWorld } from './canvas/canvas-viewport';
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

  /** Currently hovered node ID — plain field, only used for canvas rendering. */
  hoveredNode: string | null = null;

  /** Active search query — attribute-bound from parent via search-query="..." */
  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string;

  /** Display mode — attribute-bound from parent via view-mode="..." */
  @property({ type: String, attribute: 'view-mode' })
  declare viewMode: ViewMode;

  /**
   * Current zoom level.
   * Uses a plain field + setter to trigger canvas re-render without a full
   * Lit update cycle, which was causing lag during wheel-zoom.
   */
  private _zoom = 1;
  get zoom(): number {
    return this._zoom;
  }
  set zoom(value: number) {
    if (value !== this._zoom) {
      this._zoom = value;
      this.requestRender();
    }
  }

  /** Whether physics animation is enabled for layout settling */
  @property({ type: Boolean, attribute: 'enable-animation' })
  declare enableAnimation: boolean;

  /** Transitive dependency chain — plain field, only used for canvas rendering. */
  transitiveDeps: TransitiveResult | undefined;

  /** Transitive dependent chain — plain field, only used for canvas rendering. */
  transitiveDependents: TransitiveResult | undefined;

  /** Active filter preview — plain field, only used for canvas rendering. */
  previewFilter: PreviewFilter | undefined;

  /** Whether to highlight direct dependency edges — attribute-bound via ?show-direct-deps */
  @property({ type: Boolean, attribute: 'show-direct-deps' })
  declare showDirectDeps: boolean;

  /** Whether to highlight transitive dependency edges — attribute-bound via ?show-transitive-deps */
  @property({ type: Boolean, attribute: 'show-transitive-deps' })
  declare showTransitiveDeps: boolean;

  /** Whether to highlight direct dependent edges — attribute-bound via ?show-direct-dependents */
  @property({ type: Boolean, attribute: 'show-direct-dependents' })
  declare showDirectDependents: boolean;

  /** Whether to highlight transitive dependent edges — attribute-bound via ?show-transitive-dependents */
  @property({ type: Boolean, attribute: 'show-transitive-dependents' })
  declare showTransitiveDependents: boolean;

  /** Set of node IDs that should be visually dimmed */
  dimmedNodeIds: Set<string> = new Set();

  @query('canvas')
  private declare canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | undefined;

  private readonly layout = new GraphLayoutController(this, {
    enableAnimation: false,
    animationTicks: 30,
  });

  private resizeObserver: ResizeObserver | null = null;
  private resizeRafId: number | null = null;

  private intersectionObserver: IntersectionObserver | null = null;
  private _isVisible = true;

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
  private nodeMap = new Map<string, GraphNode>();
  private connectedNodesCache: { nodeId: string; result: Set<string> } | null = null;
  private theme: CanvasTheme | undefined;
  /** Cached canvas bounding rect — updated on resize to avoid per-event forced reflow */
  private cachedCanvasRect: DOMRect | null = null;

  // Animation & Render State
  private readonly animationLoop = new AnimationLoopController(this, {
    onRender: (timestamp, dt) => this.onFrame(timestamp, dt),
    shouldAnimate: () => this.isAnimating,
    isVisible: () => this._isVisible,
  });
  private time = 0;
  private didInitialFit = false;
  private isAnimating = false;

  // Smooth opacity transitions for selection/deselection
  private nodeAlphaMap = new Map<string, AnimatedValue>();

  // Fade-out animation for removed nodes
  private fadingOutNodes = new Map<string, FadingNode>();

  // Dev-only performance overlay (stats.js + Long Tasks)
  private perfOverlay: PerfOverlay | null = null;

  constructor() {
    super();
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.selectedCluster = null;
    this.searchQuery = '';
    this.viewMode = ViewMode.Full;
    this.enableAnimation = false;
    this.showDirectDeps = false;
    this.showTransitiveDeps = false;
    this.showDirectDependents = false;
    this.showTransitiveDependents = false;
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
      touch-action: none;
    }

    canvas:active {
      cursor: grabbing;
    }
  `;

  /** Initializes the canvas context, resolves the theme, and starts the render loop. */
  override firstUpdated(): void {
    this.theme = resolveCanvasTheme(this);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { alpha: false }) ?? undefined;
      this.cachedCanvasRect = this.canvas.getBoundingClientRect();

      /* v8 ignore next 3 -- native observer: not triggered in jsdom */
      this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
      this.resizeObserver.observe(this);

      /* v8 ignore next 6 -- native observer: not triggered in jsdom */
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this._isVisible = entries.some((e) => e.isIntersecting);
      });
      this.intersectionObserver.observe(this);

      // Attach wheel listener with { passive: false } so preventDefault() works.
      // Lit's @wheel binding uses a passive listener by default in Chrome,
      // which ignores preventDefault and lets the browser compete with our zoom.
      /* v8 ignore next 1 -- native event listener: not triggered in jsdom */
      this.canvas.addEventListener('wheel', this.handleCanvasWheel, { passive: false });

      this.resizeCanvas();
      this.centerGraph();
      this.isAnimating = true;
      this.animationLoop.requestRender();

      /* v8 ignore start -- dev-only perf overlay */
      if (import.meta.env.DEV) {
        import('@graph/utils/dev-perf-overlay').then(({ createPerfOverlay }) => {
          createPerfOverlay(this).then((overlay) => {
            this.perfOverlay = overlay;
          });
        });
      }
      /* v8 ignore stop */
    } else {
      console.error('Canvas element not found in firstUpdated');
    }
  }

  /** Stops the animation loop and observers when the component is removed from the DOM. */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.animationLoop.stop();
    this.perfOverlay?.destroy();
    this.perfOverlay = null;
    this.canvas?.removeEventListener('wheel', this.handleCanvasWheel);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }
  }

  /** Detects nodes removed between updates and queues them for fade-out animation. */
  private trackRemovedNodesForFadeOut(changedProps: PropertyValues<this>) {
    const prevNodes = changedProps.get('nodes') as GraphNode[] | undefined;
    if (!prevNodes || prevNodes.length === 0) return;

    const currentIds = new Set(this.nodes.map((node) => node.id));
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

  /** Recomputes layout, caches, and animation state when reactive properties change. */
  override willUpdate(changedProps: PropertyValues<this>): void {
    /* v8 ignore next 2 */
    if (import.meta.env.DEV)
      console.log(`[graph-canvas] willUpdate keys: ${[...changedProps.keys()].join(', ')}`);
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

      this.rebuildNodeMap();
      this.connectedNodesCache = null;
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

    if (changedProps.size > 0) {
      this.requestRender();
    }
  }

  /** Performs initial fit-to-viewport once cluster positions are available. */
  override updated(changedProps: PropertyValues<this>): void {
    super.updated(changedProps);

    if (!this.didInitialFit && this.layout.clusterPositions.size > 0) {
      this.fitToViewport();
      this.didInitialFit = true;
    }
  }

  /** Clears cached Path2D objects for nodes and edges, forcing re-creation on next render. */
  private updatePathCache() {
    this.pathCache.clear();
    this.edgePathCache.clear();
  }

  /** Rebuilds the node lookup map from the current nodes array. */
  private rebuildNodeMap() {
    this.nodeMap.clear();
    for (const node of this.nodes) {
      this.nodeMap.set(node.id, node);
    }
  }

  /** Updates opacity animation targets based on current selection and cluster state. */
  private updateNodeAlphaTargets() {
    for (const node of this.nodes) {
      setAnimatedTarget(this.nodeAlphaMap, node.id, 1.0);
    }
    // Ensure animation loop runs to process the transitions
    if (this.nodeAlphaMap.size > 0) {
      this.isAnimating = true;
      this.animationLoop.requestRender();
    }
  }

  /** Returns the cached set of node IDs connected to the selected node. */
  private getConnectedNodesSet(): Set<string> {
    if (!this.selectedNode) return new Set<string>();
    if (this.connectedNodesCache && this.connectedNodesCache.nodeId === this.selectedNode.id) {
      return this.connectedNodesCache.result;
    }
    const result = getConnectedNodes(this.selectedNode.id, this.edges);
    this.connectedNodesCache = { nodeId: this.selectedNode.id, result };
    return result;
  }

  private getPathForNode = (node: GraphNode): Path2D => {
    const key = `${node.type}-${node.platform}`;
    if (!this.pathCache.has(key)) {
      const pathString = getNodeIconPath(node.type, node.platform);
      this.pathCache.set(key, new Path2D(pathString));
    }
    return this.pathCache.get(key) as Path2D;
  };

  /** Centers the pan offset to the middle of the component's bounding rectangle. */
  private centerGraph() {
    const rect = this.getBoundingClientRect();
    this.interactionState.pan = { x: rect.width / 2, y: rect.height / 2 };
  }

  /** Adjusts zoom and pan so that all clusters fit within the visible viewport. */
  fitToViewport(): void {
    const rect = this.getBoundingClientRect();
    const fit = computeFitToViewport(this.layout.clusterPositions, rect.width, rect.height);
    if (!fit) return;

    this.zoom = fit.zoom;
    this.interactionState.zoom = fit.zoom;
    setBaseZoom(fit.zoom);
    this.interactionState.pan = fit.pan;

    this.dispatchEvent(
      new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }),
    );
  }

  /** Stable callback for zoom changes from non-wheel interactions */
  private handleZoomChange = (zoom: number) => {
    if (zoom !== this._zoom) {
      this._zoom = zoom;
      this.dispatchEvent(
        new CustomEvent('zoom-change', { detail: zoom, bubbles: true, composed: true }),
      );
      this.requestRender();
    }
  };

  /** Stable callback for edge path cache invalidation — avoids closure allocation per event */
  private handleInvalidateEdgePathCache = () => {
    this.edgePathCache.clear();
  };

  /** Builds the interaction context object used by canvas mouse/wheel event handlers. */
  private getInteractionContext(): InteractionContext {
    return {
      state: this.interactionState,
      layout: this.layout,
      nodes: this.nodes,
      edges: this.edges,
      selectedNode: this.selectedNode,
      manualNodePositions: this.manualNodePositions,
      manualClusterPositions: this.manualClusterPositions,
      getMousePos: this.getMousePos,
      screenToWorld: this.screenToWorld,
      dispatchCanvasEvent: this.dispatchCanvasEvent,
      dispatchZoomChange: this.handleZoomChange,
      invalidateEdgePathCache: this.handleInvalidateEdgePathCache,
    };
  }

  /**
   * Debounces resize via rAF so the canvas buffer clear and re-render happen
   * in the same frame, preventing visible flashes during CSS transitions.
   */
  /* v8 ignore next 7 -- rAF scheduling: not triggered in jsdom */
  private scheduleResize() {
    if (this.resizeRafId !== null) return;
    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.resizeCanvas();
    });
  }

  /** Resizes the canvas buffer to match the element dimensions and device pixel ratio. */
  private resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.getBoundingClientRect();

    // Cache rect for use in wheel/mouse handlers (avoids forced reflow per event)
    this.cachedCanvasRect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.renderCanvas();
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
    const prevZoom = this._zoom;
    this.interactionState.zoom = prevZoom;
    const ctx = this.getInteractionContext();
    // Bypass the zoom setter (which schedules a redundant rAF render)
    // so we can render synchronously below for zero-latency zoom.
    ctx.dispatchZoomChange = (z: number) => {
      this._zoom = z;
    };
    handleWheel(e, ctx);
    if (this._zoom !== prevZoom) {
      // Dispatch immediately — no debounce — for real-time zoom display updates
      this.dispatchEvent(
        new CustomEvent('zoom-change', { detail: this._zoom, bubbles: true, composed: true }),
      );
      // Render synchronously for zero-latency response
      this.time = performance.now();
      this.renderCanvas();
    }
  };

  private handleCanvasKeyDown = (e: KeyboardEvent) => {
    const needsRender = handleKeyDown(e, {
      state: this.interactionState,
      nodes: this.nodes,
      selectedNode: this.selectedNode,
      dispatchCanvasEvent: this.dispatchCanvasEvent,
      dispatchEvent: (event) => this.dispatchEvent(event),
    });
    if (needsRender) {
      this.requestRender();
    }
  };

  /** Schedules a canvas render on the next animation frame. */
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

  /** Recalculates whether the animation loop should remain active based on current state. */
  private updateAnimatingState() {
    const hasSelectedNode = Boolean(this.selectedNode);
    const hasSelectedCluster = Boolean(this.selectedCluster);
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

  /* v8 ignore next -- dev-only frame counter for periodic render profiling */
  private _renderFrameCount = 0;

  /** Clears and redraws the entire canvas including clusters, edges, nodes, and tooltips. */
  private renderCanvas() {
    this.perfOverlay?.begin();
    if (!this.ctx || !this.canvas || !this.theme) return;

    /* v8 ignore next -- dev render profiling */
    const _profile = import.meta.env.DEV && ++this._renderFrameCount > 0;
    /* v8 ignore next */
    const _t0 = _profile ? performance.now() : 0;

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

    /* v8 ignore next */
    const _t1 = _profile ? performance.now() : 0;

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

    /* v8 ignore next */
    const _t2 = _profile ? performance.now() : 0;

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
        edgePathCache: this.edgePathCache,
        showDirectDeps: this.showDirectDeps,
        showTransitiveDeps: this.showTransitiveDeps,
        showDirectDependents: this.showDirectDependents,
        showTransitiveDependents: this.showTransitiveDependents,
      },
      viewport,
    );

    /* v8 ignore next */
    const _t3 = _profile ? performance.now() : 0;

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
        manualNodePositions: this.manualNodePositions,
        manualClusterPositions: this.manualClusterPositions,
        getPathForNode: this.getPathForNode,
        connectedNodes: this.getConnectedNodesSet(),
        nodeAlphaMap: this.nodeAlphaMap,
        showDirectDeps: this.showDirectDeps,
        showTransitiveDeps: this.showTransitiveDeps,
        showDirectDependents: this.showDirectDependents,
        showTransitiveDependents: this.showTransitiveDependents,
      },
      viewport,
    );

    /* v8 ignore next */
    const _t4 = _profile ? performance.now() : 0;

    // Render fading-out nodes
    this.renderFadingOutNodes();

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
      manualNodePositions: this.manualNodePositions,
      manualClusterPositions: this.manualClusterPositions,
      hoveredCluster: this.interactionState.hoveredCluster,
    };
    renderNodeTooltip(tooltipCtx);
    renderClusterTooltip(tooltipCtx);

    /* v8 ignore start -- dev render profiling */
    if (_profile) {
      const _t5 = performance.now();
      console.log(
        `[render] frame #${this._renderFrameCount} | ` +
          `setup: ${(_t1 - _t0).toFixed(1)}ms | ` +
          `clusters: ${(_t2 - _t1).toFixed(1)}ms | ` +
          `edges: ${(_t3 - _t2).toFixed(1)}ms | ` +
          `nodes: ${(_t4 - _t3).toFixed(1)}ms | ` +
          `tooltip+rest: ${(_t5 - _t4).toFixed(1)}ms | ` +
          `TOTAL: ${(_t5 - _t0).toFixed(1)}ms`,
      );
    }
    /* v8 ignore stop */

    this.perfOverlay?.end();
  }

  /** Renders nodes that are fading out after removal, cleaning up completed animations. */
  private renderFadingOutNodes() {
    if (this.fadingOutNodes.size === 0 || !this.ctx || !this.theme) return;

    const sizeBefore = this.fadingOutNodes.size;
    renderFadingNodes(
      {
        ctx: this.ctx,
        theme: this.theme,
        layout: this.layout,
        zoom: this.zoom,
        manualNodePositions: this.manualNodePositions,
        manualClusterPositions: this.manualClusterPositions,
        getPathForNode: this.getPathForNode,
      },
      this.fadingOutNodes,
    );

    if (this.fadingOutNodes.size === 0 && sizeBefore > 0) {
      this.updateAnimatingState();
    }
  }

  private getMousePos = (e: MouseEvent) => {
    const rect = this.cachedCanvasRect ?? this.canvas.getBoundingClientRect();
    return getCanvasMousePos(e, rect);
  };

  private screenToWorld = (screenX: number, screenY: number) => {
    return screenToWorld(screenX, screenY, this.interactionState.pan, this.zoom);
  };

  /** Renders the canvas element and hidden DOM accessibility tree. */
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
