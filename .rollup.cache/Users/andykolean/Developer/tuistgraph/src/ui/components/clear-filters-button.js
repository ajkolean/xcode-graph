import { __decorate } from "tslib";
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
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <button>
        Clear all filters
      </button>
    `, parts: [{ type: 1, index: 0, name: "disabled", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }] };
/**
 * Button to clear all active filters.
 * Disabled state when no filters are active.
 *
 * @summary Button to clear all active filters
 *
 * @fires clear-filters - Dispatched when button is clicked (only when active)
 */
export class GraphClearFiltersButton extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
    // ========================================
    // Event Handlers
    // ========================================
    handleClick() {
        if (!this.isActive) {
            return;
        }
        this.dispatchEvent(new CustomEvent('clear-filters', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [!this.isActive, this.handleClick] };
    }
}
__decorate([
    property({ type: Boolean, attribute: 'is-active' })
], GraphClearFiltersButton.prototype, "isActive", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-clear-filters-button')) {
    customElements.define('xcode-graph-clear-filters-button', GraphClearFiltersButton);
}
//# sourceMappingURL=clear-filters-button.js.map