import { __decorate } from "tslib";
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
 * <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
 * ```
 */
import { SignalWatcher } from '@lit-labs/signals';
import { getToastErrors } from '@shared/signals/error.signals';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { errorService } from '@/services/error-service';
import './error-toast';
// ==================== Component ====================
const SignalWatcherLitElement = SignalWatcher(LitElement);
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { PropertyPart: P_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <?>
    `, parts: [{ type: 2, index: 0 }] };
const lit_template_2 = { h: b_1 `
          <xcode-graph-error-toast></xcode-graph-error-toast>
        `, parts: [{ type: 1, index: 0, name: "error", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "dismiss", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "action", strings: ["", ""], ctor: E_1 }] };
/**
 * Container component that manages the display of multiple error toast
 * notifications. Integrates with error signals to automatically show/hide
 * toasts as errors are added or dismissed.
 *
 * @summary Error toast notification stack manager
 */
let GraphErrorNotificationContainer = class GraphErrorNotificationContainer extends SignalWatcherLitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
    handleDismiss(e) {
        const { errorId } = e.detail;
        errorService.dismiss(errorId);
    }
    handleAction(e) {
        const { error } = e.detail;
        errorService.executeAction(error);
    }
    // ========================================
    // Render
    // ========================================
    render() {
        // Get visible toasts from signal
        const toasts = getToastErrors();
        if (toasts.length === 0) {
            return null;
        }
        return { ["_$litType$"]: lit_template_1, values: [repeat(toasts, (error) => error.id, (error) => ({ ["_$litType$"]: lit_template_2, values: [error, this.handleDismiss, this.handleAction] }))] };
    }
};
GraphErrorNotificationContainer = __decorate([
    customElement('xcode-graph-error-notification-container')
], GraphErrorNotificationContainer);
export { GraphErrorNotificationContainer };
//# sourceMappingURL=error-notification-container.js.map