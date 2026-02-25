import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { ChainDisplayMode } from '@graph/signals/graph.signals';
import type { TransitiveResult } from '@graph/utils';
import { type CanvasTheme, resolveCanvasTheme } from '@graph/utils/canvas-theme';
import { getConnectedNodes } from '@graph/utils/connections';
import { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import { setBaseZoom } from '@shared/signals/index';
import { ZOOM_CONFIG } from '@shared/utils/zoom-constants';
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
import { Starfield } from './starfield';

@customElement('graph-canvas')
export class GraphCanvas extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare nodes: GraphNode[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  declare selectedNode: GraphNode | null;

  @property({ attribute: false })
  declare selectedCluster: string | null;

  @property({ attribute: false })
  declare hoveredNode: string | null;

  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string;

  @property({ type: String, attribute: 'view-mode' })
  declare viewMode: ViewMode;

  @property({ type: String, attribute: 'chain-display' })
  declare chainDisplay: ChainDisplayMode;

  @property({ type: Number })
  declare zoom: number;

  @property({ type: Boolean, attribute: 'enable-animation' })
  declare enableAnimation: boolean;

  @property({ attribute: false })
  declare transitiveDeps: TransitiveResult | undefined;

  @property({ attribute: false })
  declare transitiveDependents: TransitiveResult | undefined;

  @property({ attribute: false })
  declare previewFilter: PreviewFilter | undefined;

  // ========================================
  // Internal State & Controllers
  // ========================================

  @query('canvas')
  private declare canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private readonly layout = new GraphLayoutController(this, {
    enableAnimation: false,
    animationTicks: 30,
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
  private nodeWeights = new Map<string, number>();
  private nodeMap = new Map<string, GraphNode>();
  private connectedNodesCache: { nodeId: string; result: Set<string> } | null = null;
  private routedEdgeMapCache: Map<string, RoutedEdge> | null = null;
  private lastRoutedEdgesRef: RoutedEdge[] | undefined = undefined;
  private theme!: CanvasTheme;

  // Animation & Render State
  private animationFrameId: number | null = null;
  private time = 0;
  private didInitialFit = false;
  private isAnimating = false;

  // Starfield background
  private starfield = new Starfield();

  constructor() {
    super();
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.selectedCluster = null;
    this.hoveredNode = null;
    this.searchQuery = '';
    this.viewMode = ViewMode.Full;
    this.chainDisplay = 'direct';
    this.zoom = 1;
    this.enableAnimation = false;
  }

  // ========================================
  // Styles
  // ========================================

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

  // ========================================
  // Lifecycle
  // ========================================

  override firstUpdated(): void {
    this.theme = resolveCanvasTheme(this);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { alpha: true })!;
      this.resizeCanvas();
      window.addEventListener('resize', this.handleResize);
      this.centerGraph();
      this.requestRender();
    } else {
      console.error('Canvas element not found in firstUpdated');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.handleResize);
    this.stopRenderLoop();
  }

  override willUpdate(changedProps: PropertyValues<this>): void {
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      const isFilterChange =
        this.layout.nodePositions.size > 0 &&
        this.nodes.every((n) => this.layout.nodePositions.has(n.id));

      if (!isFilterChange) {
        this.layout.enableAnimation = this.enableAnimation;
        this.layout.computeLayout(this.nodes, this.edges).catch((err) => {
          console.error('Layout computation failed', err);
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

    if (changedProps.has('selectedNode')) {
      this.connectedNodesCache = null;
    }

    if (changedProps.has('enableAnimation')) {
      this.layout.enableAnimation = this.enableAnimation;
      if (!this.enableAnimation) {
        this.layout.stopAnimation();
      } else if (this.nodes.length > 0) {
        this.layout.computeLayout(this.nodes, this.edges).catch(console.error);
      }
    }

    if (
      changedProps.has('selectedNode') ||
      changedProps.has('viewMode') ||
      changedProps.has('chainDisplay')
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
  }

  private rebuildNodeMap() {
    this.nodeMap.clear();
    for (const node of this.nodes) {
      this.nodeMap.set(node.id, node);
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
    return this.pathCache.get(key)!;
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

  // ========================================
  // Interaction Context
  // ========================================

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

  // ========================================
  // Event Handlers
  // ========================================

  private handleResize = () => {
    this.resizeCanvas();
  };

  private resizeCanvas() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    if (this.theme) {
      this.starfield.setColors([
        this.theme.starfieldWarm,
        this.theme.starfieldGolden,
        this.theme.starfieldCool,
      ]);
    }
    this.starfield.generate(rect.width, rect.height);
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

  // ========================================
  // Rendering
  // ========================================

  private requestRender() {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  private renderLoop = (timestamp: number) => {
    this.animationFrameId = null;
    this.time = timestamp;
    this.renderCanvas();

    if (this.isAnimating) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  };

  private stopRenderLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateAnimatingState() {
    const hasCycleNodes = (this.layout.cycleNodes?.size ?? 0) > 0;
    const hasSelectedChain =
      !!this.selectedNode && this.viewMode !== 'full' && this.viewMode !== 'path';
    this.isAnimating = hasCycleNodes || hasSelectedChain;
  }

  private renderCanvas() {
    if (!this.ctx || !this.canvas) return;

    const pan = this.interactionState.pan;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, width, height);

    this.starfield.render(this.ctx, pan.x, pan.y);

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
        hoveredCluster: this.interactionState.hoveredCluster,
        viewMode: this.viewMode,
        chainDisplay: this.chainDisplay,
        transitiveDeps: this.transitiveDeps,
        transitiveDependents: this.transitiveDependents,
        manualNodePositions: this.manualNodePositions,
        manualClusterPositions: this.manualClusterPositions,
        nodeMap: this.nodeMap,
        routedEdgeMap: this.getRoutedEdgeMap(),
      },
      viewport,
    );

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
        chainDisplay: this.chainDisplay,
        transitiveDeps: this.transitiveDeps,
        transitiveDependents: this.transitiveDependents,
        previewFilter: this.previewFilter,
        nodeWeights: this.nodeWeights,
        manualNodePositions: this.manualNodePositions,
        manualClusterPositions: this.manualClusterPositions,
        getPathForNode: this.getPathForNode,
        connectedNodes: this.getConnectedNodesSet(),
      },
      viewport,
    );

    this.ctx.restore();

    this.renderTooltip();
  }

  private renderTooltip() {
    if (!this.hoveredNode) return;
    const node = this.nodes.find((n) => n.id === this.hoveredNode);
    if (!node || node.name.length <= 20) return;

    const layoutPos = this.layout.nodePositions.get(node.id);
    if (!layoutPos) return;
    const clusterPos = this.layout.clusterPositions.get(layoutPos.clusterId);
    if (!clusterPos) return;

    const manualClusterPos = this.manualClusterPositions.get(layoutPos.clusterId);
    const manualPos = this.manualNodePositions.get(node.id);
    const worldX = (manualClusterPos?.x ?? clusterPos.x) + (manualPos?.x ?? layoutPos.x);
    const worldY = (manualClusterPos?.y ?? clusterPos.y) + (manualPos?.y ?? layoutPos.y);
    const size = getNodeSize(node, this.edges, this.nodeWeights.get(node.id));

    const pan = this.interactionState.pan;
    const screenX = worldX * this.zoom + pan.x;
    const screenY = worldY * this.zoom + pan.y;

    const text = node.name;
    this.ctx.font = '12px var(--fonts-body, sans-serif)';
    const padding = 8;
    const metrics = this.ctx.measureText(text);
    const tooltipWidth = metrics.width + padding * 2;
    const tooltipHeight = 24;

    const x = screenX - tooltipWidth / 2;
    const y = screenY - size * this.zoom - 35;

    this.ctx.save();
    this.ctx.fillStyle = this.theme.tooltipBg;
    this.ctx.strokeStyle = adjustColorForZoom(
      getNodeTypeColorFromTheme(node.type, this.theme),
      this.zoom,
    );
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, tooltipWidth, tooltipHeight, 4);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, screenX, y + tooltipHeight / 2);
    this.ctx.restore();
  }

  // ========================================
  // Utils
  // ========================================

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
        @mousedown=${this.handleCanvasMouseDown}
        @mousemove=${this.handleCanvasMouseMove}
        @mouseup=${this.handleCanvasMouseUp}
        @mouseleave=${this.handleCanvasMouseUp}
        @wheel=${this.handleCanvasWheel}
      ></canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'graph-canvas': GraphCanvas;
  }
}
