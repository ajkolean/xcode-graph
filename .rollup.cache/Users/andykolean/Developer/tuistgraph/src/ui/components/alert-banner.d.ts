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
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type AlertBannerVariant = 'warning' | 'error' | 'info' | 'success';
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
export declare class GraphAlertBanner extends LitElement {
    /**
     * Alert variant (determines color scheme)
     */
    variant: AlertBannerVariant;
    /**
     * Alert title
     */
    title: string;
    /**
     * Alert message/description
     */
    message: string;
    /**
     * Whether the alert can be dismissed
     */
    dismissible: boolean;
    private isDismissed;
    constructor();
    static readonly styles: CSSResultGroup;
    private handleDismiss;
    render(): TemplateResult | null;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-alert-banner': GraphAlertBanner;
    }
}
//# sourceMappingURL=alert-banner.d.ts.map