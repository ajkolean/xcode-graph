import { __decorate } from "tslib";
import { computed, Signal, SignalWatcher, watch } from '@lit-labs/signals';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@graph/components/graph-canvas';
import '@graph/components/graph-overlays';
import '../components/right-sidebar';
// Import signals
// Import actions
import { highlightDirectDependents, highlightDirectDeps, highlightTransitiveDependents, highlightTransitiveDeps, hoveredNode, selectCluster, selectedCluster, selectedNode, selectNode, setHoveredNode, viewMode, } from '@graph/signals/index';
import { baseZoom, enableAnimation, previewFilter, searchQuery, setZoom, toggleAnimation, zoom, zoomIn, zoomOut, } from '@shared/signals/index';
/** Computed: search query with empty string fallback (avoids attribute removal) */
const searchQueryValue = computed(() => searchQuery.get() || '');
const SignalWatcherLitElement = SignalWatcher(LitElement);
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="container">
        <!-- Graph + Sidebar -->
        <div class="content">
          <div class="graph-container">
            <xcode-graph-controls></xcode-graph-controls>

            <xcode-graph-canvas></xcode-graph-canvas>
          </div>

          <!-- Right Sidebar -->
          <xcode-graph-right-sidebar collapsed="">
            <slot name="filter-view" slot="filter-view"></slot>
          </xcode-graph-right-sidebar>
        </div>
      </div>
    `, parts: [{ type: 1, index: 4, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "baseZoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "nodeCount", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "edgeCount", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "enable-animation", strings: ["", ""], ctor: B_1 }, { type: 1, index: 4, name: "zoom-in", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "zoom-out", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "zoom-step", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "zoom-reset", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "toggle-animation", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "nodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "edges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "selectedNode", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "selectedCluster", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "hoveredNode", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "search-query", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "view-mode", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "enable-animation", strings: ["", ""], ctor: B_1 }, { type: 1, index: 5, name: "transitiveDeps", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "transitiveDependents", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "previewFilter", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "show-direct-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 5, name: "show-transitive-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 5, name: "show-direct-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 5, name: "show-transitive-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 5, name: "node-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "cluster-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "node-hover", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "zoom-in", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "zoom-out", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "zoom-reset", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "zoom-change", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "toggle-animation", strings: ["", ""], ctor: E_1 }, { type: 1, index: 7, name: "allNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 7, name: "allEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 7, name: "filteredNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 7, name: "filteredEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 7, name: "clusters", strings: ["", ""], ctor: P_1 }] };
/**
 * Main graph tab orchestrator that coordinates the graph canvas, overlays,
 * and right sidebar. Uses Lit Signals for reactive state management.
 *
 * @summary Graph tab layout orchestrator
 * @slot filter-view - Slot for injecting a custom filter view into the right sidebar
 */
export class GraphTab extends SignalWatcherLitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
    handleNodeSelect(e) {
        selectNode(e.detail.node);
    }
    handleClusterSelect(e) {
        selectCluster(e.detail.clusterId);
    }
    handleNodeHover(e) {
        setHoveredNode(e.detail.nodeId);
    }
    handleZoomIn() {
        zoomIn();
    }
    handleZoomOut() {
        zoomOut();
    }
    handleZoomStep(e) {
        setZoom(e.detail);
    }
    handleZoomReset() {
        // Fit to viewport instead of resetting to 1.0
        this.canvasElement?.fitToViewport();
    }
    handleToggleAnimation() {
        toggleAnimation();
    }
    handleZoomChange(e) {
        setZoom(e.detail);
    }
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [watch(zoom), watch(baseZoom), this.displayNodes.length, this.displayEdges.length, watch(enableAnimation), this.handleZoomIn, this.handleZoomOut, this.handleZoomStep, this.handleZoomReset, this.handleToggleAnimation, this.displayNodes, this.displayEdges, watch(selectedNode), watch(selectedCluster), Signal.subtle.untrack(() => hoveredNode.get()), watch(searchQueryValue), watch(viewMode), watch(zoom), watch(enableAnimation), this.transitiveDeps, this.transitiveDependents, watch(previewFilter), watch(highlightDirectDeps), watch(highlightTransitiveDeps), watch(highlightDirectDependents), watch(highlightTransitiveDependents), this.handleNodeSelect, this.handleClusterSelect, this.handleNodeHover, this.handleZoomIn, this.handleZoomOut, this.handleZoomReset, this.handleZoomChange, this.handleToggleAnimation, this.allNodes, this.allEdges, this.filteredNodes, this.filteredEdges, this.clusters] };
    }
}
__decorate([
    query('xcode-graph-canvas')
], GraphTab.prototype, "canvasElement", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "displayNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "displayEdges", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "filteredNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "filteredEdges", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "allNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "allEdges", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "clusters", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "transitiveDeps", void 0);
__decorate([
    property({ attribute: false })
], GraphTab.prototype, "transitiveDependents", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-tab')) {
    customElements.define('xcode-graph-tab', GraphTab);
}
//# sourceMappingURL=graph-tab.js.map