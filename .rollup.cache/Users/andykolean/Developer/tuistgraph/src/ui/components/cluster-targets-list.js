import { __decorate } from "tslib";
/**
 * ClusterTargetsList Lit Component
 *
 * List of cluster target nodes GROUPED BY TYPE using ListItemRow components.
 * Matches React version with full grouping and stats.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-targets-list
 *   .nodesByType=${nodesByType}
 *   .edges=${edges}
 *   filtered-targets-count="5"
 *   total-targets-count="10"
 * ></xcode-graph-cluster-targets-list>
 * ```
 *
 * @fires node-select - Dispatched when target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import { NodeListEventsBase } from './node-list-events';
import './list-item-row';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_2 = { h: b_1 `
      <div class="header">
        <span class="main-title">
          Targets (<?>/<?>)
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 2 }, { type: 2, index: 3 }, { type: 1, index: 4, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 6 }] };
const lit_template_3 = { h: b_1 `
          <div class="content">
            <div class="target-list">
              <?>
            </div>
          </div>
        `, parts: [{ type: 2, index: 2 }] };
const lit_template_4 = { h: b_1 `<div class="type-header"><?> (<?>)</div>`, parts: [{ type: 2, index: 1 }, { type: 2, index: 2 }] };
const lit_template_5 = { h: b_1 `
                        <xcode-graph-list-item-row></xcode-graph-list-item-row>
                      `, parts: [{ type: 1, index: 0, name: "node", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "subtitle", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "row-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "row-hover", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "row-hover-end", strings: ["", ""], ctor: E_1 }] };
/**
 * List of cluster target nodes grouped by type using ListItemRow components.
 * Shows targets organized by node type with dependency/dependent counts.
 *
 * @summary Collapsible cluster targets list grouped by node type
 *
 * @fires node-select - Dispatched when a target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */
export class GraphClusterTargetsList extends NodeListEventsBase {
    constructor() {
        super();
        this.expanded = true;
        this.isExpanded = true;
    }
    connectedCallback() {
        super.connectedCallback();
        this.isExpanded = this.expanded;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      padding: var(--spacing-md);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .header:hover .main-title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .main-title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-muted-foreground);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .toggle-icon {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      color: var(--colors-muted-foreground);
      opacity: var(--opacity-40);
      transition: transform var(--durations-fast) var(--easings-out), color var(--durations-normal), opacity var(--durations-normal);
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .content {
      margin-top: var(--spacing-md);
    }

    .target-list {
      display: block;
      max-height: 400px;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .type-header {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-sm);
      margin-top: var(--spacing-3);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .type-header:first-child {
      margin-top: 0;
    }

    xcode-graph-list-item-row {
      margin-bottom: var(--spacing-1);
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
    get flatItems() {
        if (!this.nodesByType)
            return [];
        const items = [];
        for (const [type, nodes] of Object.entries(this.nodesByType)) {
            items.push({ kind: 'header', nodeType: type, count: nodes.length });
            for (const node of nodes) {
                items.push({ kind: 'node', node, stats: this.getNodeStats(node.id) });
            }
        }
        return items;
    }
    getNodeStats(nodeId) {
        if (!this.edges)
            return { dependencies: 0, dependents: 0 };
        const dependencies = this.edges.filter((e) => e.source === nodeId).length;
        const dependents = this.edges.filter((e) => e.target === nodeId).length;
        return { dependencies, dependents };
    }
    formatNodeStatsSubtitle(stats) {
        const parts = [];
        if (stats.dependencies > 0) {
            parts.push(`${stats.dependencies} dep${stats.dependencies === 1 ? '' : 's'}`);
        }
        if (stats.dependents > 0) {
            parts.push(`${stats.dependents} dependent${stats.dependents === 1 ? '' : 's'}`);
        }
        return parts.length > 0 ? parts.join(' · ') : undefined;
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.nodesByType)
            return { ["_$litType$"]: lit_template_1, values: [] };
        return { ["_$litType$"]: lit_template_2, values: [this.toggleExpanded, this.filteredTargetsCount || 0, this.totalTargetsCount || 0, classMap({ 'toggle-icon': true, expanded: this.isExpanded }), when(this.isExpanded, () => ({ ["_$litType$"]: lit_template_3, values: [virtualize({
                            items: this.flatItems,
                            renderItem: (item) => item.kind === 'header'
                                ? { ["_$litType$"]: lit_template_4, values: [getNodeTypeLabel(item.nodeType), item.count] } : { ["_$litType$"]: lit_template_5, values: [item.node, this.formatNodeStatsSubtitle(item.stats) || '', this.zoom, this.handleNodeSelect, this.handleNodeHover, this.handleHoverEnd] },
                            keyFunction: (item) => item.kind === 'header' ? `header-${item.nodeType}` : item.node.id,
                        })] }))] };
    }
}
__decorate([
    property({ attribute: false })
], GraphClusterTargetsList.prototype, "clusterNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterTargetsList.prototype, "nodesByType", void 0);
__decorate([
    property({ type: Number, attribute: 'filtered-targets-count' })
], GraphClusterTargetsList.prototype, "filteredTargetsCount", void 0);
__decorate([
    property({ type: Number, attribute: 'total-targets-count' })
], GraphClusterTargetsList.prototype, "totalTargetsCount", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterTargetsList.prototype, "edges", void 0);
__decorate([
    property({ type: Number })
], GraphClusterTargetsList.prototype, "zoom", void 0);
__decorate([
    property({ type: Boolean })
], GraphClusterTargetsList.prototype, "expanded", void 0);
__decorate([
    state()
], GraphClusterTargetsList.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-targets-list')) {
    customElements.define('xcode-graph-cluster-targets-list', GraphClusterTargetsList);
}
//# sourceMappingURL=cluster-targets-list.js.map