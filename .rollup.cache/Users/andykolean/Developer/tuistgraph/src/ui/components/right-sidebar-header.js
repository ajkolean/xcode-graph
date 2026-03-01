import { __decorate } from "tslib";
/**
 * RightSidebarHeader Lit Component
 *
 * Header for right sidebar with title and collapse button.
 * Already uses LitSidebarCollapseIcon.
 *
 * @example
 * ```html
 * <xcode-graph-right-sidebar-header
 *   title="Filters"
 *   is-collapsed
 * ></xcode-graph-right-sidebar-header>
 * ```
 *
 * @fires toggle-collapse - Dispatched when collapse button is clicked
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './sidebar-collapse-icon';
import './icon-button.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="container">
        <?>
        <xcode-graph-icon-button variant="ghost" color="neutral">
          <xcode-graph-sidebar-collapse-icon></xcode-graph-sidebar-collapse-icon>
        </xcode-graph-icon-button>
      </div>
    `, parts: [{ type: 2, index: 1 }, { type: 1, index: 2, name: "title", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "is-collapsed", strings: ["", ""], ctor: B_1 }] };
const lit_template_2 = { h: b_1 `
          <div class="title-wrapper">
            <h2 class="title"><?></h2>
            <?>
          </div>
        `, parts: [{ type: 2, index: 2 }, { type: 2, index: 3 }] };
const lit_template_3 = { h: b_1 `<span class="filters-active-dot" title="Filters active"></span>`, parts: [] };
/**
 * Header for the right sidebar with title and collapse button.
 * Shows an active filters indicator dot when filters are applied.
 *
 * @summary Right sidebar header with collapse toggle
 * @fires toggle-collapse - Dispatched when the collapse button is clicked
 */
export class GraphRightSidebarHeader extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      padding: var(--spacing-2) var(--spacing-md);
      flex-shrink: 0;
      border-bottom: var(--border-widths-thin) solid var(--colors-sidebar-border);
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      transition: opacity var(--durations-normal) var(--easings-out);
    }

    .title-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .filters-active-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--colors-primary);
      flex-shrink: 0;
      box-shadow: 0 0 6px rgba(var(--colors-primary-rgb), 0.5);
    }

    graph-icon-button {
      margin-left: auto;
    }

    graph-icon-button:hover {
      transform: scale(1.08);
      transition: transform var(--durations-fast) var(--easings-out);
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleToggle() {
        this.dispatchEvent(new CustomEvent('toggle-collapse', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.isCollapsed || !this.title
                    ? ''
                    : { ["_$litType$"]: lit_template_2, values: [this.title, this.hasActiveFilters ? { ["_$litType$"]: lit_template_3, values: [] } : ''] }, this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar', this.handleToggle, this.isCollapsed] };
    }
}
__decorate([
    property({ type: String })
], GraphRightSidebarHeader.prototype, "title", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-collapsed' })
], GraphRightSidebarHeader.prototype, "isCollapsed", void 0);
__decorate([
    property({ type: Boolean, attribute: 'has-active-filters' })
], GraphRightSidebarHeader.prototype, "hasActiveFilters", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-right-sidebar-header')) {
    customElements.define('xcode-graph-right-sidebar-header', GraphRightSidebarHeader);
}
//# sourceMappingURL=right-sidebar-header.js.map