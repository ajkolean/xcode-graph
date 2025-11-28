/**
 * EmptyState Lit Component
 *
 * Displays an empty state message when no nodes match the current filters.
 * Shows optional "Clear all filters" button when filters are active.
 *
 * @example
 * ```html
 * <graph-empty-state has-active-filters></graph-empty-state>
 * ```
 *
 * @fires clear-filters - Dispatched when clear button is clicked
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class GraphEmptyState extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * Whether there are active filters that can be cleared
   */
  @property({ type: Boolean, attribute: 'has-active-filters' })
  declare hasActiveFilters: boolean;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-lg) var(--spacing-md);
      text-align: center;
    }

    .title {
      margin-bottom: var(--spacing-xs);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
    }

    .description {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      margin-bottom: var(--spacing-md);
    }

    .clear-button {
      padding: 8px 16px;
      border-radius: var(--radius);
      transition: background-color 0.2s ease;
      background-color: rgba(168, 157, 255, 0.1);
      border: 1px solid rgba(168, 157, 255, 0.3);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: rgba(168, 157, 255, 1);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
    }

    .clear-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleClearFilters() {
    this.dispatchEvent(
      new CustomEvent('clear-filters', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="title">No nodes match filters</div>
      <div class="description">Try adjusting your filter settings</div>
      ${
        this.hasActiveFilters
          ? html`
            <button class="clear-button" @click=${this.handleClearFilters}>
              Clear all filters
            </button>
          `
          : ''
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-empty-state': GraphEmptyState;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-empty-state')) {
  customElements.define('graph-empty-state', GraphEmptyState);
}
