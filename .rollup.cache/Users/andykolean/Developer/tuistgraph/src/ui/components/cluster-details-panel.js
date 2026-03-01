import { __decorate } from "tslib";
/**
 * ClusterDetailsPanel Lit Component
 *
 * Full cluster details panel orchestrating all cluster detail components.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-details-panel
 *   .cluster=${clusterData}
 *   .clusterNodes=${nodes}
 *   .edges=${edges}
 * ></xcode-graph-cluster-details-panel>
 * ```
 */
import { computeClusterStats } from '@graph/utils/node-utils';
import { generateColor } from '@ui/utils/color-generator';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './cluster-composition.js';
import './cluster-header';
import './cluster-stats';
import './cluster-targets-list';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_2 = { h: b_1 `
      <div class="scrollable">
        <xcode-graph-cluster-header></xcode-graph-cluster-header>

        <xcode-graph-cluster-stats></xcode-graph-cluster-stats>

        <xcode-graph-cluster-composition></xcode-graph-cluster-composition>

        <xcode-graph-cluster-targets-list></xcode-graph-cluster-targets-list>
      </div>
    `, parts: [{ type: 1, index: 1, name: "cluster-name", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "cluster-type", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "cluster-color", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "cluster-path", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "is-external", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "back", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "filtered-dependencies", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "total-dependencies", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "filtered-dependents", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "total-dependents", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "active-direct-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 2, name: "active-direct-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 2, name: "platforms", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "targetBreakdown", strings: ["", ""], ctor: P_1 }, { type: 1, index: 3, name: "nodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "clusterNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "nodesByType", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "filtered-targets-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 4, name: "total-targets-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 4, name: "edges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "node-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "node-hover", strings: ["", ""], ctor: E_1 }] };
/**
 * Full cluster details panel orchestrating all cluster detail components
 * including header, stats, composition, and targets list.
 *
 * @summary Cluster details panel with header, stats, and targets
 *
 * @fires close - Dispatched when the back button is clicked
 * @fires node-select - Dispatched when a target node is selected (detail: { node })
 * @fires node-hover - Dispatched when a target node is hovered (detail: { nodeId })
 */
export class GraphClusterDetailsPanel extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      animation: panelSlideIn var(--durations-slow) var(--easings-out);
    }

    @keyframes panelSlideIn {
      from {
        opacity: 0;
        transform: translateX(12px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .scrollable {
      flex: 1;
      overflow-y: auto;
      padding-bottom: var(--spacing-lg);
      scrollbar-width: thin;
      scrollbar-color: rgba(var(--colors-primary-rgb), var(--opacity-20)) transparent;
    }
  `;
    // ========================================
    // Computed Values
    // ========================================
    get stats() {
        return computeClusterStats(this.clusterNodes, this.edges, this.filteredEdges);
    }
    get clusterColor() {
        return adjustColorForZoom(generateColor(this.cluster.name, this.cluster.type), this.zoom);
    }
    get targetBreakdown() {
        const breakdown = {};
        for (const node of this.clusterNodes) {
            breakdown[node.type] = (breakdown[node.type] || 0) + 1;
        }
        return breakdown;
    }
    // ========================================
    // Event Handlers
    // ========================================
    bubbleEvent(eventName, detail) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.cluster)
            return { ["_$litType$"]: lit_template_1, values: [] };
        const isExternal = this.cluster.origin === 'external';
        return { ["_$litType$"]: lit_template_2, values: [this.cluster.name, this.cluster.type, this.clusterColor, this.cluster.path || '', isExternal, () => this.bubbleEvent('close'), this.stats.filteredDependencies, this.stats.totalDependencies, this.stats.filteredDependents, this.stats.totalDependents, this.activeDirectDeps, this.activeDirectDependents, this.stats.platforms, this.targetBreakdown, this.clusterNodes, this.clusterNodes, this.clusterNodes.reduce((acc, node) => {
                    const type = node.type;
                    acc[type] ??= [];
                    acc[type].push(node);
                    return acc;
                }, {}), this.stats.filteredTargetsCount, this.clusterNodes.length, this.edges, this.zoom, (e) => this.bubbleEvent('node-select', e.detail), (e) => this.bubbleEvent('node-hover', e.detail)] };
    }
}
__decorate([
    property({ attribute: false })
], GraphClusterDetailsPanel.prototype, "cluster", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterDetailsPanel.prototype, "clusterNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterDetailsPanel.prototype, "allNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterDetailsPanel.prototype, "edges", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterDetailsPanel.prototype, "filteredEdges", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-direct-deps' })
], GraphClusterDetailsPanel.prototype, "activeDirectDeps", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-direct-dependents' })
], GraphClusterDetailsPanel.prototype, "activeDirectDependents", void 0);
__decorate([
    property({ type: Number })
], GraphClusterDetailsPanel.prototype, "zoom", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-details-panel')) {
    customElements.define('xcode-graph-cluster-details-panel', GraphClusterDetailsPanel);
}
//# sourceMappingURL=cluster-details-panel.js.map