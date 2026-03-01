import { __decorate } from "tslib";
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { DependencyKind, Origin } from '@shared/schemas/graph.types';
import { css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import './badge.js';
import './list-item-row.js';
import { NodeListEventsBase } from './node-list-events';
/** Dependency kind colors and labels */
const DEPENDENCY_KIND_CONFIG = {
    [DependencyKind.Target]: { label: 'Target', color: 'var(--colors-success)' },
    [DependencyKind.Project]: { label: 'Project', color: 'var(--colors-info)' },
    [DependencyKind.Sdk]: { label: 'SDK', color: 'var(--colors-primary)' },
    [DependencyKind.XCFramework]: { label: 'XCF', color: 'var(--colors-warning)' },
};
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <xcode-graph-badge class="kind-badge" variant="rounded" size="sm"></xcode-graph-badge>
    `, parts: [{ type: 1, index: 0, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: A_1 }] };
const lit_template_2 = { h: b_1 `
      <div class="header">
        <div>
          <span class="header-title"><?></span>
          <span class="count"><?></span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 3 }, { type: 2, index: 5 }, { type: 1, index: 6, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 8 }] };
const lit_template_3 = { h: b_1 `
          <div class="content">
            <?>
          </div>
        `, parts: [{ type: 2, index: 1 }] };
const lit_template_4 = { h: b_1 `<div class="empty"><?></div>`, parts: [{ type: 2, index: 1 }] };
const lit_template_5 = { h: b_1 `
                  <div class="list">
                    <?>
                  </div>
                `, parts: [{ type: 2, index: 1 }] };
const lit_template_6 = { h: b_1 `
                        <div class="item-row">
                          <div class="item-content">
                            <xcode-graph-list-item-row></xcode-graph-list-item-row>
                          </div>
                          <?>
                        </div>
                      `, parts: [{ type: 1, index: 2, name: "node", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "subtitle", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "row-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "row-hover", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "row-hover-end", strings: ["", ""], ctor: E_1 }, { type: 2, index: 3 }] };
/**
 * A unified list component for displaying nodes with a section header.
 * Used for dependencies, dependents, and other node list displays.
 * Supports displaying dependency kind badges when edge information is provided.
 *
 * @summary Collapsible node list with section header and kind badges
 * @fires node-select - Dispatched when a node row is clicked (detail: { node })
 * @fires node-hover - Dispatched on node row hover (detail: { nodeId })
 */
export class GraphNodeList extends NodeListEventsBase {
    constructor() {
        super();
        this.title = '';
        this.suffix = '';
        this.emptyMessage = 'No items';
        this.zoom = 1;
        this.showKind = true;
        this.isExpanded = true;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .header:hover .header-title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .header-title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-muted-foreground);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .count {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      opacity: var(--opacity-50);
      margin-left: var(--spacing-2);
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
      margin-top: var(--spacing-2);
    }

    .empty {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      font-style: italic;
    }

    .list {
      display: block;
      max-height: 300px;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-1);
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .kind-badge {
      flex-shrink: 0;
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
    get itemList() {
        // Support both new items prop and legacy nodes prop
        if (this.items && this.items.length > 0) {
            return this.items;
        }
        // Legacy: wrap plain nodes in NodeWithEdge format
        if (this.nodes && this.nodes.length > 0) {
            return this.nodes.map((node) => ({
                node,
                edge: { source: '', target: node.id },
            }));
        }
        return [];
    }
    getNodeSubtitle(node) {
        const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
        return node.origin === Origin.External ? `External ${typeLabel}` : typeLabel;
    }
    renderKindBadge(item) {
        if (!this.showKind || !item.edge.kind)
            return nothing;
        const config = DEPENDENCY_KIND_CONFIG[item.edge.kind] || {
            label: item.edge.kind,
            color: 'var(--colors-muted-foreground)',
        };
        return { ["_$litType$"]: lit_template_1, values: [config.label, config.color] };
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const items = this.itemList;
        const count = items.length;
        const countText = this.suffix ? `${count} ${this.suffix}` : `${count}`;
        return { ["_$litType$"]: lit_template_2, values: [this.toggleExpanded, this.title, countText, classMap({ 'toggle-icon': true, expanded: this.isExpanded }), when(this.isExpanded, () => ({ ["_$litType$"]: lit_template_3, values: [count === 0
                            ? { ["_$litType$"]: lit_template_4, values: [this.emptyMessage] } : { ["_$litType$"]: lit_template_5, values: [virtualize({
                                    items,
                                    renderItem: (item) => ({ ["_$litType$"]: lit_template_6, values: [item.node, this.getNodeSubtitle(item.node), this.zoom, this.handleNodeSelect, this.handleNodeHover, this.handleHoverEnd, this.renderKindBadge(item)] }),
                                    keyFunction: (item) => item.node.id,
                                })] }] }))] };
    }
}
__decorate([
    property({ type: String })
], GraphNodeList.prototype, "title", void 0);
__decorate([
    property({ attribute: false })
], GraphNodeList.prototype, "items", void 0);
__decorate([
    property({ attribute: false })
], GraphNodeList.prototype, "nodes", void 0);
__decorate([
    property({ type: String })
], GraphNodeList.prototype, "suffix", void 0);
__decorate([
    property({ type: String, attribute: 'empty-message' })
], GraphNodeList.prototype, "emptyMessage", void 0);
__decorate([
    property({ type: Number })
], GraphNodeList.prototype, "zoom", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-kind' })
], GraphNodeList.prototype, "showKind", void 0);
__decorate([
    state()
], GraphNodeList.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-list')) {
    customElements.define('xcode-graph-node-list', GraphNodeList);
}
//# sourceMappingURL=node-list.js.map