/**
 * SearchBar Lit Component
 *
 * Input field for filtering nodes by name/text search.
 *
 * @example
 * ```html
 * <xcode-graph-search-bar
 *   search-query="React"
 * ></xcode-graph-search-bar>
 * ```
 *
 * @fires search-change - Dispatched when search query changes (detail: { query: string })
 * @fires search-clear - Dispatched when clear button is clicked or Escape is pressed
 */

import { KeyboardShortcutController } from '@shared/controllers/keyboard-shortcut.controller';
import { icons } from '@shared/utils/icon-adapter';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import './icon-button.js';

/**
 * Input field for filtering nodes by name/text search.
 *
 * @summary Search input for filtering nodes
 * @fires search-change - Dispatched when the search query changes (detail: { query: string })
 * @fires search-clear - Dispatched when the clear button is clicked or Escape is pressed
 */
export class GraphSearchBar extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * The current search query
   */
  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string;

  @query('input')
  private declare inputElement: HTMLInputElement;

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

    /* Highlight icon on focus */
    :host(:focus-within) .search-icon {
      color: var(--colors-primary-text);
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
        color-mix(in srgb, var(--colors-foreground) 2%, transparent) 0%,
        color-mix(in srgb, var(--colors-foreground) 4%, transparent) 100%
      );
      border: var(--border-widths-thin) solid transparent;
      color: var(--colors-foreground);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      outline: none;
    }

    input:hover {
      border-color: var(--colors-border);
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--colors-foreground) 4%, transparent) 0%,
        color-mix(in srgb, var(--colors-foreground) 5%, transparent) 100%
      );
    }

    input:focus {
      border-color: var(--colors-primary);
      box-shadow: 0 0 0 1px var(--colors-primary);
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--colors-primary) 4%, transparent) 0%,
        color-mix(in srgb, var(--colors-primary) 5%, transparent) 100%
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
        color-mix(in srgb, var(--colors-foreground) 10%, transparent) 0%,
        color-mix(in srgb, var(--colors-foreground) 4%, transparent) 100%
      );
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-foreground) 10%, transparent);
      box-shadow:
        0 1px 0 color-mix(in srgb, var(--colors-foreground) 10%, transparent),
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

  readonly shortcut: KeyboardShortcutController = new KeyboardShortcutController(this, {
    key: '/',
    onTrigger: () => this.inputElement?.focus(),
  });

  /** Dispatches search-change with the current input value */
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

  /** Dispatches search-clear to reset the search input */
  private handleClear() {
    this.dispatchEvent(
      new CustomEvent('search-clear', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Clears the search and blurs the input when Escape is pressed */
  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.handleClear();
      (e.target as HTMLInputElement).blur();
    }
  }

  /** Renders the search input with icon, keyboard hint, and clear button */
  override render(): TemplateResult {
    return html`
      <div class="container">
        <span class="search-icon">${icons.Search}</span>

        <input
          type="text"
          placeholder="Filter nodes..."
          aria-label="Filter nodes"
          .value=${this.searchQuery || ''}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />

        <div class="right-slot">
          ${
            this.searchQuery
              ? html`
                <xcode-graph-icon-button
                  variant="subtle"
                  color="destructive"
                  size="sm"
                  title="Clear search"
                  @click=${this.handleClear}
                >
                  ${icons.X}
                </xcode-graph-icon-button>
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

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-search-bar': GraphSearchBar;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-search-bar')) {
  customElements.define('xcode-graph-search-bar', GraphSearchBar);
}
