/**
 * ErrorNotificationContainer Lit Component - Toast stack manager
 *
 * Container component that manages the display of multiple error toast
 * notifications. Integrates with error signals to automatically show/hide
 * toasts as errors are added or dismissed.
 *
 * Features:
 * - Automatic toast display from error signals
 * - Configurable max visible toasts
 * - Stacked layout with smooth animations
 * - Handles dismiss and action events
 * - Fixed positioning in bottom-right corner
 *
 * @module components/toast-container
 *
 * @example
 * ```html
 * <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
 * ```
 */

import { SignalWatcher } from '@lit-labs/signals';
import type { AppError } from '@shared/schemas/error.types';
import { getToastErrors } from '@shared/signals/error.signals';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { errorService } from '@/services/error-service';
import './error-toast';

const SignalWatcherLitElement = SignalWatcher(LitElement) as typeof LitElement;

/**
 * Container component that manages the display of multiple error toast
 * notifications. Integrates with error signals to automatically show/hide
 * toasts as errors are added or dismissed.
 *
 * @summary Error toast notification stack manager
 */
export class GraphErrorNotificationContainer extends SignalWatcherLitElement {
  static override readonly styles: CSSResultGroup = css`
    :host {
      position: fixed;
      bottom: var(--spacing-4);
      right: var(--spacing-4);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      pointer-events: none;
      max-width: 90vw;
    }

    xcode-graph-error-toast {
      pointer-events: auto;
    }

    @media (max-width: 768px) {
      :host {
        bottom: var(--spacing-2);
        right: var(--spacing-2);
        left: var(--spacing-2);
        align-items: stretch;
      }

      xcode-graph-error-toast {
        max-width: 100%;
      }
    }
  `;

  private handleDismiss(e: CustomEvent<{ errorId: string }>): void {
    // skipcq: JS-0105
    const { errorId } = e.detail;
    errorService.dismiss(errorId);
  }

  private handleAction(e: CustomEvent<{ error: AppError }>): void {
    // skipcq: JS-0105
    const { error } = e.detail;
    errorService.executeAction(error);
  }

  override render(): TemplateResult | null {
    const toasts = getToastErrors();

    if (toasts.length === 0) {
      return null;
    }

    return html`
      ${repeat(
        toasts,
        (error) => error.id,
        (error) => html`
          <xcode-graph-error-toast
            .error=${error}
            @dismiss=${this.handleDismiss}
            @action=${this.handleAction}
          ></xcode-graph-error-toast>
        `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-error-notification-container': GraphErrorNotificationContainer;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-error-notification-container')) {
  customElements.define(
    'xcode-graph-error-notification-container',
    GraphErrorNotificationContainer,
  );
}
