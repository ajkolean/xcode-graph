/**
 * GraphVisualization Lit Component
 *
 * FULL graph rendering engine with:
 * - Animated layout with physics
 * - Deterministic layout option
 * - Pan/zoom/drag interactions
 * - Node dragging
 * - All graph features
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

import { LitElement, html, css, svg } from 'lit';
import { state, query } from 'lit/decorators.js';
import type { GraphEdge, GraphNode as GraphNodeType } from '@/data/mockGraphData';
import type { ViewMode } from '@/types/app';
import { AnimatedLayoutController } from '@/controllers/animated-layout.controller';
import { GraphInteractionFullController } from '@/controllers/graph-interaction-full.controller';
import { computeHierarchicalLayout } from '@/utils/hierarchicalLayout';
import { groupIntoClusters } from '@/utils/clusterGrouping';
import { analyzeCluster } from '@/utils/clusterAnalysis';
import { renderClusterGroup, renderGraphEdges } from './svg-renderers';
import './graph-svg-defs';
import './cluster-group';
import './graph-edges';
import '../graph/graph-overlays';

interface TransitiveResult {
  nodes: Set<string>;
  edges: Set<string>;
  edgeDepths: Map<string, number>;
  maxDepth: number;
}

interface PreviewFilter {
  type: string;
  value: string;
}

export class GraphVisualization extends LitElement {
  // ========================================
  // Properties
  // ========================================

  static properties = {
    nodes: { attribute: false },
    edges: { attribute: false },
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
  private svgElement!: SVGSVGElement;

  private nodeMap: Map<string, GraphNodeType> = new Map();

  // ========================================
  // Controllers
  // ========================================

  private layout = new AnimatedLayoutController(this, {
    enableAnimation: this.enableAnimation,
    animationTicks: 30,
  });

  private interaction = new GraphInteractionFullController(this, {
    zoom: this.zoom,
    finalNodePositions: new Map(),
    clusterPositions: new Map(),
  });

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      position: relative;
      flex: 1;
      overflow: hidden;
      background-color: var(--color-background);
      min-height: 0;
      width: 100%;
      height: 100%;
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

  willUpdate(changedProps: Map<string, any>) {
    // Update layout when nodes/edges change
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      // Optimization: Compute nodeMap for O(1) lookups
      this.nodeMap = new Map((this.nodes ?? []).map(n => [n.id, n]));

      this.layout.enableAnimation = this.enableAnimation;
      this.layout.computeLayout(this.nodes ?? [], this.edges ?? []);
    }

    // Update animation when enableAnimation changes
    if (changedProps.has('enableAnimation')) {
      this.layout.enableAnimation = this.enableAnimation;
    }

    // Update interaction config when zoom changes
    if (changedProps.has('zoom')) {
      this.interaction.updateConfig({
        zoom: this.zoom,
        finalNodePositions: this.finalNodePositions,
        clusterPositions: this.layout.clusterPositions,
      });
    }
  }

  updated(changedProps: Map<string, any>) {
    // Set SVG element reference
    if (this.svgElement && !this.interaction.hasSvgElement()) {
      this.interaction.setSvgElement(this.svgElement);
    }
  }

  // ========================================
  // Computed Values
  // ========================================

  private get finalNodePositions() {
    // Merge layout positions with manual positions
    const merged = new Map(this.layout.nodePositions);
    this.interaction.manualNodePositions.forEach((pos, id) => {
      const existing = merged.get(id);
      if (existing) {
        merged.set(id, { ...existing, x: pos.x, y: pos.y });
      }
    });
    return merged;
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
        })
      );
      this.dispatchEvent(
        new CustomEvent('cluster-select', {
          detail: { clusterId: null },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private handleNodeClick(e: CustomEvent) {
    if (!this.interaction.hasMoved) {
      this.dispatchEvent(
        new CustomEvent('node-select', {
          detail: e.detail,
          bubbles: true,
          composed: true,
        })
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
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <graph-background></graph-background>

      <graph-controls
        .zoom=${this.zoom}
        node-count=${this.nodes?.length ?? 0}
        edge-count=${this.edges?.length ?? 0}
        ?enable-animation=${this.enableAnimation}
        @zoom-in=${() => this.dispatchEvent(new CustomEvent('zoom-in', { bubbles: true, composed: true }))}
        @zoom-out=${() =>
          this.dispatchEvent(new CustomEvent('zoom-out', { bubbles: true, composed: true }))}
        @zoom-reset=${() =>
          this.dispatchEvent(new CustomEvent('zoom-reset', { bubbles: true, composed: true }))}
        @toggle-animation=${() =>
          this.dispatchEvent(new CustomEvent('toggle-animation', { bubbles: true, composed: true }))}
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
          ${this.nodes?.length
            ? svg`
                <!-- Cross-cluster edges -->
                <g class="cluster-edges">
                  ${renderGraphEdges({
                    edges: this.edges ?? [],
                    nodes: this.nodes ?? [],
                    nodeMap: this.nodeMap,
                    finalNodePositions: this.finalNodePositions,
                    clusterPositions: this.layout.clusterPositions,
                    selectedNode: this.selectedNode ?? null,
                    hoveredNode: this.hoveredNode ?? null,
                    hoveredClusterId: this.hoveredCluster,
                    viewMode: this.viewMode,
                    transitiveDeps: this.transitiveDeps,
                    transitiveDependents: this.transitiveDependents,
                    zoom: this.zoom,
                  })}
                </g>

                <!-- Clusters with nodes and internal edges -->
                ${this.layout.clusters.map((cluster) => {
                  const position = this.layout.clusterPositions.get(cluster.id);
                  if (!position) return null;

                  const isSelected = this.selectedCluster === cluster.id;

                  return renderClusterGroup({
                    cluster,
                    clusterPosition: position,
                    nodes: this.nodes ?? [],
                    edges: this.edges ?? [],
                    finalNodePositions: this.finalNodePositions,
                    selectedNode: this.selectedNode ?? null,
                    hoveredNode: this.hoveredNode ?? null,
                    isClusterHovered: this.hoveredCluster === cluster.id,
                    isClusterSelected: isSelected,
                    searchQuery: this.searchQuery,
                    zoom: this.zoom,
                    previewFilter: this.previewFilter,
                    onClusterClick: () =>
                      this.dispatchEvent(
                        new CustomEvent('cluster-select', {
                          detail: { clusterId: cluster.id },
                          bubbles: true,
                          composed: true,
                        })
                      ),
                    onClusterMouseEnter: () => (this.hoveredCluster = cluster.id),
                    onClusterMouseLeave: () => (this.hoveredCluster = null),
                    onNodeMouseEnter: (nodeId) =>
                      this.dispatchEvent(
                        new CustomEvent('node-hover', {
                          detail: { nodeId },
                          bubbles: true,
                          composed: true,
                        })
                      ),
                    onNodeMouseLeave: () =>
                      this.dispatchEvent(
                        new CustomEvent('node-hover', {
                          detail: { nodeId: null },
                          bubbles: true,
                          composed: true,
                        })
                      ),
                    onNodeMouseDown: (nodeId, e) =>
                      this.interaction.handleNodeMouseDown(nodeId, e),
                    onNodeClick: (node, e) => {
                      if (!this.interaction.hasMoved) {
                        this.dispatchEvent(
                          new CustomEvent('node-select', {
                            detail: { node },
                            bubbles: true,
                            composed: true,
                          })
                        );
                      }
                    },
                  });
                })}
              `
            : ''}
        </g>
      </svg>

      ${this.nodes?.length === 0
        ? html`<graph-visualization-empty-state></graph-visualization-empty-state>`
        : ''}
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