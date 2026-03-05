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
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
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
import type { CanvasEventMap } from './canvas/canvas-keyboard-handler';
import { handleKeyDown } from './canvas/canvas-keyboard-handler';
import { CanvasScene, type FadingNode, type SceneConfig } from './canvas/canvas-scene';
import './graph-hidden-dom';

/**
 * Canvas2D graph visualization component. Renders nodes, edges, and clusters
 * using raw Canvas2D with pan, zoom, and interactive selection support.
 *
 * @summary Canvas2D interactive graph visualization
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
  /** Properties that affect canvas rendering — other Lit properties (e.g. internal state) don't need a render. */
  private static readonly CANVAS_PROPS = new Set([
    'nodes',
    'edges',
    'selectedNode',
    'selectedCluster',
    'searchQuery',
    'viewMode',
    'enableAnimation',
    'showDirectDeps',
    'showTransitiveDeps',
    'showDirectDependents',
    'showTransitiveDependents',
  ]);
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

  @query('#canvas-container')
  private declare containerEl: HTMLDivElement;

  private scene: CanvasScene | null = null;

  private readonly layout = new GraphLayoutController(this, {
    enableAnimation: false,
    animationTicks: 30,
  });

  private resizeObserver: ResizeObserver | null = null;
  private resizeRafId: number | null = null;

  private intersectionObserver: IntersectionObserver | null = null;
  private _isVisible = true;

  private manualNodePositions = new Map<string, { x: number; y: number }>();
  private manualClusterPositions = new Map<string, { x: number; y: number }>();
  private connectedNodesCache: { nodeId: string; result: Set<string> } | null = null;
  private theme: CanvasTheme | undefined;

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

    #canvas-container {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
      cursor: grab;
      touch-action: none;
    }
  `;

  /** Initializes the canvas scene, resolves the theme, and starts the render loop. */
  override firstUpdated(): void {
    this.theme = resolveCanvasTheme(this);
    if (this.containerEl) {
      this.scene = new CanvasScene(this.containerEl, {
        onNodeSelect: (node) => this.dispatchCanvasEvent('node-select', { node }),
        onClusterSelect: (clusterId) => this.dispatchCanvasEvent('cluster-select', { clusterId }),
        onNodeHover: (nodeId) => {
          this.hoveredNode = nodeId;
          this.dispatchCanvasEvent('node-hover', { nodeId });
        },
        onClusterHover: (clusterId) => this.dispatchCanvasEvent('cluster-hover', { clusterId }),
        onZoomChange: (zoom) => {
          this._zoom = zoom;
          this.dispatchEvent(
            new CustomEvent('zoom-change', { detail: zoom, bubbles: true, composed: true }),
          );
        },
        onRenderRequest: () => this.requestRender(),
        onInvalidateEdgePathCache: () => {
          // Edge path cache is now internal to CanvasScene — no-op
        },
      });

      /* v8 ignore next 3 -- native observer: not triggered in jsdom */
      this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
      this.resizeObserver.observe(this);

      /* v8 ignore next 6 -- native observer: not triggered in jsdom */
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this._isVisible = entries.some((e) => e.isIntersecting);
      });
      this.intersectionObserver.observe(this);

      this.resizeScene();
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
      console.error('Canvas container element not found in firstUpdated');
    }
  }

  /** Stops the animation loop and observers when the component is removed from the DOM. */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.animationLoop.stop();
    this.perfOverlay?.destroy();
    this.perfOverlay = null;
    this.scene?.destroy();
    this.scene = null;
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
        this.scene?.clearCaches();
        this.didInitialFit = false;
      }

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

    // Request a canvas render only when a canvas-relevant property changed,
    // OR when the layout controller triggers an update after async work
    // completes (changedProps is empty but positions are now available).
    const hasCanvasChange = [...changedProps.keys()].some((k) =>
      GraphCanvas.CANVAS_PROPS.has(k as string),
    );
    if (hasCanvasChange || this.layout.nodePositions.size > 0) {
      this.requestRender();
    }
  }

  /** Performs initial fit-to-viewport once cluster positions are available. */
  override updated(changedProps: PropertyValues<this>): void {
    super.updated(changedProps);

    if (!this.didInitialFit && this.layout.clusterPositions.size > 0) {
      this.fitToViewport();
      this.didInitialFit = true;
      this.requestRender();
    }
  }

  /** Updates opacity animation targets based on current selection and cluster state. */
  private updateNodeAlphaTargets() {
    for (const node of this.nodes) {
      setAnimatedTarget(this.nodeAlphaMap, node.id, 1.0);
    }
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

  /** Centers the pan offset to the middle of the component's bounding rectangle. */
  private centerGraph() {
    const rect = this.getBoundingClientRect();
    this.scene?.centerGraph(rect.width, rect.height);
  }

  /** Adjusts zoom and pan so that all clusters fit within the visible viewport. */
  fitToViewport(): void {
    if (!this.scene) return;
    const rect = this.getBoundingClientRect();
    const fit = this.scene.fitToViewport(this.layout.clusterPositions, rect.width, rect.height);
    if (!fit) return;

    this._zoom = fit.zoom;
    setBaseZoom(fit.zoom);

    this.dispatchEvent(
      new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }),
    );
  }

  /**
   * Debounces resize via rAF so the scene resize and re-render happen
   * in the same frame, preventing visible flashes during CSS transitions.
   */
  /* v8 ignore next 7 -- rAF scheduling: not triggered in jsdom */
  private scheduleResize() {
    if (this.resizeRafId !== null) return;
    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.resizeScene();
    });
  }

  /** Resizes the canvas to match the element dimensions. */
  private resizeScene() {
    if (!this.scene) return;
    const rect = this.getBoundingClientRect();
    this.scene.resize(rect.width, rect.height);
    this.renderScene();
  }

  private dispatchCanvasEvent = <K extends keyof CanvasEventMap>(
    name: K,
    detail: CanvasEventMap[K],
  ) => {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  };

  private handleContainerKeyDown = (e: KeyboardEvent) => {
    if (!this.scene) return;
    const needsRender = handleKeyDown(e, {
      panBy: (dx, dy) => this.scene?.panBy(dx, dy),
      hoveredNodeId: this.scene.hoveredNodeId,
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
   * Handles animation ticking and delegates to renderScene().
   */
  private onFrame(timestamp: number, dt: number): void {
    this.time = timestamp;

    // Tick opacity transition animations
    const alphaAnimating = tickAnimationMap(this.nodeAlphaMap, dt);
    if (alphaAnimating && !this.isAnimating) {
      this.isAnimating = true;
    }

    this.renderScene();

    // Re-check: if only alpha was animating and it settled, stop
    if (this.isAnimating && !alphaAnimating) {
      this.updateAnimatingState();
    }
  }

  /** Recalculates whether the animation loop should remain active based on current state. */
  private updateAnimatingState() {
    const hasFadingNodes = this.fadingOutNodes.size > 0;

    // Only count entries that are still mid-transition — settled entries
    // (progress >= 1) are awaiting cleanup and shouldn't keep the loop alive.
    let hasAlphaAnimations = false;
    for (const v of this.nodeAlphaMap.values()) {
      if (v.progress < 1) {
        hasAlphaAnimations = true;
        break;
      }
    }

    // Selection rings, cycle glow, and cluster dash animations only need
    // continuous rendering when motion is enabled. With reduced motion,
    // these render as static visuals — no per-frame updates needed.
    const needsMotionAnimation =
      !prefersReducedMotion.get() &&
      (Boolean(this.selectedNode) ||
        Boolean(this.selectedCluster) ||
        (this.layout.cycleNodes?.size ?? 0) > 0);

    this.isAnimating = needsMotionAnimation || hasFadingNodes || hasAlphaAnimations;
  }

  /** Builds the scene config and delegates rendering to the canvas scene. */
  private renderScene() {
    this.perfOverlay?.begin();
    if (!this.scene || !this.theme) return;

    // Sync fading nodes into the scene
    this.scene.fadingOutNodes = this.fadingOutNodes;

    const config: SceneConfig = {
      nodes: this.nodes,
      edges: this.edges,
      layout: this.layout,
      theme: this.theme,
      selectedNode: this.selectedNode,
      selectedCluster: this.selectedCluster,
      hoveredNode: this.scene.hoveredNodeId,
      hoveredCluster: this.scene.hoveredClusterId,
      searchQuery: this.searchQuery,
      viewMode: this.viewMode,
      transitiveDeps: this.transitiveDeps,
      transitiveDependents: this.transitiveDependents,
      showDirectDeps: this.showDirectDeps,
      showTransitiveDeps: this.showTransitiveDeps,
      showDirectDependents: this.showDirectDependents,
      showTransitiveDependents: this.showTransitiveDependents,
      previewFilter: this.previewFilter,
      dimmedNodeIds: this.dimmedNodeIds,
      connectedNodes: this.getConnectedNodesSet(),
      nodeAlphaMap: this.nodeAlphaMap,
      manualNodePositions: this.manualNodePositions,
      manualClusterPositions: this.manualClusterPositions,
      zoom: this._zoom,
      time: this.time,
    };

    this.scene.render(config);

    // Update cursor based on interaction state
    if (this.containerEl) {
      this.containerEl.style.cursor = this.scene.getCursorStyle();
    }

    // Clean up completed fading nodes
    if (this.fadingOutNodes.size === 0 && this.isAnimating) {
      this.updateAnimatingState();
    }

    this.perfOverlay?.end();
  }

  /** Renders the container div and hidden DOM accessibility tree. */
  override render(): TemplateResult {
    return html`
      <div
        id="canvas-container"
        tabindex="-1"
        role="img"
        aria-hidden="true"
        aria-label="Dependency graph visualization"
        @keydown=${this.handleContainerKeyDown}
      ></div>
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
