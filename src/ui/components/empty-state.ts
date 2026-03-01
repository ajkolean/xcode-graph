/**
 * EmptyState Lit Component - Mission Control Theme
 *
 * Displays an empty state message when no nodes match the current filters.
 * Features amber glow effects, monospace typography, and animated icon.
 *
 * @example
 * ```html
 * <xcode-graph-empty-state has-active-filters></xcode-graph-empty-state>
 * ```
 *
 * @fires clear-filters - Dispatched when clear button is clicked
 */

import { type CSSResultGroup, css, html, LitElement, nothing, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Displays an empty state message when no nodes match the current filters.
 * Features animated icon and optional clear filters button.
 *
 * @summary Empty state message with optional clear filters action
 *
 * @fires clear-filters - Dispatched when the clear filters button is clicked
 */
export class GraphEmptyState extends LitElement {
  /**
   * Whether there are active filters that can be cleared
   */
  @property({ type: Boolean, attribute: 'has-active-filters' })
  declare hasActiveFilters: boolean;

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--spacing-xl) var(--spacing-md);
      text-align: center;
      animation: fadeIn var(--durations-slow) var(--easings-default);
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
      width: var(--spacing-12);
      height: var(--spacing-12);
      margin: 0 auto var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radii-lg);
      background: rgba(var(--colors-primary-rgb), var(--opacity-10));
      border: var(--border-widths-thin) solid rgba(var(--colors-primary-rgb), var(--opacity-20));
      animation: iconPulse 3s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(var(--colors-primary-rgb), var(--opacity-10));
      }
      50% {
        box-shadow: 0 0 20px 4px rgba(var(--colors-primary-rgb), var(--opacity-20));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .icon-container {
        animation: none;
      }
    }

    .icon-container svg {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .title {
      margin-bottom: var(--spacing-xs);
      font-family: var(--fonts-heading);
      font-size: var(--font-sizes-base);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      letter-spacing: var(--letter-spacing-tight);
    }

    .description {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-lg);
      line-height: var(--line-heights-normal);
    }

    .clear-button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--radii-md);
      transition: all var(--durations-normal) var(--easings-default);
      background: rgba(var(--colors-primary-rgb), var(--opacity-10));
      border: var(--border-widths-thin) solid rgba(var(--colors-primary-rgb), var(--opacity-25));
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-primary-text);
      letter-spacing: var(--letter-spacing-wide);
      text-transform: uppercase;
      cursor: pointer;
    }

    .clear-button:hover {
      background: rgba(var(--colors-primary-rgb), var(--opacity-20));
      border-color: rgba(var(--colors-primary-rgb), var(--opacity-40));
      box-shadow: 0 0 20px rgba(var(--colors-primary-rgb), var(--opacity-20));
      transform: translateY(-1px);
    }

    .clear-button:active {
      transform: translateY(0);
      box-shadow: 0 0 10px rgba(var(--colors-primary-rgb), var(--opacity-20));
    }

    .clear-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .clear-button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }
  `;

  private handleClearFilters() {
    this.dispatchEvent(
      new CustomEvent('clear-filters', {
        bubbles: true,
        composed: true,
      }),
    );
  }

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

  override render(): TemplateResult {
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
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-empty-state': GraphEmptyState;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-empty-state')) {
  customElements.define('xcode-graph-empty-state', GraphEmptyState);
}
