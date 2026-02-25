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

import { icons } from '@shared/controllers/icon.adapter';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './icon-button.js';

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

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm);
    }

    .container {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: var(--spacing-3);
      top: 50%;
      transform: translateY(-50%);
      transition:
        color var(--durations-normal) var(--easings-out),
        transform var(--durations-normal) var(--easings-out);
      color: var(--colors-muted-foreground);
      pointer-events: none;
      z-index: 1;
    }

    .search-icon svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      stroke: currentColor;
    }

    /* Animate icon on focus */
    :host(:focus-within) .search-icon {
      color: var(--colors-primary);
      transform: translateY(-50%) scale(1.1);
    }

    input {
      width: 100%;
      padding: var(--spacing-2) var(--spacing-12) var(--spacing-2) var(--spacing-10);
      border-radius: var(--radii-sm);
      transition:
        border-color var(--durations-normal) var(--easings-out),
        box-shadow var(--durations-normal) var(--easings-out),
        background-color var(--durations-normal) var(--easings-out);
      background: linear-gradient(
        90deg,
        rgba(var(--colors-foreground-rgb), var(--opacity-2)) 0%,
        rgba(var(--colors-foreground-rgb), var(--opacity-4)) 100%
      );
      border: var(--border-widths-thin) solid transparent;
      color: var(--colors-foreground);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      outline: none;
    }

    input:hover {
      border-color: transparent;
      background: linear-gradient(
        90deg,
        rgba(var(--colors-foreground-rgb), var(--opacity-4)) 0%,
        rgba(var(--colors-foreground-rgb), var(--opacity-5)) 100%
      );
    }

    input:focus {
      border-color: var(--colors-primary);
      box-shadow:
        0 0 0 1px var(--colors-primary),
        0 0 20px rgba(var(--colors-primary-rgb), var(--opacity-20)),
        0 0 40px rgba(var(--colors-primary-rgb), var(--opacity-10));
      background: linear-gradient(
        90deg,
        rgba(var(--colors-primary-rgb), var(--opacity-4)) 0%,
        rgba(var(--colors-primary-rgb), var(--opacity-5)) 100%
      );
    }

    input::placeholder {
      color: var(--colors-muted-foreground);
      opacity: var(--opacity-50);
      font-family: var(--fonts-body);
    }

    .right-slot {
      position: absolute;
      right: var(--spacing-3);
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }

    .keyboard-hint {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 var(--spacing-1);
      border-radius: var(--radii-sm);
      background: linear-gradient(
        180deg,
        rgba(var(--colors-foreground-rgb), var(--opacity-10)) 0%,
        rgba(var(--colors-foreground-rgb), var(--opacity-4)) 100%
      );
      border: var(--border-widths-thin) solid rgba(var(--colors-foreground-rgb), var(--opacity-10));
      box-shadow:
        0 1px 0 rgba(var(--colors-foreground-rgb), var(--opacity-10)),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
      opacity: var(--opacity-50);
      pointer-events: none;
      line-height: 1;
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

  override render(): TemplateResult {
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
                <graph-icon-button
                  variant="subtle"
                  color="destructive"
                  size="sm"
                  title="Clear search"
                  @click=${this.handleClear}
                >
                  ${unsafeHTML(icons.X)}
                </graph-icon-button>
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
