/**
 * Sidebar State Machine
 *
 * Manages the right sidebar UI state using Zag-js state machine patterns.
 * Handles expand/collapse, tab switching, and section accordion.
 *
 * @module machines/sidebar
 */
import { createMachine } from '@zag-js/core';
// ==================== Machine Definition ====================
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
export const sidebarMachine = createMachine({
    /**
     * Initialize machine props with defaults
     */
    props({ props }) {
        const { id, ...rest } = props;
        return { id: id ?? 'sidebar', ...rest };
    },
    /**
     * Initialize bindable context values with defaults
     */
    context({ bindable }) {
        return {
            activeTab: bindable(() => ({
                defaultValue: 'filters',
            })),
            expandedSections: bindable(() => ({
                defaultValue: {
                    productTypes: true,
                    platforms: true,
                    projects: false,
                    packages: false,
                },
            })),
        };
    },
    /**
     * Determine initial state based on defaultCollapsed prop
     */
    initialState({ prop }) {
        return prop('defaultCollapsed') ? 'collapsed' : 'expanded';
    },
    // ==================== State Definitions ====================
    states: {
        /**
         * Collapsed state - sidebar is hidden
         *
         * Transitions to expanded on:
         * - TOGGLE/EXPAND events
         * - EXPAND_TO_SECTION (auto-expands and shows filter section)
         */
        collapsed: {
            entry: ['notifyCollapseChange'],
            on: {
                TOGGLE: { target: 'expanded' },
                EXPAND: { target: 'expanded' },
                EXPAND_TO_SECTION: {
                    target: 'expanded',
                    actions: ['expandSection', 'switchToFilters'],
                },
            },
        },
        /**
         * Expanded state - sidebar is visible
         *
         * Handles:
         * - TOGGLE/COLLAPSE to hide
         * - Tab switching
         * - Section accordion control
         */
        expanded: {
            entry: ['notifyCollapseChange'],
            on: {
                TOGGLE: { target: 'collapsed' },
                COLLAPSE: { target: 'collapsed' },
                SWITCH_TAB: {
                    actions: ['switchTab'],
                },
                TOGGLE_SECTION: {
                    actions: ['toggleSection'],
                },
                EXPAND_TO_SECTION: {
                    actions: ['expandSection', 'switchToFilters'],
                },
            },
        },
    },
    // ==================== Action Implementations ====================
    implementations: {
        actions: {
            /** Switch to filters tab */
            switchToFilters: ({ context }) => {
                context.set('activeTab', 'filters');
            },
            /** Switch to the tab specified in the event */
            switchTab: ({ context, event }) => {
                if (event.type === 'SWITCH_TAB') {
                    context.set('activeTab', event.tab);
                }
            },
            /** Toggle an accordion section open/closed */
            toggleSection: ({ context, event }) => {
                if (event.type === 'TOGGLE_SECTION') {
                    const sections = context.get('expandedSections');
                    context.set('expandedSections', {
                        ...sections,
                        [event.section]: !sections[event.section],
                    });
                }
            },
            /** Force expand a specific accordion section */
            expandSection: ({ context, event }) => {
                if (event.type === 'EXPAND_TO_SECTION') {
                    const sections = context.get('expandedSections');
                    context.set('expandedSections', {
                        ...sections,
                        [event.section]: true,
                    });
                }
            },
            /** Notify external callback when collapse state changes */
            notifyCollapseChange: ({ prop, state }) => {
                const onCollapseChange = prop('onCollapseChange');
                if (onCollapseChange) {
                    onCollapseChange(state.get() === 'collapsed');
                }
            },
        },
    },
});
//# sourceMappingURL=sidebar.machine.js.map