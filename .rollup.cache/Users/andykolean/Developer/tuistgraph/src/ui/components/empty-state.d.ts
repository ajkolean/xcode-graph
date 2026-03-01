/**
 * EmptyState Lit Component - Mission Control Theme
 *
 * Displays an empty state message when no nodes match the current filters.
 * Features amber glow effects, monospace typography, and animated icon.
 *
 * @example
 * ```html
 * <xcode-graph-empty-state has-active-filters></xcode-graph-empty-state>
 * ```
 *
 * @fires clear-filters - Dispatched when clear button is clicked
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Displays an empty state message when no nodes match the current filters.
 * Features animated icon and optional clear filters button.
 *
 * @summary Empty state message with optional clear filters action
 *
 * @fires clear-filters - Dispatched when the clear filters button is clicked
 */
export declare class GraphEmptyState extends LitElement {
    /**
     * Whether there are active filters that can be cleared
     */
    hasActiveFilters: boolean;
    static readonly styles: CSSResultGroup;
    private handleClearFilters;
    private renderSearchIcon;
    private renderClearIcon;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-empty-state': GraphEmptyState;
    }
}
