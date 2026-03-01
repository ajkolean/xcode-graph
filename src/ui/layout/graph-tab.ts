/**
 * GraphTab Lit Component
 *
 * Main graph tab orchestrator - coordinates GraphVisualization and RightSidebar.
 * Uses Lit Signals for state management.
 *
 * @example
 * ```html
 * <xcode-graph-tab
 *   .displayNodes=${nodes}
 *   .displayEdges=${edges}
 *   .allNodes=${allNodes}
 * ></xcode-graph-tab>
 * ```
 */

import type { GraphCanvas } from '@graph/components/graph-canvas';
import type { TransitiveResult } from '@graph/utils';
import { computed, Signal, SignalWatcher, watch } from '@lit-labs/signals';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@graph/components/graph-canvas';
import '@graph/components/graph-overlays';
import '../components/right-sidebar';

import {
  dimmedNodeIds,
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
  hoveredNode,
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
  setHoveredNode,
  viewMode,
} from '@graph/signals/index';
import {
  baseZoom,
  enableAnimation,
  previewFilter,
  searchQuery,
  setZoom,
  toggleAnimation,
  zoom,
  zoomIn,
  zoomOut,
} from '@shared/signals/index';

/** Computed: search query with empty string fallback (avoids attribute removal) */
const searchQueryValue = computed(() => searchQuery.get() || '');

const SignalWatcherLitElement = SignalWatcher(LitElement) as typeof LitElement;

/**
 * Main graph tab orchestrator that coordinates the graph canvas, overlays,
 * and right sidebar. Uses Lit Signals for reactive state management.
 *
 * @summary Graph tab layout orchestrator
 * @slot filter-view - Slot for injecting a custom filter view into the right sidebar
 */
export class GraphTab extends SignalWatcherLitElement {
  @query('xcode-graph-canvas')
  private declare canvasElement: GraphCanvas;

  /** Nodes to render on the canvas (after search/filter/highlight processing) */
  @property({ attribute: false })
  declare displayNodes: GraphNode[];

  /** Edges to render on the canvas (after search/filter/highlight processing) */
  @property({ attribute: false })
  declare displayEdges: GraphEdge[];

  /** Nodes remaining after filter application (for sidebar stats) */
  @property({ attribute: false })
  declare filteredNodes: GraphNode[];

  /** Edges remaining after filter application (for sidebar stats) */
  @property({ attribute: false })
  declare filteredEdges: GraphEdge[];

  /** All nodes in the graph (unfiltered, for sidebar filter computation) */
  @property({ attribute: false })
  declare allNodes: GraphNode[];

  /** All edges in the graph (unfiltered, for sidebar filter computation) */
  @property({ attribute: false })
  declare allEdges: GraphEdge[];

  /** Available clusters from the layout engine */
  @property({ attribute: false })
  declare clusters: Cluster[] | undefined;

  /** Transitive dependency chain for the selected node */
  @property({ attribute: false })
  declare transitiveDeps: TransitiveResult;

  /** Transitive dependent chain for the selected node */
  @property({ attribute: false })
  declare transitiveDependents: TransitiveResult;

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .container {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    .content {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
      min-height: 0;
    }

    .graph-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      min-height: 0;
    }
  `;

  private handleNodeSelect(e: CustomEvent) {
    selectNode(e.detail.node);
  }

  private handleClusterSelect(e: CustomEvent) {
    selectCluster(e.detail.clusterId);
  }

  private handleNodeHover(e: CustomEvent) {
    setHoveredNode(e.detail.nodeId);
  }

  private handleZoomIn() {
    zoomIn();
  }

  private handleZoomOut() {
    zoomOut();
  }

  private handleZoomStep(e: CustomEvent<number>) {
    setZoom(e.detail);
  }

  private handleZoomReset() {
    // Fit to viewport instead of resetting to 1.0
    this.canvasElement?.fitToViewport();
  }

  private handleToggleAnimation() {
    toggleAnimation();
  }

  private handleZoomChange(e: CustomEvent) {
    setZoom(e.detail);
  }

  override render(): TemplateResult {
    return html`
      <div class="container">
        <!-- Graph + Sidebar -->
        <div class="content">
          <div class="graph-container">
            <xcode-graph-controls
              .zoom=${watch(zoom)}
              .baseZoom=${watch(baseZoom)}
              .nodeCount=${this.displayNodes.length}
              .edgeCount=${this.displayEdges.length}
              ?enable-animation=${watch(enableAnimation)}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-step=${this.handleZoomStep}
              @zoom-reset=${this.handleZoomReset}
              @toggle-animation=${this.handleToggleAnimation}
            ></xcode-graph-controls>

            <xcode-graph-canvas
              .nodes=${this.displayNodes}
              .edges=${this.displayEdges}
              .selectedNode=${watch(selectedNode)}
              .selectedCluster=${watch(selectedCluster)}
              .hoveredNode=${Signal.subtle.untrack(() => hoveredNode.get())}
              search-query=${watch(searchQueryValue)}
              view-mode=${watch(viewMode)}
              .zoom=${watch(zoom)}
              ?enable-animation=${watch(enableAnimation)}
              .transitiveDeps=${this.transitiveDeps}
              .transitiveDependents=${this.transitiveDependents}
              .previewFilter=${watch(previewFilter)}
              .dimmedNodeIds=${watch(dimmedNodeIds)}
              ?show-direct-deps=${watch(highlightDirectDeps)}
              ?show-transitive-deps=${watch(highlightTransitiveDeps)}
              ?show-direct-dependents=${watch(highlightDirectDependents)}
              ?show-transitive-dependents=${watch(highlightTransitiveDependents)}
              @node-select=${this.handleNodeSelect}
              @cluster-select=${this.handleClusterSelect}
              @node-hover=${this.handleNodeHover}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-reset=${this.handleZoomReset}
              @zoom-change=${this.handleZoomChange}
              @toggle-animation=${this.handleToggleAnimation}
            ></xcode-graph-canvas>
          </div>

          <!-- Right Sidebar -->
          <xcode-graph-right-sidebar
            .allNodes=${this.allNodes}
            .allEdges=${this.allEdges}
            .filteredNodes=${this.filteredNodes}
            .filteredEdges=${this.filteredEdges}
            .clusters=${this.clusters}
            collapsed
          >
            <slot name="filter-view" slot="filter-view"></slot>
          </xcode-graph-right-sidebar>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-tab': GraphTab;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-tab')) {
  customElements.define('xcode-graph-tab', GraphTab);
}
