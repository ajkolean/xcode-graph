/**
 * Konva Scene Graph Manager
 *
 * Replaces the manual Canvas2D rendering pipeline with a Konva.js scene graph.
 * Each node and cluster is a Konva.Group with custom sceneFunc for drawing,
 * edges use a single batched Shape, and interactions are handled natively by Konva.
 *
 * Layers (bottom to top):
 *   1. Cluster layer – gradient fills, dashed borders, arc labels
 *   2. Edge layer – batched non-special + individual special edges
 *   3. Node layer – icon paths, labels, selection/cycle effects
 *   4. Tooltip layer – hover tooltips (counter-scaled for constant screen size)
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
  isLineInViewportRaw,
  type ViewportBounds,
} from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import Konva from 'konva';
import { computeFitToViewport, getCanvasMousePos, screenToWorld } from './canvas-viewport';

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
const EDGE_HIDE_ZOOM_THRESHOLD = 0.3;

// ---------------------------------------------------------------------------
// KonvaScene
// ---------------------------------------------------------------------------

export class KonvaScene {
  private stage: Konva.Stage;
  private clusterLayer: Konva.Layer;
  private edgeLayer: Konva.Layer;
  private nodeLayer: Konva.Layer;
  private tooltipLayer: Konva.Layer;

  // Shape registries
  private nodeGroups = new Map<string, Konva.Group>();
  private clusterGroups = new Map<string, Konva.Group>();

  // Single shape for all edges (batched + special in one sceneFunc)
  private edgeShape: Konva.Shape;

  // Tooltip shapes (persistent, show/hide)
  private tooltipGroup: Konva.Group;
  private tooltipBg: Konva.Rect;
  private tooltipText: Konva.Text;
  private tooltipSubtext: Konva.Text;

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

  // Offscreen bitmap cache for arc labels — avoids per-character setTransform + fillText each frame
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

  // Edge endpoint cache — only cleared when positions change (layout, drag, data change)
  private edgeEndpointCache = new Map<
    string,
    ReturnType<KonvaScene['resolveEdgeEndpointsInner']>
  >();
  private cachedEdgesRef: GraphEdge[] | null = null;
  private cachedManualNodePosSize = -1;
  private cachedManualClusterPosSize = -1;

  // Tooltip text cache to avoid redundant Konva text measurement
  private lastTooltipText = '';
  private lastTooltipSubtext = '';

  // Per-frame cached viewport bounds (computed once in render(), used by nodes/clusters/edges)
  private cachedViewport: ViewportBounds | null = null;

  // Per-frame edge metadata map — precomputed once per frame to avoid redundant calculations
  private edgeMetaMap = new Map<GraphEdge, EdgeMeta>();

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

    // Disable Konva's automatic redraws — we manage draw calls manually
    Konva.autoDrawEnabled = false;

    this.stage = new Konva.Stage({
      container,
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
    });

    // Layers in draw order (bottom to top)
    this.clusterLayer = new Konva.Layer();
    this.edgeLayer = new Konva.Layer({ listening: false });
    this.nodeLayer = new Konva.Layer();
    this.tooltipLayer = new Konva.Layer({ listening: false });

    this.stage.add(this.clusterLayer);
    this.stage.add(this.edgeLayer);
    this.stage.add(this.nodeLayer);
    this.stage.add(this.tooltipLayer);

    // Edge shape — single shape for all edges, with perf flags
    this.edgeShape = new Konva.Shape({
      listening: false,
      perfectDrawEnabled: false,
      shadowForStrokeEnabled: false,
      sceneFunc: (context) => this.drawEdges(context._context),
    });
    this.edgeLayer.add(this.edgeShape);

    // Tooltip shapes
    this.tooltipGroup = new Konva.Group({ visible: false, listening: false });
    this.tooltipBg = new Konva.Rect({ cornerRadius: 4 });
    this.tooltipText = new Konva.Text({ fontSize: 12, align: 'center' });
    this.tooltipSubtext = new Konva.Text({ fontSize: 11, align: 'center', opacity: 0.7 });
    this.tooltipGroup.add(this.tooltipBg);
    this.tooltipGroup.add(this.tooltipText);
    this.tooltipGroup.add(this.tooltipSubtext);
    this.tooltipLayer.add(this.tooltipGroup);

    // Event handlers
    this.stage.on('wheel', (e) => this.handleWheel(e));
    this.stage.on('mousedown', (e) => this.handleMouseDown(e));
    this.stage.on('mousemove', (e) => this.handleMouseMove(e));
    this.stage.on('mouseup', () => this.handleMouseUp());
    this.stage.on('mouseleave', () => this.handleMouseLeave());
  }

  // -------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------

  /** Main render method — called each frame by the animation loop. */
  render(config: SceneConfig): void {
    this.config = config;

    // Rebuild node map only when the nodes array reference changes
    if (config.nodes !== this.cachedNodesRef) {
      this.nodeMap.clear();
      for (const node of config.nodes) {
        this.nodeMap.set(node.id, node);
      }
      this.cachedNodesRef = config.nodes;
    }

    // Rebuild cluster map only when the clusters array reference changes
    if (config.layout.clusters !== this.cachedClustersRef) {
      this.clusterMap.clear();
      for (const cluster of config.layout.clusters) {
        this.clusterMap.set(cluster.id, cluster);
      }
      this.cachedClustersRef = config.layout.clusters;
    }

    // Only clear edge endpoint cache when positions/edges change (not every frame)
    const positionsChanged =
      config.edges !== this.cachedEdgesRef ||
      config.nodes !== this.cachedNodesRef ||
      config.layout.clusters !== this.cachedClustersRef ||
      config.manualNodePositions.size !== this.cachedManualNodePosSize ||
      config.manualClusterPositions.size !== this.cachedManualClusterPosSize;
    if (positionsChanged) {
      this.edgeEndpointCache.clear();
      this.cachedEdgesRef = config.edges;
      this.cachedManualNodePosSize = config.manualNodePositions.size;
      this.cachedManualClusterPosSize = config.manualClusterPositions.size;
    }

    // Sync shapes with current data
    this.syncClusterShapes(config);
    this.syncNodeShapes(config);

    // Update stage transform
    this.stage.scale({ x: config.zoom, y: config.zoom });
    this.stage.position({ x: this.pan.x, y: this.pan.y });

    // Compute viewport bounds once per frame (used by nodes, clusters, edges)
    this.cachedViewport = this.computeViewportBounds(config);

    // Pre-compute adjusted node type colors (7 types vs N nodes)
    if (config.zoom !== this.adjustedColorsZoom) {
      this.adjustedNodeColors.clear();
      for (const type of Object.values(NodeType)) {
        const baseColor = getNodeTypeColorFromTheme(type, config.theme);
        this.adjustedNodeColors.set(type, adjustColorForZoom(baseColor, config.zoom));
      }
      this.adjustedColorsZoom = config.zoom;
    }

    // Update cluster positions and visuals
    this.updateClusterVisuals(config);

    // Update node positions and visuals
    this.updateNodePositions(config);

    // Clean up completed fading nodes
    this.updateFadingNodes();

    // Update tooltip
    this.updateTooltip(config);

    // Draw all layers
    this.clusterLayer.draw();
    this.edgeLayer.draw();
    this.nodeLayer.draw();
    this.tooltipLayer.draw();
  }

  /** Synchronous render for zero-latency zoom response. */
  renderImmediate(): void {
    if (this.config) {
      this.stage.scale({ x: this._zoom, y: this._zoom });
      this.stage.position({ x: this.pan.x, y: this.pan.y });
      this.clusterLayer.draw();
      this.edgeLayer.draw();
      this.nodeLayer.draw();
      this.tooltipLayer.draw();
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
    this.stage.scale({ x: zoom, y: zoom });
    this.stage.position(pan);
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

  /** Get canvas-relative mouse position. */
  getMousePosition(e: MouseEvent, canvasRect: DOMRect): { x: number; y: number } {
    return getCanvasMousePos(e, canvasRect);
  }

  /** Resize the stage to match container dimensions. */
  resize(width: number, height: number): void {
    this.stage.width(width);
    this.stage.height(height);
  }

  /** Clear caches when layout changes. */
  clearCaches(): void {
    this.gradientCache.clear();
    this.arcTextCache.clear();
    this.truncateCache.clear();
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
    this.stage.destroy();
    this.pathCache.clear();
    this.bezierPathCache.clear();
    this.gradientCache.clear();
    this.arcTextCache.clear();
    this.truncateCache.clear();
    this.arcLabelBitmapCache.clear();
    this.nodeGroups.clear();
    this.clusterGroups.clear();
    this.nodeMap.clear();
    this.clusterMap.clear();
    this.edgeEndpointCache.clear();
    this.edgeMetaMap.clear();
  }

  // -------------------------------------------------------------------
  // Shape Sync — add/remove Konva groups to match current data
  // -------------------------------------------------------------------

  private syncNodeShapes(config: SceneConfig): void {
    // Use the already-built nodeMap for O(1) lookups instead of creating a new Set
    // Remove shapes for nodes no longer present (unless they're fading out)
    for (const [id, group] of this.nodeGroups) {
      if (!this.nodeMap.has(id) && !this.fadingOutNodes.has(id)) {
        group.destroy();
        this.nodeGroups.delete(id);
      }
    }

    // Add shapes for new nodes
    for (const node of config.nodes) {
      if (!this.nodeGroups.has(node.id)) {
        const group = this.createNodeGroup(node);
        this.nodeLayer.add(group);
        this.nodeGroups.set(node.id, group);
      }
    }
  }

  private syncClusterShapes(config: SceneConfig): void {
    // Use the already-built clusterMap for O(1) lookups instead of creating a new Set
    for (const [id, group] of this.clusterGroups) {
      if (!this.clusterMap.has(id)) {
        group.destroy();
        this.clusterGroups.delete(id);
      }
    }

    for (const cluster of config.layout.clusters) {
      if (!this.clusterGroups.has(cluster.id)) {
        const group = this.createClusterGroup(cluster.id);
        this.clusterLayer.add(group);
        this.clusterGroups.set(cluster.id, group);
      }
    }
  }

  // -------------------------------------------------------------------
  // Node Group Creation
  // -------------------------------------------------------------------

  private createNodeGroup(node: GraphNode): Konva.Group {
    const group = new Konva.Group({ id: node.id, transformsEnabled: 'position' });

    const shape = new Konva.Shape({
      perfectDrawEnabled: false,
      shadowForStrokeEnabled: false,
      sceneFunc: (context) => {
        if (!this.config) return;
        this.drawNode(context._context, node.id);
      },
      hitFunc: (context, shape) => {
        const size = getNodeSize(node);
        const hitRadius = size * 2;
        context.beginPath();
        context.arc(0, 0, hitRadius, 0, Math.PI * 2);
        context.closePath();
        context.fillStrokeShape(shape);
      },
    });

    group.add(shape);

    // Events
    group.on('mouseenter', () => {
      if (this.isDragging) return;
      this.currentHoveredNode = node.id;
      this.currentHoveredCluster = node.project || 'External';
      this.callbacks.onNodeHover(node.id);
      this.callbacks.onClusterHover(this.currentHoveredCluster);
      this.callbacks.onRenderRequest();
    });

    group.on('mouseleave', () => {
      if (this.isDragging) return;
      if (this.currentHoveredNode === node.id) {
        this.currentHoveredNode = null;
        this.callbacks.onNodeHover(null);
      }
      // Don't clear cluster hover here — let the stage handle it
      this.callbacks.onRenderRequest();
    });

    group.on('mousedown', (e) => {
      e.cancelBubble = true;
      this.draggedNodeId = node.id;
      this.isDragging = true;
      this.hasMoved = false;

      const currentNode = this.nodeMap.get(node.id);
      if (currentNode) {
        const selected = this.config?.selectedNode;
        const newSelection = selected?.id === currentNode.id ? null : currentNode;
        this.callbacks.onNodeSelect(newSelection);
      }
    });

    return group;
  }

  // -------------------------------------------------------------------
  // Cluster Group Creation
  // -------------------------------------------------------------------

  private createClusterGroup(clusterId: string): Konva.Group {
    const group = new Konva.Group({ id: clusterId, transformsEnabled: 'position' });

    const shape = new Konva.Shape({
      perfectDrawEnabled: false,
      shadowForStrokeEnabled: false,
      sceneFunc: (context) => {
        if (!this.config) return;
        this.drawCluster(context._context, clusterId);
      },
      hitFunc: (context, shape) => {
        if (!this.config) return;
        const layoutPos = this.config.layout.clusterPositions.get(clusterId);
        if (!layoutPos) return;
        const radius = Math.max(layoutPos.width, layoutPos.height) / 2;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.closePath();
        context.fillStrokeShape(shape);
      },
    });

    group.add(shape);

    group.on('mouseenter', () => {
      if (this.isDragging) return;
      if (!this.currentHoveredNode) {
        this.currentHoveredCluster = clusterId;
        this.callbacks.onClusterHover(clusterId);
        this.callbacks.onRenderRequest();
      }
    });

    group.on('mouseleave', () => {
      if (this.isDragging) return;
      if (this.currentHoveredCluster === clusterId && !this.currentHoveredNode) {
        this.currentHoveredCluster = null;
        this.callbacks.onClusterHover(null);
        this.callbacks.onRenderRequest();
      }
    });

    group.on('mousedown', (e) => {
      const evt = e.evt;
      if (evt.shiftKey || evt.metaKey) {
        e.cancelBubble = true;
        this.draggedClusterId = clusterId;
        this.isDragging = true;
        this.hasMoved = false;
        this.callbacks.onClusterSelect(clusterId);
      } else {
        e.cancelBubble = true;
        this.callbacks.onClusterSelect(clusterId);
      }
    });

    return group;
  }

  // -------------------------------------------------------------------
  // Position & Visual Updates
  // -------------------------------------------------------------------

  private updateNodePositions(config: SceneConfig): void {
    for (const node of config.nodes) {
      const group = this.nodeGroups.get(node.id);
      if (!group) continue;

      const pos = resolveNodeWorldPosition(
        node.id,
        node.project || 'External',
        config.layout,
        config.manualNodePositions,
        config.manualClusterPositions,
      );

      if (pos) {
        group.position({ x: pos.x, y: pos.y });
      }
    }
  }

  private updateClusterVisuals(config: SceneConfig): void {
    for (const cluster of config.layout.clusters) {
      const group = this.clusterGroups.get(cluster.id);
      if (!group) continue;

      const layoutPos = config.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      const manualPos = config.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      group.position({ x: cx, y: cy });
    }
  }

  // -------------------------------------------------------------------
  // Node Drawing (sceneFunc)
  // -------------------------------------------------------------------

  private drawNode(ctx: CanvasRenderingContext2D, nodeId: string): void {
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
    const glowRadius = size + 6 + pulse * 3;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.strokeStyle = theme.cycleGlowColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 + pulse * 0.3;
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
    // Skip text rendering at very low zoom levels — labels are unreadable
    if ((this.config?.zoom ?? 1) < LOD_THRESHOLDS.NODE_LABELS) return;

    const labelText =
      node.name.length > 20 && !isHovered && !isConnected
        ? `${node.name.substring(0, 20)}...`
        : node.name;

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
  // Cluster Drawing (sceneFunc)
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
    // Skip arc text at very low zoom — per-character operations are expensive and unreadable
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

    // Use cached offscreen bitmap to avoid per-character setTransform + fillText every frame
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

  /**
   * Render arc label text to an offscreen canvas bitmap.
   * Called once per unique label, then the bitmap is reused via drawImage each frame.
   */
  private renderArcLabelBitmap(
    ctx: CanvasRenderingContext2D,
    text: string,
    arcRadius: number,
    font: string,
    color: string,
  ): { canvas: OffscreenCanvas; width: number; height: number; arcRadius: number } {
    // Measure character widths using the main ctx (inherits font metrics)
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

    // Size the bitmap to cover the arc label area
    const padding = 4;
    const bitmapSize = (arcRadius + padding) * 2;
    const canvas = new OffscreenCanvas(bitmapSize, bitmapSize);
    const offCtx = canvas.getContext('2d');
    if (!offCtx) return { canvas, width: bitmapSize, height: bitmapSize, arcRadius };

    // Draw arc text centered in the bitmap
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
  // Edge Drawing (sceneFunc — batched + individual)
  // -------------------------------------------------------------------

  /** Pre-compute edge metadata once per frame to eliminate redundant per-edge calculations. */
  private precomputeEdgeMeta(edges: GraphEdge[], isChainActive: boolean): void {
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

    const { edges, zoom, time, theme } = config;
    const viewport = this.cachedViewport ?? this.computeViewportBounds(config);

    const isChainActive =
      config.showDirectDeps ||
      config.showTransitiveDeps ||
      config.showDirectDependents ||
      config.showTransitiveDependents;

    const hideNonEmphasized = zoom < EDGE_HIDE_ZOOM_THRESHOLD;
    const batchEdges = !hideNonEmphasized && zoom < LOD_THRESHOLDS.ARROWHEADS;

    // Pre-compute all edge metadata once per frame
    this.precomputeEdgeMeta(edges, isChainActive);

    if (batchEdges) {
      this.drawBatchedEdges(ctx, edges, viewport, theme, zoom);
    }

    const animatedDashOffset = prefersReducedMotion.get() ? 0 : time / 20;
    this.drawIndividualEdges(
      ctx,
      edges,
      viewport,
      batchEdges,
      hideNonEmphasized,
      animatedDashOffset,
    );
  }

  private drawBatchedEdges(
    ctx: CanvasRenderingContext2D,
    edges: GraphEdge[],
    viewport: ViewportBounds,
    theme: CanvasTheme,
    zoom: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = theme.edgeDefault;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([]);
    ctx.beginPath();

    for (const edge of edges) {
      const meta = this.edgeMetaMap.get(edge);
      if (!meta || meta.isSpecial) continue;

      const { endpoints } = meta;
      if (!endpoints) continue;
      if (!isLineInViewportRaw(endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2, viewport))
        continue;

      ctx.moveTo(endpoints.x1, endpoints.y1);
      ctx.lineTo(endpoints.x2, endpoints.y2);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawIndividualEdges(
    ctx: CanvasRenderingContext2D,
    edges: GraphEdge[],
    viewport: ViewportBounds,
    batchEdges: boolean,
    hideNonEmphasized: boolean,
    animatedDashOffset: number,
  ): void {
    ctx.lineWidth = 1;
    for (const edge of edges) {
      const meta = this.edgeMetaMap.get(edge);
      if (!meta) continue;

      if (batchEdges && !meta.isSpecial) continue;
      if (hideNonEmphasized && !meta.isHighlighted && !meta.inChain) continue;

      this.renderSingleEdge(ctx, edge, meta, viewport, animatedDashOffset);
    }
  }

  /** Resolves edge endpoints with per-frame caching to avoid redundant lookups. */
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

    // Resolve cluster positions — capture values immediately since
    // resolveClusterPosition returns a reusable object
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
    _edge: GraphEdge,
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
      const pathStr = generateBezierPath(x1, y1, x2, y2);
      // Cache Path2D objects keyed by the (already rounded) path string
      let path = this.bezierPathCache.get(pathStr);
      if (!path) {
        path = new Path2D(pathStr);
        // FIFO eviction
        if (this.bezierPathCache.size >= KonvaScene.MAX_BEZIER_CACHE_SIZE) {
          const firstKey = this.bezierPathCache.keys().next().value;
          if (firstKey) this.bezierPathCache.delete(firstKey);
        }
        this.bezierPathCache.set(pathStr, path);
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
  // Tooltip
  // -------------------------------------------------------------------

  private updateTooltip(config: SceneConfig): void {
    const { hoveredNode, hoveredCluster } = config;

    if (hoveredNode) {
      this.showNodeTooltip(config, hoveredNode);
    } else if (hoveredCluster) {
      this.showClusterTooltip(config, hoveredCluster);
    } else {
      this.hideTooltip();
    }
  }

  private showNodeTooltip(config: SceneConfig, hoveredNode: string): void {
    const node = this.nodeMap.get(hoveredNode);
    if (!node) {
      this.hideTooltip();
      return;
    }

    const worldPos = resolveNodeWorldPosition(
      node.id,
      node.project || 'External',
      config.layout,
      config.manualNodePositions,
      config.manualClusterPositions,
    );
    if (!worldPos) {
      this.hideTooltip();
      return;
    }

    const { theme, zoom } = config;
    const size = getNodeSize(node);
    const nodeColor =
      this.adjustedNodeColors.get(node.type) ??
      adjustColorForZoom(getNodeTypeColorFromTheme(node.type, theme), zoom);

    this.tooltipGroup.position({ x: worldPos.x, y: worldPos.y - size - 35 / zoom });
    this.tooltipGroup.scale({ x: 1 / zoom, y: 1 / zoom });

    if (this.lastTooltipText !== node.name) {
      this.tooltipText.text(node.name);
      this.tooltipText.fontFamily('var(--fonts-body, sans-serif)');
      this.lastTooltipText = node.name;

      const textWidth = this.tooltipText.width();
      const padding = 8;
      const tooltipWidth = textWidth + padding * 2;

      this.tooltipBg.width(tooltipWidth);
      this.tooltipBg.height(24);
      this.tooltipBg.x(-tooltipWidth / 2);
      this.tooltipBg.y(-12);
      this.tooltipText.x(-textWidth / 2);
      this.tooltipText.y(-6);
    }

    this.tooltipText.fill(nodeColor);
    this.tooltipBg.fill(theme.tooltipBg);
    this.tooltipBg.stroke(nodeColor);
    this.tooltipBg.strokeWidth(1);
    this.tooltipSubtext.visible(false);
    this.lastTooltipSubtext = '';
    this.tooltipGroup.visible(true);
  }

  private showClusterTooltip(config: SceneConfig, hoveredCluster: string): void {
    const cluster = this.clusterMap.get(hoveredCluster);
    if (!cluster) {
      this.hideTooltip();
      return;
    }

    const layoutPos = config.layout.clusterPositions.get(hoveredCluster);
    if (!layoutPos) {
      this.hideTooltip();
      return;
    }

    const { theme, zoom } = config;
    const clusterPos = resolveClusterPosition(
      hoveredCluster,
      layoutPos,
      config.manualClusterPositions,
    );
    const radius = Math.max(layoutPos.width, layoutPos.height) / 2;
    const clusterColor = adjustColorForZoom(generateColor(cluster.name, cluster.type), zoom);

    this.tooltipGroup.position({
      x: clusterPos.x,
      y: clusterPos.y - radius - 60 / zoom,
    });
    this.tooltipGroup.scale({ x: 1 / zoom, y: 1 / zoom });

    const subtitleText = `${cluster.nodes.length} targets`;

    if (this.lastTooltipText !== cluster.name || this.lastTooltipSubtext !== subtitleText) {
      this.tooltipText.text(cluster.name);
      this.tooltipText.fontSize(13);
      this.tooltipText.fontStyle('600');
      this.tooltipText.fontFamily('var(--fonts-body, sans-serif)');
      this.lastTooltipText = cluster.name;

      this.tooltipSubtext.text(subtitleText);
      this.tooltipSubtext.fontSize(11);
      this.tooltipSubtext.fontFamily('var(--fonts-body, sans-serif)');
      this.lastTooltipSubtext = subtitleText;

      const nameWidth = this.tooltipText.width();
      const subtitleWidth = this.tooltipSubtext.width();
      const maxWidth = Math.max(nameWidth, subtitleWidth);
      const padding = 10;
      const tooltipWidth = maxWidth + padding * 2;

      this.tooltipBg.width(tooltipWidth);
      this.tooltipBg.height(40);
      this.tooltipBg.x(-tooltipWidth / 2);
      this.tooltipBg.y(-20);
      this.tooltipText.x(-nameWidth / 2);
      this.tooltipText.y(-14);
      this.tooltipSubtext.x(-subtitleWidth / 2);
      this.tooltipSubtext.y(2);
    }

    this.tooltipText.fill(clusterColor);
    this.tooltipSubtext.fill(clusterColor);
    this.tooltipSubtext.visible(true);
    this.tooltipBg.fill(theme.tooltipBg);
    this.tooltipBg.stroke(clusterColor);
    this.tooltipBg.strokeWidth(1);
    this.tooltipGroup.visible(true);
  }

  private hideTooltip(): void {
    if (this.tooltipGroup.visible()) {
      this.tooltipGroup.visible(false);
      this.lastTooltipText = '';
      this.lastTooltipSubtext = '';
    }
  }

  // -------------------------------------------------------------------
  // Fading Nodes
  // -------------------------------------------------------------------

  private updateFadingNodes(): void {
    if (this.fadingOutNodes.size === 0 || !this.config) return;

    const now = performance.now();

    for (const [nodeId, { startTime }] of this.fadingOutNodes) {
      const elapsed = now - startTime;
      const group = this.nodeGroups.get(nodeId);

      if (elapsed >= FADE_OUT_DURATION) {
        // Animation complete — remove the shape and tracking entry
        if (group) {
          group.destroy();
          this.nodeGroups.delete(nodeId);
        }
        this.fadingOutNodes.delete(nodeId);
        continue;
      }

      // Still fading — update opacity on the Konva group
      if (group) {
        const opacity = 1 - elapsed / FADE_OUT_DURATION;
        group.opacity(opacity);
      }
    }
  }

  // -------------------------------------------------------------------
  // Interaction Handlers
  // -------------------------------------------------------------------

  private handleWheel(e: Konva.KonvaEventObject<WheelEvent>): void {
    const evt = e.evt;
    evt.preventDefault();

    const modeFactor = evt.deltaMode === 1 ? 0.05 : evt.deltaMode ? 1 : 0.002;
    const pinchFactor = evt.ctrlKey ? 10 : 1;
    const delta = -evt.deltaY * modeFactor * pinchFactor;

    const newZoom = Math.min(
      Math.max(ZOOM_CONFIG.MIN_ZOOM, this._zoom * 2 ** delta),
      ZOOM_CONFIG.MAX_ZOOM,
    );

    if (newZoom !== this._zoom) {
      const stage = this.stage;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Convert pointer to world position at current zoom
      const worldX = (pointer.x - this.pan.x) / this._zoom;
      const worldY = (pointer.y - this.pan.y) / this._zoom;

      this._zoom = newZoom;
      this.pan = {
        x: pointer.x - worldX * newZoom,
        y: pointer.y - worldY * newZoom,
      };

      // Update stage transform
      stage.scale({ x: newZoom, y: newZoom });
      stage.position(this.pan);

      this.callbacks.onZoomChange(newZoom);

      // Synchronous render for zero-latency zoom — draw each layer individually
      this.clusterLayer.draw();
      this.edgeLayer.draw();
      this.nodeLayer.draw();
      this.tooltipLayer.draw();
    }
  }

  private handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>): void {
    // Only handle clicks on empty stage space (not on shapes)
    if (e.target !== this.stage) return;

    this.isPanning = true;
    this.hasMoved = false;
    this.clickedEmptySpace = true;
    this.lastMousePos = { x: e.evt.clientX, y: e.evt.clientY };
  }

  private handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (this.draggedClusterId && this.config) {
      this.handleDragCluster();
    } else if (this.draggedNodeId && this.config) {
      this.handleDragNode();
    } else if (this.isPanning) {
      this.handlePan(e.evt);
    } else if (e.target === this.stage) {
      this.clearHoverStates();
    }
  }

  private handleDragCluster(): void {
    if (!this.config || !this.draggedClusterId) return;
    this.hasMoved = true;
    const pointer = this.stage.getPointerPosition();
    if (!pointer) return;
    const worldPos = this.screenToWorldPos(pointer.x, pointer.y);
    this.config.manualClusterPositions.set(this.draggedClusterId, worldPos);
    this.callbacks.onInvalidateEdgePathCache();
    this.callbacks.onRenderRequest();
  }

  private handleDragNode(): void {
    if (!this.config || !this.draggedNodeId) return;
    this.hasMoved = true;
    const pointer = this.stage.getPointerPosition();
    if (!pointer) return;
    const worldPos = this.screenToWorldPos(pointer.x, pointer.y);

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
    this.stage.position(this.pan);

    // Immediate draw for zero-latency pan response.
    // Shapes are already positioned in world-space; only the stage
    // transform changed. A deferred full render updates viewport culling.
    this.clusterLayer.draw();
    this.edgeLayer.draw();
    this.nodeLayer.draw();
    this.tooltipLayer.draw();
    this.callbacks.onRenderRequest();
  }

  private clearHoverStates(): void {
    if (this.currentHoveredNode) {
      this.currentHoveredNode = null;
      this.callbacks.onNodeHover(null);
      this.callbacks.onRenderRequest();
    }
    if (this.currentHoveredCluster) {
      this.currentHoveredCluster = null;
      this.callbacks.onClusterHover(null);
      this.callbacks.onRenderRequest();
    }
  }

  private handleMouseUp(): void {
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
  }

  private handleMouseLeave(): void {
    this.handleMouseUp();
    if (this.currentHoveredNode) {
      this.currentHoveredNode = null;
      this.callbacks.onNodeHover(null);
    }
    if (this.currentHoveredCluster) {
      this.currentHoveredCluster = null;
      this.callbacks.onClusterHover(null);
    }
  }

  // -------------------------------------------------------------------
  // Viewport Helpers
  // -------------------------------------------------------------------

  private computeViewportBounds(config: SceneConfig): ViewportBounds {
    const width = this.stage.width();
    const height = this.stage.height();
    // Scale margin inversely with zoom so nodes don't pop in/out at viewport edges
    // when zoomed out. At zoom=1 the margin is 200; at zoom=0.1 it's 2000.
    const margin = Math.max(200, 200 / config.zoom);
    return calculateViewportBounds(width, height, this.pan.x, this.pan.y, config.zoom, margin);
  }
}
