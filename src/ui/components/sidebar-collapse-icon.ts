/**
 * SidebarCollapseIcon Lit Component
 *
 * Displays chevrons pointing left (collapsed) or right (expanded).
 * Used in sidebar header to indicate collapse/expand state.
 *
 * @example
 * ```html
 * <graph-sidebar-collapse-icon is-collapsed></graph-sidebar-collapse-icon>
 * <graph-sidebar-collapse-icon></graph-sidebar-collapse-icon>
 * ```
 */

import { type CSSResultGroup, css, LitElement, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export class GraphSidebarCollapseIcon extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * Whether the sidebar is collapsed
   */
  @property({ type: Boolean, attribute: 'is-collapsed' })
  declare isCollapsed: boolean;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
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

  override render(): TemplateResult {
    return svg`
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
        ${
          this.isCollapsed
            ? svg`
                <path d="M11 7l-5 5l5 5"></path>
                <path d="M17 7l-5 5l5 5"></path>
              `
            : svg`
                <path d="M7 7l5 5l-5 5"></path>
                <path d="M13 7l5 5l-5 5"></path>
              `
        }
      </svg>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-sidebar-collapse-icon': GraphSidebarCollapseIcon;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-sidebar-collapse-icon')) {
  customElements.define('graph-sidebar-collapse-icon', GraphSidebarCollapseIcon);
}
