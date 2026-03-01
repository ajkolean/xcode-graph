import { __decorate } from "tslib";
/**
 * IconButton Lit Component
 *
 * A unified icon button component with variants for all clickable icon scenarios.
 * Supports ghost, subtle, and solid variants with multiple color options.
 *
 * @example
 * ```html
 * <xcode-graph-icon-button
 *   title="Close"
 *   variant="ghost"
 *   color="neutral"
 * >
 *   <svg>...</svg>
 * </xcode-graph-icon-button>
 * ```
 *
 * @fires click - Native click event (not prevented)
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, BooleanAttributePart: B_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <button>
        <slot></slot>
      </button>
    `, parts: [{ type: 1, index: 0, name: "disabled", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "title", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "aria-label", strings: ["", ""], ctor: A_1 }] };
/**
 * A unified icon button component with variants for all clickable icon scenarios.
 * Supports ghost, subtle, and solid variants with multiple color options.
 *
 * @summary Icon button with variant and color options
 * @slot - Icon content (typically an SVG element)
 */
export class GraphIconButton extends LitElement {
    constructor() {
        super();
        this.variant = 'ghost';
        this.color = 'neutral';
        this.size = 'md';
        this.disabled = false;
        this.title = '';
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: inline-flex;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      border: var(--border-widths-thin) solid transparent;
      cursor: pointer;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        color var(--durations-fast) var(--easings-out),
        transform var(--durations-fast) var(--easings-out);
    }

    button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: var(--opacity-40);
    }

    button:active:not(:disabled) {
      transform: scale(0.95);
    }

    /* Size: sm */
    :host([size="sm"]) button {
      padding: var(--spacing-1);
      border-radius: var(--radii-sm);
    }

    :host([size="sm"]) ::slotted(svg),
    :host([size="sm"]) button svg {
      width: var(--sizes-icon-xs);
      height: var(--sizes-icon-xs);
    }

    /* Size: md (default) */
    button {
      padding: var(--spacing-1);
      border-radius: var(--radii-md);
    }

    ::slotted(svg),
    button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      stroke: currentColor;
    }

    /* Variant: ghost (default) */
    button {
      background: none;
      color: var(--colors-muted-foreground);
    }

    /* Ghost + Neutral */
    :host([variant="ghost"][color="neutral"]) button:hover:not(:disabled),
    :host([color="neutral"]:not([variant])) button:hover:not(:disabled) {
      background-color: var(--colors-muted);
      color: var(--colors-foreground);
    }

    /* Ghost + Primary */
    :host([variant="ghost"][color="primary"]) button:hover:not(:disabled) {
      background-color: rgba(var(--colors-primary-rgb), var(--opacity-10));
      color: var(--colors-primary-text);
    }

    /* Ghost + Destructive */
    :host([variant="ghost"][color="destructive"]) button:hover:not(:disabled) {
      background-color: rgba(var(--colors-destructive-rgb), var(--opacity-10));
      color: var(--colors-destructive);
    }

    /* Variant: subtle */
    :host([variant="subtle"]) button {
      background: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      border-color: rgba(var(--colors-foreground-rgb), var(--opacity-10));
      color: var(--colors-muted-foreground);
    }

    :host([variant="subtle"][color="neutral"]) button:hover:not(:disabled) {
      background: rgba(var(--colors-foreground-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-foreground-rgb), var(--opacity-15));
      color: var(--colors-foreground);
    }

    :host([variant="subtle"][color="primary"]) button:hover:not(:disabled) {
      background: rgba(var(--colors-primary-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-primary-rgb), var(--opacity-20));
      color: var(--colors-primary-text);
    }

    :host([variant="subtle"][color="destructive"]) button:hover:not(:disabled) {
      background-color: rgba(var(--colors-destructive-rgb), var(--opacity-15));
      border-color: rgba(var(--colors-destructive-rgb), var(--opacity-30));
      color: var(--colors-destructive);
      transform: scale(1.05);
    }

    :host([variant="subtle"][color="destructive"]) button:active:not(:disabled) {
      transform: scale(0.95);
    }

    /* Variant: solid */
    :host([variant="solid"][color="neutral"]) button {
      background: var(--colors-muted);
      color: var(--colors-foreground);
    }

    :host([variant="solid"][color="neutral"]) button:hover:not(:disabled) {
      background: var(--colors-muted-foreground);
      color: var(--colors-background);
    }

    :host([variant="solid"][color="primary"]) button {
      background: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    :host([variant="solid"][color="primary"]) button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--colors-primary) 85%, white);
    }

    :host([variant="solid"][color="destructive"]) button {
      background: var(--colors-destructive);
      color: var(--colors-destructive-foreground);
    }

    :host([variant="solid"][color="destructive"]) button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--colors-destructive) 85%, white);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.disabled, this.title || '', this.title || ''] };
    }
}
__decorate([
    property({ type: String })
], GraphIconButton.prototype, "variant", void 0);
__decorate([
    property({ type: String })
], GraphIconButton.prototype, "color", void 0);
__decorate([
    property({ type: String })
], GraphIconButton.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], GraphIconButton.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], GraphIconButton.prototype, "title", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-icon-button')) {
    customElements.define('xcode-graph-icon-button', GraphIconButton);
}
//# sourceMappingURL=icon-button.js.map