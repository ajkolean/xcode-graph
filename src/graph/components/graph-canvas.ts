import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { TransitiveResult } from '@graph/utils';
import { getConnectedNodes } from '@graph/utils/connections';
import { ViewMode } from '@shared/schemas';
import type { Cluster } from '@shared/schemas/cluster.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import { layoutDimension, setBaseZoom } from '@shared/signals/index';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { getNodeIconPath3D } from '@ui/utils/node-icons-3d';
import { generateBezierPath, generatePortRoutedPath } from '@ui/utils/paths';
import { getNodeSize } from '@ui/utils/sizing';
import {
  calculateViewportBounds,
  isCircleInViewport,
  isLineInViewport,
  type ViewportBounds,
} from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { ZOOM_CONFIG } from '@ui/utils/zoom-constants';
import { css, html, LitElement, type PropertyValues } from 'lit';
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

  // 3D Camera Rotation State (for Cmd+drag rotation in 3D mode)
  private cameraRotation = { pitch: 0, yaw: 0 }; // pitch = up/down (radians), yaw = left/right (radians)
  private isRotating = false; // true when Cmd+dragging to rotate
  private rotationStartPos = { x: 0, y: 0 }; // Mouse position when rotation started
  private rotationStartAngles = { pitch: 0, yaw: 0 }; // Angles when rotation started

  // Hover State
  private hoveredCluster: string | null = null;

  // Animation State
  private animationFrameId: number | null = null;
  private time = 0;
  private didInitialFit = false;

  // Starfield
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
    this.zoom = 1;
    this.enableAnimation = false;
    this.pan = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  // ========================================
  // Styles
  // ========================================

  static override styles = css`
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

    /* Rotation cursor when Cmd is held in 3D mode */
    :host([rotating]) canvas {
      cursor: move;
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  override firstUpdated() {
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

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.handleResize);
    this.stopRenderLoop();
  }

  override willUpdate(changedProps: PropertyValues<this>) {
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      this.layout.enableAnimation = this.enableAnimation;
      // ELK layout is asynchronous
      this.layout.computeLayout(this.nodes, this.edges).catch((err) => {
        console.error('Layout computation failed', err);
      });
      this.manualNodePositions.clear();
      this.manualClusterPositions.clear(); // Clear manual cluster positions on new data
      this.updatePathCache();
      this.didInitialFit = false; // Reset fit flag when data changes
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

  override updated(changedProps: PropertyValues<this>) {
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
    const dimension = layoutDimension.get();
    const key = `${node.type}-${node.platform}-${dimension}`;
    if (!this.pathCache.has(key)) {
      const pathString =
        dimension === '3d'
          ? getNodeIconPath3D(node.type, node.platform)
          : getNodeIconPath(node.type, node.platform);
      this.pathCache.set(key, new Path2D(pathString));
    }
    return this.pathCache.get(key)!;
  }

  private centerGraph() {
    const rect = this.getBoundingClientRect();
    this.pan = { x: rect.width / 2, y: rect.height / 2 };
  }

  /**
   * Force recompute the layout (e.g., when dimension changes)
   */
  recomputeLayout() {
    if (this.nodes.length === 0) return;
    this.layout.enableAnimation = this.enableAnimation;
    this.layout.computeLayout(this.nodes, this.edges).catch(console.error);
    this.manualNodePositions.clear();
    this.manualClusterPositions.clear();
    this.updatePathCache();
  }

  /**
   * Fit graph into viewport: compute bounding box of all clusters and adjust pan/zoom.
   */
  fitToViewport() {
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

    // Regenerate starfield for new canvas size
    this.starfield.generate(rect.width, rect.height);

    this.renderCanvas();
  }

  private handleCanvasMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.hasMoved = false;
    this.lastMousePos = { x: e.clientX, y: e.clientY };

    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);

    // Check for Cmd+drag to start 3D rotation (in 3D mode only, without shift)
    const is3D = layoutDimension.get() === '3d';
    if (is3D && e.metaKey && !e.shiftKey) {
      this.isRotating = true;
      this.isDragging = false;
      this.rotationStartPos = { x: e.clientX, y: e.clientY };
      this.rotationStartAngles = { ...this.cameraRotation };
      this.setAttribute('rotating', '');
      return;
    }

    // Check clusters first (if holding shift/cmd, allow cluster drag)
    if (e.shiftKey || e.metaKey) {
      for (const cluster of this.layout.clusters) {
        const layoutPos = this.layout.clusterPositions.get(cluster.id);
        if (!layoutPos) continue;

        const manualPos = this.manualClusterPositions.get(cluster.id);
        const cx = manualPos?.x ?? layoutPos.x;
        const cy = manualPos?.y ?? layoutPos.y;
        const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

        // Circular hit test
        const dx = worldPos.x - cx;
        const dy = worldPos.y - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          this.draggedClusterId = cluster.id;
          this.dispatchEvent(
            new CustomEvent('cluster-select', {
              detail: { clusterId: cluster.id },
              bubbles: true,
              composed: true,
            }),
          );
          this.isDragging = false;
          return;
        }
      }
    }

    // Check nodes
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const layoutPos = this.layout.nodePositions.get(node.id);
      const clusterPos = this.layout.clusterPositions.get(node.project || 'External');

      if (layoutPos && clusterPos) {
        const manualClusterPos = this.manualClusterPositions.get(node.project || 'External');
        const clusterX = manualClusterPos?.x ?? clusterPos.x;
        const clusterY = manualClusterPos?.y ?? clusterPos.y;

        const manualPos = this.manualNodePositions.get(node.id);
        const wx = clusterX + (manualPos?.x ?? layoutPos.x);
        const wy = clusterY + (manualPos?.y ?? layoutPos.y);
        const size = getNodeSize(node, this.edges);

        const dx = worldPos.x - wx;
        const dy = worldPos.y - wy;

        if (dx * dx + dy * dy <= size * size) {
          this.draggedNodeId = node.id;
          this.dispatchEvent(
            new CustomEvent('node-select', { detail: { node }, bubbles: true, composed: true }),
          );
          this.isDragging = false; // Don't pan if dragging node
          return;
        }
      }
    }

    // Check clusters (for selection without dragging)
    for (const cluster of this.layout.clusters) {
      const layoutPos = this.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      const manualPos = this.manualClusterPositions.get(cluster.id);
      const cx = manualPos?.x ?? layoutPos.x;
      const cy = manualPos?.y ?? layoutPos.y;
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      // Circular hit test
      const dx = worldPos.x - cx;
      const dy = worldPos.y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        this.dispatchEvent(
          new CustomEvent('cluster-select', {
            detail: { clusterId: cluster.id },
            bubbles: true,
            composed: true,
          }),
        );
        return;
      }
    }

    this.dispatchEvent(
      new CustomEvent('node-select', { detail: { node: null }, bubbles: true, composed: true }),
    );
    this.dispatchEvent(
      new CustomEvent('cluster-select', {
        detail: { clusterId: null },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleCanvasMouseMove = (e: MouseEvent) => {
    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);

    // Handle 3D camera rotation with Cmd+drag
    if (this.isRotating) {
      const dx = e.clientX - this.rotationStartPos.x;
      const dy = e.clientY - this.rotationStartPos.y;

      // Sensitivity: how much rotation per pixel of mouse movement
      const sensitivity = 0.005;

      // Yaw changes with horizontal mouse movement
      // Pitch changes with vertical mouse movement
      this.cameraRotation = {
        yaw: this.rotationStartAngles.yaw + dx * sensitivity,
        pitch: Math.max(
          -Math.PI / 3, // Limit pitch to ±60°
          Math.min(Math.PI / 3, this.rotationStartAngles.pitch + dy * sensitivity),
        ),
      };
      this.hasMoved = true;
      return;
    }

    if (this.draggedClusterId) {
      // Dragging entire cluster
      this.hasMoved = true;
      this.manualClusterPositions.set(this.draggedClusterId, {
        x: worldPos.x,
        y: worldPos.y,
      });
    } else if (this.draggedNodeId) {
      // Dragging individual node
      this.hasMoved = true;
      const node = this.nodes.find((n) => n.id === this.draggedNodeId);
      if (node) {
        const layoutClusterPos = this.layout.clusterPositions.get(node.project || 'External');
        if (layoutClusterPos) {
          const manualClusterPos = this.manualClusterPositions.get(node.project || 'External');
          const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
          const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;

          this.manualNodePositions.set(node.id, {
            x: worldPos.x - clusterX,
            y: worldPos.y - clusterY,
          });
        }
      }
    } else if (this.isDragging) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.pan = { x: this.pan.x + dx, y: this.pan.y + dy };
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      this.hasMoved = true;
    } else {
      let hitNodeId: string | null = null;
      let hitClusterId: string | null = null;
      let hitNodeCluster: string | null = null;

      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const node = this.nodes[i];
        const layoutPos = this.layout.nodePositions.get(node.id);
        const clusterPos = this.layout.clusterPositions.get(node.project || 'External');

        if (layoutPos && clusterPos) {
          const manualPos = this.manualNodePositions.get(node.id);
          const wx = clusterPos.x + (manualPos?.x ?? layoutPos.x);
          const wy = clusterPos.y + (manualPos?.y ?? layoutPos.y);
          const size = getNodeSize(node, this.edges);

          if ((worldPos.x - wx) ** 2 + (worldPos.y - wy) ** 2 <= size ** 2) {
            hitNodeId = node.id;
            hitNodeCluster = node.project || 'External';
            break;
          }
        }
      }

      if (hitNodeId !== this.hoveredNode) {
        this.hoveredNode = hitNodeId;
        this.dispatchEvent(
          new CustomEvent('node-hover', {
            detail: { nodeId: hitNodeId },
            bubbles: true,
            composed: true,
          }),
        );
      }

      if (hitNodeCluster) {
        hitClusterId = hitNodeCluster;
      } else {
        for (const cluster of this.layout.clusters) {
          const pos = this.layout.clusterPositions.get(cluster.id);
          if (!pos) continue;

          const radius = Math.max(pos.width, pos.height) / 2;

          // Circular hit test
          const dx = worldPos.x - pos.x;
          const dy = worldPos.y - pos.y;
          if (dx * dx + dy * dy <= radius * radius) {
            hitClusterId = cluster.id;
            break;
          }
        }
      }

      if (hitClusterId !== this.hoveredCluster) {
        this.hoveredCluster = hitClusterId;
        this.dispatchEvent(
          new CustomEvent('cluster-hover', {
            detail: { clusterId: hitClusterId },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  };

  private handleCanvasMouseUp = (e?: MouseEvent) => {
    this.isDragging = false;
    if (this.isRotating) {
      this.isRotating = false;
      this.removeAttribute('rotating');
    }
    this.draggedNodeId = null;
    this.draggedClusterId = null;
    setTimeout(() => {
      this.hasMoved = false;
    }, 0);

    // Only clear hover state when leaving the canvas
    if (e?.type === 'mouseleave') {
      if (this.hoveredNode) {
        this.hoveredNode = null;
        this.dispatchEvent(
          new CustomEvent('node-hover', {
            detail: { nodeId: null },
            bubbles: true,
            composed: true,
          }),
        );
      }
      if (this.hoveredCluster) {
        this.hoveredCluster = null;
        this.dispatchEvent(
          new CustomEvent('cluster-hover', {
            detail: { clusterId: null },
            bubbles: true,
            composed: true,
          }),
        );
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

    // Render starfield first (behind everything, in screen space)
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
    const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
    if (!layoutPos || !clusterPos) return;

    const manualPos = this.manualNodePositions.get(node.id);
    const worldX = clusterPos.x + (manualPos?.x ?? layoutPos.x);
    const worldY = clusterPos.y + (manualPos?.y ?? layoutPos.y);
    const size = getNodeSize(node, this.edges);

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
    this.ctx.fillStyle = 'rgba(30, 30, 35, 0.95)';
    this.ctx.strokeStyle = adjustColorForZoom(getNodeTypeColor(node.type), this.zoom);
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

  private renderClusters(viewport: ViewportBounds) {
    const activeClusterId = this.selectedCluster || this.hoveredCluster;
    const is3D = layoutDimension.get() === '3d';

    // Build projected cluster positions for sorting and rendering
    const projectedClusters: Array<{
      cluster: Cluster;
      cx: number;
      cy: number;
      cz: number;
      radius: number;
    }> = [];

    for (const cluster of this.layout.clusters) {
      const layoutPos = this.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      // Use manual position if cluster was dragged
      const manualPos = this.manualClusterPositions.get(cluster.id);
      const worldX = manualPos?.x ?? layoutPos.x;
      const worldY = manualPos?.y ?? layoutPos.y;
      const worldZ = layoutPos.z ?? 0;

      // Apply 3D camera rotation
      const projected = this.project3D(worldX, worldY, worldZ);

      // Use circular clusters - radius is half of the larger dimension
      const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

      projectedClusters.push({
        cluster,
        cx: projected.x,
        cy: projected.y,
        cz: projected.z,
        radius,
      });
    }

    // In 3D mode, sort clusters by projected z (furthest first for painter's algorithm)
    if (is3D) {
      projectedClusters.sort((a, b) => a.cz - b.cz);
    }

    for (const { cluster, cx, cy, cz, radius } of projectedClusters) {
      const layoutPos = this.layout.clusterPositions.get(cluster.id);
      if (!layoutPos) continue;

      // 3D depth effects for clusters: scale and opacity based on projected z
      const depthScale = is3D ? Math.max(0.6, 1 + cz / 400) : 1;
      const depthOpacity = is3D ? Math.max(0.5, Math.min(1, 0.6 + (cz + 200) / 400)) : 1;
      const scaledRadius = radius * depthScale;

      // Viewport culling with circular bounds
      if (
        cx + scaledRadius < viewport.minX ||
        cx - scaledRadius > viewport.maxX ||
        cy + scaledRadius < viewport.minY ||
        cy - scaledRadius > viewport.maxY
      ) {
        continue;
      }

      const clusterColor = generateColor(cluster.name, cluster.type);
      const isHighlighted = this.hoveredCluster === cluster.id;
      const isSelected = this.selectedCluster === cluster.id;
      const isActive = isHighlighted || isSelected;
      const borderOpacity = adjustOpacityForZoom(0.5, this.zoom);

      const shouldDim = activeClusterId && activeClusterId !== cluster.id;

      this.ctx.globalAlpha = (shouldDim ? 0.3 : 1.0) * depthOpacity;

      // Draw cluster fill - 3D sphere or 2D circle
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, scaledRadius, 0, Math.PI * 2);

      if (is3D) {
        // 3D sphere with radial gradient for depth effect
        const gradient = this.ctx.createRadialGradient(
          cx - scaledRadius * 0.3, // Highlight offset to upper-left
          cy - scaledRadius * 0.3,
          scaledRadius * 0.1,
          cx,
          cy,
          scaledRadius,
        );
        // Parse cluster color and create gradient stops
        gradient.addColorStop(0, `color-mix(in srgb, ${clusterColor} 25%, white)`);
        gradient.addColorStop(0.4, `color-mix(in srgb, ${clusterColor} 15%, transparent)`);
        gradient.addColorStop(0.8, `color-mix(in srgb, ${clusterColor} 10%, transparent)`);
        gradient.addColorStop(1, `color-mix(in srgb, ${clusterColor} 5%, transparent)`);
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = (isActive ? 0.4 : 0.3) * depthOpacity;
      } else {
        this.ctx.fillStyle = clusterColor;
        this.ctx.globalAlpha = isActive ? 0.05 : 0.08;
      }
      this.ctx.fill();

      this.ctx.globalAlpha = (shouldDim ? 0.3 : 1.0) * depthOpacity;

      // Draw cluster border
      this.ctx.lineWidth = isActive ? 2.5 : 2;
      this.ctx.strokeStyle = clusterColor;
      this.ctx.globalAlpha =
        (isActive ? 0.9 : borderOpacity) * (shouldDim ? 0.3 : 1.0) * depthOpacity;

      if (is3D) {
        // 3D mode: solid border for sphere look
        this.ctx.setLineDash([]);
      } else if (cluster.type === 'project') {
        this.ctx.setLineDash([8, 8]);
      } else {
        this.ctx.setLineDash([3, 8]);
      }

      if (isSelected) {
        this.ctx.lineDashOffset = -this.time / 50;
      }

      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.lineDashOffset = 0;

      // In 3D mode, add a subtle inner highlight arc for sphere effect
      if (is3D) {
        this.ctx.beginPath();
        this.ctx.arc(
          cx - scaledRadius * 0.2,
          cy - scaledRadius * 0.2,
          scaledRadius * 0.6,
          Math.PI * 1.2,
          Math.PI * 1.8,
        );
        this.ctx.strokeStyle = `color-mix(in srgb, ${clusterColor} 40%, white)`;
        this.ctx.lineWidth = 1.5;
        this.ctx.globalAlpha = 0.3 * (shouldDim ? 0.3 : 1.0) * depthOpacity;
        this.ctx.stroke();
      }

      // Draw label at top of circle/sphere
      this.ctx.globalAlpha = (isActive ? 1 : 0.7) * (shouldDim ? 0.3 : 1.0) * depthOpacity;
      this.ctx.fillStyle = clusterColor;
      this.ctx.font = `${isActive ? 600 : 500} 13px var(--fonts-body, sans-serif)`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(cluster.name, cx, cy - scaledRadius - 12);

      // Draw node count below cluster name
      this.ctx.font = `${isActive ? 500 : 400} 11px var(--fonts-body, sans-serif)`;
      this.ctx.globalAlpha = (isActive ? 0.8 : 0.5) * (shouldDim ? 0.3 : 1.0) * depthOpacity;
      this.ctx.fillText(`${cluster.nodes.length} targets`, cx, cy - scaledRadius + 4);

      this.ctx.globalAlpha = 1.0;
    }
  }

  private renderNodes(viewport: ViewportBounds) {
    const connectedNodes = this.selectedNode
      ? getConnectedNodes(this.selectedNode.id, this.edges)
      : new Set<string>();
    const is3D = layoutDimension.get() === '3d';

    // Build projected positions for all nodes (needed for sorting by projected z)
    const projectedNodes: Array<{
      node: GraphNode;
      x: number;
      y: number;
      z: number;
      clusterId: string;
    }> = [];

    for (const node of this.nodes) {
      const layoutPos = this.layout.nodePositions.get(node.id);
      const layoutClusterPos = this.layout.clusterPositions.get(node.project || 'External');
      if (!layoutPos || !layoutClusterPos) continue;

      const clusterId = node.project || 'External';
      const manualClusterPos = this.manualClusterPositions.get(clusterId);
      const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
      const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;
      const clusterZ = layoutClusterPos.z ?? 0;

      const manualPos = this.manualNodePositions.get(node.id);
      const relX = manualPos?.x ?? layoutPos.x;
      const relY = manualPos?.y ?? layoutPos.y;
      const relZ = layoutPos.z ?? 0;

      // World position (before camera rotation)
      const worldX = clusterX + relX;
      const worldY = clusterY + relY;
      const worldZ = clusterZ + relZ;

      // Apply 3D camera rotation
      const projected = this.project3D(worldX, worldY, worldZ);
      projectedNodes.push({
        node,
        x: projected.x,
        y: projected.y,
        z: projected.z,
        clusterId,
      });
    }

    // In 3D mode, sort nodes by projected z so that nodes with higher z (closer) render on top
    if (is3D) {
      projectedNodes.sort((a, b) => a.z - b.z);
    }

    for (const { node, x, y, z: projectedZ, clusterId } of projectedNodes) {
      const layoutPos = this.layout.nodePositions.get(node.id);
      const layoutClusterPos = this.layout.clusterPositions.get(clusterId);
      if (!layoutPos || !layoutClusterPos) continue;

      // 3D depth effects: use projected z for depth
      // z typically ranges from -150 to +150 after rotation, map to noticeable depth effects
      // Scale: further away → smaller, closer → larger
      const depthScale = is3D ? Math.max(0.5, 1 + projectedZ / 250) : 1;
      // Opacity: nodes further from camera (low z) fade more
      const depthOpacity = is3D ? Math.max(0.4, Math.min(1, 0.5 + (projectedZ + 150) / 300)) : 1;

      const size = getNodeSize(node, this.edges) * depthScale;
      if (!isCircleInViewport({ x, y }, size, viewport)) continue;
      const color = getNodeTypeColor(node.type);
      const adjustedColor = adjustColorForZoom(color, this.zoom);

      const isHovered = this.hoveredNode === node.id;
      const isSelected = this.selectedNode?.id === node.id;

      const isConnected = this.selectedNode && connectedNodes.has(node.id);
      const isSearchMatch =
        this.searchQuery && node.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const clusterDim =
        (this.hoveredCluster && clusterId !== this.hoveredCluster) ||
        (this.selectedCluster && clusterId !== this.selectedCluster);

      const matchesPreview =
        !this.previewFilter ||
        (this.previewFilter.type === 'nodeType' && node.type === this.previewFilter.value) ||
        (this.previewFilter.type === 'platform' && node.platform === this.previewFilter.value) ||
        (this.previewFilter.type === 'origin' && node.origin === this.previewFilter.value) ||
        (this.previewFilter.type === 'project' && node.project === this.previewFilter.value) ||
        (this.previewFilter.type === 'package' &&
          node.type === 'package' &&
          node.name === this.previewFilter.value);

      const isDimmed =
        (this.searchQuery && !isSearchMatch) ||
        (this.selectedNode && !isSelected && !isConnected) ||
        (this.previewFilter && !matchesPreview) ||
        clusterDim;

      this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * depthOpacity;

      // Cycle node glow effect (Phase 6: cycle highlighting)
      const isCycleNode = this.layout.cycleNodes?.has(node.id) ?? false;
      if (isCycleNode && !isDimmed) {
        const pulse = (Math.sin(this.time / 300) + 1) / 2;
        const glowRadius = size + 6 + pulse * 3;

        this.ctx.beginPath();
        this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 100, 50, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = (0.4 + pulse * 0.3) * depthOpacity;
        this.ctx.stroke();
        this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * depthOpacity;
      }

      if (isSelected) {
        const pulse = (Math.sin(this.time / 200) + 1) / 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size + 8 + pulse * 4, 0, Math.PI * 2);
        this.ctx.strokeStyle = adjustedColor;
        this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * depthOpacity * 0.3 * (1 - pulse);
        this.ctx.stroke();
        this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * depthOpacity;
      }

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

      this.ctx.fillStyle = 'rgba(30, 30, 35, 0.95)';
      this.ctx.fill(path);

      this.ctx.strokeStyle = adjustedColor;
      this.ctx.lineWidth = (isSelected ? 2.5 : 2) / scale;
      this.ctx.stroke(path);

      this.ctx.scale(1 / scale, 1 / scale);
      this.ctx.translate(-x, -y);

      this.ctx.shadowBlur = 0;

      if (this.zoom >= 0.5 || isHovered || isSelected) {
        const labelText =
          node.name.length > 20 && !isHovered ? `${node.name.substring(0, 20)}...` : node.name;

        this.ctx.font = `${isSelected ? '600' : '400'} 12px var(--fonts-body, sans-serif)`;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = adjustedColor;

        this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * depthOpacity * 0.9;
        this.ctx.shadowColor = 'rgba(30, 30, 35, 0.9)';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(labelText, x, y + size + 22);

        this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * depthOpacity;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText(labelText, x, y + size + 22);
      }
    }
    this.ctx.globalAlpha = 1.0;
  }

  private getEdgeOpacity(edge: GraphEdge): number {
    const edgeKey = `${edge.source}->${edge.target}`;
    const transitiveDeps = this.transitiveDeps;
    const transitiveDependents = this.transitiveDependents;

    const inDepsChain = transitiveDeps?.edges.has(edgeKey);
    const inDependentsChain = transitiveDependents?.edges.has(edgeKey);

    if (this.viewMode === 'focused' && inDepsChain && transitiveDeps) {
      const depth = transitiveDeps.edgeDepths.get(edgeKey) || 0;
      const maxDepth = transitiveDeps.maxDepth || 1;
      return 1 - (depth / maxDepth) * 0.7;
    }

    if (
      (this.viewMode === 'dependents' || this.viewMode === 'impact') &&
      inDependentsChain &&
      transitiveDependents
    ) {
      const depth = transitiveDependents.edgeDepths.get(edgeKey) || 0;
      const maxDepth = transitiveDependents.maxDepth || 1;
      return 1 - (depth / maxDepth) * 0.7;
    }

    if (this.viewMode === 'both' && (inDepsChain || inDependentsChain)) {
      if (inDepsChain && transitiveDeps) {
        const depth = transitiveDeps.edgeDepths.get(edgeKey) || 0;
        const maxDepth = transitiveDeps.maxDepth || 1;
        return 1 - (depth / maxDepth) * 0.7;
      }
      if (inDependentsChain && transitiveDependents) {
        const depth = transitiveDependents.edgeDepths.get(edgeKey) || 0;
        const maxDepth = transitiveDependents.maxDepth || 1;
        return 1 - (depth / maxDepth) * 0.7;
      }
    }

    return 1;
  }

  private renderEdges(viewport: ViewportBounds) {
    const selectedNodeId = this.selectedNode?.id;

    // Build routed edge lookup map for cross-cluster edges
    const routedEdgeMap = new Map<string, RoutedEdge>();
    if (this.layout.routedEdges) {
      for (const re of this.layout.routedEdges) {
        routedEdgeMap.set(`${re.sourceNodeId}->${re.targetNodeId}`, re);
      }
    }

    this.ctx.lineWidth = 1;

    for (const edge of this.edges) {
      const isConnectedToSelected =
        edge.source === selectedNodeId || edge.target === selectedNodeId;
      this.renderSingleNodeEdge(edge, viewport, isConnectedToSelected, routedEdgeMap);
    }
  }

  private renderSingleNodeEdge(
    edge: GraphEdge,
    viewport: ViewportBounds,
    isHighlighted: boolean,
    routedEdgeMap?: Map<string, RoutedEdge>,
  ) {
    const sourceNode = this.nodes.find((n) => n.id === edge.source);
    const targetNode = this.nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceLayout = this.layout.nodePositions.get(edge.source);
    const targetLayout = this.layout.nodePositions.get(edge.target);
    if (!sourceLayout || !targetLayout) return;

    const sClusterLayout = this.layout.clusterPositions.get(sourceNode.project || 'External');
    const tClusterLayout = this.layout.clusterPositions.get(targetNode.project || 'External');
    if (!sClusterLayout || !tClusterLayout) return;

    const sourceClusterId = sourceNode.project || 'External';
    const targetClusterId = targetNode.project || 'External';

    // LOD: Hide intra-cluster edges when zoomed out (unless hovering that cluster or explicitly highlighted)
    if (
      sourceClusterId === targetClusterId &&
      this.zoom < 0.6 &&
      this.hoveredCluster !== sourceClusterId &&
      !isHighlighted
    ) {
      return;
    }

    // Use manual cluster positions if clusters were dragged
    const sClusterManual = this.manualClusterPositions.get(sourceClusterId);
    const tClusterManual = this.manualClusterPositions.get(targetClusterId);

    const sClusterX = sClusterManual?.x ?? sClusterLayout.x;
    const sClusterY = sClusterManual?.y ?? sClusterLayout.y;
    const sClusterZ = sClusterLayout.z ?? 0;
    const tClusterX = tClusterManual?.x ?? tClusterLayout.x;
    const tClusterY = tClusterManual?.y ?? tClusterLayout.y;
    const tClusterZ = tClusterLayout.z ?? 0;

    const sManual = this.manualNodePositions.get(edge.source);
    const tManual = this.manualNodePositions.get(edge.target);

    // Compute world positions including z
    const worldX1 = sClusterX + (sManual?.x ?? sourceLayout.x);
    const worldY1 = sClusterY + (sManual?.y ?? sourceLayout.y);
    const worldZ1 = sClusterZ + (sourceLayout.z ?? 0);
    const worldX2 = tClusterX + (tManual?.x ?? targetLayout.x);
    const worldY2 = tClusterY + (tManual?.y ?? targetLayout.y);
    const worldZ2 = tClusterZ + (targetLayout.z ?? 0);

    // Apply 3D camera rotation
    const p1 = this.project3D(worldX1, worldY1, worldZ1);
    const p2 = this.project3D(worldX2, worldY2, worldZ2);
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    if (!isLineInViewport({ x: x1, y: y1 }, { x: x2, y: y2 }, viewport)) return;

    // Cycle edge detection
    const sourceScc = this.layout.nodeSccId?.get(edge.source);
    const targetScc = this.layout.nodeSccId?.get(edge.target);
    const isCycleEdge =
      sourceScc !== undefined &&
      targetScc !== undefined &&
      sourceScc === targetScc &&
      (this.layout.sccSizes?.get(sourceScc) ?? 0) > 1;

    let color = getNodeTypeColor(targetNode.type);

    // Bypass adjustColorForZoom if highlighted to ensure visibility
    if (!isHighlighted) {
      color = adjustColorForZoom(color, this.zoom);
    }

    if (isCycleEdge) {
      color = 'rgba(255, 100, 50, 0.8)';
    }
    this.ctx.strokeStyle = color;

    let opacity = isHighlighted ? 1.0 : 0.1;

    if (isCycleEdge) {
      opacity = Math.max(opacity, 0.8);
    }

    opacity *= this.getEdgeOpacity(edge);

    this.ctx.globalAlpha = Math.min(1, opacity);

    // Scale line width by inverse zoom to maintain screen pixel width
    const baseWidth = isHighlighted ? 2.5 : isCycleEdge ? 2 : 1;
    this.ctx.lineWidth = baseWidth / this.zoom;

    const isCrossCluster = sourceClusterId !== targetClusterId;
    const dashPattern = isCycleEdge ? [4, 4] : isCrossCluster ? [10, 5] : [4, 2];
    this.ctx.setLineDash(dashPattern);
    this.ctx.lineDashOffset = isHighlighted ? -this.time / 20 : 0;

    // Check for port-routed path for cross-cluster edges
    const edgeKey = `${edge.source}->${edge.target}`;
    const routedEdge = isCrossCluster ? routedEdgeMap?.get(edgeKey) : undefined;

    if (routedEdge && layoutDimension.get() === '2d') {
      // Use opaque color instead of alpha to prevent stacking
      // (multiple edges share the same port-to-port highway, causing overlap)
      // Use a gray that looks like white at the target opacity on black background
      const baseOpacity = isHighlighted ? 0.5 : 0.15;
      const targetOpacity = adjustOpacityForZoom(baseOpacity, this.zoom);
      const gray = Math.round(255 * targetOpacity);
      this.ctx.strokeStyle = `rgb(${gray}, ${gray}, ${gray})`;
      this.ctx.globalAlpha = 1.0;

      // Use port-routed path for cross-cluster edges (2D only for now)
      const pathString = generatePortRoutedPath(
        { x: sourceLayout.x, y: sourceLayout.y },
        { x: routedEdge.sourcePort.x, y: routedEdge.sourcePort.y },
        { x: routedEdge.targetPort.x, y: routedEdge.targetPort.y },
        { x: targetLayout.x, y: targetLayout.y },
        routedEdge.waypoints,
        { x: sClusterX, y: sClusterY },
        { x: tClusterX, y: tClusterY },
      );
      const path = new Path2D(pathString);
      this.ctx.stroke(path);
    } else if (!isCrossCluster) {
      // Only render intra-cluster edges with direct bezier
      // Skip cross-cluster edges without routing data (they'll be shown via port routing)
      // Fall back to direct bezier
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const useBezier = distance > 150;

      if (useBezier) {
        const pathString = generateBezierPath(x1, y1, x2, y2);
        const path = new Path2D(pathString);
        this.ctx.stroke(path);
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
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

  /**
   * Apply 3D camera rotation to a point.
   * Uses simple rotation matrices for pitch (X-axis) and yaw (Y-axis).
   * Returns the projected 2D coordinates and the projected z for depth sorting.
   */
  private project3D(x: number, y: number, z: number): { x: number; y: number; z: number } {
    const is3D = layoutDimension.get() === '3d';
    if (!is3D || (this.cameraRotation.pitch === 0 && this.cameraRotation.yaw === 0)) {
      return { x, y, z };
    }

    const { pitch, yaw } = this.cameraRotation;
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);

    // First rotate around Y-axis (yaw) - horizontal rotation
    const x1 = x * cosYaw + z * sinYaw;
    const z1 = -x * sinYaw + z * cosYaw;
    const y1 = y;

    // Then rotate around X-axis (pitch) - vertical rotation
    const y2 = y1 * cosPitch - z1 * sinPitch;
    const z2 = y1 * sinPitch + z1 * cosPitch;
    const x2 = x1;

    return { x: x2, y: y2, z: z2 };
  }

  /**
   * Reset camera rotation to default (front view)
   */
  resetCameraRotation() {
    this.cameraRotation = { pitch: 0, yaw: 0 };
  }

  private handleCanvasDblClick = (e: MouseEvent) => {
    // Double-click with Cmd in 3D mode resets camera rotation
    const is3D = layoutDimension.get() === '3d';
    if (is3D && e.metaKey) {
      this.resetCameraRotation();
      e.preventDefault();
    }
  };

  override render() {
    return html`
      <canvas
        @mousedown=${this.handleCanvasMouseDown}
        @mousemove=${this.handleCanvasMouseMove}
        @mouseup=${this.handleCanvasMouseUp}
        @mouseleave=${this.handleCanvasMouseUp}
        @wheel=${this.handleCanvasWheel}
        @dblclick=${this.handleCanvasDblClick}
      ></canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'graph-canvas': GraphCanvas;
  }
}
