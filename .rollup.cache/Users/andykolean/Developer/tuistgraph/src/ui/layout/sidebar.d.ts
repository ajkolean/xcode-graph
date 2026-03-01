/**
 * Sidebar Lit Component - Mission Control Theme
 *
 * Left sidebar navigation with staggered entrance animations.
 * Features noise texture, accent borders, and monospace typography.
 *
 * @example
 * ```html
 * <xcode-graph-sidebar
 *   active-tab="graph"
 * ></xcode-graph-sidebar>
 * ```
 *
 * @fires tab-change - Dispatched when tab is clicked (detail: { tab: string })
 */
import { type ActiveTab as ActiveTabType } from '@shared/schemas';
export type { ActiveTab } from '@shared/schemas';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import '@ui/components/sidebar-collapse-icon';
import '@ui/components/sidebar-collapse-icon';
/**
 * Left sidebar navigation with staggered entrance animations.
 * Features noise texture, accent borders, and monospace typography.
 *
 * @summary Left sidebar navigation component
 * @fires tab-change - Dispatched when a tab is clicked (detail: { tab: string })
 */
export declare class GraphSidebar extends LitElement {
    collapsed: boolean;
    defaultCollapsed: boolean;
    /**
     * The currently active tab
     */
    activeTab: ActiveTabType;
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private get navItems();
    private handleTabClick;
    private toggleCollapse;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-sidebar': GraphSidebar;
    }
}
//# sourceMappingURL=sidebar.d.ts.map