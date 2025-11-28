/**
 * EmptyState Lit Component - Mission Control Theme
 *
 * Displays an empty state message when no nodes match the current filters.
 * Features amber glow effects, monospace typography, and animated icon.
 *
 * @example
 * ```html
 * <graph-empty-state has-active-filters></graph-empty-state>
 * ```
 *
 * @fires clear-filters - Dispatched when clear button is clicked
 */

import { css, html, LitElement, svg } from 'lit';
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
      padding: var(--spacing-xl) var(--spacing-md);
      text-align: center;
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .icon-container {
      width: 48px;
      height: 48px;
      margin: 0 auto var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-card);
      background: rgba(255, 160, 60, 0.08);
      border: 1px solid rgba(255, 160, 60, 0.15);
      animation: iconPulse 3s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(255, 160, 60, 0.1);
      }
      50% {
        box-shadow: 0 0 20px 4px rgba(255, 160, 60, 0.15);
      }
    }

    .icon-container svg {
      width: 24px;
      height: 24px;
      color: var(--primary);
      opacity: 0.8;
    }

    .title {
      margin-bottom: var(--spacing-xs);
      font-family: var(--font-family-heading);
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      color: var(--foreground);
      letter-spacing: -0.01em;
    }

    .description {
      font-family: var(--font-family-body);
      font-size: var(--text-small);
      color: var(--muted-foreground);
      margin-bottom: var(--spacing-lg);
      line-height: 1.5;
    }

    .clear-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: var(--radius);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(255, 160, 60, 0.1);
      border: 1px solid rgba(255, 160, 60, 0.25);
      font-family: var(--font-family-mono);
      font-size: var(--text-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--primary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .clear-button:hover {
      background: rgba(255, 160, 60, 0.18);
      border-color: rgba(255, 160, 60, 0.4);
      box-shadow: 0 0 20px rgba(255, 160, 60, 0.2);
      transform: translateY(-1px);
    }

    .clear-button:active {
      transform: translateY(0);
    }

    .clear-button svg {
      width: 14px;
      height: 14px;
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

  private renderSearchIcon() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
        <path d="M8 11h6"></path>
      </svg>
    `;
  }

  private renderClearIcon() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <path d="M19 6l-1.5 14.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 6"></path>
      </svg>
    `;
  }

  render() {
    return html`
      <div class="icon-container">
        ${this.renderSearchIcon()}
      </div>
      <div class="title">No nodes match filters</div>
      <div class="description">Try adjusting your filter settings or search query</div>
      ${
        this.hasActiveFilters
          ? html`
            <button class="clear-button" @click=${this.handleClearFilters}>
              ${this.renderClearIcon()}
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
