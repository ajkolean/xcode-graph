/**
 * ActionButton Lit Component
 *
 * A semantic action button with color variants and active states.
 * Used for action buttons in panels and forms.
 *
 * @example
 * ```html
 * <xcode-graph-action-button
 *   variant="primary"
 *   ?active=${isActive}
 *   ?full-width=${true}
 * >
 *   <span slot="icon">🎯</span>
 *   Show Dependency Chain
 * </xcode-graph-action-button>
 * ```
 *
 * @fires click - Native click event
 *
 * @slot icon - Optional icon to display before the text
 * @slot - Button text content
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type ActionButtonVariant = 'primary' | 'success' | 'warning' | 'neutral';
/**
 * A semantic action button with color variants and active states.
 * Used for action buttons in panels and forms.
 *
 * @summary Action button with color variants and active states
 *
 * @slot icon - Optional icon to display before the text
 * @slot - Button text content
 */
export declare class GraphActionButton extends LitElement {
    /**
     * Button color variant
     */
    variant: ActionButtonVariant;
    /**
     * Whether the button is in active state
     */
    active: boolean;
    /**
     * Whether the button should be full width
     */
    fullWidth: boolean;
    /**
     * Whether the button is disabled
     */
    disabled: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-action-button': GraphActionButton;
    }
}
