/**
 * Raw Canvas2D Scene Renderer
 *
 * Single-pass render order:
 *   1. Clear canvas + background fill
 *   2. Transform: translate(pan) + scale(zoom)
 *   3. Draw clusters (fill, border, arc label)
 *   4. Draw edges (batched + individual)
 *   5. Draw nodes (icon, label, selection/cycle effects)
 *   6. Draw fading-out nodes
 *   7. Restore transform
 *   8. Draw tooltips (screen space, constant size)
 */

import type { LayoutController as GraphLayoutController } from '@graph/controllers/layout.controller';
import type { TransitiveResult } from '@graph/utils';
import {
  type AnimatedValue,
  getAnimatedAlpha,
  tickViewportTransition,
  type ViewportTransition,
} from '@graph/utils/canvas-animation';
import { resolveClusterPosition, resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { buildNodeQuadtree, findNodeAt, type IndexedNode } from '@graph/utils/spatial-index';
import type { Cluster, ClusterPosition, ViewMode } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { LOD_THRESHOLDS, ZOOM_CONFIG } from '@shared/utils/zoom-config';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { getNodeSize } from '@ui/utils/sizing';
import {
  calculateViewportBounds,
  isCircleInViewport,
  type ViewportBounds,
} from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import type { Quadtree } from 'd3-quadtree';
import {
  drawClusterBorder,
  drawClusterFill,
  drawClusterLabel,
  renderArcLabelBitmap as renderArcLabelBitmapFn,
  truncateText as truncateTextFn,
} from './canvas-draw-clusters';
import {
  drawClusterArteries,
  drawEdgePath as drawEdgePathFn,
  type EdgeMeta,
  renderSingleEdge,
} from './canvas-draw-edges';
import {
  drawCycleGlow,
  drawNodeIcon,
  drawNodeLabel,
  drawSelectionRings,
  NODE_HIT_RADIUS_MULTIPLIER,
} from './canvas-draw-nodes';
import { drawClusterTooltip, drawNodeTooltip } from './canvas-draw-tooltips';
import { computeFitToViewport, screenToWorld } from './canvas-viewport';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum search radius for node hit-testing (world-space pixels) */
const HIT_TEST_RADIUS = 50;

/** Padding around cluster bounds when fitting a cluster into the viewport */
const CLUSTER_VIEWPORT_PADDING = 50;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Full rendering state passed each frame. */
export interface SceneConfig {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: GraphLayoutController;
  theme: CanvasTheme;

  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  hoveredNode: string | null;
  hoveredCluster: string | null;
  searchQuery: string;
  viewMode: ViewMode;

  transitiveDeps: TransitiveResult | undefined;
  transitiveDependents: TransitiveResult | undefined;
  showDirectDeps: boolean;
  showTransitiveDeps: boolean;
  showDirectDependents: boolean;
  showTransitiveDependents: boolean;

  previewFilter: PreviewFilter | undefined;
  dimmedNodeIds: Set<string>;
  connectedNodes: Set<string>;
  nodeAlphaMap: Map<string, AnimatedValue>;

  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;

  zoom: number;
  time: number;
}

/** Callbacks fired by the scene for host component event dispatching. */
export interface SceneCallbacks {
  onNodeSelect: (node: GraphNode | null) => void;
  onClusterSelect: (clusterId: string | null) => void;
  onNodeHover: (nodeId: string | null) => void;
  onClusterHover: (clusterId: string | null) => void;
  onZoomChange: (zoom: number) => void;
  onRenderRequest: () => void;
  onInvalidateEdgePathCache: () => void;
}


// ---------------------------------------------------------------------------
// CanvasScene
// ---------------------------------------------------------------------------

export class CanvasScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 800;
  private height = 600;
  private dpr = 1;

  // Path2D cache for node icons
  private pathCache = new Map<string, Path2D>();

  // Path2D cache for bezier edge paths (avoids per-frame allocation)
  private bezierPathCache = new Map<string, Path2D>();
  private static readonly MAX_ARC_LABEL_CACHE_SIZE = 200;

  // Gradient cache for cluster fills
  private gradientCache = new Map<string, CanvasGradient>();

  // Arc text measurement cache
  private arcTextCache = new Map<string, { charWidths: number[]; totalWidth: number }>();
  private truncateCache = new Map<string, string>();
  private truncatedLabelCache = new Map<string, string>();

  // Offscreen bitmap cache for arc labels
  private arcLabelBitmapCache = new Map<
    string,
    { canvas: OffscreenCanvas; width: number; height: number; arcRadius: number }
  >();

  // Node map for quick lookup — only rebuilt when nodes array reference changes
  private nodeMap = new Map<string, GraphNode>();
  private cachedNodesRef: GraphNode[] | null = null;

  // Cluster map for O(1) lookup — only rebuilt when clusters array reference changes
  private clusterMap = new Map<string, Cluster>();
  private cachedClustersRef: Cluster[] | null = null;

  // Visible node IDs for cluster visibility — rebuilt when nodes array changes
  private visibleNodeIds = new Set<string>();

  // Quadtree spatial index for O(log n) hit testing
  private nodeQuadtree: Quadtree<IndexedNode> | null = null;

  // Edge endpoint cache — only cleared when positions change
  private edgeEndpointCache = new Map<
    string,
    ReturnType<CanvasScene['resolveEdgeEndpointsInner']>
  >();
  private cachedEdgesRef: GraphEdge[] | null = null;
  private cachedManualNodePosSize = -1;
  private cachedManualClusterPosSize = -1;

  // Per-frame cached viewport bounds
  private cachedViewport: ViewportBounds | null = null;

  // Per-frame edge metadata map
  private edgeMetaMap = new Map<GraphEdge, EdgeMeta>();
  private edgeMetaDirty = true;
  private cachedSelectedNode: GraphNode | null = null;
  private cachedSelectedCluster: string | null = null;
  private cachedShowDirectDeps = false;
  private cachedShowTransitiveDeps = false;
  private cachedShowDirectDependents = false;
  private cachedShowTransitiveDependents = false;
  private cachedTransitiveDepsRef: TransitiveResult | undefined = undefined;
  private cachedTransitiveDependentsRef: TransitiveResult | undefined = undefined;

  // Per-frame adjusted node type colors (7 types, recomputed only when zoom changes)
  private adjustedNodeColors = new Map<string, string>();
  private adjustedColorsZoom = -1;

  // Current state
  private config: SceneConfig | null = null;
  private callbacks: SceneCallbacks;

  // Interaction state
  private pan = { x: 0, y: 0 };
  private _zoom = 1;
  private isDragging = false;
  private isPanning = false;
  private lastMousePos = { x: 0, y: 0 };
  private draggedNodeId: string | null = null;
  private draggedClusterId: string | null = null;
  private currentHoveredNode: string | null = null;
  private currentHoveredCluster: string | null = null;

  // Viewport transition animation
  private viewportTransition: ViewportTransition | null = null;

  // Tooltip hover delay
  private tooltipShowTime = 0;

  // Fade-out nodes


  constructor(container: HTMLDivElement, callbacks: SceneCallbacks) {
    this.callbacks = callbacks;

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;

    // Event handlers on the canvas element
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('dblclick', this.handleDoubleClick);
  }

  // -------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------

  /** Main render method — called each frame by the animation loop. */
  render(config: SceneConfig): void {
    this.config = config;
    this.updateCaches(config);

    // Compute viewport bounds once per frame
    this.cachedViewport = this.computeViewportBounds(config);

    const ctx = this.ctx;

    // 1. Clear + background
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = config.theme.canvasBg;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Apply world transform: translate(pan) + scale(zoom)
    ctx.save();
    ctx.translate(this.pan.x, this.pan.y);
    ctx.scale(config.zoom, config.zoom);

    // 3–6. Draw world-space content
    this.drawClusters(ctx, config);
    this.drawEdges(ctx);
    this.drawNodes(ctx, config);
    // 7. Restore world transform
    ctx.restore();

    // 8. Draw tooltip (screen space)
    this.drawTooltip(ctx, config);
  }

  /** Rebuild lookup maps and caches when data references change. */
  private updateCaches(config: SceneConfig): void {
    // Detect ref changes BEFORE updating cached refs so positionsChanged
    // correctly triggers edge endpoint cache invalidation when layout completes.
    const nodesChanged = config.nodes !== this.cachedNodesRef;
    const clustersChanged = config.layout.clusters !== this.cachedClustersRef;

    if (nodesChanged) {
      this.nodeMap.clear();
      this.visibleNodeIds.clear();
      this.truncatedLabelCache.clear();
      for (const node of config.nodes) {
        this.nodeMap.set(node.id, node);
        this.visibleNodeIds.add(node.id);
      }
      this.cachedNodesRef = config.nodes;
    }

    if (clustersChanged) {
      this.clusterMap.clear();
      for (const cluster of config.layout.clusters) {
        this.clusterMap.set(cluster.id, cluster);
      }
      this.cachedClustersRef = config.layout.clusters;
    }

    const positionsChanged =
      config.edges !== this.cachedEdgesRef ||
      nodesChanged ||
      clustersChanged ||
      config.manualNodePositions.size !== this.cachedManualNodePosSize ||
      config.manualClusterPositions.size !== this.cachedManualClusterPosSize;
    if (positionsChanged) {
      this.edgeEndpointCache.clear();
      this.nodeQuadtree = null;
      this.cachedEdgesRef = config.edges;
      this.cachedManualNodePosSize = config.manualNodePositions.size;
      this.cachedManualClusterPosSize = config.manualClusterPositions.size;
    }

    if (config.zoom !== this.adjustedColorsZoom) {
      this.adjustedNodeColors.clear();
      for (const type of Object.values(NodeType)) {
        const baseColor = getNodeTypeColorFromTheme(type, config.theme);
        this.adjustedNodeColors.set(type, adjustColorForZoom(baseColor, config.zoom));
      }
      this.adjustedColorsZoom = config.zoom;
    }

    const edgeInputsChanged =
      positionsChanged ||
      config.selectedNode !== this.cachedSelectedNode ||
      config.selectedCluster !== this.cachedSelectedCluster ||
      config.showDirectDeps !== this.cachedShowDirectDeps ||
      config.showTransitiveDeps !== this.cachedShowTransitiveDeps ||
      config.showDirectDependents !== this.cachedShowDirectDependents ||
      config.showTransitiveDependents !== this.cachedShowTransitiveDependents ||
      config.transitiveDeps !== this.cachedTransitiveDepsRef ||
      config.transitiveDependents !== this.cachedTransitiveDependentsRef;

    if (edgeInputsChanged) {
      this.edgeMetaDirty = true;
      this.cachedSelectedNode = config.selectedNode;
      this.cachedSelectedCluster = config.selectedCluster;
      this.cachedShowDirectDeps = config.showDirectDeps;
      this.cachedShowTransitiveDeps = config.showTransitiveDeps;
      this.cachedShowDirectDependents = config.showDirectDependents;
      this.cachedShowTransitiveDependents = config.showTransitiveDependents;
      this.cachedTransitiveDepsRef = config.transitiveDeps;
      this.cachedTransitiveDependentsRef = config.transitiveDependents;
    }
  }

  /** Draw all visible clusters with viewport culling. */
  private drawClusters(ctx: CanvasRenderingContext2D, config: SceneConfig): void {
    const viewport = this.cachedViewport ?? this.computeViewportBounds(config);
    const hasDimmed = config.dimmedNodeIds.size > 0;
    for (const cluster of config.layout.clusters) {
      const layoutPos = config.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      // Skip clusters with no visible nodes
      if (!cluster.nodes.some((n) => this.visibleNodeIds.has(n.id))) continue;

      const manualPos = config.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      if (!isCircleInViewport({ x: cx, y: cy }, radius, viewport)) continue;

      // Dim cluster when all its nodes are dimmed
      const allNodesDimmed =
        hasDimmed &&
        cluster.nodes.length > 0 &&
        cluster.nodes.every((n) => config.dimmedNodeIds.has(n.id));

      ctx.save();
      if (allNodesDimmed) ctx.globalAlpha = 0.15;
      ctx.translate(cx, cy);
      this.drawCluster(ctx, cluster.id);
      ctx.restore();
    }
  }

  /** Draw screen-space cluster labels on top of edges at low zoom. */
  /** Draw all visible nodes with viewport culling. */
  private drawNodes(ctx: CanvasRenderingContext2D, config: SceneConfig): void {
    const viewport = this.cachedViewport ?? this.computeViewportBounds(config);
    const drawLabels = config.zoom >= LOD_THRESHOLDS.NODE_LABELS;
    for (const node of config.nodes) {
      const pos = resolveNodeWorldPosition(
        node.id,
        node.project || 'External',
        config.layout,
        config.manualNodePositions,
        config.manualClusterPositions,
      );
      if (!pos) continue;

      const size = getNodeSize(node);
      if (!isCircleInViewport({ x: pos.x, y: pos.y }, size * 3, viewport)) continue;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      this.drawNode(ctx, node.id, drawLabels);
      ctx.restore();
    }
  }

  /** Synchronous render for zero-latency zoom response. */
  renderImmediate(): void {
    if (this.config) {
      this.config.zoom = this._zoom;
      this.render(this.config);
    }
  }

  get zoom(): number {
    return this._zoom;
  }

  get panOffset(): { x: number; y: number } {
    return this.pan;
  }

  get hoveredNodeId(): string | null {
    return this.currentHoveredNode;
  }

  get hoveredClusterId(): string | null {
    return this.currentHoveredCluster;
  }

  get interactionIsDragging(): boolean {
    return this.isDragging || this.isPanning;
  }

  /** Set viewport pan and zoom (for fit-to-viewport, keyboard pan). */
  setViewport(pan: { x: number; y: number }, zoom: number): void {
    this.pan = { ...pan };
    this._zoom = zoom;
  }

  /** Center the pan offset to the middle of the container. */
  centerGraph(width: number, height: number): void {
    this.pan = { x: width / 2, y: height / 2 };
  }

  /** Pan by a delta in screen pixels (for keyboard pan). */
  panBy(dx: number, dy: number): void {
    this.pan = { x: this.pan.x + dx, y: this.pan.y + dy };
  }

  /** Fit all clusters into the viewport. */
  fitToViewport(
    clusterPositions: ReadonlyMap<string, ClusterPosition>,
    viewportWidth: number,
    viewportHeight: number,
  ): { zoom: number; pan: { x: number; y: number } } | null {
    const fit = computeFitToViewport(clusterPositions, viewportWidth, viewportHeight);
    if (!fit) return null;
    this.pan = { ...fit.pan };
    this._zoom = fit.zoom;
    return fit;
  }

  /** Convert screen coords to world coords. */
  screenToWorldPos(screenX: number, screenY: number): { x: number; y: number } {
    return screenToWorld(screenX, screenY, this.pan, this._zoom);
  }

  /** Start an animated viewport transition to the target pan and zoom. */
  animateToViewport(targetPan: { x: number; y: number }, targetZoom: number, duration = 300): void {
    this.viewportTransition = {
      startZoom: this._zoom,
      targetZoom,
      startPan: { ...this.pan },
      targetPan: { ...targetPan },
      duration,
      startTime: performance.now(),
    };
    this.callbacks.onRenderRequest();
  }

  /**
   * Advance the active viewport transition.
   * @returns true if a transition is active (caller should keep rendering).
   */
  tickViewportAnimation(now: number): boolean {
    if (!this.viewportTransition) return false;

    const result = tickViewportTransition(this.viewportTransition, now);
    this._zoom = result.zoom;
    this.pan = { ...result.pan };
    this.callbacks.onZoomChange(result.zoom);

    if (result.done) {
      this.viewportTransition = null;
    }

    return true;
  }

  /** Whether a viewport transition animation is currently in flight. */
  hasActiveViewportTransition(): boolean {
    return this.viewportTransition !== null;
  }

  /** Resize the canvas to match container dimensions. */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    // Invalidate gradient cache since contexts change on resize
    this.gradientCache.clear();
  }

  /** Clear caches when layout changes. */
  clearCaches(): void {
    this.gradientCache.clear();
    this.arcTextCache.clear();
    this.truncateCache.clear();
    this.truncatedLabelCache.clear();
    this.arcLabelBitmapCache.clear();
    this.bezierPathCache.clear();
    this.edgeEndpointCache.clear();
    this.nodeQuadtree = null;
    this.cachedNodesRef = null;
    this.cachedClustersRef = null;
    this.cachedEdgesRef = null;
    this.cachedManualNodePosSize = -1;
    this.cachedManualClusterPosSize = -1;
  }

  /** Get cursor style based on current interaction state. */
  getCursorStyle(): string {
    if (this.isDragging || this.isPanning) return 'grabbing';
    if (this.currentHoveredNode || this.currentHoveredCluster) return 'pointer';
    return 'grab';
  }

  /** Destroy the scene and release resources. */
  destroy(): void {
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick);
    this.canvas.remove();
    this.pathCache.clear();
    this.bezierPathCache.clear();
    this.gradientCache.clear();
    this.arcTextCache.clear();
    this.truncateCache.clear();
    this.truncatedLabelCache.clear();
    this.arcLabelBitmapCache.clear();
    this.nodeMap.clear();
    this.visibleNodeIds.clear();
    this.clusterMap.clear();
    this.edgeEndpointCache.clear();
    this.nodeQuadtree = null;
    this.edgeMetaMap.clear();
  }

  // -------------------------------------------------------------------
  // Node Drawing
  // -------------------------------------------------------------------

  /** Draw a single node with icon, label, and selection/cycle effects. */
  private drawNode(ctx: CanvasRenderingContext2D, nodeId: string, shouldDrawLabels = true): void {
    const config = this.config;
    if (!config) return;

    const node = this.nodeMap.get(nodeId);
    if (!node) return;

    const { theme, zoom } = config;
    const size = getNodeSize(node);

    const state = this.getNodeState(config, nodeId);
    const { isHovered, isSelected, isConnected, isDimmed, isCycleNode, isInChain } = state;

    const adjustedColor =
      this.adjustedNodeColors.get(node.type) ??
      adjustColorForZoom(getNodeTypeColorFromTheme(node.type, theme), zoom);
    const alpha = this.getNodeAlpha(config, nodeId);

    ctx.globalAlpha = alpha;

    if (isDimmed) {
      ctx.globalAlpha = alpha * 0.35;
    }

    if (isCycleNode && !isDimmed) {
      drawCycleGlow(ctx, size, theme, alpha, config.time);
    }

    if (isSelected) {
      drawSelectionRings(ctx, size, adjustedColor, alpha, config.time);
    }

    drawNodeIcon(
      ctx,
      this.getPathForNode(node),
      size,
      adjustedColor,
      theme,
      isHovered || isSelected,
    );

    if (isHovered && !isSelected && !isDimmed) {
      this.drawHoverRing(ctx, size, adjustedColor, alpha);
    }

    if (shouldDrawLabels) {
      const labelText = this.resolveLabelText(node, isHovered, isConnected);
      drawNodeLabel(
        ctx,
        labelText,
        size,
        adjustedColor,
        theme,
        alpha,
        isSelected,
        isConnected,
        isInChain,
      );
    }

    ctx.globalAlpha = 1.0;
  }

  /** Compute selection, hover, dim, and cycle state flags for a node. */
  private getNodeState(config: NonNullable<typeof this.config>, nodeId: string) {
    const isSelected = config.selectedNode?.id === nodeId;
    return {
      isHovered: config.hoveredNode === nodeId,
      isSelected,
      isConnected: Boolean(config.selectedNode && config.connectedNodes.has(nodeId)),
      isDimmed: config.dimmedNodeIds.has(nodeId),
      isCycleNode: config.layout.cycleNodes?.has(nodeId) ?? false,
      isInChain:
        (config.transitiveDeps?.nodes.has(nodeId) ?? false) ||
        (config.transitiveDependents?.nodes.has(nodeId) ?? false) ||
        isSelected,
    };
  }

  /** Resolve the current opacity for a node, respecting reduced-motion preference. */
  private getNodeAlpha(config: NonNullable<typeof this.config>, nodeId: string): number {
    if (prefersReducedMotion.get()) {
      return config.nodeAlphaMap.get(nodeId)?.target ?? 1.0;
    }
    return getAnimatedAlpha(config.nodeAlphaMap, nodeId);
  }

  /** Draw a subtle ring around a hovered node. */
  private drawHoverRing(
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string,
    alpha: number,
  ): void {
    ctx.beginPath();
    ctx.arc(0, 0, size + 3, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = alpha * 0.5;
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }

  /** Return full or truncated label text depending on hover/connection state. */
  private resolveLabelText(node: GraphNode, isHovered: boolean, isConnected: boolean): string {
    if (node.name.length <= 20 || isHovered || isConnected) {
      return node.name;
    }
    let cached = this.truncatedLabelCache.get(node.id);
    if (!cached) {
      cached = `${node.name.substring(0, 20)}...`;
      this.truncatedLabelCache.set(node.id, cached);
    }
    return cached;
  }

  /** Get or create a cached Path2D icon for the given node type and platform. */
  private getPathForNode(node: GraphNode): Path2D {
    const key = `${node.type}-${node.platform}`;
    let path = this.pathCache.get(key);
    if (!path) {
      path = new Path2D(getNodeIconPath(node.type, node.platform));
      this.pathCache.set(key, path);
    }
    return path;
  }

  // -------------------------------------------------------------------
  // Cluster Drawing
  // -------------------------------------------------------------------

  /** Draw a single cluster with fill, border, and arc label. */
  private drawCluster(ctx: CanvasRenderingContext2D, clusterId: string): void {
    const config = this.config;
    if (!config) return;

    const cluster = this.clusterMap.get(clusterId);
    if (!cluster) return;

    const layoutPos = config.layout.clusterPositions.get(clusterId);
    if (!layoutPos) return;

    const radius = Math.max(layoutPos.width, layoutPos.height) / 2;
    const isActive = config.hoveredCluster === clusterId || config.selectedCluster === clusterId;
    const isSelected = config.selectedCluster === clusterId;
    const clusterColor = generateColor(cluster.name, cluster.type);

    drawClusterFill(
      ctx,
      radius,
      clusterColor,
      isActive,
      cluster.nodes.length,
      this.gradientCache,
      clusterId,
    );
    drawClusterBorder(
      ctx,
      radius,
      clusterColor,
      isActive,
      isSelected,
      cluster.nodes.length,
      cluster.type,
      config.zoom,
      config.time,
    );
    drawClusterLabel(
      ctx,
      radius,
      clusterColor,
      isActive,
      cluster.name,
      this.arcLabelBitmapCache,
      CanvasScene.MAX_ARC_LABEL_CACHE_SIZE,
      (c, text, maxWidth) => truncateTextFn(c, text, maxWidth, this.truncateCache),
      (c, text, arcRadius, font, color) =>
        renderArcLabelBitmapFn(c, text, arcRadius, font, color, this.arcTextCache),
    );

    ctx.globalAlpha = 1.0;
  }

  // -------------------------------------------------------------------
  // Edge Drawing
  // -------------------------------------------------------------------

  /** Build per-edge metadata cache (cycle, highlight, chain, endpoints). */
  private precomputeEdgeMeta(edges: GraphEdge[], isChainActive: boolean): void {
    if (!this.edgeMetaDirty) return;
    this.edgeMetaDirty = false;
    this.edgeMetaMap.clear();
    for (const edge of edges) {
      const key = `${edge.source}->${edge.target}`;
      const isCycle = this.isCycleEdge(edge);
      const isHighlighted = this.isEdgeHighlighted(edge);
      const inChain = isChainActive ? this.isEdgeInActiveChain(key) : false;
      const isSpecial = isCycle || isHighlighted || inChain;
      const endpoints = this.resolveEdgeEndpointsCached(edge);
      this.edgeMetaMap.set(edge, { key, isCycle, isHighlighted, inChain, isSpecial, endpoints });
    }
  }

  /** Whether any dependency chain toggle (direct/transitive) is active. */
  private isChainActive(): boolean {
    const config = this.config;
    if (!config) return false;
    return (
      config.showDirectDeps ||
      config.showTransitiveDeps ||
      config.showDirectDependents ||
      config.showTransitiveDependents
    );
  }

  /** Draw all edges with LOD: cluster arteries at low zoom, individual edges at high zoom. */
  private drawEdges(ctx: CanvasRenderingContext2D): void {
    const config = this.config;
    if (!config) return;

    const { edges, zoom, time } = config;
    const viewport = this.cachedViewport ?? this.computeViewportBounds(config);

    this.precomputeEdgeMeta(edges, this.isChainActive());
    const animatedDashOffset = prefersReducedMotion.get() ? 0 : time / 20;

    // Two-tier LOD: cluster arteries at low zoom, individual edges at high zoom
    if (zoom < LOD_THRESHOLDS.CLUSTER_ARTERIES) {
      drawClusterArteries(ctx, config, viewport);
      this.renderEdges(ctx, edges, viewport, animatedDashOffset, true);
      return;
    }

    ctx.lineWidth = 1;
    this.renderEdges(ctx, edges, viewport, animatedDashOffset, false);
  }

  /** Iterate edges and delegate to single-edge renderer, optionally filtering to special-only. */
  private renderEdges(
    ctx: CanvasRenderingContext2D,
    edges: GraphEdge[],
    viewport: ViewportBounds,
    animatedDashOffset: number,
    specialOnly: boolean,
  ): void {
    for (const edge of edges) {
      const meta = this.edgeMetaMap.get(edge);
      if (!meta) continue;
      if (specialOnly && !meta.isSpecial) continue;
      this.renderSingleEdgeDelegate(ctx, meta, viewport, animatedDashOffset);
    }
  }

  /** Resolve edge source/target world positions with caching. */
  private resolveEdgeEndpointsCached(edge: GraphEdge): {
    sourceNode: GraphNode;
    targetNode: GraphNode;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null {
    const edgeKey = `${edge.source}->${edge.target}`;
    const cached = this.edgeEndpointCache.get(edgeKey);
    if (cached !== undefined) return cached;

    const result = this.resolveEdgeEndpointsInner(edge);
    this.edgeEndpointCache.set(edgeKey, result);
    return result;
  }

  /** Compute edge endpoint world coordinates from layout and manual positions. */
  private resolveEdgeEndpointsInner(edge: GraphEdge): {
    sourceNode: GraphNode;
    targetNode: GraphNode;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null {
    const config = this.config;
    if (!config) return null;

    const sourceNode = this.nodeMap.get(edge.source);
    const targetNode = this.nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return null;

    const sourceLayout = config.layout.nodePositions.get(edge.source);
    const targetLayout = config.layout.nodePositions.get(edge.target);
    if (!sourceLayout || !targetLayout) return null;

    const sourceClusterId = sourceNode.project || 'External';
    const targetClusterId = targetNode.project || 'External';
    const sClusterLayout = config.layout.clusterPositions.get(sourceClusterId);
    const tClusterLayout = config.layout.clusterPositions.get(targetClusterId);
    if (!sClusterLayout || !tClusterLayout) return null;

    const sCluster = resolveClusterPosition(
      sourceClusterId,
      sClusterLayout,
      config.manualClusterPositions,
    );
    const scx = sCluster.x;
    const scy = sCluster.y;
    const tCluster = resolveClusterPosition(
      targetClusterId,
      tClusterLayout,
      config.manualClusterPositions,
    );

    const sManual = config.manualNodePositions.get(edge.source);
    const tManual = config.manualNodePositions.get(edge.target);

    return {
      sourceNode,
      targetNode,
      x1: scx + (sManual?.x ?? sourceLayout.x),
      y1: scy + (sManual?.y ?? sourceLayout.y),
      x2: tCluster.x + (tManual?.x ?? targetLayout.x),
      y2: tCluster.y + (tManual?.y ?? targetLayout.y),
    };
  }

  /** Check if an edge connects two nodes in the same strongly-connected component. */
  private isCycleEdge(edge: GraphEdge): boolean {
    const layout = this.config?.layout;
    if (!layout) return false;
    const sourceScc = layout.nodeSccId?.get(edge.source);
    const targetScc = layout.nodeSccId?.get(edge.target);
    return (
      sourceScc !== undefined &&
      targetScc !== undefined &&
      sourceScc === targetScc &&
      (layout.sccSizes?.get(sourceScc) ?? 0) > 1
    );
  }

  /** Check if an edge is highlighted by the selected cluster. */
  private isEdgeHighlighted(edge: GraphEdge): boolean {
    const config = this.config;
    if (!config || config.selectedCluster == null) return false;
    return (
      (config.showDirectDeps &&
        this.nodeMap.get(edge.source)?.project === config.selectedCluster) ||
      (config.showDirectDependents &&
        this.nodeMap.get(edge.target)?.project === config.selectedCluster)
    );
  }

  /** Check if an edge is part of the active dependency/dependent chain. */
  private isEdgeInActiveChain(edgeKey: string): boolean {
    const config = this.config;
    if (!config) return false;

    const matchToggle = (
      chain: TransitiveResult | undefined,
      showDirect: boolean,
      showTransitive: boolean,
    ): boolean => {
      if (!chain?.edges.has(edgeKey)) return false;
      const depth = chain.edgeDepths.get(edgeKey) ?? 0;
      return depth === 0 ? showDirect : showTransitive;
    };

    return (
      matchToggle(config.transitiveDeps, config.showDirectDeps, config.showTransitiveDeps) ||
      matchToggle(
        config.transitiveDependents,
        config.showDirectDependents,
        config.showTransitiveDependents,
      )
    );
  }

  /** Get the minimum depth of an edge across all active chains. */
  private getChainEdgeDepth(edgeKey: string): number {
    const config = this.config;
    if (!config) return 0;
    let depth = Number.POSITIVE_INFINITY;
    if (config.transitiveDeps?.edges.has(edgeKey)) {
      depth = Math.min(depth, config.transitiveDeps.edgeDepths.get(edgeKey) ?? 0);
    }
    if (config.transitiveDependents?.edges.has(edgeKey)) {
      depth = Math.min(depth, config.transitiveDependents.edgeDepths.get(edgeKey) ?? 0);
    }
    return Number.isFinite(depth) ? depth : 0;
  }

  /** Delegate to the extracted renderSingleEdge, passing class-bound helpers. */
  private renderSingleEdgeDelegate(
    ctx: CanvasRenderingContext2D,
    meta: EdgeMeta,
    viewport: ViewportBounds,
    animatedDashOffset: number,
  ): void {
    const config = this.config;
    if (!config) return;

    renderSingleEdge(
      ctx,
      meta,
      viewport,
      animatedDashOffset,
      config.zoom,
      config.theme,
      config.selectedNode,
      (key) => this.getChainEdgeDepth(key),
      (c, x1, y1, x2, y2) => drawEdgePathFn(c, x1, y1, x2, y2, this.bezierPathCache),
    );
  }

  // -------------------------------------------------------------------
  // Tooltip (screen space)
  // -------------------------------------------------------------------

  /** Draw hover tooltip for the currently hovered node or cluster. */
  private drawTooltip(ctx: CanvasRenderingContext2D, config: SceneConfig): void {
    // Suppress tooltip during hover delay
    if (performance.now() < this.tooltipShowTime) return;

    const { hoveredNode, hoveredCluster } = config;

    if (hoveredNode) {
      this.drawNodeTooltipDelegate(ctx, config, hoveredNode);
    } else if (hoveredCluster) {
      this.drawClusterTooltipDelegate(ctx, config, hoveredCluster);
    }
  }

  /** Resolve node world position and draw its tooltip in screen space. */
  private drawNodeTooltipDelegate(
    ctx: CanvasRenderingContext2D,
    config: SceneConfig,
    hoveredNodeId: string,
  ): void {
    const node = this.nodeMap.get(hoveredNodeId);
    if (!node) return;

    const worldPos = resolveNodeWorldPosition(
      node.id,
      node.project || 'External',
      config.layout,
      config.manualNodePositions,
      config.manualClusterPositions,
    );
    if (!worldPos) return;

    const { theme, zoom } = config;
    const size = getNodeSize(node);
    const nodeColor =
      this.adjustedNodeColors.get(node.type) ??
      adjustColorForZoom(getNodeTypeColorFromTheme(node.type, theme), zoom);

    const screenX = worldPos.x * zoom + this.pan.x;
    const screenY = (worldPos.y - size) * zoom + this.pan.y - 35;

    drawNodeTooltip(ctx, screenX, screenY, node.name, nodeColor, theme, this.dpr);
  }

  /** Resolve cluster position and draw its tooltip in screen space. */
  private drawClusterTooltipDelegate(
    ctx: CanvasRenderingContext2D,
    config: SceneConfig,
    hoveredClusterId: string,
  ): void {
    const cluster = this.clusterMap.get(hoveredClusterId);
    if (!cluster) return;

    const layoutPos = config.layout.clusterPositions.get(hoveredClusterId);
    if (!layoutPos) return;

    const { theme, zoom } = config;
    const clusterPos = resolveClusterPosition(
      hoveredClusterId,
      layoutPos,
      config.manualClusterPositions,
    );
    const radius = Math.max(layoutPos.width, layoutPos.height) / 2;
    const clusterColor = adjustColorForZoom(generateColor(cluster.name, cluster.type), zoom);

    const screenX = clusterPos.x * zoom + this.pan.x;
    const screenY = (clusterPos.y - radius) * zoom + this.pan.y - 60;

    drawClusterTooltip(
      ctx,
      screenX,
      screenY,
      cluster.name,
      cluster.nodes.length,
      clusterColor,
      theme,
      this.dpr,
    );
  }

  // -------------------------------------------------------------------
  // Hit Testing (on mouse events, not per-frame)
  // -------------------------------------------------------------------

  /** Lazily build and cache a quadtree for O(log n) node hit testing. */
  private ensureQuadtree(): Quadtree<IndexedNode> | null {
    if (this.nodeQuadtree) return this.nodeQuadtree;
    const config = this.config;
    if (!config) return null;

    const items: IndexedNode[] = [];
    for (const node of config.nodes) {
      const pos = resolveNodeWorldPosition(
        node.id,
        node.project || 'External',
        config.layout,
        config.manualNodePositions,
        config.manualClusterPositions,
      );
      if (!pos) continue;
      items.push({
        x: pos.x,
        y: pos.y,
        node,
        hitRadius: getNodeSize(node) * NODE_HIT_RADIUS_MULTIPLIER,
      });
    }

    this.nodeQuadtree = buildNodeQuadtree(items);
    return this.nodeQuadtree;
  }

  /** Find the node at the given world coordinates using quadtree lookup. */
  private hitTestNode(worldX: number, worldY: number): GraphNode | null {
    const tree = this.ensureQuadtree();
    if (!tree) return null;
    return findNodeAt(tree, worldX, worldY, HIT_TEST_RADIUS);
  }

  /** Find the cluster at the given world coordinates using radius check. */
  private hitTestCluster(worldX: number, worldY: number): string | null {
    const config = this.config;
    if (!config) return null;

    for (const cluster of config.layout.clusters) {
      // Skip clusters with no visible nodes
      if (!cluster.nodes.some((n) => this.visibleNodeIds.has(n.id))) continue;

      const layoutPos = config.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      const manualPos = config.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      const dx = worldX - cx;
      const dy = worldY - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        return cluster.id;
      }
    }

    return null;
  }

  // -------------------------------------------------------------------
  // Interaction Handlers
  // -------------------------------------------------------------------

  private handleWheel = (evt: WheelEvent): void => {
    evt.preventDefault();

    const modeFactor = evt.deltaMode === 1 ? 0.05 : evt.deltaMode ? 1 : 0.002;
    const pinchFactor = evt.ctrlKey ? 10 : 1;
    const delta = -evt.deltaY * modeFactor * pinchFactor;

    const newZoom = Math.min(
      Math.max(ZOOM_CONFIG.MIN_ZOOM, this._zoom * 2 ** delta),
      ZOOM_CONFIG.MAX_ZOOM,
    );

    if (newZoom !== this._zoom) {
      const rect = this.canvas.getBoundingClientRect();
      const pointerX = evt.clientX - rect.left;
      const pointerY = evt.clientY - rect.top;

      const worldX = (pointerX - this.pan.x) / this._zoom;
      const worldY = (pointerY - this.pan.y) / this._zoom;

      this._zoom = newZoom;
      this.pan = {
        x: pointerX - worldX * newZoom,
        y: pointerY - worldY * newZoom,
      };

      this.callbacks.onZoomChange(newZoom);

      // Synchronous render for zero-latency zoom
      this.renderImmediate();
    }
  };

  private handleMouseDown = (evt: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = evt.clientX - rect.left;
    const screenY = evt.clientY - rect.top;
    const worldPos = this.screenToWorldPos(screenX, screenY);

    this.lastMousePos = { x: evt.clientX, y: evt.clientY };

    // Check if clicking a node
    const hitNode = this.hitTestNode(worldPos.x, worldPos.y);
    if (hitNode) {
      this.draggedNodeId = hitNode.id;
      this.isDragging = true;

      const selected = this.config?.selectedNode;
      const newSelection = selected?.id === hitNode.id ? null : hitNode;
      this.callbacks.onNodeSelect(newSelection);
      return;
    }

    // Check if clicking a cluster (shift/meta for drag)
    const hitCluster = this.hitTestCluster(worldPos.x, worldPos.y);
    if (hitCluster) {
      if (evt.shiftKey || evt.metaKey) {
        this.draggedClusterId = hitCluster;
        this.isDragging = true;
      }
      this.callbacks.onClusterSelect(hitCluster);
      return;
    }

    // Clicked empty space — start panning
    this.isPanning = true;
  };

  private handleMouseMove = (evt: MouseEvent): void => {
    if (this.draggedClusterId && this.config) {
      this.handleDragCluster(evt);
    } else if (this.draggedNodeId && this.config) {
      this.handleDragNode(evt);
    } else if (this.isPanning) {
      this.handlePan(evt);
    } else {
      this.handleHover(evt);
    }
  };

  /** Update manual cluster position during drag interaction. */
  private handleDragCluster(evt: MouseEvent): void {
    if (!this.config || !this.draggedClusterId) return;
    const rect = this.canvas.getBoundingClientRect();
    const screenX = evt.clientX - rect.left;
    const screenY = evt.clientY - rect.top;
    const worldPos = this.screenToWorldPos(screenX, screenY);
    this.config.manualClusterPositions.set(this.draggedClusterId, worldPos);
    this.callbacks.onInvalidateEdgePathCache();
    this.callbacks.onRenderRequest();
  }

  /** Update manual node position (relative to cluster) during drag interaction. */
  private handleDragNode(evt: MouseEvent): void {
    if (!this.config || !this.draggedNodeId) return;
    const rect = this.canvas.getBoundingClientRect();
    const screenX = evt.clientX - rect.left;
    const screenY = evt.clientY - rect.top;
    const worldPos = this.screenToWorldPos(screenX, screenY);

    const dragNode = this.nodeMap.get(this.draggedNodeId);
    if (!dragNode) return;

    const clusterId = dragNode.project || 'External';
    const layoutClusterPos = this.config.layout.clusterPositions.get(clusterId);
    if (!layoutClusterPos) return;

    const clusterPos = resolveClusterPosition(
      clusterId,
      layoutClusterPos,
      this.config.manualClusterPositions,
    );
    this.config.manualNodePositions.set(this.draggedNodeId, {
      x: worldPos.x - clusterPos.x,
      y: worldPos.y - clusterPos.y,
    });
    this.callbacks.onInvalidateEdgePathCache();
    this.callbacks.onRenderRequest();
  }

  /** Apply pan delta from mouse movement with immediate render. */
  private handlePan(evt: MouseEvent): void {
    const dx = evt.clientX - this.lastMousePos.x;
    const dy = evt.clientY - this.lastMousePos.y;
    this.pan = { x: this.pan.x + dx, y: this.pan.y + dy };
    this.lastMousePos = { x: evt.clientX, y: evt.clientY };

    // Immediate render for zero-latency pan
    this.renderImmediate();
    this.callbacks.onRenderRequest();
  }

  /** Update hovered node/cluster state and trigger tooltip delay. */
  private handleHover(evt: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = evt.clientX - rect.left;
    const screenY = evt.clientY - rect.top;
    const worldPos = this.screenToWorldPos(screenX, screenY);

    const hitNode = this.hitTestNode(worldPos.x, worldPos.y);
    const newHoveredNode = hitNode?.id ?? null;

    if (newHoveredNode !== this.currentHoveredNode) {
      this.currentHoveredNode = newHoveredNode;
      this.callbacks.onNodeHover(newHoveredNode);

      // Apply tooltip delay when hovering a new entity
      if (newHoveredNode) {
        this.tooltipShowTime = performance.now() + 150;
        setTimeout(() => this.callbacks.onRenderRequest(), 160);
      }

      if (hitNode) {
        this.currentHoveredCluster = hitNode.project || 'External';
        this.callbacks.onClusterHover(this.currentHoveredCluster);
      }
      this.callbacks.onRenderRequest();
    }

    if (!hitNode) {
      const hitCluster = this.hitTestCluster(worldPos.x, worldPos.y);
      if (hitCluster !== this.currentHoveredCluster) {
        this.currentHoveredCluster = hitCluster;
        this.callbacks.onClusterHover(hitCluster);

        // Apply tooltip delay for cluster hover changes
        if (hitCluster) {
          this.tooltipShowTime = performance.now() + 150;
          setTimeout(() => this.callbacks.onRenderRequest(), 160);
        }

        this.callbacks.onRenderRequest();
      }
    }
  }

  private handleMouseUp = (): void => {
    // Selection is preserved when clicking empty canvas space.
    // Use Escape or click another node/cluster to change selection.

    this.isPanning = false;
    this.isDragging = false;
    this.draggedNodeId = null;
    this.draggedClusterId = null;
  };

  private handleMouseLeave = (): void => {
    this.handleMouseUp();
    if (this.currentHoveredNode) {
      this.currentHoveredNode = null;
      this.callbacks.onNodeHover(null);
    }
    if (this.currentHoveredCluster) {
      this.currentHoveredCluster = null;
      this.callbacks.onClusterHover(null);
    }
  };

  private handleDoubleClick = (evt: MouseEvent): void => {
    evt.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const screenX = evt.clientX - rect.left;
    const screenY = evt.clientY - rect.top;
    const worldPos = this.screenToWorldPos(screenX, screenY);

    // Don't zoom if double-clicking a node — node interactions are handled elsewhere
    const hitNode = this.hitTestNode(worldPos.x, worldPos.y);
    if (hitNode) return;

    // Double-click on a cluster — zoom to fit that cluster
    const hitCluster = this.hitTestCluster(worldPos.x, worldPos.y);
    if (hitCluster) {
      this.animateToCluster(hitCluster);
      return;
    }

    // Empty space — zoom in 2x centered on click point
    const newZoom = Math.min(this._zoom * 2, ZOOM_CONFIG.MAX_ZOOM);
    const newPan = {
      x: screenX - worldPos.x * newZoom,
      y: screenY - worldPos.y * newZoom,
    };
    this.animateToViewport(newPan, newZoom, 300);
  };

  /** Animate viewport to center and fit a specific cluster. */
  private animateToCluster(clusterId: string): void {
    const clusterPos = this.config?.layout?.clusterPositions?.get(clusterId);
    if (!clusterPos) return;

    const manualPos = this.config?.manualClusterPositions?.get(clusterId);
    const cx = manualPos?.x ?? clusterPos.x;
    const cy = manualPos?.y ?? clusterPos.y;

    const clusterRadius = Math.max(clusterPos.width, clusterPos.height) / 2;

    const fitZoom = Math.min(
      this.width / ((clusterRadius + CLUSTER_VIEWPORT_PADDING) * 2),
      this.height / ((clusterRadius + CLUSTER_VIEWPORT_PADDING) * 2),
      ZOOM_CONFIG.MAX_ZOOM,
    );

    const targetPan = {
      x: this.width / 2 - cx * fitZoom,
      y: this.height / 2 - cy * fitZoom,
    };

    this.animateToViewport(targetPan, fitZoom, 400);
  }

  // -------------------------------------------------------------------
  // Viewport Helpers
  // -------------------------------------------------------------------

  /** Compute the visible world-space bounds with a margin for culling. */
  private computeViewportBounds(config: SceneConfig): ViewportBounds {
    const margin = Math.max(200, 200 / config.zoom);
    return calculateViewportBounds(
      this.width,
      this.height,
      this.pan.x,
      this.pan.y,
      config.zoom,
      margin,
    );
  }
}
