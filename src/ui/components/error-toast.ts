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
 * <xcode-graph-error-toast
 *   .error=${error}
 *   @dismiss=${handleDismiss}
 *   @action=${handleAction}
 * ></xcode-graph-error-toast>
 * ```
 */

import type { AppError } from '@shared/schemas/error.types';
import { ErrorSeverity } from '@shared/schemas/error.types';
import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';

const SEVERITY_ICONS = {
  [ErrorSeverity.Info]: 'ℹ️',
  [ErrorSeverity.Warning]: '⚠️',
  [ErrorSeverity.Error]: '❌',
  [ErrorSeverity.Critical]: '🚨',
};

/**
 * Displays a single error notification with severity-based styling,
 * optional action button, and dismiss functionality.
 *
 * @summary Individual error notification toast with severity styling
 *
 * @fires dismiss - Dispatched when the toast is dismissed (detail: { errorId })
 * @fires action - Dispatched when the action button is clicked (detail: { error })
 */
export class GraphErrorToast extends LitElement {
  @property({ attribute: false })
  declare error: AppError | null;

  @property({ type: Boolean, reflect: true })
  declare visible: boolean;

  constructor() {
    super();
    this.error = null;
    this.visible = false;
  }

  static override readonly styles: CSSResultGroup = css`
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

  override updated(changed: PropertyValues): void {
    if (changed.has('error') && this.error) {
      // Set data attribute for severity-based styling
      this.setAttribute('data-severity', this.error.severity);

      // Trigger slide-in animation
      requestAnimationFrame(() => {
        this.visible = true;
      });
    }
  }

  private handleDismiss(): void {
    if (!this.error || !this.error.dismissible) {
      return;
    }

    this.visible = false;

    // Wait for animation to complete before dispatching
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('dismiss', {
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
      new CustomEvent('action', {
        detail: { error: this.error },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.error) {
      return nothing;
    }

    const icon = SEVERITY_ICONS[this.error.severity];
    const hasAction = this.error.actionLabel && this.error.actionType;

    return html`
      <div
        class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <span class="icon" aria-hidden="true">${icon}</span>

        <div class="content">
          <p class="message">${this.error.message}</p>

          ${this.error.details ? html`<pre class="details">${this.error.details}</pre>` : nothing}

          ${
            hasAction
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
              : nothing
          }
        </div>

        ${
          this.error.dismissible
            ? html`
                <span
                  class="close-icon"
                  @click=${this.handleDismiss}
                  role="button"
                  tabindex="0"
                  aria-label="Dismiss notification"
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      this.handleDismiss();
                    }
                  }}
                >
                  ×
                </span>
              `
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-error-toast': GraphErrorToast;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-error-toast')) {
  customElements.define('xcode-graph-error-toast', GraphErrorToast);
}
