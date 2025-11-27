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

import { LitElement, html, css } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import type { GraphEdge, GraphNode as GraphNodeType } from '@/data/mockGraphData';
import type { ViewMode } from '@/types/app';
import { AnimatedLayoutController } from '@/controllers/animated-layout.controller';
import { GraphInteractionFullController } from '@/controllers/graph-interaction-full.controller';
import { computeHierarchicalLayout } from '@/utils/hierarchicalLayout';
import { groupIntoClusters } from '@/utils/clusterGrouping';
import { analyzeCluster } from '@/utils/clusterAnalysis';
import './graph-svg-defs';
import './cluster-group';
import './graph-edges';
import '../graph/graph-overlays';

export class GraphVisualization extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare nodes: GraphNodeType[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  declare selectedNode: GraphNodeType | null;

  @property({ attribute: false })
  declare selectedCluster: string | null;

  @property({ attribute: false })
  declare hoveredNode: string | null;

  @property({ type: String, attribute: 'search-query' })
  searchQuery: string = '';

  @property({ type: String, attribute: 'view-mode' })
  viewMode: ViewMode = 'full';

  @property({ type: Number })
  zoom: number = 1.0;

  @property({ type: Boolean, attribute: 'enable-animation' })
  enableAnimation: boolean = true;

  @property({ attribute: false })
  declare transitiveDeps: any;

  @property({ attribute: false })
  declare transitiveDependents: any;

  @property({ attribute: false })
  previewFilter: any = null;

  // ========================================
  // Internal State
  // ========================================

  @state()
  private declare hoveredCluster: string | null;

  @query('svg')
  private svgElement!: SVGSVGElement;

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
    }

    svg {
      width: 100%;
      height: 100%;
      cursor: default;
    }

    svg.dragging {
      cursor: grabbing;
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  updated(changedProps: Map<string, any>) {
    // Update layout when nodes/edges change
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      this.layout.enableAnimation = this.enableAnimation;
      this.layout.computeLayout(this.nodes, this.edges);
    }

    // Update interaction config when zoom changes
    if (changedProps.has('zoom')) {
      this.interaction.updateConfig({
        zoom: this.zoom,
        finalNodePositions: this.finalNodePositions,
        clusterPositions: this.layout.clusterPositions,
      });
    }

    // Set SVG element reference
    if (this.svgElement && !this.interaction['svgElement']) {
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

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <graph-background></graph-background>

      <graph-controls
        .zoom=${this.zoom}
        node-count=${this.nodes.length}
        edge-count=${this.edges.length}
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
        @click=${this.handleCanvasClick}
      >
        <graph-svg-defs></graph-svg-defs>

        <g transform="translate(${this.interaction.pan.x}, ${this.interaction.pan.y}) scale(${this.zoom})">
          ${this.nodes.length
            ? html`
                <!-- Cross-cluster edges -->
                <g class="cluster-edges">
                  <graph-edges
                    .edges=${this.edges}
                    .nodes=${this.nodes}
                    .finalNodePositions=${this.finalNodePositions}
                    .clusterPositions=${this.layout.clusterPositions}
                    .selectedNode=${this.selectedNode}
                    .hoveredNode=${this.hoveredNode}
                    .hoveredClusterId=${this.hoveredCluster}
                    view-mode=${this.viewMode}
                    .transitiveDeps=${this.transitiveDeps}
                    .transitiveDependents=${this.transitiveDependents}
                    .zoom=${this.zoom}
                  ></graph-edges>
                </g>

                <!-- Clusters with nodes and internal edges -->
                ${this.layout.clusters.map((cluster) => {
                  const position = this.layout.clusterPositions.get(cluster.id);
                  if (!position) return null;

                  const isSelected = this.selectedCluster === cluster.id;

                  return html`
                    <graph-cluster-group
                      .cluster=${cluster}
                      .clusterPosition=${position}
                      .nodes=${this.nodes}
                      .edges=${this.edges}
                      .finalNodePositions=${this.finalNodePositions}
                      .selectedNode=${this.selectedNode}
                      .hoveredNode=${this.hoveredNode}
                      .hoveredClusterId=${this.hoveredCluster}
                      search-query=${this.searchQuery}
                      .zoom=${this.zoom}
                      view-mode=${this.viewMode}
                      .transitiveDeps=${this.transitiveDeps}
                      .transitiveDependents=${this.transitiveDependents}
                      ?is-selected=${isSelected}
                      .previewFilter=${this.previewFilter}
                      @node-mouseenter=${(e: CustomEvent) =>
                        this.dispatchEvent(
                          new CustomEvent('node-hover', {
                            detail: e.detail,
                            bubbles: true,
                            composed: true,
                          })
                        )}
                      @node-mouseleave=${() =>
                        this.dispatchEvent(
                          new CustomEvent('node-hover', {
                            detail: { nodeId: null },
                            bubbles: true,
                            composed: true,
                          })
                        )}
                      @node-mousedown=${(e: CustomEvent) =>
                        this.interaction.handleNodeMouseDown(e.detail.nodeId, e.detail.originalEvent)}
                      @node-click=${this.handleNodeClick}
                      @cluster-mouseenter=${() => (this.hoveredCluster = cluster.id)}
                      @cluster-mouseleave=${() => (this.hoveredCluster = null)}
                      @cluster-click=${() =>
                        this.dispatchEvent(
                          new CustomEvent('cluster-select', {
                            detail: { clusterId: cluster.id },
                            bubbles: true,
                            composed: true,
                          })
                        )}
                    ></graph-cluster-group>
                  `;
                })}
              `
            : ''}
        </g>
      </svg>

      ${this.nodes.length === 0
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
