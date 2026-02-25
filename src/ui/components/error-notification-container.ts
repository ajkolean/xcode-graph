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
 * @module components/error-notification-container
 *
 * @example
 * ```html
 * <graph-error-notification-container></graph-error-notification-container>
 * ```
 */

import { SignalWatcher } from '@lit-labs/signals';
import type { AppError } from '@shared/schemas/error.schema';
import { getToastErrors } from '@shared/signals/error.signals';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { errorService } from '@/services/error-service';
import './error-toast';

// ==================== Component ====================

const SignalWatcherLitElement = SignalWatcher(LitElement) as typeof LitElement;

@customElement('graph-error-notification-container')
export class GraphErrorNotificationContainer extends SignalWatcherLitElement {
  // ========================================
  // Styles
  // ========================================

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

    graph-error-toast {
      pointer-events: auto;
    }

    @media (max-width: 768px) {
      :host {
        bottom: var(--spacing-2);
        right: var(--spacing-2);
        left: var(--spacing-2);
        align-items: stretch;
      }

      graph-error-toast {
        max-width: 100%;
      }
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleDismiss(e: CustomEvent<{ errorId: string }>): void {
    const { errorId } = e.detail;
    errorService.dismiss(errorId);
  }

  private handleAction(e: CustomEvent<{ error: AppError }>): void {
    const { error } = e.detail;
    errorService.executeAction(error);
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult | null {
    // Get visible toasts from signal
    const toasts = getToastErrors();

    if (toasts.length === 0) {
      return null;
    }

    return html`
      ${toasts.map(
        (error) => html`
          <graph-error-toast
            .error=${error}
            @dismiss=${this.handleDismiss}
            @action=${this.handleAction}
          ></graph-error-toast>
        `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'graph-error-notification-container': GraphErrorNotificationContainer;
  }
}
