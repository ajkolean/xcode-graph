import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import { GraphInteractionFullController } from '@graph/controllers/graph-interaction-full.controller';
import type { TransitiveResult } from '@graph/utils';
import { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { generateColor } from '@ui/utils/color-generator';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';

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

  // Replaced external interaction controller with internal logic for native canvas feel
  private pan = { x: 0, y: 0 };
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };
  private pathCache = new Map<string, Path2D>();
  
  // Animation state
  private animationFrameId: number | null = null;
  private time = 0;

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
    this.pan = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // Center initially
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
  `;

  // ========================================
  // Lifecycle
  // ========================================

  override firstUpdated() {
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { alpha: true })!;
      this.resizeCanvas();
      window.addEventListener('resize', this.handleResize);
      this.centerGraph(); // Initial center
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
      this.layout.computeLayout(this.nodes, this.edges);
      // Pre-cache paths
      this.updatePathCache();
    }

    if (changedProps.has('enableAnimation')) {
      this.layout.enableAnimation = this.enableAnimation;
      if (!this.enableAnimation) {
        this.layout.stopAnimation();
      } else if (this.nodes.length > 0) {
        this.layout.computeLayout(this.nodes, this.edges);
      }
    }
  }

  private updatePathCache() {
      this.pathCache.clear();
      // We don't iterate all nodes, we iterate types/platforms found or just lazily?
      // Lazy is better, but pre-caching ensures no stutter.
      // Let's do lazy in renderNodes but cache the result.
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
      // Simple centering
      const rect = this.getBoundingClientRect();
      this.pan = { x: rect.width / 2, y: rect.height / 2 };
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
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  private handleCanvasMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    
    // Hit Test
    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);
    
    // Check nodes (reverse draw order)
    for (let i = this.nodes.length - 1; i >= 0; i--) {
        const node = this.nodes[i];
        const pos = this.layout.nodePositions.get(node.id);
        const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
        
        if (pos && clusterPos) {
             const wx = clusterPos.x + pos.x;
             const wy = clusterPos.y + pos.y;
             const size = getNodeSize(node, this.edges);
             
             const dx = worldPos.x - wx;
             const dy = worldPos.y - wy;
             
             if (dx * dx + dy * dy <= size * size) {
                 this.dispatchEvent(new CustomEvent('node-select', { detail: { node }, bubbles: true, composed: true }));
                 this.isDragging = false; // Don't pan if we clicked a node
                 return;
             }
        }
    }
    
    // If background click
    this.dispatchEvent(new CustomEvent('node-select', { detail: { node: null }, bubbles: true, composed: true }));
  }

  private handleCanvasMouseMove = (e: MouseEvent) => {
    if (this.isDragging) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.pan.x += dx;
        this.pan.y += dy;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
    } else {
        // Hover logic
        const { x, y } = this.getMousePos(e);
        const worldPos = this.screenToWorld(x, y);
        let hitNodeId: string | null = null;
        
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const pos = this.layout.nodePositions.get(node.id);
            const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
            
            if (pos && clusterPos) {
                 const wx = clusterPos.x + pos.x;
                 const wy = clusterPos.y + pos.y;
                 const size = getNodeSize(node, this.edges);
                 
                 if ((worldPos.x - wx) ** 2 + (worldPos.y - wy) ** 2 <= size ** 2) {
                     hitNodeId = node.id;
                     break;
                 }
            }
        }
        
        if (hitNodeId !== this.hoveredNode) {
            this.dispatchEvent(new CustomEvent('node-hover', { detail: { nodeId: hitNodeId }, bubbles: true, composed: true }));
        }
    }
  }

  private handleCanvasMouseUp = () => {
      this.isDragging = false;
  }

  private handleCanvasWheel = (e: WheelEvent) => {
    // Native-feel zoom: zoom towards mouse pointer
    e.preventDefault();
    
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(0.1, this.zoom + delta), 5); // Clamp zoom
    
    if (newZoom !== this.zoom) {
        // Zoom towards pointer
        const { x, y } = this.getMousePos(e);
        const worldPos = this.screenToWorld(x, y);
        
        this.zoom = newZoom;
        
        // Adjust pan to keep worldPos under mouse
        this.pan.x = x - worldPos.x * this.zoom;
        this.pan.y = y - worldPos.y * this.zoom;
        
        this.dispatchEvent(new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }));
    }
  }

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
      this.ctx.save();
      this.ctx.translate(this.pan.x, this.pan.y);
      this.ctx.scale(this.zoom, this.zoom);

      this.renderClusters();
      this.renderEdges();
      this.renderNodes();

      this.ctx.restore();
  }

  private renderClusters() {
      for (const cluster of this.layout.clusters) {
          const pos = this.layout.clusterPositions.get(cluster.id);
          if (!pos) continue;

          const x = pos.x - pos.width / 2;
          const y = pos.y - pos.height / 2;
          const width = pos.width;
          const height = pos.height;

          const clusterColor = generateColor(cluster.name, cluster.type);
          const isSelected = this.selectedCluster === cluster.id;
          
          this.ctx.beginPath();
          this.ctx.roundRect(x, y, width, height, 8);
          this.ctx.fillStyle = clusterColor;
          this.ctx.globalAlpha = isSelected ? 0.05 : 0.02;
          this.ctx.fill();
          
          this.ctx.lineWidth = 3.5;
          this.ctx.strokeStyle = clusterColor;
          this.ctx.globalAlpha = isSelected ? 0.9 : 0.5; // adjustOpacityForZoom(0.5, this.zoom);
          
          if (cluster.type === 'project') {
              this.ctx.setLineDash([8, 8]);
          } else {
              this.ctx.setLineDash([3, 8]);
          }
          
          // Animate marching ants selection
          if (isSelected) {
              this.ctx.lineDashOffset = -this.time / 50; 
          }
          
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          this.ctx.lineDashOffset = 0;
          this.ctx.globalAlpha = 1.0;

          // Label
          this.ctx.fillStyle = clusterColor;
          this.ctx.globalAlpha = isSelected ? 1 : 0.6;
          this.ctx.font = `${isSelected ? 600 : 500} 14px var(--fonts-body, sans-serif)`;
          this.ctx.textAlign = 'left';
          this.ctx.fillText(cluster.name, x + 12, y + 20);
          
          this.ctx.textAlign = 'right';
          this.ctx.font = `${isSelected ? 600 : 500} 12px var(--fonts-body, sans-serif)`;
          this.ctx.fillText(`${cluster.nodes.length} targets`, x + width - 12, y + 20);
          
          this.ctx.globalAlpha = 1.0;
      }
  }

  private renderNodes() {
      for (const node of this.nodes) {
          const pos = this.layout.nodePositions.get(node.id);
          const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
          
          if (!pos || !clusterPos) continue;
          
          const x = clusterPos.x + pos.x;
          const y = clusterPos.y + pos.y;
          const size = getNodeSize(node, this.edges);
          const color = getNodeTypeColor(node.type);
          
          const isHovered = this.hoveredNode === node.id;
          const isSelected = this.selectedNode?.id === node.id;

          // Pulse animation for selection
          if (isSelected) {
              const pulse = (Math.sin(this.time / 200) + 1) / 2; // 0 to 1
              this.ctx.beginPath();
              this.ctx.arc(x, y, size + 8 + pulse * 4, 0, Math.PI * 2);
              this.ctx.strokeStyle = color;
              this.ctx.globalAlpha = 0.3 * (1 - pulse);
              this.ctx.stroke();
              this.ctx.globalAlpha = 1.0;
          }

          // Glow
          if (isHovered || isSelected) {
              this.ctx.shadowColor = color;
              this.ctx.shadowBlur = 10;
          } else {
              this.ctx.shadowColor = 'transparent';
              this.ctx.shadowBlur = 0;
          }

          // Draw Node Shape (Path2D)
          this.ctx.translate(x, y);
          // Scale icon to fit size? size is radius. Icon paths are roughly 24x24 (radius 12).
          // Scale factor: size / 12
          const scale = size / 12;
          this.ctx.scale(scale, scale);
          
          const path = this.getPathForNode(node);
          
          this.ctx.fillStyle = 'rgba(30, 30, 35, 0.95)';
          this.ctx.fill(path);
          
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = (isSelected ? 2.5 : 2) / scale; // Invert scale for consistent stroke width
          this.ctx.stroke(path);
          
          this.ctx.scale(1/scale, 1/scale);
          this.ctx.translate(-x, -y);
          
          this.ctx.shadowBlur = 0;
          
          // Label
          if (this.zoom > 0.5 || isHovered) {
              this.ctx.fillStyle = color;
              this.ctx.font = '12px var(--fonts-body, sans-serif)';
              this.ctx.textAlign = 'center';
              // Shadow for text readability
              this.ctx.shadowColor = 'black';
              this.ctx.shadowBlur = 4;
              this.ctx.fillText(node.name, x, y + size + 16);
              this.ctx.shadowBlur = 0;
          }
      }
  }

  private renderEdges() {
      // Batch drawing by state/color could be optimized, but simpler loop for now
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.3;

      for (const edge of this.edges) {
          const sourcePos = this.layout.nodePositions.get(edge.source);
          const targetPos = this.layout.nodePositions.get(edge.target);
          
          const sourceNode = this.nodes.find(n => n.id === edge.source);
          const targetNode = this.nodes.find(n => n.id === edge.target);
          
          if (!sourcePos || !targetPos || !sourceNode || !targetNode) continue;
          
          const sCluster = this.layout.clusterPositions.get(sourceNode.project || 'External');
          const tCluster = this.layout.clusterPositions.get(targetNode.project || 'External');
          
          if (!sCluster || !tCluster) continue;
          
          const x1 = sCluster.x + sourcePos.x;
          const y1 = sCluster.y + sourcePos.y;
          const x2 = tCluster.x + targetPos.x;
          const y2 = tCluster.y + targetPos.y;
          
          const color = getNodeTypeColor(targetNode.type);
          this.ctx.strokeStyle = color;
          
          const isHighlighted = this.hoveredNode === edge.source || this.hoveredNode === edge.target || 
                                (this.selectedNode && (this.selectedNode.id === edge.source || this.selectedNode.id === edge.target));
          
          if (isHighlighted) {
              this.ctx.globalAlpha = 0.8;
              this.ctx.lineWidth = 2;
          } else {
              this.ctx.globalAlpha = 0.3;
              this.ctx.lineWidth = 1;
          }

          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          
          // Dashed line if cross-cluster (dependent)
          const isDependent = sourceNode.project !== targetNode.project;
          if (isDependent) {
              this.ctx.setLineDash([8, 4]);
          } else {
              this.ctx.setLineDash([4, 2]);
          }
          
          // Animate flow if highlighted
          if (isHighlighted) {
              this.ctx.lineDashOffset = -this.time / 20;
          }
          
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          this.ctx.lineDashOffset = 0;
      }
      this.ctx.globalAlpha = 1.0;
  }

  // ========================================
  // Utils
  // ========================================

  private getMousePos(e: MouseEvent) {
      const rect = this.canvas.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  }

  private screenToWorld(screenX: number, screenY: number) {
      return {
          x: (screenX - this.pan.x) / this.zoom,
          y: (screenY - this.pan.y) / this.zoom
      };
  }

  // ========================================
  // Render Template
  // ========================================

  override render() {
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
