/**
 * ClearFiltersButton Lit Component
 *
 * Button to clear all active filters.
 * Disabled state when no filters are active.
 *
 * @example
 * ```html
 * <xcode-graph-clear-filters-button is-active></xcode-graph-clear-filters-button>
 * ```
 *
 * @fires clear-filters - Dispatched when button is clicked (only when active)
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Button to clear all active filters.
 * Disabled state when no filters are active.
 *
 * @summary Button to clear all active filters
 *
 * @fires clear-filters - Dispatched when button is clicked (only when active)
 */
export class GraphClearFiltersButton extends LitElement {
  /**
   * Whether the button is active (has filters to clear)
   */
  @property({ type: Boolean, attribute: 'is-active' })
  declare isActive: boolean;

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: 0 var(--spacing-md);
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition:
        max-height var(--durations-normal) var(--easings-default),
        opacity var(--durations-normal) var(--easings-default),
        padding var(--durations-normal) var(--easings-default);
    }

    :host([is-active]) {
      max-height: 48px;
      opacity: 1;
      padding: var(--spacing-sm) var(--spacing-md);
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

    button {
      background-color: color-mix(in srgb, var(--colors-primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-primary) 30%, transparent);
      color: var(--colors-primary-text);
      cursor: pointer;
    }

    button:hover {
      background-color: color-mix(in srgb, var(--colors-primary) 15%, transparent);
    }

    button:active {
      transform: scale(0.98);
    }

    button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }
  `;

  /** Handles the click event and dispatches clear-filters */
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

  /** Renders the component template */
  override render(): TemplateResult {
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

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-clear-filters-button': GraphClearFiltersButton;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-clear-filters-button')) {
  customElements.define('xcode-graph-clear-filters-button', GraphClearFiltersButton);
}
