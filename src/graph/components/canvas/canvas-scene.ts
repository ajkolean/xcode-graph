/**
 * Raw Canvas2D Scene Renderer
 *
 * Replaces the Konva.js scene graph with a single raw Canvas2D rendering pass.
 * All drawing code is ported verbatim from konva-scene.ts — the draw methods
 * were already raw `ctx` calls wrapped in Konva sceneFunc callbacks.
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

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import { type AnimatedValue, getAnimatedAlpha } from '@graph/utils/canvas-animation';
import { resolveClusterPosition, resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import { type CanvasTheme, colorWithAlpha, hexToRgba } from '@graph/utils/canvas-theme';
import type { Cluster, ViewMode } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { CLUSTER_LABEL_CONFIG, LOD_THRESHOLDS, ZOOM_CONFIG } from '@shared/utils/zoom-config';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { generateBezierPath } from '@ui/utils/paths';
import { getNodeSize } from '@ui/utils/sizing';
import {
  calculateViewportBounds,
  isCircleInViewport,
  isLineInViewportRaw,
  type ViewportBounds,
} from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { computeFitToViewport, screenToWorld } from './canvas-viewport';

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

/** Fade-out entry for removed nodes. */
export interface FadingNode {
  node: GraphNode;
  startTime: number;
}

/** Pre-computed per-edge metadata to avoid redundant calculations per frame. */
interface EdgeMeta {
  key: string;
  isCycle: boolean;
  isHighlighted: boolean;
  inChain: boolean;
  isSpecial: boolean;
  endpoints: {
    sourceNode: GraphNode;
    targetNode: GraphNode;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_LABEL_FONT_SIZE = 12;
const NODE_LABEL_PADDING = 8;
const NODE_FONT_SELECTED = `600 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
const NODE_FONT_CONNECTED = `500 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
const NODE_FONT_NORMAL = `400 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
const FADE_OUT_DURATION = 250;
const NODE_HIT_RADIUS_MULTIPLIER = 2;
const TOOLTIP_FONT = '12px var(--fonts-body, sans-serif)';
const TOOLTIP_TITLE_FONT = '600 13px var(--fonts-body, sans-serif)';
const TOOLTIP_SUBTITLE_FONT = '11px var(--fonts-body, sans-serif)';

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
  private static readonly MAX_BEZIER_CACHE_SIZE = 1000;

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
  private clickedEmptySpace = false;
  private hasMoved = false;
  private draggedNodeId: string | null = null;
  private draggedClusterId: string | null = null;
  private currentHoveredNode: string | null = null;
  private currentHoveredCluster: string | null = null;

  // Fade-out nodes
  fadingOutNodes = new Map<string, FadingNode>();

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
    this.drawFadingNodes(ctx, config);

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
      this.truncatedLabelCache.clear();
      for (const node of config.nodes) {
        this.nodeMap.set(node.id, node);
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
    for (const cluster of config.layout.clusters) {
      const layoutPos = config.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      const manualPos = config.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      if (!isCircleInViewport({ x: cx, y: cy }, radius, viewport)) continue;

      ctx.save();
      ctx.translate(cx, cy);
      this.drawCluster(ctx, cluster.id);
      ctx.restore();
    }
  }

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
    clusterPositions: ReadonlyMap<string, { x: number; y: number; width: number; height: number }>,
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
    this.canvas.remove();
    this.pathCache.clear();
    this.bezierPathCache.clear();
    this.gradientCache.clear();
    this.arcTextCache.clear();
    this.truncateCache.clear();
    this.truncatedLabelCache.clear();
    this.arcLabelBitmapCache.clear();
    this.nodeMap.clear();
    this.clusterMap.clear();
    this.edgeEndpointCache.clear();
    this.edgeMetaMap.clear();
  }

  // -------------------------------------------------------------------
  // Node Drawing
  // -------------------------------------------------------------------

  private drawNode(ctx: CanvasRenderingContext2D, nodeId: string, drawLabels = true): void {
    const config = this.config;
    if (!config) return;

    const node = this.nodeMap.get(nodeId);
    if (!node) return;

    const { theme, zoom } = config;
    const size = getNodeSize(node);

    const isHovered = config.hoveredNode === nodeId;
    const isSelected = config.selectedNode?.id === nodeId;
    const isConnected = Boolean(config.selectedNode && config.connectedNodes.has(nodeId));
    const isDimmed = config.dimmedNodeIds.has(nodeId);
    const isCycleNode = config.layout.cycleNodes?.has(nodeId) ?? false;
    const isInChain =
      (config.transitiveDeps?.nodes.has(nodeId) ?? false) ||
      (config.transitiveDependents?.nodes.has(nodeId) ?? false) ||
      isSelected;

    const adjustedColor =
      this.adjustedNodeColors.get(node.type) ??
      adjustColorForZoom(getNodeTypeColorFromTheme(node.type, theme), zoom);
    const alpha = prefersReducedMotion.get()
      ? (config.nodeAlphaMap.get(nodeId)?.target ?? 1.0)
      : getAnimatedAlpha(config.nodeAlphaMap, nodeId);

    ctx.globalAlpha = alpha;

    if (isCycleNode && !isDimmed) {
      this.drawCycleGlow(ctx, size, theme, alpha, config.time);
    }

    if (isSelected) {
      this.drawSelectionRings(ctx, size, adjustedColor, alpha, config.time);
    }

    this.drawNodeIcon(ctx, node, size, adjustedColor, theme, isHovered || isSelected);
    if (drawLabels) {
      this.drawNodeLabel(
        ctx,
        node,
        size,
        adjustedColor,
        theme,
        alpha,
        isSelected,
        isConnected,
        isInChain,
        isHovered,
      );
    }

    ctx.globalAlpha = 1.0;
  }

  private drawCycleGlow(
    ctx: CanvasRenderingContext2D,
    size: number,
    theme: CanvasTheme,
    alpha: number,
    time: number,
  ): void {
    const pulse = prefersReducedMotion.get() ? 0.5 : (Math.sin(time / 300) + 1) / 2;
    const glowRadius = size + 4 + pulse * 2;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.strokeStyle = theme.cycleGlowColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + pulse * 0.2;
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }

  private drawSelectionRings(
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string,
    alpha: number,
    time: number,
  ): void {
    if (prefersReducedMotion.get()) {
      ctx.beginPath();
      ctx.arc(0, 0, size + 8, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.globalAlpha = alpha * 0.4;
      ctx.stroke();
    } else {
      const ringCount = 3;
      const cycleDuration = 2400;
      const maxExpand = 24;
      for (let i = 0; i < ringCount; i++) {
        const phase = (i / ringCount + time / cycleDuration) % 1;
        const ringRadius = size + 2 + phase * maxExpand;
        const fadeIn = Math.min(1, phase / 0.2);
        const fadeOut = 1 - phase;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 8 * (1 - phase * 0.6);
        ctx.globalAlpha = alpha * fadeIn * fadeOut * 0.7;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = alpha;
  }

  private drawNodeIcon(
    ctx: CanvasRenderingContext2D,
    node: GraphNode,
    size: number,
    adjustedColor: string,
    theme: CanvasTheme,
    isEmphasized: boolean,
  ): void {
    const scale = (size / 12) * (isEmphasized ? 1.08 : 1.0);
    ctx.save();
    ctx.scale(scale, scale);

    const path = this.getPathForNode(node);
    ctx.fillStyle = theme.tooltipBg;
    ctx.fill(path);
    ctx.fillStyle = colorWithAlpha(adjustedColor, 0.12);
    ctx.fill(path);
    ctx.strokeStyle = adjustedColor;
    ctx.lineWidth = (isEmphasized ? 2.5 : 2) / scale;
    ctx.stroke(path);

    ctx.restore();
  }

  private drawNodeLabel(
    ctx: CanvasRenderingContext2D,
    node: GraphNode,
    size: number,
    adjustedColor: string,
    theme: CanvasTheme,
    alpha: number,
    isSelected: boolean,
    isConnected: boolean,
    isInChain: boolean,
    isHovered: boolean,
  ): void {
    let labelText: string;
    if (node.name.length > 20 && !isHovered && !isConnected) {
      let cached = this.truncatedLabelCache.get(node.id);
      if (!cached) {
        cached = `${node.name.substring(0, 20)}...`;
        this.truncatedLabelCache.set(node.id, cached);
      }
      labelText = cached;
    } else {
      labelText = node.name;
    }

    ctx.font = isSelected
      ? NODE_FONT_SELECTED
      : isConnected || isInChain
        ? NODE_FONT_CONNECTED
        : NODE_FONT_NORMAL;
    ctx.textAlign = 'center';
    const labelY = size + NODE_LABEL_PADDING + NODE_LABEL_FONT_SIZE;

    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = theme.shadowColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(labelText, 0, labelY);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = adjustedColor;
    ctx.fillText(labelText, 0, labelY);
  }

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

    this.drawClusterFill(ctx, clusterId, radius, clusterColor, isActive, cluster.nodes.length);
    this.drawClusterBorder(
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
    this.drawClusterLabel(ctx, radius, clusterColor, isActive, cluster.name);

    ctx.globalAlpha = 1.0;
  }

  private drawClusterFill(
    ctx: CanvasRenderingContext2D,
    clusterId: string,
    radius: number,
    clusterColor: string,
    isActive: boolean,
    nodeCount: number,
  ): void {
    const fillOpacity = isActive ? 0.08 : nodeCount <= 5 ? 0.06 : nodeCount <= 20 ? 0.08 : 0.1;
    const cacheKey = `${clusterId}-${Math.round(radius)}-${fillOpacity}`;
    let grad = this.gradientCache.get(cacheKey);
    if (!grad) {
      grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, hexToRgba(clusterColor, fillOpacity * 1.8));
      grad.addColorStop(0.6, hexToRgba(clusterColor, fillOpacity));
      grad.addColorStop(1, hexToRgba(clusterColor, fillOpacity * 0.3));
      this.gradientCache.set(cacheKey, grad);
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 1.0;
    ctx.fill();
  }

  private drawClusterBorder(
    ctx: CanvasRenderingContext2D,
    radius: number,
    clusterColor: string,
    isActive: boolean,
    isSelected: boolean,
    nodeCount: number,
    clusterType: string,
    zoom: number,
    time: number,
  ): void {
    const borderOpacity = adjustOpacityForZoom(0.7, zoom);
    const baseWidth = isActive ? 2.5 : 2;
    ctx.lineWidth = Math.max(1, Math.log2(nodeCount)) * baseWidth * 1.5;
    ctx.strokeStyle = clusterColor;
    ctx.globalAlpha = isActive ? 1.0 : borderOpacity;
    ctx.setLineDash(clusterType === 'project' ? [8, 8] : [3, 8]);

    if (isSelected && !prefersReducedMotion.get()) {
      ctx.lineDashOffset = -time / 50;
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }

  private drawClusterLabel(
    ctx: CanvasRenderingContext2D,
    radius: number,
    color: string,
    isActive: boolean,
    name: string,
  ): void {
    if ((this.config?.zoom ?? 1) < LOD_THRESHOLDS.CLUSTER_ARC_LABELS) return;

    const fontSize = CLUSTER_LABEL_CONFIG.FONT_SIZE;
    const maxTextWidth = radius * 1.6;
    const fontWeight = isActive ? 600 : 500;
    const font = `${fontWeight} ${fontSize}px var(--fonts-body, sans-serif)`;

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const displayName = this.truncateText(ctx, name, maxTextWidth);
    const arcRadius = radius + CLUSTER_LABEL_CONFIG.LABEL_PADDING;

    const bitmapKey = `${font}-${displayName}-${Math.round(arcRadius)}-${color}`;
    let cached = this.arcLabelBitmapCache.get(bitmapKey);
    if (!cached) {
      cached = this.renderArcLabelBitmap(ctx, displayName, arcRadius, font, color);
      this.arcLabelBitmapCache.set(bitmapKey, cached);
    }

    ctx.globalAlpha = isActive ? 1 : 0.85;
    ctx.drawImage(cached.canvas, -cached.width / 2, -cached.height / 2);
  }

  private truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    const cacheKey = `${ctx.font}-${text}-${Math.round(maxWidth)}`;
    const cached = this.truncateCache.get(cacheKey);
    if (cached !== undefined) return cached;

    let result = text;
    if (ctx.measureText(text).width > maxWidth) {
      while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
        result = result.slice(0, -1);
      }
      result = `${result}…`;
    }
    this.truncateCache.set(cacheKey, result);
    return result;
  }

  private renderArcLabelBitmap(
    ctx: CanvasRenderingContext2D,
    text: string,
    arcRadius: number,
    font: string,
    color: string,
  ): { canvas: OffscreenCanvas; width: number; height: number; arcRadius: number } {
    const cacheKey = `${font}-${text}`;
    let measurements = this.arcTextCache.get(cacheKey);
    if (!measurements) {
      ctx.font = font;
      const charWidths: number[] = [];
      let totalWidth = 0;
      for (const ch of text) {
        const w = ctx.measureText(ch).width;
        charWidths.push(w);
        totalWidth += w;
      }
      measurements = { charWidths, totalWidth };
      this.arcTextCache.set(cacheKey, measurements);
    }

    const padding = 4;
    const bitmapSize = (arcRadius + padding) * 2;
    const canvas = new OffscreenCanvas(bitmapSize, bitmapSize);
    const offCtx = canvas.getContext('2d');
    if (!offCtx) return { canvas, width: bitmapSize, height: bitmapSize, arcRadius };

    const cx = bitmapSize / 2;
    const cy = bitmapSize / 2;
    offCtx.font = font;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = color;

    const totalAngle = measurements.totalWidth / arcRadius;
    let angle = -Math.PI / 2 - totalAngle / 2;

    for (let i = 0; i < text.length; i++) {
      const charWidth = measurements.charWidths[i] ?? 0;
      angle += charWidth / (2 * arcRadius);

      const x = cx + arcRadius * Math.cos(angle);
      const y = cy + arcRadius * Math.sin(angle);
      const rotation = angle + Math.PI / 2;

      offCtx.save();
      offCtx.translate(x, y);
      offCtx.rotate(rotation);
      offCtx.fillText(text[i] ?? '', 0, 0);
      offCtx.restore();

      angle += charWidth / (2 * arcRadius);
    }

    return { canvas, width: bitmapSize, height: bitmapSize, arcRadius };
  }

  // -------------------------------------------------------------------
  // Edge Drawing
  // -------------------------------------------------------------------

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

  private drawEdges(ctx: CanvasRenderingContext2D): void {
    const config = this.config;
    if (!config) return;

    const { edges, zoom, time } = config;

    const isChainActive =
      config.showDirectDeps ||
      config.showTransitiveDeps ||
      config.showDirectDependents ||
      config.showTransitiveDependents;

    // Two-tier LOD: cluster arteries at low zoom, individual edges at high zoom
    if (zoom < LOD_THRESHOLDS.ARROWHEADS) {
      this.drawClusterArteries(ctx);

      // Still draw highlighted/chain edges so selections are visible at low zoom
      this.precomputeEdgeMeta(edges, isChainActive);
      const viewport = this.cachedViewport ?? this.computeViewportBounds(config);
      const animatedDashOffset = prefersReducedMotion.get() ? 0 : time / 20;
      for (const edge of edges) {
        const meta = this.edgeMetaMap.get(edge);
        if (!meta || !meta.isSpecial) continue;
        this.renderSingleEdge(ctx, meta, viewport, animatedDashOffset);
      }
      return;
    }

    // High zoom: individual edges with arrowheads
    const viewport = this.cachedViewport ?? this.computeViewportBounds(config);

    this.precomputeEdgeMeta(edges, isChainActive);

    const animatedDashOffset = prefersReducedMotion.get() ? 0 : time / 20;
    this.drawIndividualEdges(ctx, edges, viewport, animatedDashOffset);
  }

  private drawClusterArteries(ctx: CanvasRenderingContext2D): void {
    const config = this.config;
    if (!config) return;
    const clusterEdges = config.layout.clusterEdges;
    if (!clusterEdges || clusterEdges.length === 0) return;

    const { zoom, theme } = config;
    const viewport = this.cachedViewport ?? this.computeViewportBounds(config);

    for (const edge of clusterEdges) {
      const sLayout = config.layout.clusterPositions.get(edge.source);
      const tLayout = config.layout.clusterPositions.get(edge.target);
      if (!sLayout || !tLayout) continue;

      const sPos = resolveClusterPosition(edge.source, sLayout, config.manualClusterPositions);
      const tPos = resolveClusterPosition(edge.target, tLayout, config.manualClusterPositions);

      if (!isLineInViewportRaw(sPos.x, sPos.y, tPos.x, tPos.y, viewport)) continue;

      // Line thickness: 1-6px based on weight, scaled by zoom
      const thickness = Math.min(6, 1 + Math.log2(edge.weight)) / zoom;

      ctx.save();
      ctx.strokeStyle = theme.edgeDefault;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = thickness;
      ctx.setLineDash([]);

      this.drawEdgePath(ctx, sPos.x, sPos.y, tPos.x, tPos.y);
      ctx.restore();
    }
  }

  private drawIndividualEdges(
    ctx: CanvasRenderingContext2D,
    edges: GraphEdge[],
    viewport: ViewportBounds,
    animatedDashOffset: number,
  ): void {
    ctx.lineWidth = 1;
    for (const edge of edges) {
      const meta = this.edgeMetaMap.get(edge);
      if (!meta) continue;

      this.renderSingleEdge(ctx, meta, viewport, animatedDashOffset);
    }
  }

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

  private renderSingleEdge(
    ctx: CanvasRenderingContext2D,
    meta: EdgeMeta,
    viewport: ViewportBounds,
    animatedDashOffset: number,
  ): void {
    const config = this.config;
    if (!config) return;

    const { endpoints, key: edgeKey, isHighlighted, inChain, isCycle: cycleEdge } = meta;
    if (!endpoints) return;
    if (!isLineInViewportRaw(endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2, viewport))
      return;

    const isEmphasized = isHighlighted || inChain;
    const { zoom } = config;

    if (isEmphasized) {
      this.drawEdgeGlow(ctx, endpoints, cycleEdge, inChain, isHighlighted, edgeKey, zoom);
    }

    this.applyEdgeStyle(
      ctx,
      endpoints,
      edgeKey,
      isEmphasized,
      isHighlighted,
      cycleEdge,
      inChain,
      animatedDashOffset,
      zoom,
    );
    this.drawEdgePath(ctx, endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);

    if (zoom >= LOD_THRESHOLDS.ARROWHEADS) {
      this.drawArrowhead(ctx, endpoints, isEmphasized, zoom);
    }

    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }

  private drawEdgeGlow(
    ctx: CanvasRenderingContext2D,
    endpoints: {
      sourceNode: GraphNode;
      targetNode: GraphNode;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    },
    cycleEdge: boolean,
    inChain: boolean,
    isHighlighted: boolean,
    edgeKey: string,
    zoom: number,
  ): void {
    const glowColor = this.resolveEdgeColor(
      endpoints.sourceNode,
      endpoints.targetNode,
      true,
      cycleEdge,
    );
    ctx.save();
    ctx.strokeStyle = glowColor;
    const glowAlpha =
      inChain && !isHighlighted ? (this.getChainEdgeDepth(edgeKey) === 0 ? 0.15 : 0.08) : 0.15;
    ctx.globalAlpha = glowAlpha;
    ctx.lineWidth = 6 / zoom;
    ctx.setLineDash([]);
    this.drawEdgePath(ctx, endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);
    ctx.restore();
  }

  private resolveEdgeOpacity(
    edgeKey: string,
    isHighlighted: boolean,
    cycleEdge: boolean,
    inChain: boolean,
  ): number {
    if (inChain) {
      return this.getChainEdgeDepth(edgeKey) === 0 ? 1.0 : 0.5;
    }
    const baseOpacity = isHighlighted ? 1.0 : 0.25;
    return cycleEdge ? Math.max(baseOpacity, 0.8) : baseOpacity;
  }

  private applyEdgeStyle(
    ctx: CanvasRenderingContext2D,
    endpoints: { sourceNode: GraphNode; targetNode: GraphNode },
    edgeKey: string,
    isEmphasized: boolean,
    isHighlighted: boolean,
    cycleEdge: boolean,
    inChain: boolean,
    animatedDashOffset: number,
    zoom: number,
  ): void {
    ctx.strokeStyle = this.resolveEdgeColor(
      endpoints.sourceNode,
      endpoints.targetNode,
      isEmphasized,
      cycleEdge,
    );
    ctx.globalAlpha = this.resolveEdgeOpacity(edgeKey, isHighlighted, cycleEdge, inChain);
    ctx.lineWidth = (isEmphasized ? 2.5 : cycleEdge ? 2 : 1) / zoom;

    if (cycleEdge) {
      ctx.setLineDash([4, 4]);
    } else if (isEmphasized) {
      ctx.setLineDash([6, 3]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.lineDashOffset = isEmphasized ? animatedDashOffset : 0;
  }

  private drawArrowhead(
    ctx: CanvasRenderingContext2D,
    endpoints: { x1: number; y1: number; x2: number; y2: number },
    isEmphasized: boolean,
    zoom: number,
  ): void {
    const arrowSize = (isEmphasized ? 7 : 5) / zoom;
    const angle = Math.atan2(endpoints.y2 - endpoints.y1, endpoints.x2 - endpoints.x1);
    ctx.save();
    ctx.translate(endpoints.x2, endpoints.y2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, arrowSize * 0.5);
    ctx.lineTo(-arrowSize, -arrowSize * 0.5);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    ctx.restore();
  }

  private resolveEdgeColor(
    sourceNode: GraphNode,
    targetNode: GraphNode,
    isEmphasized: boolean,
    isCycle: boolean,
  ): string {
    const config = this.config;
    if (!config) return 'gray';
    if (isCycle) return config.theme.cycleEdgeColor;
    if (!isEmphasized) return config.theme.edgeDefault;
    const colorNode =
      config.selectedNode && sourceNode.id === config.selectedNode.id ? targetNode : sourceNode;
    return getNodeTypeColorFromTheme(colorNode.type, config.theme);
  }

  private drawEdgePath(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): void {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    if (distance > 150) {
      // Use rounded integer coords as cache key to avoid generating full path string on hit
      const rx1 = Math.round(x1);
      const ry1 = Math.round(y1);
      const rx2 = Math.round(x2);
      const ry2 = Math.round(y2);
      const numericKey = `${rx1},${ry1},${rx2},${ry2}`;

      let path = this.bezierPathCache.get(numericKey);
      if (!path) {
        const pathStr = generateBezierPath(x1, y1, x2, y2);
        path = new Path2D(pathStr);
        if (this.bezierPathCache.size >= CanvasScene.MAX_BEZIER_CACHE_SIZE) {
          const firstKey = this.bezierPathCache.keys().next().value;
          if (firstKey) this.bezierPathCache.delete(firstKey);
        }
        this.bezierPathCache.set(numericKey, path);
      }
      ctx.stroke(path);
    } else {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------------
  // Tooltip (screen space)
  // -------------------------------------------------------------------

  private drawTooltip(ctx: CanvasRenderingContext2D, config: SceneConfig): void {
    const { hoveredNode, hoveredCluster } = config;

    if (hoveredNode) {
      this.drawNodeTooltip(ctx, config, hoveredNode);
    } else if (hoveredCluster) {
      this.drawClusterTooltip(ctx, config, hoveredCluster);
    }
  }

  private drawNodeTooltip(
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

    // Convert world position to screen space
    const screenX = worldPos.x * zoom + this.pan.x;
    const screenY = (worldPos.y - size) * zoom + this.pan.y - 35;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    ctx.font = TOOLTIP_FONT;
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(node.name).width;
    const padding = 8;
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = 24;

    // Background
    ctx.fillStyle = theme.tooltipBg;
    ctx.strokeStyle = nodeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.roundRect(
      ctx,
      screenX - tooltipWidth / 2,
      screenY - tooltipHeight / 2,
      tooltipWidth,
      tooltipHeight,
      4,
    );
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = nodeColor;
    ctx.fillText(node.name, screenX, screenY + 4);

    ctx.restore();
  }

  private drawClusterTooltip(
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

    // Convert to screen space
    const screenX = clusterPos.x * zoom + this.pan.x;
    const screenY = (clusterPos.y - radius) * zoom + this.pan.y - 60;

    const subtitleText = `${cluster.nodes.length} targets`;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Measure text
    ctx.font = TOOLTIP_TITLE_FONT;
    const nameWidth = ctx.measureText(cluster.name).width;
    ctx.font = TOOLTIP_SUBTITLE_FONT;
    const subtitleWidth = ctx.measureText(subtitleText).width;
    const maxWidth = Math.max(nameWidth, subtitleWidth);
    const padding = 10;
    const tooltipWidth = maxWidth + padding * 2;
    const tooltipHeight = 40;

    // Background
    ctx.fillStyle = theme.tooltipBg;
    ctx.strokeStyle = clusterColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.roundRect(
      ctx,
      screenX - tooltipWidth / 2,
      screenY - tooltipHeight / 2,
      tooltipWidth,
      tooltipHeight,
      4,
    );
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = TOOLTIP_TITLE_FONT;
    ctx.textAlign = 'center';
    ctx.fillStyle = clusterColor;
    ctx.fillText(cluster.name, screenX, screenY - 4);

    // Subtitle
    ctx.font = TOOLTIP_SUBTITLE_FONT;
    ctx.globalAlpha = 0.7;
    ctx.fillText(subtitleText, screenX, screenY + 12);
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // -------------------------------------------------------------------
  // Fading Nodes
  // -------------------------------------------------------------------

  private drawFadingNodes(ctx: CanvasRenderingContext2D, config: SceneConfig): void {
    if (this.fadingOutNodes.size === 0) return;

    const now = performance.now();

    for (const [nodeId, { node, startTime }] of this.fadingOutNodes) {
      const elapsed = now - startTime;

      if (elapsed >= FADE_OUT_DURATION) {
        this.fadingOutNodes.delete(nodeId);
        continue;
      }

      const opacity = 1 - elapsed / FADE_OUT_DURATION;
      const pos = resolveNodeWorldPosition(
        node.id,
        node.project || 'External',
        config.layout,
        config.manualNodePositions,
        config.manualClusterPositions,
      );
      if (!pos) continue;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(pos.x, pos.y);
      this.drawNode(ctx, node.id);
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------
  // Hit Testing (on mouse events, not per-frame)
  // -------------------------------------------------------------------

  private hitTestNode(worldX: number, worldY: number): GraphNode | null {
    const config = this.config;
    if (!config) return null;

    let closestNode: GraphNode | null = null;
    let closestDist = Number.POSITIVE_INFINITY;

    for (const node of config.nodes) {
      const pos = resolveNodeWorldPosition(
        node.id,
        node.project || 'External',
        config.layout,
        config.manualNodePositions,
        config.manualClusterPositions,
      );
      if (!pos) continue;

      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = getNodeSize(node) * NODE_HIT_RADIUS_MULTIPLIER;

      if (dist < hitRadius && dist < closestDist) {
        closestDist = dist;
        closestNode = node;
      }
    }

    return closestNode;
  }

  private hitTestCluster(worldX: number, worldY: number): string | null {
    const config = this.config;
    if (!config) return null;

    for (const cluster of config.layout.clusters) {
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
    this.hasMoved = false;

    // Check if clicking a node
    const hitNode = this.hitTestNode(worldPos.x, worldPos.y);
    if (hitNode) {
      this.draggedNodeId = hitNode.id;
      this.isDragging = true;
      this.clickedEmptySpace = false;

      const selected = this.config?.selectedNode;
      const newSelection = selected?.id === hitNode.id ? null : hitNode;
      this.callbacks.onNodeSelect(newSelection);
      return;
    }

    // Check if clicking a cluster (shift/meta for drag)
    const hitCluster = this.hitTestCluster(worldPos.x, worldPos.y);
    if (hitCluster) {
      this.clickedEmptySpace = false;
      if (evt.shiftKey || evt.metaKey) {
        this.draggedClusterId = hitCluster;
        this.isDragging = true;
      }
      this.callbacks.onClusterSelect(hitCluster);
      return;
    }

    // Clicked empty space — start panning
    this.isPanning = true;
    this.clickedEmptySpace = true;
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

  private handleDragCluster(evt: MouseEvent): void {
    if (!this.config || !this.draggedClusterId) return;
    this.hasMoved = true;
    const rect = this.canvas.getBoundingClientRect();
    const screenX = evt.clientX - rect.left;
    const screenY = evt.clientY - rect.top;
    const worldPos = this.screenToWorldPos(screenX, screenY);
    this.config.manualClusterPositions.set(this.draggedClusterId, worldPos);
    this.callbacks.onInvalidateEdgePathCache();
    this.callbacks.onRenderRequest();
  }

  private handleDragNode(evt: MouseEvent): void {
    if (!this.config || !this.draggedNodeId) return;
    this.hasMoved = true;
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

  private handlePan(evt: MouseEvent): void {
    this.hasMoved = true;
    const dx = evt.clientX - this.lastMousePos.x;
    const dy = evt.clientY - this.lastMousePos.y;
    this.pan = { x: this.pan.x + dx, y: this.pan.y + dy };
    this.lastMousePos = { x: evt.clientX, y: evt.clientY };

    // Immediate render for zero-latency pan
    this.renderImmediate();
    this.callbacks.onRenderRequest();
  }

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
        this.callbacks.onRenderRequest();
      }
    }
  }

  private handleMouseUp = (): void => {
    if (this.clickedEmptySpace && !this.hasMoved) {
      this.callbacks.onNodeSelect(null);
      this.callbacks.onClusterSelect(null);
    }

    this.isPanning = false;
    this.isDragging = false;
    this.clickedEmptySpace = false;
    this.draggedNodeId = null;
    this.draggedClusterId = null;
    setTimeout(() => {
      this.hasMoved = false;
    }, 0);
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

  // -------------------------------------------------------------------
  // Viewport Helpers
  // -------------------------------------------------------------------

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
