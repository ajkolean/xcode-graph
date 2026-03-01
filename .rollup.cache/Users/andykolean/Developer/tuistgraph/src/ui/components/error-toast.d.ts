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
import { type CSSResultGroup, LitElement, type PropertyValues, type TemplateResult } from 'lit';
/**
 * Displays a single error notification with severity-based styling,
 * optional action button, and dismiss functionality.
 *
 * @summary Individual error notification toast with severity styling
 *
 * @fires dismiss - Dispatched when the toast is dismissed (detail: { errorId })
 * @fires action - Dispatched when the action button is clicked (detail: { error })
 */
export declare class GraphErrorToast extends LitElement {
    error: AppError | null;
    visible: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    updated(changed: PropertyValues): void;
    private handleDismiss;
    private handleAction;
    render(): TemplateResult | null;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-error-toast': GraphErrorToast;
    }
}
