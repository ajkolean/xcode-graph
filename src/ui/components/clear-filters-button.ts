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

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

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

  static override readonly styles = css`
    :host {
      display: block;
      padding: 0 var(--spacing-md) var(--spacing-sm);
    }

    button {
      width: 100%;
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radii-md);
      transition: all var(--durations-normal) var(--easings-default);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      border: var(--border-widths-thin) solid transparent;
    }

    button:not(:disabled) {
      background-color: color-mix(in srgb, var(--colors-primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-primary) 30%, transparent);
      color: var(--colors-primary);
      cursor: pointer;
      opacity: 1;
    }

    button:not(:disabled):hover {
      background-color: color-mix(in srgb, var(--colors-primary) 15%, transparent);
    }

    button:disabled {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-4));
      border-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      color: var(--colors-muted-foreground);
      cursor: not-allowed;
      opacity: var(--opacity-50);
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
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render() {
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

// Register custom element with HMR support
if (!customElements.get('graph-clear-filters-button')) {
  customElements.define('graph-clear-filters-button', GraphClearFiltersButton);
}
