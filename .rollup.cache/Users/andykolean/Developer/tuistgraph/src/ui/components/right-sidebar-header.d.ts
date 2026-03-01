/**
 * RightSidebarHeader Lit Component
 *
 * Header for right sidebar with title and collapse button.
 * Already uses LitSidebarCollapseIcon.
 *
 * @example
 * ```html
 * <xcode-graph-right-sidebar-header
 *   title="Filters"
 *   is-collapsed
 * ></xcode-graph-right-sidebar-header>
 * ```
 *
 * @fires toggle-collapse - Dispatched when collapse button is clicked
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './sidebar-collapse-icon';
import './icon-button.js';
/**
 * Header for the right sidebar with title and collapse button.
 * Shows an active filters indicator dot when filters are applied.
 *
 * @summary Right sidebar header with collapse toggle
 * @fires toggle-collapse - Dispatched when the collapse button is clicked
 */
export declare class GraphRightSidebarHeader extends LitElement {
    title: string;
    isCollapsed: boolean;
    hasActiveFilters: boolean;
    static readonly styles: CSSResultGroup;
    private handleToggle;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-right-sidebar-header': GraphRightSidebarHeader;
    }
}
