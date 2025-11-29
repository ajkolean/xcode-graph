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
import { eventOptions, query, state } from 'lit/decorators.js';
import './cluster-group';
import './graph-edges';
import './graph-overlays';
import './graph-svg-defs';
import { renderClusterGroup, renderGraphEdges } from './svg-renderers';

export class GraphVisualization extends LitElement {
  // ========================================
  // Properties
  // ========================================

  static readonly override properties: PropertyDeclarations = {
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

  private layout = new GraphLayoutController(this, {
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

  static readonly override styles: CSSResultGroup = css`
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

  override willUpdate(changedProps: PropertyValues<this>): void {
    // Update layout when nodes/edges change
    if (changedProps.has('nodes') || changedProps.has('edges')) {
      // Optimization: Compute nodeMap for O(1) lookups
      this.nodeMap = new Map((this.nodes ?? []).map((n) => [n.id, n]));

      this.layout.enableAnimation = this.enableAnimation ?? false;
      this.layout.computeLayout(this.nodes ?? [], this.edges ?? []);

      // Keep interaction controller in sync with fresh layout positions
      this.interaction.updateConfig({
        finalNodePositions: this.layout.nodePositions,
        clusterPositions: this.layout.clusterPositions,
      });
    }

    // Update animation when enableAnimation changes
    if (changedProps.has('enableAnimation')) {
      const enableAnimation = this.enableAnimation ?? false;
      this.layout.enableAnimation = enableAnimation;

      // If toggled on/off after initial render, re-run layout or stop animation
      if (!enableAnimation) {
        this.layout.stopAnimation();
      } else if (this.nodes && this.edges) {
        this.layout.computeLayout(this.nodes, this.edges);
      }
    }

    // Update interaction config when zoom changes
    if (changedProps.has('zoom')) {
      this.interaction.updateConfig({
        zoom: this.zoom ?? 1,
        finalNodePositions: this.layout.nodePositions,
        clusterPositions: this.layout.clusterPositions,
      });
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

  @eventOptions({ passive: true })
  private handleWheel(e: WheelEvent) {
    // Only zoom if Ctrl/Cmd key is pressed (also captures trackpad pinch)
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }

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

  override render(): TemplateResult {
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
          this.dispatchEvent(
            new CustomEvent('toggle-animation', { bubbles: true, composed: true }),
          )}
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
          ${
            this.nodes?.length
              ? svg`
                <!-- Cross-cluster edges -->
                <g class="cluster-edges">
                  ${renderGraphEdges({
                    edges: this.edges ?? [],
                    nodes: this.nodes ?? [],
                    nodeMap: this.nodeMap,
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
                ${this.layout.clusters.map((cluster) => {
                  const position = this.layout.clusterPositions.get(cluster.id);
                  if (!position) return null;

                  const isSelected = this.selectedCluster === cluster.id;

                  return renderClusterGroup({
                    cluster,
                    clusterPosition: position,
                    nodes: this.nodes ?? [],
                    edges: this.edges ?? [],
                    layoutNodePositions: this.layout.nodePositions,
                    manualNodePositions: this.interaction.manualNodePositions,
                    selectedNode: this.selectedNode ?? null,
                    hoveredNode: this.hoveredNode ?? null,
                    isClusterHovered: this.hoveredCluster === cluster.id,
                    isClusterSelected: isSelected,
                    searchQuery: this.searchQuery ?? '',
                    zoom: this.zoom ?? 1,
                    previewFilter: this.previewFilter ?? null,
                    onClusterClick: () =>
                      this.dispatchEvent(
                        new CustomEvent('cluster-select', {
                          detail: { clusterId: cluster.id },
                          bubbles: true,
                          composed: true,
                        }),
                      ),
                    onClusterMouseEnter: () => {
                      this.hoveredCluster = cluster.id;
                    },
                    onClusterMouseLeave: () => {
                      this.hoveredCluster = null;
                    },
                    onNodeMouseEnter: (nodeId) =>
                      this.dispatchEvent(
                        new CustomEvent('node-hover', {
                          detail: { nodeId },
                          bubbles: true,
                          composed: true,
                        }),
                      ),
                    onNodeMouseLeave: () =>
                      this.dispatchEvent(
                        new CustomEvent('node-hover', {
                          detail: { nodeId: null },
                          bubbles: true,
                          composed: true,
                        }),
                      ),
                    onNodeMouseDown: (nodeId, e) => this.interaction.handleNodeMouseDown(nodeId, e),
                    onNodeClick: (node) => {
                      if (!this.interaction.hasMoved) {
                        this.dispatchEvent(
                          new CustomEvent('node-select', {
                            detail: { node },
                            bubbles: true,
                            composed: true,
                          }),
                        );
                      }
                    },
                  });
                })}
              `
              : ''
          }
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
