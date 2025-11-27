/**
 * SearchBar Lit Component
 *
 * Input field for filtering nodes by name/text search.
 * Includes search icon, clear button, and keyboard shortcut hint.
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

import { LitElement, html, css } from 'lit';
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
      transition: color 0.2s;
      color: var(--color-muted-foreground);
      pointer-events: none;
    }

    .search-icon svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    input {
      width: 100%;
      padding: 8px 48px 8px 40px;
      border-radius: var(--radius);
      transition: all 0.2s ease;
      background-color: var(--color-input-background);
      border: 1px solid var(--color-border);
      color: var(--color-foreground);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      outline: none;
    }

    input:focus {
      border-color: var(--primary);
    }

    input::placeholder {
      color: var(--color-muted-foreground);
      opacity: 0.6;
    }

    .right-slot {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
    }

    .clear-button {
      padding: 4px;
      border-radius: var(--radius);
      transition: background-color 0.2s;
      background: none;
      border: none;
      color: var(--color-muted-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .clear-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .clear-button svg {
      width: 12px;
      height: 12px;
      stroke: currentColor;
    }

    .keyboard-hint {
      padding: 2px 6px;
      border-radius: var(--radius);
      background-color: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: var(--font-family-mono);
      font-size: 10px;
      color: var(--color-foreground);
      opacity: 0.3;
      pointer-events: none;
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
      })
    );
  }

  private handleClear() {
    this.dispatchEvent(
      new CustomEvent('search-clear', {
        bubbles: true,
        composed: true,
      })
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
          ${this.searchQuery
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
                <div class="keyboard-hint">⌘F</div>
              `}
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
