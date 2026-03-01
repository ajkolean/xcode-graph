import { __decorate } from "tslib";
/**
 * AlertBanner Lit Component
 *
 * A dismissible alert/warning banner with icon and actions.
 * Used for warnings, errors, info messages, and success notifications.
 *
 * @example
 * ```html
 * <xcode-graph-alert-banner
 *   variant="warning"
 *   title="Warning Title"
 *   message="Description of the warning..."
 *   dismissible
 * >
 *   <span slot="icon">⚠️</span>
 *   <div slot="actions">
 *     <button>Action</button>
 *   </div>
 * </xcode-graph-alert-banner>
 * ```
 *
 * @fires dismiss - Dispatched when the banner is dismissed
 *
 * @slot icon - Optional icon to display
 * @slot actions - Optional action buttons
 * @slot - Default slot for additional content
 */
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="banner" role="alert">
        <div class="icon">
          <slot name="icon"></slot>
        </div>
        <div class="content">
          <div class="header">
            <?>
            <slot name="badge"></slot>
          </div>
          <?>
          <slot></slot>
          <div class="actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <?>
      </div>
    `, parts: [{ type: 2, index: 5 }, { type: 2, index: 7 }, { type: 2, index: 11 }] };
const lit_template_2 = { h: b_1 `<span class="title"><?></span>`, parts: [{ type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `<div class="message"><?></div>`, parts: [{ type: 2, index: 1 }] };
const lit_template_4 = { h: b_1 `
              <button class="close-btn" title="Dismiss" aria-label="Dismiss">\u00D7</button>
            `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }] };
/**
 * A dismissible alert/warning banner with icon and actions.
 * Used for warnings, errors, info messages, and success notifications.
 *
 * @summary Dismissible alert banner with icon, message, and actions
 *
 * @fires dismiss - Dispatched when the banner is dismissed
 *
 * @slot icon - Optional icon to display
 * @slot badge - Optional badge to display next to the title
 * @slot actions - Optional action buttons
 * @slot - Default slot for additional content
 */
export class GraphAlertBanner extends LitElement {
    constructor() {
        super();
        this.variant = 'info';
        this.title = '';
        this.message = '';
        this.dismissible = false;
        this.isDismissed = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .banner {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-md);
      border-radius: var(--radii-sm);
      border: var(--border-widths-thin) solid transparent;
      font-family: var(--fonts-body);
    }

    /* Variant: Warning */
    :host([variant="warning"]) .banner {
      background: rgba(var(--colors-warning-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-warning-rgb), var(--opacity-30));
    }

    :host([variant="warning"]) .title,
    :host([variant="warning"]) .message {
      color: var(--colors-warning);
    }

    :host([variant="warning"]) .close-btn {
      color: var(--colors-warning);
    }

    /* Variant: Error */
    :host([variant="error"]) .banner {
      background: rgba(var(--colors-destructive-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-destructive-rgb), var(--opacity-30));
    }

    :host([variant="error"]) .title,
    :host([variant="error"]) .message {
      color: var(--colors-destructive);
    }

    :host([variant="error"]) .close-btn {
      color: var(--colors-destructive);
    }

    /* Variant: Info (default) */
    .banner {
      background: rgba(var(--colors-primary-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-primary-rgb), var(--opacity-25));
    }

    .title {
      color: var(--colors-primary-text);
    }

    .message {
      color: var(--colors-muted-foreground);
    }

    /* Variant: Success */
    :host([variant="success"]) .banner {
      background: rgba(var(--colors-success-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-success-rgb), var(--opacity-30));
    }

    :host([variant="success"]) .title,
    :host([variant="success"]) .message {
      color: var(--colors-success);
    }

    :host([variant="success"]) .close-btn {
      color: var(--colors-success);
    }

    .icon {
      flex-shrink: 0;
      font-size: var(--font-sizes-h3);
      line-height: 1;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .title {
      font-weight: var(--font-weights-semibold);
      font-size: var(--font-sizes-sm);
    }

    .message {
      font-size: var(--font-sizes-sm);
      line-height: var(--line-heights-normal);
    }

    .actions {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-1);
    }

    .close-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: var(--font-sizes-lg);
      padding: 0;
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--durations-normal);
      color: var(--colors-muted-foreground);
    }

    .close-btn:hover {
      background: rgba(var(--colors-foreground-rgb), var(--opacity-10));
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleDismiss() {
        this.isDismissed = true;
        this.dispatchEvent(new CustomEvent('dismiss', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (this.isDismissed) {
            return null;
        }
        return { ["_$litType$"]: lit_template_1, values: [this.title ? { ["_$litType$"]: lit_template_2, values: [this.title] } : '', this.message ? { ["_$litType$"]: lit_template_3, values: [this.message] } : '', this.dismissible
                    ? { ["_$litType$"]: lit_template_4, values: [this.handleDismiss] } : ''] };
    }
}
__decorate([
    property({ type: String })
], GraphAlertBanner.prototype, "variant", void 0);
__decorate([
    property({ type: String })
], GraphAlertBanner.prototype, "title", void 0);
__decorate([
    property({ type: String })
], GraphAlertBanner.prototype, "message", void 0);
__decorate([
    property({ type: Boolean })
], GraphAlertBanner.prototype, "dismissible", void 0);
__decorate([
    state()
], GraphAlertBanner.prototype, "isDismissed", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-alert-banner')) {
    customElements.define('xcode-graph-alert-banner', GraphAlertBanner);
}
//# sourceMappingURL=alert-banner.js.map