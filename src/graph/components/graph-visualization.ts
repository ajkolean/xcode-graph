/**
 * GraphVisualization Lit Component - Core Graph Renderer
 *
 * Complete graph rendering engine with physics-based animation:
 * - Animated layout with configurable physics (GraphLayoutController)
 * - Pan/zoom/drag interactions (GraphInteractionFullController)
 * - Cluster-based visualization with edges
 * - Selection and hover state management
 *
 * @module components/graph/graph-visualization
 *
 * @example
 * ```html
 * <graph-visualization
 *   .nodes=${nodes}
 *   .edges=${edges}
 *   .selectedNode=${selectedNode}
 *   zoom="1.0"
 *   enable-animation
 * ></graph-visualization>
 * ```
 */

import { GraphInteractionFullController } from '@graph/controllers/graph-interaction-full.controller';
import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode as GraphNodeType } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  type PropertyDeclarations,
  type PropertyValues,
  svg,
  type TemplateResult,
} from 'lit';
import { query, state } from 'lit/decorators.js';
import './cluster-group';
import './graph-edges';
import './graph-overlays';
import './graph-svg-defs';
import { renderClusterGroup, renderGraphEdges } from './svg-renderers';

export class GraphVisualization extends LitElement {
  // ========================================
  // Properties
  // ========================================

  static override readonly properties: PropertyDeclarations = {
    nodes: { attribute: false },
    edges: { attribute: false },
    nodeMap: { attribute: false }, // Added property
    selectedNode: { attribute: false },
    selectedCluster: { attribute: false },
    hoveredNode: { attribute: false },
    searchQuery: { type: String, attribute: 'search-query' },
    viewMode: { type: String, attribute: 'view-mode' },
    zoom: { type: Number },
    enableAnimation: { type: Boolean, attribute: 'enable-animation' },
    transitiveDeps: { attribute: false },
    transitiveDependents: { attribute: false },
    previewFilter: { attribute: false },
  };

  declare nodes: GraphNodeType[] | undefined;
  declare edges: GraphEdge[] | undefined;
  declare nodeMap: Map<string, GraphNodeType> | undefined; // Added declaration
  declare selectedNode: GraphNodeType | null | undefined;
  declare selectedCluster: string | null | undefined;
  declare hoveredNode: string | null | undefined;
  declare searchQuery: string | undefined;
  declare viewMode: ViewMode | undefined;
  declare zoom: number | undefined;
  declare enableAnimation: boolean | undefined;
  declare transitiveDeps: TransitiveResult | undefined;
  declare transitiveDependents: TransitiveResult | undefined;
  declare previewFilter: PreviewFilter | undefined;

  // ========================================
  // Internal State
  // ========================================

  @state()
  private declare hoveredCluster: string | null;

  @query('svg')
  private readonly svgElement!: SVGSVGElement;

  // Use internal map if property is not provided
  private internalNodeMap: Map<string, GraphNodeType> = new Map();

  private get effectiveNodeMap(): Map<string, GraphNodeType> {
    return this.nodeMap ?? this.internalNodeMap;
  }

  // Hover throttling
  private hoverUpdatePending = false;
  private pendingHoveredCluster: string | null = null;

  /**
   * Throttled hover update using requestAnimationFrame
   * Prevents re-rendering on every mousemove event
   */
  private scheduleHoverUpdate(clusterId: string | null): void {
    this.pendingHoveredCluster = clusterId;

    if (!this.hoverUpdatePending) {
      this.hoverUpdatePending = true;
      requestAnimationFrame(() => {
        this.hoveredCluster = this.pendingHoveredCluster;
        this.hoverUpdatePending = false;
      });
    }
  }

  // ========================================
  // Controllers
  // ========================================

  private readonly layout = new GraphLayoutController(this, {
    enableAnimation: false,
    animationTicks: 30,
  });

  private readonly interaction = new GraphInteractionFullController(this, {
    zoom: 1,
    finalNodePositions: new Map(),
    clusterPositions: new Map(),
  });

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      position: relative;
      flex: 1;
      overflow: hidden;
      background-color: var(--color-background);
      min-height: 0;
      width: 100%;
      height: 100%;
      overscroll-behavior: contain;
      touch-action: none;
    }

    svg {
      width: 100%;
      height: 100%;
      cursor: default;
    }

    svg.dragging {
      cursor: grabbing;
    }

    @keyframes flowDashes {
      to {
        stroke-dashoffset: -12px;
      }
    }

    @keyframes marchingAnts {
      to {
        stroke-dashoffset: -16px;
      }
    }

    .flow-animation {
      animation: flowDashes 1s linear infinite;
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  /**
   * Check if zoom changed significantly
   */
  private hasSignificantZoomChange(changedProps: PropertyValues<this>): boolean {
    if (!changedProps.has('zoom')) return false;
    const oldZoom = changedProps.get('zoom') ?? 1;
    const newZoom = this.zoom ?? 1;
    return Math.abs(newZoom - oldZoom) > 0.01;
  }

  /**
   * Check if hover state changed
   */
  private hasHoverStateChange(changedProps: Map<PropertyKey, unknown>): boolean {
    if (changedProps.has('hoveredCluster')) {
      const oldHover = changedProps.get('hoveredCluster');
      if (oldHover !== this.hoveredCluster) return true;
    }
    if (changedProps.has('hoveredNode')) {
      const oldHover = changedProps.get('hoveredNode');
      if (oldHover !== this.hoveredNode) return true;
    }
    return false;
  }

  /**
   * Optimize re-renders by only updating when relevant props change
   */
  override shouldUpdate(changedProps: PropertyValues<this>): boolean {
    if (!changedProps.size) return true;

    return (
      changedProps.has('nodes') ||
      changedProps.has('edges') ||
      changedProps.has('selectedNode') ||
      changedProps.has('selectedCluster') ||
      changedProps.has('viewMode') ||
      changedProps.has('enableAnimation') ||
      changedProps.has('transitiveDeps') ||
      changedProps.has('transitiveDependents') ||
      changedProps.has('previewFilter') ||
      changedProps.has('searchQuery') ||
      this.hasSignificantZoomChange(changedProps) ||
      this.hasHoverStateChange(changedProps)
    );
  }

  private handleGraphDataChange(): void {
    // Optimization: Compute nodeMap for O(1) lookups ONLY if not provided via props
    if (!this.nodeMap) {
      this.internalNodeMap = new Map((this.nodes ?? []).map((n) => [n.id, n]));
    }

    this.layout.enableAnimation = this.enableAnimation ?? false;
    // ELK layout is asynchronous
    this.layout.computeLayout(this.nodes ?? [], this.edges ?? []).catch(console.error);

    // Keep interaction controller in sync with fresh layout positions
    this.interaction.updateConfig({
      finalNodePositions: this.layout.nodePositions,
      clusterPositions: this.layout.clusterPositions,
    });
  }

  private handleAnimationChange(): void {
    const enableAnimation = this.enableAnimation ?? false;
    this.layout.enableAnimation = enableAnimation;

    if (!enableAnimation) {
      this.layout.stopAnimation();
    } else if (this.nodes && this.edges) {
      this.layout.computeLayout(this.nodes, this.edges).catch(console.error);
    }
  }

  private handleZoomChange(): void {
    this.interaction.updateConfig({
      zoom: this.zoom ?? 1,
      finalNodePositions: this.layout.nodePositions,
      clusterPositions: this.layout.clusterPositions,
    });
  }

  override willUpdate(changedProps: PropertyValues<this>): void {
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      this.handleGraphDataChange();
    }

    if (changedProps.has('enableAnimation')) {
      this.handleAnimationChange();
    }

    if (changedProps.has('zoom')) {
      this.handleZoomChange();
    }
  }

  override updated(_changedProps: PropertyValues<this>): void {
    // Set SVG element reference
    if (this.svgElement && !this.interaction.hasSvgElement()) {
      this.interaction.setSvgElement(this.svgElement);
    }
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleCanvasClick(e: MouseEvent) {
    // Only deselect if we didn't drag
    if (!this.interaction.hasMoved && (e.target as HTMLElement).tagName === 'svg') {
      this.dispatchEvent(
        new CustomEvent('node-select', {
          detail: { node: null },
          bubbles: true,
          composed: true,
        }),
      );
      this.dispatchEvent(
        new CustomEvent('cluster-select', {
          detail: { clusterId: null },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleWheel(e: WheelEvent) {
    // Only zoom if Ctrl/Cmd key is pressed (also captures trackpad pinch)
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }

    e.preventDefault();

    const eventName = e.deltaY < 0 ? 'zoom-in' : 'zoom-out';
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  private dispatchBubble(eventName: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderGraphContent() {
    return svg`
      <!-- Cross-cluster edges -->
      <g class="cluster-edges">
        ${renderGraphEdges({
          edges: this.edges ?? [],
          nodes: this.nodes ?? [],
          nodeMap: this.effectiveNodeMap,
          layoutNodePositions: this.layout.nodePositions,
          manualNodePositions: this.interaction.manualNodePositions,
          clusterPositions: this.layout.clusterPositions,
          selectedNode: this.selectedNode ?? null,
          hoveredNode: this.hoveredNode ?? null,
          hoveredClusterId: this.hoveredCluster,
          viewMode: this.viewMode ?? 'full',
          ...(this.transitiveDeps ? { transitiveDeps: this.transitiveDeps } : {}),
          ...(this.transitiveDependents
            ? { transitiveDependents: this.transitiveDependents }
            : {}),
          zoom: this.zoom ?? 1,
        })}
      </g>

      <!-- Clusters with nodes and internal edges -->
      ${this.layout.clusters.map((cluster) => this.renderSingleCluster(cluster))}
    `;
  }

  private renderSingleCluster(cluster: { id: string; nodes: GraphNodeType[] }) {
    const position = this.layout.clusterPositions.get(cluster.id);
    if (!position) return null;

    return renderClusterGroup({
      cluster: cluster as import('@shared/schemas').Cluster,
      clusterPosition: position,
      nodes: this.nodes ?? [],
      edges: this.edges ?? [],
      layoutNodePositions: this.layout.nodePositions,
      manualNodePositions: this.interaction.manualNodePositions,
      selectedNode: this.selectedNode ?? null,
      hoveredNode: this.hoveredNode ?? null,
      isClusterHovered: this.hoveredCluster === cluster.id,
      isClusterSelected: this.selectedCluster === cluster.id,
      searchQuery: this.searchQuery ?? '',
      zoom: this.zoom ?? 1,
      previewFilter: this.previewFilter ?? null,
      onClusterClick: () => this.dispatchBubble('cluster-select', { clusterId: cluster.id }),
      onClusterMouseEnter: () => this.scheduleHoverUpdate(cluster.id),
      onClusterMouseLeave: () => this.scheduleHoverUpdate(null),
      onNodeMouseEnter: (nodeId) => this.dispatchBubble('node-hover', { nodeId }),
      onNodeMouseLeave: () => this.dispatchBubble('node-hover', { nodeId: null }),
      onNodeMouseDown: (nodeId, e) => this.interaction.handleNodeMouseDown(nodeId, e),
      onNodeClick: (node) => {
        if (!this.interaction.hasMoved) {
          this.dispatchBubble('node-select', { node });
        }
      },
    });
  }

  override render(): TemplateResult {
    return html`
      <graph-background></graph-background>

      <graph-controls
        .zoom=${this.zoom}
        node-count=${this.nodes?.length ?? 0}
        edge-count=${this.edges?.length ?? 0}
        ?enable-animation=${this.enableAnimation}
        @zoom-in=${() => this.dispatchBubble('zoom-in')}
        @zoom-out=${() => this.dispatchBubble('zoom-out')}
        @zoom-reset=${() => this.dispatchBubble('zoom-reset')}
        @toggle-animation=${() => this.dispatchBubble('toggle-animation')}
      ></graph-controls>

      <svg
        class="${this.interaction.isDragging ? 'dragging' : ''}"
        @mousedown=${this.interaction.handleMouseDown}
        @mousemove=${this.interaction.handleMouseMove}
        @mouseup=${this.interaction.handleMouseUp}
        @mouseleave=${this.interaction.handleMouseUp}
        @click=${this.handleCanvasClick}
        @wheel=${this.handleWheel}
      >
        <graph-svg-defs></graph-svg-defs>

        <g transform="translate(${this.interaction.pan.x}, ${this.interaction.pan.y}) scale(${this.zoom ?? 1})">
          ${this.nodes?.length ? this.renderGraphContent() : ''}
        </g>
      </svg>

      ${
        this.nodes?.length === 0
          ? html`<graph-visualization-empty-state></graph-visualization-empty-state>`
          : ''
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-visualization': GraphVisualization;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-visualization')) {
  customElements.define('graph-visualization', GraphVisualization);
}
