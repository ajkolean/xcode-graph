/**
 * SearchBar Lit Component - Mission Control Theme
 *
 * Input field for filtering nodes by name/text search.
 * Features sharp edges, dramatic focus glow, and animated icon.
 *
 * @example
 * ```html
 * <graph-search-bar
 *   search-query="React"
 * ></graph-search-bar>
 * ```
 *
 * @fires search-change - Dispatched when search query changes (detail: { query: string })
 * @fires search-clear - Dispatched when clear button is clicked or Escape is pressed
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

export class GraphSearchBar extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The current search query
   */
  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: 0 var(--spacing-md) var(--spacing-sm);
    }

    .container {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      transition:
        color 0.2s var(--easings-out),
        transform 0.2s var(--easings-out);
      color: var(--colors-muted-foreground);
      pointer-events: none;
      z-index: 1;
    }

    .search-icon svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    /* Animate icon on focus */
    :host(:focus-within) .search-icon {
      color: var(--colors-primary);
      transform: translateY(-50%) scale(1.1);
    }

    input {
      width: 100%;
      padding: 10px 48px 10px 40px;
      border-radius: var(--radii-sm);
      transition:
        border-color 0.2s var(--easings-out),
        box-shadow 0.2s var(--easings-out),
        background-color 0.2s var(--easings-out);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.02) 0%,
        rgba(255, 255, 255, 0.04) 100%
      );
      border: 1px solid var(--colors-border);
      color: var(--colors-foreground);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      outline: none;
    }

    input:hover {
      border-color: rgba(255, 255, 255, 0.1);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.03) 0%,
        rgba(255, 255, 255, 0.05) 100%
      );
    }

    input:focus {
      border-color: var(--colors-primary);
      box-shadow:
        0 0 0 1px var(--colors-primary),
        0 0 20px rgba(var(--colors-primary-rgb), 0.2),
        0 0 40px rgba(var(--colors-primary-rgb), 0.1);
      background: linear-gradient(
        90deg,
        rgba(255, 160, 60, 0.03) 0%,
        rgba(255, 160, 60, 0.05) 100%
      );
    }

    input::placeholder {
      color: var(--colors-muted-foreground);
      opacity: 0.5;
      font-family: var(--fonts-body);
    }

    .right-slot {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }

    .clear-button {
      padding: 6px;
      border-radius: var(--radii-sm);
      transition:
        background-color 0.15s var(--easings-out),
        color 0.15s var(--easings-out),
        transform 0.15s var(--easings-out);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--colors-muted-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .clear-button:hover {
      background-color: rgba(var(--colors-destructive-rgb), 0.15);
      border-color: rgba(var(--colors-destructive-rgb), 0.3);
      color: var(--colors-destructive);
      transform: scale(1.05);
    }

    .clear-button:active {
      transform: scale(0.95);
    }

    .clear-button svg {
      width: 12px;
      height: 12px;
      stroke: currentColor;
    }

    .keyboard-hint {
      padding: 3px 8px;
      border-radius: var(--radii-sm);
      background-color: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-family: var(--fonts-mono);
      font-size: 10px;
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      opacity: 0.4;
      pointer-events: none;
      letter-spacing: 0.02em;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent('search-change', {
        detail: { query: input.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleClear() {
    this.dispatchEvent(
      new CustomEvent('search-clear', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.handleClear();
      (e.target as HTMLInputElement).blur();
    }
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container">
        <span class="search-icon">${unsafeHTML(icons.Search)}</span>

        <input
          type="text"
          placeholder="Filter nodes..."
          .value=${this.searchQuery || ''}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />

        <div class="right-slot">
          ${
            this.searchQuery
              ? html`
                <button
                  class="clear-button"
                  @click=${this.handleClear}
                  title="Clear search"
                >
                  ${unsafeHTML(icons.X)}
                </button>
              `
              : html`
                <div class="keyboard-hint">/</div>
              `
          }
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-search-bar': GraphSearchBar;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-search-bar')) {
  customElements.define('graph-search-bar', GraphSearchBar);
}
