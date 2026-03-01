/**
 * SidebarCollapseIcon Lit Component
 *
 * Displays chevrons pointing left (collapsed) or right (expanded).
 * Used in sidebar header to indicate collapse/expand state.
 *
 * @example
 * ```html
 * <xcode-graph-sidebar-collapse-icon is-collapsed></xcode-graph-sidebar-collapse-icon>
 * <xcode-graph-sidebar-collapse-icon></xcode-graph-sidebar-collapse-icon>
 * ```
 */
import { __decorate } from "tslib";
import { css, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
/**
 * Displays chevrons pointing left (collapsed) or right (expanded)
 * to indicate sidebar collapse/expand state.
 *
 * @summary Animated collapse/expand chevron icon
 */
export class GraphSidebarCollapseIcon extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: inline-block;
    }

    svg {
      display: block;
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        return svg `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        ${this.isCollapsed
            ? svg `
                <path d="M11 7l-5 5l5 5"></path>
                <path d="M17 7l-5 5l5 5"></path>
              `
            : svg `
                <path d="M7 7l5 5l-5 5"></path>
                <path d="M13 7l5 5l-5 5"></path>
              `}
      </svg>
    `;
    }
}
__decorate([
    property({ type: Boolean, attribute: 'is-collapsed' })
], GraphSidebarCollapseIcon.prototype, "isCollapsed", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-sidebar-collapse-icon')) {
    customElements.define('xcode-graph-sidebar-collapse-icon', GraphSidebarCollapseIcon);
}
//# sourceMappingURL=sidebar-collapse-icon.js.map