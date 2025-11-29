/**
 * RightSidebarHeader Lit Component
 *
 * Header for right sidebar with title and collapse button.
 * Already uses LitSidebarCollapseIcon.
 *
 * @example
 * ```html
 * <graph-right-sidebar-header
 *   title="Filters"
 *   is-collapsed
 * ></graph-right-sidebar-header>
 * ```
 *
 * @fires toggle-collapse - Dispatched when collapse button is clicked
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './sidebar-collapse-icon';
import './icon-button.js';

export class GraphRightSidebarHeader extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: String })
  declare title: string;

  @property({ type: Boolean, attribute: 'is-collapsed' })
  declare isCollapsed: boolean;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: block;
      padding: var(--spacing-3) var(--spacing-md);
      flex-shrink: 0;
      border-bottom: var(--border-widths-thin) solid var(--colors-sidebar-border);
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      font-family: var(--fonts-heading);
      font-size: var(--font-sizes-h2);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
    }

    graph-icon-button {
      margin-left: auto;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleToggle() {
    this.dispatchEvent(
      new CustomEvent('toggle-collapse', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    return html`
      <div class="container">
        ${!this.isCollapsed ? html`<h2 class="title">${this.title}</h2>` : ''}
        <graph-icon-button
          variant="ghost"
          color="neutral"
          title="${this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}"
          @click=${this.handleToggle}
        >
          <graph-sidebar-collapse-icon ?is-collapsed=${this.isCollapsed}></graph-sidebar-collapse-icon>
        </graph-icon-button>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-right-sidebar-header': GraphRightSidebarHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-right-sidebar-header')) {
  customElements.define('graph-right-sidebar-header', GraphRightSidebarHeader);
}
