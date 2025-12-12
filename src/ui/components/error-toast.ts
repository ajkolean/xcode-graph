/**
 * ErrorToast Lit Component - Individual error notification toast
 *
 * Displays a single error notification with severity-based styling,
 * optional action button, and dismiss functionality.
 *
 * Features:
 * - Severity-based color coding (info, warning, error, critical)
 * - Dismiss button (if error is dismissible)
 * - Optional action button (retry, reload, etc.)
 * - Smooth slide-in/out animations
 * - Accessible with ARIA labels
 *
 * @module components/error-toast
 *
 * @example
 * ```html
 * <graph-error-toast
 *   .error=${error}
 *   @dismiss=${handleDismiss}
 *   @action=${handleAction}
 * ></graph-error-toast>
 * ```
 */

import type { AppError } from "@shared/schemas/error.schema";
import { ErrorSeverity } from "@shared/schemas/error.schema";
import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

// ==================== Severity Icons ====================

const SEVERITY_ICONS = {
  [ErrorSeverity.Info]: "ℹ️",
  [ErrorSeverity.Warning]: "⚠️",
  [ErrorSeverity.Error]: "❌",
  [ErrorSeverity.Critical]: "🚨",
};

// ==================== Component ====================

@customElement("graph-error-toast")
export class GraphErrorToast extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare error: AppError | null;

  @property({ type: Boolean, reflect: true })
  declare visible: boolean;

  constructor() {
    super();
    this.error = null;
    this.visible = false;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin-bottom: var(--spacing-2);
      opacity: 0;
      transform: translateX(100%);
      transition:
        opacity 0.3s ease,
        transform 0.3s ease;
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
      background-color: var(--color-surface);
      border-left: 4px solid var(--severity-color);
      border-radius: var(--radius-2);
      box-shadow: var(--shadow-lg);
      min-height: 60px;
    }

    .icon {
      font-size: var(--font-size-xl);
      line-height: 1;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .message {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
      margin: 0 0 var(--spacing-1) 0;
      word-wrap: break-word;
    }

    .details {
      font-size: var(--font-size-xs);
      color: var(--color-foreground-muted);
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
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-1);
      background-color: var(--color-surface);
      color: var(--color-foreground);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-button:hover,
    .dismiss-button:hover {
      background-color: var(--color-surface-hover);
      border-color: var(--color-border-hover);
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
      font-size: var(--font-size-xl);
      line-height: 1;
      color: var(--color-foreground-muted);
      transition: color 0.2s ease;
      user-select: none;
    }

    .close-icon:hover {
      color: var(--color-foreground);
    }

    /* Severity-specific colors */
    :host([data-severity="info"]) {
      --severity-color: var(--color-info, #3b82f6);
    }

    :host([data-severity="warning"]) {
      --severity-color: var(--color-warning, #f59e0b);
    }

    :host([data-severity="error"]) {
      --severity-color: var(--color-error, #ef4444);
    }

    :host([data-severity="critical"]) {
      --severity-color: var(--color-critical, #dc2626);
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  override updated(changed: PropertyValues): void {
    if (changed.has("error") && this.error) {
      // Set data attribute for severity-based styling
      this.setAttribute("data-severity", this.error.severity);

      // Trigger slide-in animation
      requestAnimationFrame(() => {
        this.visible = true;
      });
    }
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleDismiss(): void {
    if (!this.error || !this.error.dismissible) {
      return;
    }

    this.visible = false;

    // Wait for animation to complete before dispatching
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("dismiss", {
          detail: { errorId: this.error?.id },
          bubbles: true,
          composed: true,
        }),
      );
    }, 300);
  }

  private handleAction(): void {
    if (!this.error) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("action", {
        detail: { error: this.error },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    if (!this.error) {
      return null;
    }

    const icon = SEVERITY_ICONS[this.error.severity];
    const hasAction = this.error.actionLabel && this.error.actionType;

    return html`
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <span class="icon" aria-hidden="true">${icon}</span>

        <div class="content">
          <p class="message">${this.error.message}</p>

          ${this.error.details
            ? html`<pre class="details">${this.error.details}</pre>`
            : null}
          ${hasAction
            ? html`
                <div class="actions">
                  <button
                    class="action-button"
                    @click=${this.handleAction}
                    aria-label=${this.error.actionLabel}
                  >
                    ${this.error.actionLabel}
                  </button>
                </div>
              `
            : null}
        </div>

        ${this.error.dismissible
          ? html`
              <span
                class="close-icon"
                @click=${this.handleDismiss}
                role="button"
                tabindex="0"
                aria-label="Dismiss notification"
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.handleDismiss();
                  }
                }}
              >
                ×
              </span>
            `
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "graph-error-toast": GraphErrorToast;
  }
}
