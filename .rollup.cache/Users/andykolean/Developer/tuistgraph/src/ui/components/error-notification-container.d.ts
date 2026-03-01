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
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './error-toast';
declare const SignalWatcherLitElement: typeof LitElement;
/**
 * Container component that manages the display of multiple error toast
 * notifications. Integrates with error signals to automatically show/hide
 * toasts as errors are added or dismissed.
 *
 * @summary Error toast notification stack manager
 */
export declare class GraphErrorNotificationContainer extends SignalWatcherLitElement {
    static readonly styles: CSSResultGroup;
    private handleDismiss;
    private handleAction;
    render(): TemplateResult | null;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-error-notification-container': GraphErrorNotificationContainer;
    }
}
export {};
