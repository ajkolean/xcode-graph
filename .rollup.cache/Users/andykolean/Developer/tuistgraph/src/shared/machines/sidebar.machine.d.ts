/**
 * Sidebar State Machine
 *
 * Manages the right sidebar UI state using Zag-js state machine patterns.
 * Handles expand/collapse, tab switching, and section accordion.
 *
 * @module machines/sidebar
 */
import { type Machine, type MachineSchema } from '@zag-js/core';
/**
 * Available sidebar tabs
 *
 * - `nodeDetails`: Shows details for the selected node
 * - `clusterDetails`: Shows details for the selected cluster
 * - `filters`: Shows filter controls for the graph
 */
export type SidebarTab = 'nodeDetails' | 'clusterDetails' | 'filters';
/**
 * Collapsible section identifiers for the filters accordion
 *
 * Each section can be independently expanded or collapsed.
 */
export type SidebarSection = 'productTypes' | 'platforms' | 'projects' | 'packages';
/**
 * Type-safe schema for the sidebar state machine
 *
 * Defines props, context, states, events, and actions for full type safety.
 */
interface SidebarMachineSchema extends MachineSchema {
    props: {
        id: string;
        defaultCollapsed?: boolean;
        onCollapseChange?: (collapsed: boolean) => void;
    };
    context: {
        activeTab: SidebarTab;
        expandedSections: Record<SidebarSection, boolean>;
    };
    state: 'collapsed' | 'expanded';
    event: {
        type: 'TOGGLE';
    } | {
        type: 'EXPAND';
    } | {
        type: 'COLLAPSE';
    } | {
        type: 'SWITCH_TAB';
        tab: SidebarTab;
    } | {
        type: 'TOGGLE_SECTION';
        section: SidebarSection;
    } | {
        type: 'EXPAND_TO_SECTION';
        section: SidebarSection;
    };
    action: 'switchToFilters' | 'switchTab' | 'toggleSection' | 'expandSection' | 'notifyCollapseChange';
}
/**
 * Sidebar state machine instance
 *
 * A Zag-js state machine managing the sidebar UI with two states:
 *
 * **States:**
 * - `collapsed`: Sidebar is hidden, can expand on toggle
 * - `expanded`: Sidebar is visible, shows active tab content
 *
 * **Context:**
 * - `activeTab`: Current visible tab (nodeDetails, clusterDetails, filters)
 * - `expandedSections`: Which accordion sections are open
 *
 * **Events:**
 * - `TOGGLE/EXPAND/COLLAPSE`: Control sidebar visibility
 * - `SWITCH_TAB`: Manual tab change
 * - `TOGGLE_SECTION/EXPAND_TO_SECTION`: Accordion control
 *
 * @example
 * ```ts
 * const service = interpret(sidebarMachine, {
 *   context: { defaultCollapsed: false },
 * });
 * service.start();
 * service.send({ type: 'SWITCH_TAB', tab: 'filters' });
 * ```
 */
export declare const sidebarMachine: Machine<SidebarMachineSchema>;
export type { SidebarMachineSchema };
