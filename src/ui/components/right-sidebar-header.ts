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

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './sidebar-collapse-icon';
import './icon-button.js';

/**
 * Header for the right sidebar with title and collapse button.
 * Shows an active filters indicator dot when filters are applied.
 *
 * @summary Right sidebar header with collapse toggle
 * @fires toggle-collapse - Dispatched when the collapse button is clicked
 */
export class GraphRightSidebarHeader extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: String })
  declare title: string;

  @property({ type: Boolean, attribute: 'is-collapsed' })
  declare isCollapsed: boolean;

  @property({ type: Boolean, attribute: 'has-active-filters' })
  declare hasActiveFilters: boolean;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
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

    xcode-graph-icon-button {
      margin-left: auto;
    }

    xcode-graph-icon-button:hover {
      transform: scale(1.08);
      transition: transform var(--durations-fast) var(--easings-out);
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

  override render(): TemplateResult {
    return html`
      <div class="container">
        ${
          this.isCollapsed || !this.title
            ? ''
            : html`
          <div class="title-wrapper">
            <h2 class="title">${this.title}</h2>
            ${this.hasActiveFilters ? html`<span class="filters-active-dot" title="Filters active"></span>` : ''}
          </div>
        `
        }
        <xcode-xcode-graph-icon-button
          variant="ghost"
          color="neutral"
          title="${this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}"
          @click=${this.handleToggle}
        >
          <xcode-graph-sidebar-collapse-icon ?is-collapsed=${this.isCollapsed}></xcode-graph-sidebar-collapse-icon>
        </xcode-xcode-graph-icon-button>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-right-sidebar-header': GraphRightSidebarHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-right-sidebar-header')) {
  customElements.define('xcode-graph-right-sidebar-header', GraphRightSidebarHeader);
}
