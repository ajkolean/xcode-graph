import { __decorate } from "tslib";
import { ErrorSeverity } from '@shared/schemas/error.types';
import { css, html, LitElement, } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// ==================== Severity Icons ====================
const SEVERITY_ICONS = {
    [ErrorSeverity.Info]: 'ℹ️',
    [ErrorSeverity.Warning]: '⚠️',
    [ErrorSeverity.Error]: '❌',
    [ErrorSeverity.Critical]: '🚨',
};
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <span class="icon" aria-hidden="true"><?></span>

        <div class="content">
          <p class="message"><?></p>

          <?>

          <?>
        </div>

        <?>
      </div>
    `, parts: [{ type: 2, index: 2 }, { type: 2, index: 5 }, { type: 2, index: 6 }, { type: 2, index: 7 }, { type: 2, index: 8 }] };
const lit_template_2 = { h: b_1 `<pre class="details"><?></pre>`, parts: [{ type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `
                  <div class="actions">
                    <button class="action-button">
                      <?>
                    </button>
                  </div>
                `, parts: [{ type: 1, index: 1, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 1, name: "aria-label", strings: ["", ""], ctor: A_1 }, { type: 2, index: 2 }] };
const lit_template_4 = { h: b_1 `
                <span class="close-icon" role="button" tabindex="0" aria-label="Dismiss notification">
                  \u00D7
                </span>
              `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "keydown", strings: ["", ""], ctor: E_1 }] };
// ==================== Component ====================
/**
 * Displays a single error notification with severity-based styling,
 * optional action button, and dismiss functionality.
 *
 * @summary Individual error notification toast with severity styling
 *
 * @fires dismiss - Dispatched when the toast is dismissed (detail: { errorId })
 * @fires action - Dispatched when the action button is clicked (detail: { error })
 */
let GraphErrorToast = class GraphErrorToast extends LitElement {
    constructor() {
        super();
        this.error = null;
        this.visible = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      max-width: 400px;
      margin-bottom: var(--spacing-2);
      opacity: 0;
      transform: translateX(100%);
      transition:
        opacity var(--durations-slow) var(--easings-default),
        transform var(--durations-slow) var(--easings-default);
    }

    :host([visible]) {
      opacity: 1;
      transform: translateX(0);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background-color: var(--colors-card);
      border-left: 4px solid var(--severity-color);
      border-radius: var(--radii-sm);
      box-shadow: var(--shadows-lg);
      min-height: 60px;
    }

    .icon {
      font-size: var(--font-sizes-h3);
      line-height: 1;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .message {
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      margin: 0 0 var(--spacing-1) 0;
      word-wrap: break-word;
    }

    .details {
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      margin: 0;
      font-family: var(--fonts-mono);
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 100px;
      overflow-y: auto;
    }

    .actions {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
    }

    .action-button,
    .dismiss-button {
      padding: var(--spacing-1) var(--spacing-2);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      border: 1px solid var(--colors-border);
      border-radius: var(--radii-xs);
      background-color: var(--colors-card);
      color: var(--colors-foreground);
      cursor: pointer;
      transition: all var(--durations-normal) var(--easings-default);
    }

    .action-button:hover,
    .dismiss-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      border-color: var(--colors-border);
    }

    .action-button {
      background-color: var(--severity-color);
      border-color: var(--severity-color);
      color: white;
    }

    .action-button:hover {
      opacity: 0.9;
    }

    .close-icon {
      flex-shrink: 0;
      cursor: pointer;
      font-size: var(--font-sizes-h3);
      line-height: 1;
      color: var(--colors-muted-foreground);
      transition: color var(--durations-normal) var(--easings-default);
      user-select: none;
    }

    .close-icon:hover {
      color: var(--colors-foreground);
    }

    /* Severity-specific colors */
    :host([data-severity='info']) {
      --severity-color: var(--colors-info);
    }

    :host([data-severity='warning']) {
      --severity-color: var(--colors-warning);
    }

    :host([data-severity='error']) {
      --severity-color: var(--colors-destructive);
    }

    :host([data-severity='critical']) {
      --severity-color: var(--colors-destructive);
    }
  `;
    // ========================================
    // Lifecycle
    // ========================================
    updated(changed) {
        if (changed.has('error') && this.error) {
            // Set data attribute for severity-based styling
            this.setAttribute('data-severity', this.error.severity);
            // Trigger slide-in animation
            requestAnimationFrame(() => {
                this.visible = true;
            });
        }
    }
    // ========================================
    // Event Handlers
    // ========================================
    handleDismiss() {
        if (!this.error || !this.error.dismissible) {
            return;
        }
        this.visible = false;
        // Wait for animation to complete before dispatching
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('dismiss', {
                detail: { errorId: this.error?.id },
                bubbles: true,
                composed: true,
            }));
        }, 300);
    }
    handleAction() {
        if (!this.error) {
            return;
        }
        this.dispatchEvent(new CustomEvent('action', {
            detail: { error: this.error },
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.error) {
            return null;
        }
        const icon = SEVERITY_ICONS[this.error.severity];
        const hasAction = this.error.actionLabel && this.error.actionType;
        return { ["_$litType$"]: lit_template_1, values: [icon, this.error.message, this.error.details ? { ["_$litType$"]: lit_template_2, values: [this.error.details] } : null, hasAction
                    ? { ["_$litType$"]: lit_template_3, values: [this.handleAction, this.error.actionLabel, this.error.actionLabel] } : null, this.error.dismissible
                    ? { ["_$litType$"]: lit_template_4, values: [this.handleDismiss, (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    this.handleDismiss();
                                }
                            }] } : null] };
    }
};
__decorate([
    property({ attribute: false })
], GraphErrorToast.prototype, "error", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], GraphErrorToast.prototype, "visible", void 0);
GraphErrorToast = __decorate([
    customElement('xcode-graph-error-toast')
], GraphErrorToast);
export { GraphErrorToast };
//# sourceMappingURL=error-toast.js.map