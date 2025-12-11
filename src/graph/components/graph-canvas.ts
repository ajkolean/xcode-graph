import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import { getConnectedNodes } from '@graph/utils/connections';
import type { TransitiveResult } from '@graph/utils';
import { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import { generateColor } from '@ui/utils/color-generator';
import { generateBezierPath } from '@ui/utils/paths';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { getNodeSize } from '@ui/utils/sizing';
import { calculateViewportBounds, isCircleInViewport, isLineInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

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
  private hasMoved = false;
  private draggedNodeId: string | null = null;
  private lastMousePos = { x: 0, y: 0 };
  private manualNodePositions = new Map<string, { x: number; y: number }>();
  private pathCache = new Map<string, Path2D>();
  
  // Hover State
  private hoveredCluster: string | null = null;
  
  // Animation State
  private animationFrameId: number | null = null;
  private time = 0;
  private didInitialFit = false;

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
      // Fire async layout computation
      this.layout.computeLayout(this.nodes, this.edges).then(() => {
        this.requestUpdate(); // Trigger render when layout completes
      });
      this.manualNodePositions.clear();
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
  private fitToViewport() {
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

      if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) return;

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;
      const padding = 40;
      const scaleX = (rect.width - padding * 2) / graphWidth;
      const scaleY = (rect.height - padding * 2) / graphHeight;
      const fitZoom = Math.max(0.1, Math.min(1.5, Math.min(scaleX, scaleY)));

      this.zoom = fitZoom;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      this.pan = {
        x: rect.width / 2 - centerX * fitZoom,
        y: rect.height / 2 - centerY * fitZoom,
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

    this.renderCanvas();
  }

  private handleCanvasMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.hasMoved = false;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    
    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);
    
    for (let i = this.nodes.length - 1; i >= 0; i--) {
        const node = this.nodes[i];
        const layoutPos = this.layout.nodePositions.get(node.id);
        const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
        
        if (layoutPos && clusterPos) {
             const manualPos = this.manualNodePositions.get(node.id);
             const wx = clusterPos.x + (manualPos?.x ?? layoutPos.x);
             const wy = clusterPos.y + (manualPos?.y ?? layoutPos.y);
             const size = getNodeSize(node, this.edges);
             
             const dx = worldPos.x - wx;
             const dy = worldPos.y - wy;
             
             if (dx * dx + dy * dy <= size * size) {
                 this.draggedNodeId = node.id;
                 this.dispatchEvent(new CustomEvent('node-select', { detail: { node }, bubbles: true, composed: true }));
                 this.isDragging = false; // Don't pan if dragging node
                 return;
             }
        }
    }
    
    for (const cluster of this.layout.clusters) {
       const pos = this.layout.clusterPositions.get(cluster.id);
       if (!pos) continue;
       
       const halfW = pos.width / 2;
       const halfH = pos.height / 2;
       
       if (worldPos.x >= pos.x - halfW && worldPos.x <= pos.x + halfW &&
           worldPos.y >= pos.y - halfH && worldPos.y <= pos.y + halfH) {
           this.dispatchEvent(new CustomEvent('cluster-select', { detail: { clusterId: cluster.id }, bubbles: true, composed: true }));
           return; 
       }
    }
    
    this.dispatchEvent(new CustomEvent('node-select', { detail: { node: null }, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent('cluster-select', { detail: { clusterId: null }, bubbles: true, composed: true }));
  }

  private handleCanvasMouseMove = (e: MouseEvent) => {
    const { x, y } = this.getMousePos(e);
    const worldPos = this.screenToWorld(x, y);

    if (this.draggedNodeId) {
        this.hasMoved = true;
        const node = this.nodes.find((n) => n.id === this.draggedNodeId);
        if (node) {
            const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
            if (clusterPos) {
                this.manualNodePositions.set(node.id, {
                    x: worldPos.x - clusterPos.x,
                    y: worldPos.y - clusterPos.y,
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
            this.dispatchEvent(new CustomEvent('node-hover', { detail: { nodeId: hitNodeId }, bubbles: true, composed: true }));
        }

        if (hitNodeCluster) {
          hitClusterId = hitNodeCluster;
        } else {
            for (const cluster of this.layout.clusters) {
               const pos = this.layout.clusterPositions.get(cluster.id);
               if (!pos) continue;
               
               const halfW = pos.width / 2;
               const halfH = pos.height / 2;
               
               if (worldPos.x >= pos.x - halfW && worldPos.x <= pos.x + halfW &&
                   worldPos.y >= pos.y - halfH && worldPos.y <= pos.y + halfH) {
                   hitClusterId = cluster.id;
                   break;
               }
            }
        }
        
        if (hitClusterId !== this.hoveredCluster) {
            this.hoveredCluster = hitClusterId;
            this.dispatchEvent(new CustomEvent('cluster-hover', { detail: { clusterId: hitClusterId }, bubbles: true, composed: true }));
        }
    }
  }

  private handleCanvasMouseUp = (e?: MouseEvent) => {
    this.isDragging = false;
    this.draggedNodeId = null;
    setTimeout(() => {
      this.hasMoved = false;
    }, 0);

    // Only clear hover state when leaving the canvas
    if (e?.type === 'mouseleave') {
      if (this.hoveredNode) {
        this.hoveredNode = null;
        this.dispatchEvent(
          new CustomEvent('node-hover', { detail: { nodeId: null }, bubbles: true, composed: true }),
        );
      }
      if (this.hoveredCluster) {
        this.hoveredCluster = null;
        this.dispatchEvent(
          new CustomEvent('cluster-hover', { detail: { clusterId: null }, bubbles: true, composed: true }),
        );
      }
    }
  }

  private handleCanvasWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(0.1, this.zoom + delta), 5);
    
    if (newZoom !== this.zoom) {
        const { x, y } = this.getMousePos(e);
        const worldPos = this.screenToWorld(x, y);
        
        this.zoom = newZoom;
        
        this.pan = {
            x: x - worldPos.x * this.zoom,
            y: y - worldPos.y * this.zoom
        };
        
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

      if (!this.didInitialFit && this.layout.clusterPositions.size > 0) {
        this.fitToViewport();
        this.didInitialFit = true;
      }

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.save();
      this.ctx.translate(this.pan.x, this.pan.y);
      this.ctx.scale(this.zoom, this.zoom);

      const viewport = calculateViewportBounds(
          this.canvas.width / (window.devicePixelRatio || 1),
          this.canvas.height / (window.devicePixelRatio || 1),
          this.pan.x,
          this.pan.y,
          this.zoom
      );

      this.renderClusters(viewport);
      this.renderEdges(viewport);
      this.renderNodes(viewport);

      this.ctx.restore();
      
      this.renderTooltip();
  }

  private renderTooltip() {
      if (!this.hoveredNode) return;
      const node = this.nodes.find(n => n.id === this.hoveredNode);
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

      for (const cluster of this.layout.clusters) {
          const pos = this.layout.clusterPositions.get(cluster.id);
          if (!pos) continue;

          const halfW = pos.width / 2;
          const halfH = pos.height / 2;
          if (pos.x + halfW < viewport.minX || pos.x - halfW > viewport.maxX ||
              pos.y + halfH < viewport.minY || pos.y - halfH > viewport.maxY) {
              continue;
          }

          const x = pos.x - halfW;
          const y = pos.y - halfH;
          const width = pos.width;
          const height = pos.height;

          const clusterColor = generateColor(cluster.name, cluster.type);
          const isHighlighted = this.hoveredCluster === cluster.id;
          const isSelected = this.selectedCluster === cluster.id;
          const isActive = isHighlighted || isSelected;
          const borderOpacity = adjustOpacityForZoom(0.5, this.zoom);
          
          const shouldDim = activeClusterId && activeClusterId !== cluster.id;
          
          this.ctx.globalAlpha = shouldDim ? 0.3 : 1.0;

          this.ctx.beginPath();
          this.ctx.roundRect(x, y, width, height, 8);
          this.ctx.fillStyle = clusterColor;
          this.ctx.globalAlpha = isActive ? 0.03 : 0.09; 
          this.ctx.fill();
          
          this.ctx.globalAlpha = shouldDim ? 0.3 : 1.0;

          this.ctx.lineWidth = 3.5;
          this.ctx.strokeStyle = clusterColor;
          this.ctx.globalAlpha = (isActive ? 0.9 : borderOpacity) * (shouldDim ? 0.3 : 1.0);
          
          if (cluster.type === 'project') {
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

          this.ctx.globalAlpha = (isActive ? 1 : 0.6) * (shouldDim ? 0.3 : 1.0);
          this.ctx.fillStyle = clusterColor;
          this.ctx.font = `${isActive ? 600 : 500} 14px var(--fonts-body, sans-serif)`;
          this.ctx.textAlign = 'left';
          this.ctx.fillText(cluster.name, x + 12, y + 20);
          
          this.ctx.textAlign = 'right';
          this.ctx.font = `${isActive ? 600 : 500} 12px var(--fonts-body, sans-serif)`;
          this.ctx.fillText(`${cluster.nodes.length} targets`, x + width - 12, y + 20);
          
          this.ctx.globalAlpha = 1.0;
      }
  }

  private renderNodes(viewport: ViewportBounds) {
      const connectedNodes = this.selectedNode 
          ? getConnectedNodes(this.selectedNode.id, this.edges) 
          : new Set<string>();

      for (const node of this.nodes) {
          const layoutPos = this.layout.nodePositions.get(node.id);
          const clusterPos = this.layout.clusterPositions.get(node.project || 'External');
          
          if (!layoutPos || !clusterPos) continue;
          const clusterId = node.project || 'External';
          
          const manualPos = this.manualNodePositions.get(node.id);
          const relX = manualPos?.x ?? layoutPos.x;
          const relY = manualPos?.y ?? layoutPos.y;
          const x = clusterPos.x + relX;
          const y = clusterPos.y + relY;

          // Verify node is within cluster bounds
          const distFromClusterCenter = Math.hypot(relX, relY);
          const clusterRadius = clusterPos.width / 2;
          if (distFromClusterCenter > clusterRadius) {
            console.error(`[Render] Node ${node.id} outside cluster! Dist: ${distFromClusterCenter.toFixed(1)}, ClusterRadius: ${clusterRadius.toFixed(1)}`);
          }
          const size = getNodeSize(node, this.edges);
          if (!isCircleInViewport({ x, y }, size, viewport)) continue;
          const color = getNodeTypeColor(node.type);
          const adjustedColor = adjustColorForZoom(color, this.zoom);
          
          const isHovered = this.hoveredNode === node.id;
          const isSelected = this.selectedNode?.id === node.id;
          
          const isConnected = this.selectedNode && connectedNodes.has(node.id);
          const isSearchMatch = this.searchQuery && node.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          const clusterDim =
            (this.hoveredCluster && clusterId !== this.hoveredCluster) ||
            (this.selectedCluster && clusterId !== this.selectedCluster);
          
          const matchesPreview = !this.previewFilter ||
            (this.previewFilter.type === 'nodeType' && node.type === this.previewFilter.value) ||
            (this.previewFilter.type === 'platform' && node.platform === this.previewFilter.value) ||
            (this.previewFilter.type === 'origin' && node.origin === this.previewFilter.value) ||
            (this.previewFilter.type === 'project' && node.project === this.previewFilter.value) ||
            (this.previewFilter.type === 'package' && node.type === 'package' && node.name === this.previewFilter.value);

          const isDimmed =
            (this.searchQuery && !isSearchMatch) ||
            (this.selectedNode && !isSelected && !isConnected) ||
            (this.previewFilter && !matchesPreview) ||
            clusterDim;

          this.ctx.globalAlpha = isDimmed ? 0.3 : 1.0;

          if (isSelected) {
              const pulse = (Math.sin(this.time / 200) + 1) / 2;
              this.ctx.beginPath();
              this.ctx.arc(x, y, size + 8 + pulse * 4, 0, Math.PI * 2);
              this.ctx.strokeStyle = adjustedColor;
              this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * 0.3 * (1 - pulse);
              this.ctx.stroke();
              this.ctx.globalAlpha = isDimmed ? 0.3 : 1.0;
          }

          if (isHovered || isSelected) {
              this.ctx.shadowColor = adjustedColor;
              this.ctx.shadowBlur = 10;
          } else {
              this.ctx.shadowColor = 'transparent';
              this.ctx.shadowBlur = 0;
          }

          const scale = (size / 12) * ((isHovered || isSelected) ? 1.08 : 1.0);

          this.ctx.translate(x, y);
          this.ctx.scale(scale, scale);
          
          const path = this.getPathForNode(node);
          
          this.ctx.fillStyle = 'rgba(30, 30, 35, 0.95)';
          this.ctx.fill(path);
          
          this.ctx.strokeStyle = adjustedColor;
          this.ctx.lineWidth = (isSelected ? 2.5 : 2) / scale; 
          this.ctx.stroke(path);
          
          this.ctx.scale(1/scale, 1/scale);
          this.ctx.translate(-x, -y);
          
          this.ctx.shadowBlur = 0;
          
          if (this.zoom >= 0.5 || isHovered || isSelected) {
              const labelText = node.name.length > 20 && !isHovered ? `${node.name.substring(0, 20)}...` : node.name;
              
              this.ctx.font = `${isSelected ? '600' : '400'} 12px var(--fonts-body, sans-serif)`;
              this.ctx.textAlign = 'center';
              this.ctx.fillStyle = adjustedColor;
              
              this.ctx.globalAlpha = (isDimmed ? 0.3 : 1.0) * 0.9;
              this.ctx.shadowColor = 'rgba(30, 30, 35, 0.9)';
              this.ctx.shadowBlur = 8;
              this.ctx.fillText(labelText, x, y + size + 22);
              
              this.ctx.globalAlpha = isDimmed ? 0.3 : 1.0;
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
      this.ctx.lineWidth = 1;

      for (const edge of this.edges) {
          const sourceNode = this.nodes.find(n => n.id === edge.source);
          const targetNode = this.nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) continue;

          const sourceLayout = this.layout.nodePositions.get(edge.source);
          const targetLayout = this.layout.nodePositions.get(edge.target);
          if (!sourceLayout || !targetLayout) continue;

          const sCluster = this.layout.clusterPositions.get(sourceNode.project || 'External');
          const tCluster = this.layout.clusterPositions.get(targetNode.project || 'External');
          if (!sCluster || !tCluster) continue;

          const sourceClusterId = sourceNode.project || 'External';
          const targetClusterId = targetNode.project || 'External';

          const sManual = this.manualNodePositions.get(edge.source);
          const tManual = this.manualNodePositions.get(edge.target);

          const x1 = sCluster.x + (sManual?.x ?? sourceLayout.x);
          const y1 = sCluster.y + (sManual?.y ?? sourceLayout.y);
          const x2 = tCluster.x + (tManual?.x ?? targetLayout.x);
          const y2 = tCluster.y + (tManual?.y ?? targetLayout.y);

          if (!isLineInViewport({x: x1, y: y1}, {x: x2, y: y2}, viewport)) continue;

          const touchesHoveredNode =
            this.hoveredNode === edge.source || this.hoveredNode === edge.target;
          const isHighlighted =
            touchesHoveredNode ||
            (this.selectedNode &&
              (this.selectedNode.id === edge.source || this.selectedNode.id === edge.target));

          const isConnectedToHoveredCluster =
            this.hoveredCluster &&
            (sourceClusterId === this.hoveredCluster || targetClusterId === this.hoveredCluster);
          
          const shouldDim = !!(this.hoveredCluster && !isConnectedToHoveredCluster);
          const isDependent = sourceClusterId !== targetClusterId;
          const selectedClusterDim =
            this.selectedCluster &&
            sourceClusterId !== this.selectedCluster &&
            targetClusterId !== this.selectedCluster;

          let color = getNodeTypeColor(targetNode.type);
          color = adjustColorForZoom(color, this.zoom);
          this.ctx.strokeStyle = color;

          const baseOpacity = adjustOpacityForZoom(isHighlighted ? 0.8 : 0.3, this.zoom);
          let opacity = baseOpacity * this.getEdgeOpacity(edge);
          if (shouldDim) opacity *= 0.25;
          if (selectedClusterDim) opacity *= 0.25;
          this.ctx.globalAlpha = Math.min(1, opacity);
          this.ctx.lineWidth = isHighlighted ? 2 : 1;

          const distance = Math.hypot(x2 - x1, y2 - y1);
          const useBezier = distance > 150;
          const dashPattern = isDependent ? [8, 4] : [4, 2];
          this.ctx.setLineDash(dashPattern);
          this.ctx.lineDashOffset = isHighlighted ? -this.time / 20 : 0;

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
