import { __decorate } from "tslib";
/**
 * ActionButton Lit Component
 *
 * A semantic action button with color variants and active states.
 * Used for action buttons in panels and forms.
 *
 * @example
 * ```html
 * <xcode-graph-action-button
 *   variant="primary"
 *   ?active=${isActive}
 *   ?full-width=${true}
 * >
 *   <span slot="icon">🎯</span>
 *   Show Dependency Chain
 * </xcode-graph-action-button>
 * ```
 *
 * @fires click - Native click event
 *
 * @slot icon - Optional icon to display before the text
 * @slot - Button text content
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { BooleanAttributePart: B_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <button>
        <span class="icon">
          <slot name="icon"></slot>
        </span>
        <slot></slot>
      </button>
    `, parts: [{ type: 1, index: 0, name: "disabled", strings: ["", ""], ctor: B_1 }] };
/**
 * A semantic action button with color variants and active states.
 * Used for action buttons in panels and forms.
 *
 * @summary Action button with color variants and active states
 *
 * @slot icon - Optional icon to display before the text
 * @slot - Button text content
 */
export class GraphActionButton extends LitElement {
    constructor() {
        super();
        this.variant = 'neutral';
        this.active = false;
        this.fullWidth = false;
        this.disabled = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: inline-flex;
    }

    :host([full-width]) {
      display: flex;
      width: 100%;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radii-md);
      transition: all var(--durations-normal);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      line-height: var(--line-heights-normal);
      border: var(--border-widths-thin) solid transparent;
      cursor: pointer;
    }

    :host([full-width]) button {
      width: 100%;
    }

    button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: var(--opacity-40);
    }

    button:disabled:hover {
      background-color: inherit;
      border-color: inherit;
    }

    .icon {
      display: inline-flex;
    }

    .icon ::slotted(svg),
    .icon svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    /* Variant: Primary (Purple) */
    :host([variant="primary"]) button {
      background-color: color-mix(in srgb, var(--colors-primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-primary) 30%, transparent);
      color: color-mix(in srgb, var(--colors-primary) 120%, white);
    }

    :host([variant="primary"]) button:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--colors-primary) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-primary) 50%, transparent);
    }

    :host([variant="primary"][active]) button {
      background-color: var(--colors-primary);
      border-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    /* Variant: Success (Green) */
    :host([variant="success"]) button {
      background-color: color-mix(in srgb, var(--colors-chart-3) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-chart-3) 30%, transparent);
      color: var(--colors-chart-3);
    }

    :host([variant="success"]) button:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--colors-chart-3) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-chart-3) 50%, transparent);
    }

    :host([variant="success"][active]) button {
      background-color: color-mix(in srgb, var(--colors-chart-3) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-chart-3) 50%, transparent);
      color: var(--colors-chart-3);
    }

    /* Variant: Warning (Orange/Yellow) */
    :host([variant="warning"]) button {
      background-color: color-mix(in srgb, var(--colors-warning) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-warning) 30%, transparent);
      color: var(--colors-warning);
    }

    :host([variant="warning"]) button:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--colors-warning) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-warning) 50%, transparent);
    }

    :host([variant="warning"][active]) button {
      background-color: color-mix(in srgb, var(--colors-warning) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-warning) 50%, transparent);
    }

    /* Variant: Neutral (default) */
    button {
      background-color: color-mix(in srgb, var(--colors-foreground) 8%, transparent);
      border-color: color-mix(in srgb, var(--colors-foreground) 25%, transparent);
      color: var(--colors-foreground);
    }

    :host(:not([variant])) button:hover:not(:disabled),
    :host([variant="neutral"]) button:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--colors-foreground) 15%, transparent);
      border-color: color-mix(in srgb, var(--colors-foreground) 35%, transparent);
    }

    :host([variant="neutral"][active]) button,
    :host(:not([variant])[active]) button {
      background-color: var(--colors-foreground);
      border-color: var(--colors-foreground);
      color: var(--colors-background);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.disabled] };
    }
}
__decorate([
    property({ type: String })
], GraphActionButton.prototype, "variant", void 0);
__decorate([
    property({ type: Boolean })
], GraphActionButton.prototype, "active", void 0);
__decorate([
    property({ type: Boolean, attribute: 'full-width' })
], GraphActionButton.prototype, "fullWidth", void 0);
__decorate([
    property({ type: Boolean })
], GraphActionButton.prototype, "disabled", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-action-button')) {
    customElements.define('xcode-graph-action-button', GraphActionButton);
}
//# sourceMappingURL=action-button.js.map