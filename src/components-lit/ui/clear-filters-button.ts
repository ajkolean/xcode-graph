/**
 * ClearFiltersButton Lit Component
 *
 * Button to clear all active filters.
 * Disabled state when no filters are active.
 *
 * @example
 * ```html
 * <graph-clear-filters-button is-active></graph-clear-filters-button>
 * ```
 *
 * @fires clear-filters - Dispatched when button is clicked (only when active)
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('graph-clear-filters-button')
export class GraphClearFiltersButton extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * Whether the button is active (has filters to clear)
   */
  @property({ type: Boolean, attribute: 'is-active' })
  declare isActive: boolean;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: 0 var(--spacing-md) var(--spacing-sm);
    }

    button {
      width: 100%;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-lg);
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      font-weight: var(--font-weight-medium);
      border: 1px solid transparent;
    }

    button:not(:disabled) {
      background-color: color-mix(in srgb, var(--primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--primary) 30%, transparent);
      color: var(--primary);
      cursor: pointer;
      opacity: 1;
    }

    button:not(:disabled):hover {
      background-color: color-mix(in srgb, var(--primary) 15%, transparent);
    }

    button:disabled {
      background-color: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.06);
      color: var(--color-muted-foreground);
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleClick() {
    if (!this.isActive) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('clear-filters', {
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
      <button
        ?disabled=${!this.isActive}
        @click=${this.handleClick}
      >
        Clear all filters
      </button>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-clear-filters-button': GraphClearFiltersButton;
  }
}
