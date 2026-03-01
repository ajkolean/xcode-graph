/**
 * SidebarCollapseIcon Lit Component
 *
 * Displays chevrons pointing left (collapsed) or right (expanded).
 * Used in sidebar header to indicate collapse/expand state.
 *
 * @example
 * ```html
 * <xcode-graph-sidebar-collapse-icon is-collapsed></xcode-graph-sidebar-collapse-icon>
 * <xcode-graph-sidebar-collapse-icon></xcode-graph-sidebar-collapse-icon>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Displays chevrons pointing left (collapsed) or right (expanded)
 * to indicate sidebar collapse/expand state.
 *
 * @summary Animated collapse/expand chevron icon
 */
export declare class GraphSidebarCollapseIcon extends LitElement {
    /**
     * Whether the sidebar is collapsed
     */
    isCollapsed: boolean;
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-sidebar-collapse-icon': GraphSidebarCollapseIcon;
    }
}
//# sourceMappingURL=sidebar-collapse-icon.d.ts.map