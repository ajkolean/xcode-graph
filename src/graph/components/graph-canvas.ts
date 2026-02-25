import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { ChainDisplayMode } from '@graph/signals/graph.signals';
import type { TransitiveResult } from '@graph/utils';
import { type CanvasTheme, resolveCanvasTheme } from '@graph/utils/canvas-theme';
import { getConnectedNodes } from '@graph/utils/connections';
import { type NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import { setBaseZoom } from '@shared/signals/index';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { generateBezierPath, generatePortRoutedPath } from '@ui/utils/paths';
import { computeNodeWeights, getNodeSize } from '@ui/utils/sizing';
import {
  calculateViewportBounds,
  isCircleInViewport,
  isLineInViewport,
  type ViewportBounds,
} from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { ZOOM_CONFIG } from '@ui/utils/zoom-constants';
import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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

  // Interaction State
  private pan: { x: number; y: number };
  private isDragging = false;
  private draggedNodeId: string | null = null;
  private draggedClusterId: string | null = null;
  private lastMousePos = { x: 0, y: 0 };
  private manualNodePositions = new Map<string, { x: number; y: number }>();
  private manualClusterPositions = new Map<string, { x: number; y: number }>();
  private pathCache = new Map<string, Path2D>();
  private nodeWeights = new Map<string, number>();
  private theme!: CanvasTheme;

  // Hover State
  private hoveredCluster: string | null = null;

  // Track if mousedown was on empty space (for deselection on mouseup)
  private clickedEmptySpace = false;
  private hasMoved = false;

  // Animation State
  private animationFrameId: number | null = null;
  private time = 0;
  private didInitialFit = false;

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
    this.pan = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
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
      this.startRenderLoop();
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
      // Detect if this is a filter change (subset of already-laid-out nodes)
      // vs truly new graph data that requires a full re-layout.
      const isFilterChange =
        this.layout.nodePositions.size > 0 &&
        this.nodes.every((n) => this.layout.nodePositions.has(n.id));

      if (!isFilterChange) {
        this.layout.enableAnimation = this.enableAnimation;
        // ELK layout is asynchronous
        this.layout.computeLayout(this.nodes, this.edges).catch((err) => {
          console.error('Layout computation failed', err);
        });
        this.manualNodePositions.clear();
        this.manualClusterPositions.clear();
        this.updatePathCache();
        this.didInitialFit = false; // Reset fit flag when data changes
      }

      // Compute transitive weights for node sizing (single O(n+e) pass)
      this.nodeWeights = computeNodeWeights(this.nodes, this.edges);
    }

    if (changedProps.has('enableAnimation')) {
      this.layout.enableAnimation = this.enableAnimation;
      if (!this.enableAnimation) {
        this.layout.stopAnimation();
      } else if (this.nodes.length > 0) {
        this.layout.computeLayout(this.nodes, this.edges).catch(console.error);
      }
    }
  }

  override updated(changedProps: PropertyValues<this>): void {
    super.updated(changedProps);

    // Fit viewport once after layout completes (not during render)
    if (!this.didInitialFit && this.layout.clusterPositions.size > 0) {
      this.fitToViewport();
      this.didInitialFit = true;
    }
  }

  private updatePathCache() {
    this.pathCache.clear();
  }

  private getPathForNode(node: GraphNode): Path2D {
    const key = `${node.type}-${node.platform}`;
    if (!this.pathCache.has(key)) {
      const pathString = getNodeIconPath(node.type, node.platform);
      this.pathCache.set(key, new Path2D(pathString));
    }
    return this.pathCache.get(key)!;
  }

  private centerGraph() {
    const rect = this.getBoundingClientRect();
    this.pan = { x: rect.width / 2, y: rect.height / 2 };
  }

  /**
   * Fit graph into viewport: compute bounding box of all clusters and adjust pan/zoom.
   */
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
    setBaseZoom(fitZoom);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    this.pan = {
      x: rect.width / 2 - centerX * fitZoom,
      y: rect.height / 2 - centerY * fitZoom,
    };

    // Sync zoom with parent signal
    this.dispatchEvent(
      new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }),
    );
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
    this.renderCanvas();
  }

  private hitTestCluster(worldPos: { x: number; y: number }): string | null {
    for (const cluster of this.layout.clusters) {
      const layoutPos = this.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      const manualPos = this.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      const dx = worldPos.x - cx;
      const dy = worldPos.y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        return cluster.id;
      }
    }
    return null;
  }

  private hitTestNode(worldPos: { x: number; y: number }): GraphNode | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      if (!node) continue;
      const layoutPos = this.layout.nodePositions.get(node.id);
      const clusterPos = this.layout.clusterPositions.get(node.project || 'External');

      if (!layoutPos || !clusterPos) continue;

      const manualClusterPos = this.manualClusterPositions.get(node.project || 'External');
      const clusterX = manualClusterPos?.x ?? clusterPos.x;
      const clusterY = manualClusterPos?.y ?? clusterPos.y;

      const manualPos = this.manualNodePositions.get(node.id);
      const wx = clusterX + (manualPos?.x ?? layoutPos.x);
      const wy = clusterY + (manualPos?.y ?? layoutPos.y);
      const size = getNodeSize(node, this.edges, this.nodeWeights.get(node.id));

      const dx = worldPos.x - wx;
      const dy = worldPos.y - wy;

      if (dx * dx + dy * dy <= size * size) {
        return node;
      }
    }
    return null;
  }

  private dispatchCanvasEvent(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private handleCanvasMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.hasMoved = false;
    this.clickedEmptySpace = false;
    this.lastMousePos = { x: e.clientX, y: e.clientY };

    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);

    // Check clusters first (if holding shift/cmd, allow cluster drag)
    if (e.shiftKey || e.metaKey) {
      const clusterId = this.hitTestCluster(worldPos);
      if (clusterId) {
        this.draggedClusterId = clusterId;
        this.dispatchCanvasEvent('cluster-select', { clusterId });
        this.isDragging = false;
        return;
      }
    }

    // Check nodes
    const hitNode = this.hitTestNode(worldPos);
    if (hitNode) {
      this.draggedNodeId = hitNode.id;
      const newSelection = this.selectedNode?.id === hitNode.id ? null : hitNode;
      this.dispatchCanvasEvent('node-select', { node: newSelection });
      this.isDragging = false;
      return;
    }

    // Check clusters (for selection without dragging)
    const clusterId = this.hitTestCluster(worldPos);
    if (clusterId) {
      this.dispatchCanvasEvent('cluster-select', { clusterId });
      return;
    }

    // Mark that we clicked on empty space - deselection happens in mouseup if we didn't drag
    this.clickedEmptySpace = true;
  };

  private handleDragCluster(worldPos: { x: number; y: number }) {
    this.hasMoved = true;
    this.manualClusterPositions.set(this.draggedClusterId!, {
      x: worldPos.x,
      y: worldPos.y,
    });
  }

  private handleDragNode(worldPos: { x: number; y: number }) {
    this.hasMoved = true;
    const dragNode = this.nodes.find((n) => n.id === this.draggedNodeId);
    if (!dragNode) return;

    const layoutClusterPos = this.layout.clusterPositions.get(dragNode.project || 'External');
    if (!layoutClusterPos) return;

    const manualClusterPos = this.manualClusterPositions.get(dragNode.project || 'External');
    const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
    const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;

    this.manualNodePositions.set(dragNode.id, {
      x: worldPos.x - clusterX,
      y: worldPos.y - clusterY,
    });
  }

  private handlePan(e: MouseEvent) {
    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;
    this.pan = { x: this.pan.x + dx, y: this.pan.y + dy };
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.hasMoved = true;
  }

  private handleHoverDetection(worldPos: { x: number; y: number }) {
    const hitNode = this.hitTestNode(worldPos);
    const hitNodeId = hitNode?.id ?? null;
    const hitNodeCluster = hitNode ? hitNode.project || 'External' : null;

    if (hitNodeId !== this.hoveredNode) {
      this.hoveredNode = hitNodeId;
      this.dispatchCanvasEvent('node-hover', { nodeId: hitNodeId });
    }

    const hitClusterId = hitNodeCluster ?? this.hitTestCluster(worldPos);

    if (hitClusterId !== this.hoveredCluster) {
      this.hoveredCluster = hitClusterId;
      this.dispatchCanvasEvent('cluster-hover', { clusterId: hitClusterId });
    }
  }

  private handleCanvasMouseMove = (e: MouseEvent) => {
    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);

    if (this.draggedClusterId) {
      this.handleDragCluster(worldPos);
    } else if (this.draggedNodeId) {
      this.handleDragNode(worldPos);
    } else if (this.isDragging) {
      this.handlePan(e);
    } else {
      this.handleHoverDetection(worldPos);
    }
  };

  private handleCanvasMouseUp = (e?: MouseEvent) => {
    // Deselect only if we clicked on empty space and didn't drag
    if (this.clickedEmptySpace && !this.hasMoved) {
      this.dispatchCanvasEvent('node-select', { node: null });
      this.dispatchCanvasEvent('cluster-select', { clusterId: null });
    }

    this.isDragging = false;
    this.clickedEmptySpace = false;
    this.draggedNodeId = null;
    this.draggedClusterId = null;
    setTimeout(() => {
      this.hasMoved = false;
    }, 0);

    // Only clear hover state when leaving the canvas
    if (e?.type === 'mouseleave') {
      if (this.hoveredNode) {
        this.hoveredNode = null;
        this.dispatchCanvasEvent('node-hover', { nodeId: null });
      }
      if (this.hoveredCluster) {
        this.hoveredCluster = null;
        this.dispatchCanvasEvent('cluster-hover', { clusterId: null });
      }
    }
  };

  private handleCanvasWheel = (e: WheelEvent) => {
    e.preventDefault();

    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(
      Math.max(ZOOM_CONFIG.MIN_ZOOM, this.zoom + delta),
      ZOOM_CONFIG.MAX_ZOOM,
    );

    if (newZoom !== this.zoom) {
      const { x, y } = this.getMousePos(e);
      const worldPos = this.screenToWorld(x, y);

      this.zoom = newZoom;

      this.pan = {
        x: x - worldPos.x * this.zoom,
        y: y - worldPos.y * this.zoom,
      };

      this.dispatchEvent(
        new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }),
      );
    }
  };

  // ========================================
  // Rendering
  // ========================================

  private startRenderLoop() {
    const loop = (timestamp: number) => {
      this.time = timestamp;
      this.renderCanvas();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopRenderLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private renderCanvas() {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, width, height);

    // Render starfield behind everything (in screen space)
    this.starfield.render(this.ctx, this.pan.x, this.pan.y);

    // Apply world transform for graph elements
    this.ctx.save();
    this.ctx.translate(this.pan.x, this.pan.y);
    this.ctx.scale(this.zoom, this.zoom);

    const viewport = calculateViewportBounds(
      this.canvas.width / (window.devicePixelRatio || 1),
      this.canvas.height / (window.devicePixelRatio || 1),
      this.pan.x,
      this.pan.y,
      this.zoom,
    );

    this.renderClusters(viewport);
    this.renderEdges(viewport);
    this.renderNodes(viewport);

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

    const screenX = worldX * this.zoom + this.pan.x;
    const screenY = worldY * this.zoom + this.pan.y;

    const text = node.name;
    this.ctx.font = '12px var(--fonts-body, sans-serif)';
    const padding = 8;
    const metrics = this.ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const height = 24;

    const x = screenX - width / 2;
    const y = screenY - size * this.zoom - 35;

    this.ctx.save();
    this.ctx.fillStyle = this.theme.tooltipBg;
    this.ctx.strokeStyle = adjustColorForZoom(
      getNodeTypeColorFromTheme(node.type, this.theme),
      this.zoom,
    );
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, 4);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, screenX, y + height / 2);
    this.ctx.restore();
  }

  private isClusterInViewport(
    cx: number,
    cy: number,
    radius: number,
    viewport: ViewportBounds,
  ): boolean {
    return !(
      cx + radius < viewport.minX ||
      cx - radius > viewport.maxX ||
      cy + radius < viewport.minY ||
      cy - radius > viewport.maxY
    );
  }

  private drawClusterFillAndBorder(
    cx: number,
    cy: number,
    radius: number,
    clusterColor: string,
    isActive: boolean,
    isSelected: boolean,
    shouldDim: boolean,
    clusterType: string,
  ) {
    const dimFactor = shouldDim ? 0.3 : 1.0;
    const borderOpacity = adjustOpacityForZoom(0.5, this.zoom);

    // Draw cluster fill
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = clusterColor;
    this.ctx.globalAlpha = isActive ? 0.05 : 0.08;
    this.ctx.fill();

    this.ctx.globalAlpha = dimFactor;

    // Draw cluster border
    this.ctx.lineWidth = isActive ? 2.5 : 2;
    this.ctx.strokeStyle = clusterColor;
    this.ctx.globalAlpha = (isActive ? 0.9 : borderOpacity) * dimFactor;
    this.ctx.setLineDash(clusterType === 'project' ? [8, 8] : [3, 8]);

    if (isSelected) {
      this.ctx.lineDashOffset = -this.time / 50;
    }

    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.lineDashOffset = 0;
  }

  private drawClusterLabels(
    cx: number,
    cy: number,
    radius: number,
    clusterColor: string,
    isActive: boolean,
    shouldDim: boolean,
    name: string,
    nodeCount: number,
  ) {
    const dimFactor = shouldDim ? 0.3 : 1.0;

    this.ctx.globalAlpha = (isActive ? 1 : 0.7) * dimFactor;
    this.ctx.fillStyle = clusterColor;
    this.ctx.font = `${isActive ? 600 : 500} 13px var(--fonts-body, sans-serif)`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(name, cx, cy - radius - 12);

    this.ctx.font = `${isActive ? 500 : 400} 11px var(--fonts-body, sans-serif)`;
    this.ctx.globalAlpha = (isActive ? 0.8 : 0.5) * dimFactor;
    this.ctx.fillText(`${nodeCount} targets`, cx, cy - radius + 4);
  }

  private renderClusters(viewport: ViewportBounds) {
    const activeClusterId = this.selectedCluster || this.hoveredCluster;

    for (const cluster of this.layout.clusters) {
      const layoutPos = this.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      const manualPos = this.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      if (!this.isClusterInViewport(cx, cy, radius, viewport)) continue;

      const clusterColor = generateColor(cluster.name, cluster.type);
      const isHighlighted = this.hoveredCluster === cluster.id;
      const isSelected = this.selectedCluster === cluster.id;
      const isActive = isHighlighted || isSelected;
      const shouldDim = !!(activeClusterId && activeClusterId !== cluster.id);

      this.drawClusterFillAndBorder(
        cx,
        cy,
        radius,
        clusterColor,
        isActive,
        isSelected,
        shouldDim,
        cluster.type,
      );
      this.drawClusterLabels(
        cx,
        cy,
        radius,
        clusterColor,
        isActive,
        shouldDim,
        cluster.name,
        cluster.nodes.length,
      );

      this.ctx.globalAlpha = 1.0;
    }
  }

  private getNodeWorldPosition(node: GraphNode): { x: number; y: number } | null {
    const layoutPos = this.layout.nodePositions.get(node.id);
    const layoutClusterPos = this.layout.clusterPositions.get(node.project || 'External');
    if (!layoutPos || !layoutClusterPos) return null;

    const clusterId = node.project || 'External';
    const manualClusterPos = this.manualClusterPositions.get(clusterId);
    const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
    const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;

    const manualPos = this.manualNodePositions.get(node.id);
    return {
      x: clusterX + (manualPos?.x ?? layoutPos.x),
      y: clusterY + (manualPos?.y ?? layoutPos.y),
    };
  }

  private isNodeDimmed(
    node: GraphNode,
    isSelected: boolean,
    isConnected: boolean | null,
    isChainActive: boolean | null,
    clusterDim: boolean | '' | null,
  ): boolean {
    const isSearchMatch =
      this.searchQuery && node.name.toLowerCase().includes(this.searchQuery.toLowerCase());

    const matchesPreview =
      !this.previewFilter ||
      (this.previewFilter.type === 'nodeType' && node.type === this.previewFilter.value) ||
      (this.previewFilter.type === 'platform' && node.platform === this.previewFilter.value) ||
      (this.previewFilter.type === 'origin' && node.origin === this.previewFilter.value) ||
      (this.previewFilter.type === 'project' && node.project === this.previewFilter.value) ||
      (this.previewFilter.type === 'package' &&
        node.type === 'package' &&
        node.name === this.previewFilter.value);

    return !!(
      (this.searchQuery && !isSearchMatch) ||
      (!isChainActive && this.selectedNode && !isSelected && !isConnected) ||
      (this.previewFilter && !matchesPreview) ||
      clusterDim
    );
  }

  private drawNodeEffects(
    x: number,
    y: number,
    size: number,
    adjustedColor: string,
    alpha: number,
    isSelected: boolean,
    isCycleNode: boolean,
    isDimmed: boolean,
    chainAlpha: number,
  ) {
    // Cycle node glow effect
    if (isCycleNode && !isDimmed && chainAlpha > 0.3) {
      const pulse = (Math.sin(this.time / 300) + 1) / 2;
      const glowRadius = size + 6 + pulse * 3;

      this.ctx.beginPath();
      this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.theme.cycleGlowColor;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.4 + pulse * 0.3;
      this.ctx.stroke();
      this.ctx.globalAlpha = alpha;
    }

    if (isSelected) {
      const pulse = (Math.sin(this.time / 200) + 1) / 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size + 8 + pulse * 4, 0, Math.PI * 2);
      this.ctx.strokeStyle = adjustedColor;
      this.ctx.globalAlpha = alpha * 0.3 * (1 - pulse);
      this.ctx.stroke();
      this.ctx.globalAlpha = alpha;
    }
  }

  private drawNodeIcon(
    node: GraphNode,
    x: number,
    y: number,
    size: number,
    adjustedColor: string,
    isSelected: boolean,
    isHovered: boolean,
  ) {
    if (isHovered || isSelected) {
      this.ctx.shadowColor = adjustedColor;
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
    }

    const scale = (size / 12) * (isHovered || isSelected ? 1.08 : 1.0);
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);

    const path = this.getPathForNode(node);
    this.ctx.fillStyle = this.theme.tooltipBg;
    this.ctx.fill(path);

    this.ctx.strokeStyle = adjustedColor;
    this.ctx.lineWidth = (isSelected ? 2.5 : 2) / scale;
    this.ctx.stroke(path);

    this.ctx.scale(1 / scale, 1 / scale);
    this.ctx.translate(-x, -y);
    this.ctx.shadowBlur = 0;
  }

  private drawNodeLabel(
    node: GraphNode,
    x: number,
    y: number,
    size: number,
    adjustedColor: string,
    alpha: number,
    isSelected: boolean,
    isHovered: boolean,
    isConnected: boolean | null,
    isInChain: boolean,
  ) {
    const labelText =
      node.name.length > 20 && !isHovered && !isConnected
        ? `${node.name.substring(0, 20)}...`
        : node.name;

    this.ctx.font = `${isSelected ? '600' : isConnected || isInChain ? '500' : '400'} 12px var(--fonts-body, sans-serif)`;
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = adjustedColor;

    this.ctx.globalAlpha = alpha * 0.9;
    this.ctx.shadowColor = this.theme.shadowColor;
    this.ctx.shadowBlur = 8;
    this.ctx.fillText(labelText, x, y + size + 22);

    this.ctx.globalAlpha = alpha;
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText(labelText, x, y + size + 22);
  }

  /**
   * Determines the chain alpha for a node, returning null if the node should be skipped entirely.
   */
  private resolveChainAlpha(
    node: GraphNode,
    isSelected: boolean,
    isChainActive: boolean | GraphNode | null,
  ): number | null {
    if (!isChainActive) return 1.0;

    const isInDepsChain = this.transitiveDeps?.nodes.has(node.id) ?? false;
    const isInDependentsChain = this.transitiveDependents?.nodes.has(node.id) ?? false;
    const isInChain = isSelected || isInDepsChain || isInDependentsChain;

    if (this.chainDisplay === 'direct' && !isInChain) return null;
    if (this.chainDisplay === 'highlight') {
      return this.getNodeChainAlpha(node.id, isSelected, isInDepsChain, isInDependentsChain);
    }
    return 1.0;
  }

  /**
   * Determines whether a label should be shown for this node.
   */
  private shouldShowNodeLabel(
    isHovered: boolean,
    isSelected: boolean,
    isConnected: boolean | GraphNode | null,
    isChainActive: boolean | GraphNode | null,
    chainAlpha: number,
    nodeId: string,
  ): boolean {
    if (this.zoom >= 0.5 || isHovered || isSelected || isConnected) return true;
    if (!isChainActive) return false;

    const isInDepsChain = this.transitiveDeps?.nodes.has(nodeId) ?? false;
    const isInDependentsChain = this.transitiveDependents?.nodes.has(nodeId) ?? false;
    const isInChain = isSelected || isInDepsChain || isInDependentsChain;
    return isInChain && chainAlpha > 0.3;
  }

  /**
   * Renders a single node onto the canvas, including effects, icon, and label.
   */
  private renderSingleNode(
    node: GraphNode,
    x: number,
    y: number,
    isChainActive: boolean | GraphNode | null,
    connectedNodes: Set<string>,
    chainAlpha: number,
  ) {
    const size = getNodeSize(node, this.edges, this.nodeWeights.get(node.id));
    const isHovered = this.hoveredNode === node.id;
    const isSelected = this.selectedNode?.id === node.id;
    const isConnected = this.selectedNode && connectedNodes.has(node.id);

    const color = getNodeTypeColorFromTheme(node.type, this.theme);
    const adjustedColor = adjustColorForZoom(color, this.zoom);
    const clusterId = node.project || 'External';
    const clusterDim =
      (this.hoveredCluster && clusterId !== this.hoveredCluster) ||
      (this.selectedCluster && clusterId !== this.selectedCluster);

    const isDimmed = this.isNodeDimmed(node, isSelected, isConnected, isChainActive, clusterDim);
    const alpha = (isDimmed ? 0.3 : 1.0) * chainAlpha;
    this.ctx.globalAlpha = alpha;

    const isCycleNode = this.layout.cycleNodes?.has(node.id) ?? false;
    this.drawNodeEffects(
      x,
      y,
      size,
      adjustedColor,
      alpha,
      isSelected,
      isCycleNode,
      isDimmed,
      chainAlpha,
    );
    this.drawNodeIcon(node, x, y, size, adjustedColor, isSelected, isHovered);

    const isInChain =
      (this.transitiveDeps?.nodes.has(node.id) ?? false) ||
      (this.transitiveDependents?.nodes.has(node.id) ?? false) ||
      isSelected;
    if (
      this.shouldShowNodeLabel(
        isHovered,
        isSelected,
        isConnected,
        isChainActive,
        chainAlpha,
        node.id,
      )
    ) {
      this.drawNodeLabel(
        node,
        x,
        y,
        size,
        adjustedColor,
        alpha,
        isSelected,
        isHovered,
        isConnected,
        isInChain,
      );
    }
  }

  private renderNodes(viewport: ViewportBounds) {
    const connectedNodes = this.selectedNode
      ? getConnectedNodes(this.selectedNode.id, this.edges)
      : new Set<string>();

    const isChainActive =
      this.selectedNode && this.viewMode !== ViewMode.Full && this.viewMode !== ViewMode.Path;

    for (const node of this.nodes) {
      const pos = this.getNodeWorldPosition(node);
      if (!pos) continue;

      const { x, y } = pos;
      const size = getNodeSize(node, this.edges, this.nodeWeights.get(node.id));
      if (!isCircleInViewport({ x, y }, size, viewport)) continue;

      const isSelected = this.selectedNode?.id === node.id;
      const chainAlpha = this.resolveChainAlpha(node, isSelected, isChainActive);
      if (chainAlpha === null) continue;

      this.renderSingleNode(node, x, y, isChainActive, connectedNodes, chainAlpha);
    }
    this.ctx.globalAlpha = 1.0;
  }

  private getNodeChainAlpha(
    nodeId: string,
    isSelected: boolean,
    isInDepsChain: boolean,
    isInDependentsChain: boolean,
  ): number {
    if (isSelected) return 1.0;
    if (!isInDepsChain && !isInDependentsChain) return 0.08;

    // Find the shallowest depth from either chain
    let depth = Number.POSITIVE_INFINITY;
    let maxDepth = 1;

    if (isInDepsChain && this.transitiveDeps) {
      const d = this.transitiveDeps.nodeDepths.get(nodeId) ?? 0;
      if (d < depth) depth = d;
      maxDepth = Math.max(maxDepth, this.transitiveDeps.maxDepth);
    }
    if (isInDependentsChain && this.transitiveDependents) {
      const d = this.transitiveDependents.nodeDepths.get(nodeId) ?? 0;
      if (d < depth) depth = d;
      maxDepth = Math.max(maxDepth, this.transitiveDependents.maxDepth);
    }
    if (!Number.isFinite(depth)) depth = 0;

    // Depth 0 = selected node (1.0), max depth = 0.4
    return 1.0 - (depth / maxDepth) * 0.6;
  }

  private computeEdgeDepthOpacity(
    edgeKey: string,
    chain: { edges: Set<string>; edgeDepths: Map<string, number>; maxDepth: number },
  ): number {
    const depth = chain.edgeDepths.get(edgeKey) || 0;
    const maxDepth = chain.maxDepth || 1;
    return 1 - (depth / maxDepth) * 0.7;
  }

  private getEdgeOpacity(edge: GraphEdge): number {
    const edgeKey = `${edge.source}->${edge.target}`;
    const { transitiveDeps, transitiveDependents } = this;

    const inDepsChain = transitiveDeps?.edges.has(edgeKey);
    const inDependentsChain = transitiveDependents?.edges.has(edgeKey);

    if (this.viewMode === 'focused' && inDepsChain && transitiveDeps) {
      return this.computeEdgeDepthOpacity(edgeKey, transitiveDeps);
    }

    if (this.viewMode === 'dependents' && inDependentsChain && transitiveDependents) {
      return this.computeEdgeDepthOpacity(edgeKey, transitiveDependents);
    }

    if (this.viewMode === 'both') {
      if (inDepsChain && transitiveDeps) {
        return this.computeEdgeDepthOpacity(edgeKey, transitiveDeps);
      }
      if (inDependentsChain && transitiveDependents) {
        return this.computeEdgeDepthOpacity(edgeKey, transitiveDependents);
      }
    }

    return 1;
  }

  private renderEdges(viewport: ViewportBounds) {
    const selectedNodeId = this.selectedNode?.id;

    // Chain mode detection
    const isChainActive =
      this.selectedNode && this.viewMode !== ViewMode.Full && this.viewMode !== ViewMode.Path;

    // Build routed edge lookup map for cross-cluster edges
    const routedEdgeMap = new Map<string, RoutedEdge>();
    if (this.layout.routedEdges) {
      for (const re of this.layout.routedEdges) {
        routedEdgeMap.set(`${re.sourceNodeId}->${re.targetNodeId}`, re);
      }
    }

    this.ctx.lineWidth = 1;

    for (const edge of this.edges) {
      const edgeKey = `${edge.source}->${edge.target}`;
      const inDepsChain = this.transitiveDeps?.edges.has(edgeKey) ?? false;
      const inDependentsChain = this.transitiveDependents?.edges.has(edgeKey) ?? false;
      const inChain = inDepsChain || inDependentsChain;

      const isConnectedToSelected =
        edge.source === selectedNodeId || edge.target === selectedNodeId;

      // In chain mode with direct display, skip non-chain edges (keep selected node edges)
      if (isChainActive && this.chainDisplay === 'direct' && !inChain && !isConnectedToSelected) {
        continue;
      }

      this.renderSingleNodeEdge(
        edge,
        viewport,
        isConnectedToSelected,
        !!isChainActive,
        inChain,
        routedEdgeMap,
      );
    }
  }

  private isCycleEdge(edge: GraphEdge): boolean {
    const sourceScc = this.layout.nodeSccId?.get(edge.source);
    const targetScc = this.layout.nodeSccId?.get(edge.target);
    return (
      sourceScc !== undefined &&
      targetScc !== undefined &&
      sourceScc === targetScc &&
      (this.layout.sccSizes?.get(sourceScc) ?? 0) > 1
    );
  }

  private resolveEdgeColor(
    sourceNode: GraphNode,
    targetNode: GraphNode,
    isHighlighted: boolean,
    isCycleEdge: boolean,
  ): string {
    if (isCycleEdge) return this.theme.cycleEdgeColor;

    const colorNode =
      isHighlighted && this.selectedNode
        ? sourceNode.id === this.selectedNode.id
          ? targetNode
          : sourceNode
        : targetNode;
    const color = getNodeTypeColorFromTheme(colorNode.type, this.theme);

    return isHighlighted ? color : adjustColorForZoom(color, this.zoom);
  }

  private computeEdgeOpacity(
    edge: GraphEdge,
    isHighlighted: boolean,
    isChainActive: boolean,
    inChain: boolean,
    isCycleEdge: boolean,
  ): number {
    let opacity = isHighlighted ? 1.0 : 0.1;

    if (isCycleEdge) {
      opacity = Math.max(opacity, 0.8);
    }

    if (isChainActive && this.chainDisplay === 'highlight') {
      if (inChain) {
        const depthOpacity = this.getEdgeOpacity(edge);
        opacity = isHighlighted ? 1.0 : depthOpacity * 0.8;
      } else {
        opacity = 0.03;
      }
    } else {
      opacity *= this.getEdgeOpacity(edge);
    }

    return Math.min(1, opacity);
  }

  private drawRoutedEdgePath(
    routedEdge: RoutedEdge,
    sourceLayout: { x: number; y: number },
    targetLayout: { x: number; y: number },
    sClusterX: number,
    sClusterY: number,
    tClusterX: number,
    tClusterY: number,
    sourceNode: GraphNode,
    targetNode: GraphNode,
    isHighlighted: boolean,
  ) {
    if (isHighlighted) {
      const otherNode = sourceNode.id === this.selectedNode?.id ? targetNode : sourceNode;
      this.ctx.strokeStyle = getNodeTypeColorFromTheme(otherNode.type, this.theme);
      this.ctx.globalAlpha = 0.9;
    } else {
      const baseOpacity = 0.15;
      const targetOpacity = adjustOpacityForZoom(baseOpacity, this.zoom);
      const gray = Math.round(255 * targetOpacity);
      this.ctx.strokeStyle = `rgb(${gray}, ${gray}, ${gray})`;
      this.ctx.globalAlpha = 1.0;
    }

    const pathString = generatePortRoutedPath(
      { x: sourceLayout.x, y: sourceLayout.y },
      { x: routedEdge.sourcePort.x, y: routedEdge.sourcePort.y },
      { x: routedEdge.targetPort.x, y: routedEdge.targetPort.y },
      { x: targetLayout.x, y: targetLayout.y },
      routedEdge.waypoints,
      { x: sClusterX, y: sClusterY },
      { x: tClusterX, y: tClusterY },
    );
    this.ctx.stroke(new Path2D(pathString));
  }

  private drawDirectEdgePath(x1: number, y1: number, x2: number, y2: number) {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    if (distance > 150) {
      this.ctx.stroke(new Path2D(generateBezierPath(x1, y1, x2, y2)));
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  /**
   * Resolves the effective cluster position, using manual override if available.
   */
  private resolveClusterXY(
    clusterId: string,
    layoutPos: { x: number; y: number },
  ): { x: number; y: number } {
    const manual = this.manualClusterPositions.get(clusterId);
    return { x: manual?.x ?? layoutPos.x, y: manual?.y ?? layoutPos.y };
  }

  /**
   * Resolves world-space endpoint positions for an edge, accounting for manual overrides.
   * Returns null if any required layout data is missing.
   */
  private resolveEdgeEndpoints(edge: GraphEdge): {
    sourceNode: GraphNode;
    targetNode: GraphNode;
    sourceLayout: NodePosition;
    targetLayout: NodePosition;
    sourceClusterId: string;
    targetClusterId: string;
    sClusterX: number;
    sClusterY: number;
    tClusterX: number;
    tClusterY: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null {
    const sourceNode = this.nodes.find((n) => n.id === edge.source);
    const targetNode = this.nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;

    const sourceLayout = this.layout.nodePositions.get(edge.source);
    const targetLayout = this.layout.nodePositions.get(edge.target);
    if (!sourceLayout || !targetLayout) return null;

    const sourceClusterId = sourceNode.project || 'External';
    const targetClusterId = targetNode.project || 'External';
    const sClusterLayout = this.layout.clusterPositions.get(sourceClusterId);
    const tClusterLayout = this.layout.clusterPositions.get(targetClusterId);
    if (!sClusterLayout || !tClusterLayout) return null;

    const sCluster = this.resolveClusterXY(sourceClusterId, sClusterLayout);
    const tCluster = this.resolveClusterXY(targetClusterId, tClusterLayout);

    const sManual = this.manualNodePositions.get(edge.source);
    const tManual = this.manualNodePositions.get(edge.target);

    return {
      sourceNode, targetNode, sourceLayout, targetLayout,
      sourceClusterId, targetClusterId,
      sClusterX: sCluster.x, sClusterY: sCluster.y,
      tClusterX: tCluster.x, tClusterY: tCluster.y,
      x1: sCluster.x + (sManual?.x ?? sourceLayout.x),
      y1: sCluster.y + (sManual?.y ?? sourceLayout.y),
      x2: tCluster.x + (tManual?.x ?? targetLayout.x),
      y2: tCluster.y + (tManual?.y ?? targetLayout.y),
    };
  }

  /**
   * Applies visual styling to the canvas context for an edge.
   */
  private applyEdgeStyle(
    edge: GraphEdge,
    sourceNode: GraphNode,
    targetNode: GraphNode,
    isHighlighted: boolean,
    isChainActive: boolean,
    inChain: boolean,
    cycleEdge: boolean,
    isCrossCluster: boolean,
  ) {
    this.ctx.strokeStyle = this.resolveEdgeColor(sourceNode, targetNode, isHighlighted, cycleEdge);
    this.ctx.globalAlpha = this.computeEdgeOpacity(
      edge,
      isHighlighted,
      isChainActive,
      inChain,
      cycleEdge,
    );
    this.ctx.lineWidth = (isHighlighted ? 2.5 : cycleEdge ? 2 : 1) / this.zoom;
    this.ctx.setLineDash(cycleEdge ? [4, 4] : isCrossCluster ? [10, 5] : [4, 2]);

    const animateEdge =
      isHighlighted || (isChainActive && this.chainDisplay === 'highlight' && inChain);
    this.ctx.lineDashOffset = animateEdge ? this.time / 20 : 0;
  }

  /**
   * Returns true if an intra-cluster edge should be hidden at the current LOD level.
   */
  private shouldHideIntraClusterEdge(sourceClusterId: string, isHighlighted: boolean): boolean {
    return this.zoom < 0.6 && this.hoveredCluster !== sourceClusterId && !isHighlighted;
  }

  private renderSingleNodeEdge(
    edge: GraphEdge,
    viewport: ViewportBounds,
    isHighlighted: boolean,
    isChainActive: boolean,
    inChain: boolean,
    routedEdgeMap?: Map<string, RoutedEdge>,
  ) {
    const endpoints = this.resolveEdgeEndpoints(edge);
    if (!endpoints) return;

    const {
      sourceNode,
      targetNode,
      sourceLayout,
      targetLayout,
      sourceClusterId,
      targetClusterId,
      sClusterX,
      sClusterY,
      tClusterX,
      tClusterY,
      x1,
      y1,
      x2,
      y2,
    } = endpoints;

    const isIntraCluster = sourceClusterId === targetClusterId;
    if (isIntraCluster && this.shouldHideIntraClusterEdge(sourceClusterId, isHighlighted)) return;
    if (!isLineInViewport({ x: x1, y: y1 }, { x: x2, y: y2 }, viewport)) return;

    const cycleEdge = this.isCycleEdge(edge);
    const isCrossCluster = !isIntraCluster;

    this.applyEdgeStyle(
      edge,
      sourceNode,
      targetNode,
      isHighlighted,
      isChainActive,
      inChain,
      cycleEdge,
      isCrossCluster,
    );

    const edgeKey = `${edge.source}->${edge.target}`;
    const routedEdge = isCrossCluster ? routedEdgeMap?.get(edgeKey) : undefined;

    if (routedEdge) {
      this.drawRoutedEdgePath(
        routedEdge,
        sourceLayout,
        targetLayout,
        sClusterX,
        sClusterY,
        tClusterX,
        tClusterY,
        sourceNode,
        targetNode,
        isHighlighted,
      );
    } else if (!isCrossCluster) {
      this.drawDirectEdgePath(x1, y1, x2, y2);
    }

    this.ctx.setLineDash([]);
    this.ctx.lineDashOffset = 0;
  }

  // ========================================
  // Utils
  // ========================================

  private getMousePos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private screenToWorld(screenX: number, screenY: number) {
    return {
      x: (screenX - this.pan.x) / this.zoom,
      y: (screenY - this.pan.y) / this.zoom,
    };
  }

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
