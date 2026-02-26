/**
 * AlertBanner Lit Component
 *
 * A dismissible alert/warning banner with icon and actions.
 * Used for warnings, errors, info messages, and success notifications.
 *
 * @example
 * ```html
 * <graph-alert-banner
 *   variant="warning"
 *   title="Warning Title"
 *   message="Description of the warning..."
 *   dismissible
 * >
 *   <span slot="icon">⚠️</span>
 *   <div slot="actions">
 *     <button>Action</button>
 *   </div>
 * </graph-alert-banner>
 * ```
 *
 * @fires dismiss - Dispatched when the banner is dismissed
 *
 * @slot icon - Optional icon to display
 * @slot actions - Optional action buttons
 * @slot - Default slot for additional content
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export type AlertBannerVariant = 'warning' | 'error' | 'info' | 'success';

export class GraphAlertBanner extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * Alert variant (determines color scheme)
   */
  @property({ type: String })
  declare variant: AlertBannerVariant;

  /**
   * Alert title
   */
  @property({ type: String })
  declare title: string;

  /**
   * Alert message/description
   */
  @property({ type: String })
  declare message: string;

  /**
   * Whether the alert can be dismissed
   */
  @property({ type: Boolean })
  declare dismissible: boolean;

  @state()
  private declare isDismissed: boolean;

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

  static override readonly styles: CSSResultGroup = css`
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

  private handleDismiss() {
    this.isDismissed = true;
    this.dispatchEvent(
      new CustomEvent('dismiss', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult | null {
    if (this.isDismissed) {
      return null;
    }

    return html`
      <div class="banner">
        <div class="icon">
          <slot name="icon"></slot>
        </div>
        <div class="content">
          <div class="header">
            ${this.title ? html`<span class="title">${this.title}</span>` : ''}
            <slot name="badge"></slot>
          </div>
          ${this.message ? html`<div class="message">${this.message}</div>` : ''}
          <slot></slot>
          <div class="actions">
            <slot name="actions"></slot>
          </div>
        </div>
        ${
          this.dismissible
            ? html`
              <button
                class="close-btn"
                @click=${this.handleDismiss}
                title="Dismiss"
              >×</button>
            `
            : ''
        }
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-alert-banner': GraphAlertBanner;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-alert-banner')) {
  customElements.define('graph-alert-banner', GraphAlertBanner);
}
