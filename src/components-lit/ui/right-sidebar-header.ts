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

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import '../ui/sidebar-collapse-icon';

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

  static styles = css`
    :host {
      display: block;
      padding: 12px var(--spacing-md);
      flex-shrink: 0;
      border-bottom: 1px solid var(--color-sidebar-border);
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      font-family: 'DM Sans', sans-serif;
      font-size: var(--text-h2);
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
    }

    .toggle-button {
      padding: 6px;
      border-radius: var(--radius);
      transition: background-color 0.2s;
      background: none;
      border: none;
      color: var(--color-muted-foreground);
      cursor: pointer;
      margin-left: auto;
    }

    .toggle-button:hover {
      background-color: var(--color-muted);
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
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container">
        ${!this.isCollapsed ? html`<h2 class="title">${this.title}</h2>` : ''}
        <button
          class="toggle-button"
          @click=${this.handleToggle}
          title="${this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}"
        >
          <graph-sidebar-collapse-icon ?is-collapsed=${this.isCollapsed}></graph-sidebar-collapse-icon>
        </button>
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
