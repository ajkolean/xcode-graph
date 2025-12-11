/**
 * GraphTab Lit Component
 *
 * Main graph tab orchestrator - coordinates GraphVisualization and RightSidebar.
 * Uses Lit Signals for state management.
 *
 * @example
 * ```html
 * <graph-tab
 *   .displayNodes=${nodes}
 *   .displayEdges=${edges}
 *   .allNodes=${allNodes}
 * ></graph-tab>
 * ```
 */

import type { TransitiveResult } from '@graph/utils';
import { Signal, SignalWatcher } from '@lit-labs/signals';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import '@graph/components/graph-visualization';
import '@graph/components/graph-canvas';
import '../components/right-sidebar';

// Import signals
// Import actions
import {
  hoveredNode,
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
  setHoveredNode,
  viewMode,
} from '@graph/signals/index';
import {
  enableAnimation,
  previewFilter,
  resetZoom,
  searchQuery,
  toggleAnimation,
  zoom,
  zoomIn,
  zoomOut,
} from '@shared/signals/index';

export class GraphTab extends SignalWatcher(LitElement) {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare displayNodes: GraphNode[];

  @property({ attribute: false })
  declare displayEdges: GraphEdge[];

  @property({ attribute: false })
  declare filteredNodes: GraphNode[];

  @property({ attribute: false })
  declare filteredEdges: GraphEdge[];

  @property({ attribute: false })
  declare allNodes: GraphNode[];

  @property({ attribute: false })
  declare allEdges: GraphEdge[];

  @property({ attribute: false })
  declare clusters: Cluster[] | undefined;

  @property({ attribute: false })
  declare transitiveDeps: TransitiveResult;

  @property({ attribute: false })
  declare transitiveDependents: TransitiveResult;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
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

  // ========================================
  // Event Handlers (delegate to signal actions)
  // ========================================

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

  private handleZoomReset() {
    resetZoom();
  }

  private handleToggleAnimation() {
    toggleAnimation();
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    return html`
      <div class="container">
        <!-- Graph + Sidebar -->
        <div class="content">
          <!-- Graph Visualization -->
          <div class="graph-container">
            <!--
            <graph-visualization
              .nodes=${this.displayNodes}
              .edges=${this.displayEdges}
              .selectedNode=${selectedNode.get()}
              .selectedCluster=${selectedCluster.get()}
              .hoveredNode=${Signal.subtle.untrack(() => hoveredNode.get())}
              search-query=${searchQuery.get() || ''}
              view-mode=${viewMode.get()}
              .zoom=${zoom.get()}
              ?enable-animation=${enableAnimation.get()}
              .transitiveDeps=${this.transitiveDeps}
              .transitiveDependents=${this.transitiveDependents}
              .previewFilter=${previewFilter.get()}
              @node-select=${this.handleNodeSelect}
              @cluster-select=${this.handleClusterSelect}
              @node-hover=${this.handleNodeHover}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-reset=${this.handleZoomReset}
              @toggle-animation=${this.handleToggleAnimation}
            ></graph-visualization>
            -->
            
            <graph-canvas
              .nodes=${this.displayNodes}
              .edges=${this.displayEdges}
              .selectedNode=${selectedNode.get()}
              .selectedCluster=${selectedCluster.get()}
              .hoveredNode=${Signal.subtle.untrack(() => hoveredNode.get())}
              search-query=${searchQuery.get() || ''}
              view-mode=${viewMode.get()}
              .zoom=${zoom.get()}
              ?enable-animation=${enableAnimation.get()}
              .transitiveDeps=${this.transitiveDeps}
              .transitiveDependents=${this.transitiveDependents}
              .previewFilter=${previewFilter.get()}
              @node-select=${this.handleNodeSelect}
              @cluster-select=${this.handleClusterSelect}
              @node-hover=${this.handleNodeHover}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-reset=${this.handleZoomReset}
              @toggle-animation=${this.handleToggleAnimation}
            ></graph-canvas>
          </div>

          <!-- Right Sidebar -->
          <graph-right-sidebar
            .allNodes=${this.allNodes}
            .allEdges=${this.allEdges}
            .filteredNodes=${this.filteredNodes}
            .filteredEdges=${this.filteredEdges}
            .clusters=${this.clusters}
          >
            <slot name="filter-view" slot="filter-view"></slot>
          </graph-right-sidebar>
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-tab': GraphTab;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-tab')) {
  customElements.define('graph-tab', GraphTab);
}