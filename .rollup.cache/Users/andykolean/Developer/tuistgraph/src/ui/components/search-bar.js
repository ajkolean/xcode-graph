import { __decorate } from "tslib";
/**
 * SearchBar Lit Component - Mission Control Theme
 *
 * Input field for filtering nodes by name/text search.
 * Features sharp edges, dramatic focus glow, and animated icon.
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
import { icons } from '@shared/controllers/icon.adapter';
import { KeyboardShortcutController } from '@shared/controllers/keyboard-shortcut.controller';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './icon-button.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { PropertyPart: P_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="container">
        <span class="search-icon"><?></span>

        <input type="text" placeholder="Filter nodes..." aria-label="Filter nodes">

        <div class="right-slot">
          <?>
        </div>
      </div>
    `, parts: [{ type: 2, index: 2 }, { type: 1, index: 3, name: "value", strings: ["", ""], ctor: P_1 }, { type: 1, index: 3, name: "input", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "keydown", strings: ["", ""], ctor: E_1 }, { type: 2, index: 5 }] };
const lit_template_2 = { h: b_1 `
                <xcode-graph-icon-button variant="subtle" color="destructive" size="sm" title="Clear search">
                  <?>
                </xcode-graph-icon-button>
              `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `
                <div class="keyboard-hint">/</div>
              `, parts: [] };
/**
 * Input field for filtering nodes by name/text search.
 * Features sharp edges, dramatic focus glow, and animated icon.
 *
 * @summary Search input for filtering nodes
 * @fires search-change - Dispatched when the search query changes (detail: { query: string })
 * @fires search-clear - Dispatched when the clear button is clicked or Escape is pressed
 */
export class GraphSearchBar extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
      color: var(--colors-primary-text);
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
      border-color: var(--colors-border);
      background: linear-gradient(
        90deg,
        rgba(var(--colors-foreground-rgb), var(--opacity-4)) 0%,
        rgba(var(--colors-foreground-rgb), var(--opacity-5)) 100%
      );
    }

    input:focus {
      border-color: var(--colors-primary);
      box-shadow: 0 0 0 1px var(--colors-primary);
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
    // Controllers
    // ========================================
    shortcut = new KeyboardShortcutController(this, {
        key: '/',
        onTrigger: () => this.inputElement?.focus(),
    });
    // ========================================
    // Event Handlers
    // ========================================
    handleInput(e) {
        const input = e.target;
        this.dispatchEvent(new CustomEvent('search-change', {
            detail: { query: input.value },
            bubbles: true,
            composed: true,
        }));
    }
    handleClear() {
        this.dispatchEvent(new CustomEvent('search-clear', {
            bubbles: true,
            composed: true,
        }));
    }
    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.handleClear();
            e.target.blur();
        }
    }
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [unsafeHTML(icons.Search), this.searchQuery || '', this.handleInput, this.handleKeyDown, this.searchQuery
                    ? { ["_$litType$"]: lit_template_2, values: [this.handleClear, unsafeHTML(icons.X)] } : { ["_$litType$"]: lit_template_3, values: [] }] };
    }
}
__decorate([
    property({ type: String, attribute: 'search-query' })
], GraphSearchBar.prototype, "searchQuery", void 0);
__decorate([
    query('input')
], GraphSearchBar.prototype, "inputElement", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-search-bar')) {
    customElements.define('xcode-graph-search-bar', GraphSearchBar);
}
//# sourceMappingURL=search-bar.js.map