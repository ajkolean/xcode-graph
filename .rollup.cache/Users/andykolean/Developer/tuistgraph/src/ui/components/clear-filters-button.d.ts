/**
 * ClearFiltersButton Lit Component
 *
 * Button to clear all active filters.
 * Disabled state when no filters are active.
 *
 * @example
 * ```html
 * <xcode-graph-clear-filters-button is-active></xcode-graph-clear-filters-button>
 * ```
 *
 * @fires clear-filters - Dispatched when button is clicked (only when active)
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Button to clear all active filters.
 * Disabled state when no filters are active.
 *
 * @summary Button to clear all active filters
 *
 * @fires clear-filters - Dispatched when button is clicked (only when active)
 */
export declare class GraphClearFiltersButton extends LitElement {
    /**
     * Whether the button is active (has filters to clear)
     */
    isActive: boolean;
    static readonly styles: CSSResultGroup;
    private handleClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-clear-filters-button': GraphClearFiltersButton;
    }
}
