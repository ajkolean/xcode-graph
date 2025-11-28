/**
 * Sidebar State Machine
 *
 * Manages the right sidebar UI state using Zag-js state machine patterns.
 * Handles expand/collapse, tab switching, section accordion, and selection tracking.
 *
 * @module machines/sidebar
 */

import { createMachine, type MachineSchema } from '@zag-js/core';

// ==================== Type Definitions ====================

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

// ==================== Machine Schema ====================

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
    selectedNodeId: string | null;
    selectedClusterId: string | null;
  };
  state: 'collapsed' | 'expanded';
  event:
    | { type: 'TOGGLE' }
    | { type: 'EXPAND' }
    | { type: 'COLLAPSE' }
    | { type: 'SELECT_NODE'; nodeId: string }
    | { type: 'SELECT_CLUSTER'; clusterId: string }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SWITCH_TAB'; tab: SidebarTab }
    | { type: 'TOGGLE_SECTION'; section: SidebarSection }
    | { type: 'EXPAND_TO_SECTION'; section: SidebarSection };
  action:
    | 'setSelectedNode'
    | 'setSelectedCluster'
    | 'clearSelectedNode'
    | 'clearSelectedCluster'
    | 'clearSelections'
    | 'switchToNodeDetails'
    | 'switchToClusterDetails'
    | 'switchToFilters'
    | 'switchTab'
    | 'toggleSection'
    | 'expandSection'
    | 'notifyCollapseChange';
}

// ==================== Machine Definition ====================

/**
 * Sidebar state machine instance
 *
 * A Zag-js state machine managing the sidebar UI with two states:
 *
 * **States:**
 * - `collapsed`: Sidebar is hidden, can expand on toggle or selection
 * - `expanded`: Sidebar is visible, shows active tab content
 *
 * **Context:**
 * - `activeTab`: Current visible tab (nodeDetails, clusterDetails, filters)
 * - `expandedSections`: Which accordion sections are open
 * - `selectedNodeId`: Currently selected node (if any)
 * - `selectedClusterId`: Currently selected cluster (if any)
 *
 * **Events:**
 * - `TOGGLE/EXPAND/COLLAPSE`: Control sidebar visibility
 * - `SELECT_NODE/SELECT_CLUSTER`: Selection triggers tab switch
 * - `SWITCH_TAB`: Manual tab change
 * - `TOGGLE_SECTION/EXPAND_TO_SECTION`: Accordion control
 *
 * @example
 * ```ts
 * const service = interpret(sidebarMachine, {
 *   context: { defaultCollapsed: false },
 * });
 * service.start();
 * service.send({ type: 'SELECT_NODE', nodeId: 'node-1' });
 * ```
 */
export const sidebarMachine = createMachine<SidebarMachineSchema>({
  /**
   * Initialize machine props with defaults
   */
  props({ props }) {
    return {
      id: props.id ?? 'sidebar',
      defaultCollapsed: props.defaultCollapsed ?? false,
      onCollapseChange: props.onCollapseChange,
    };
  },

  /**
   * Initialize bindable context values with defaults
   */
  context({ bindable }) {
    return {
      activeTab: bindable(() => ({
        defaultValue: 'filters' as SidebarTab,
      })),
      expandedSections: bindable(() => ({
        defaultValue: {
          productTypes: true,
          platforms: true,
          projects: true,
          packages: true,
        },
      })),
      selectedNodeId: bindable(() => ({
        defaultValue: null,
      })),
      selectedClusterId: bindable(() => ({
        defaultValue: null,
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
     * - SELECT_NODE/SELECT_CLUSTER (auto-expands to show details)
     * - EXPAND_TO_SECTION (auto-expands and shows filter section)
     */
    collapsed: {
      entry: ['notifyCollapseChange'],
      on: {
        TOGGLE: { target: 'expanded' },
        EXPAND: { target: 'expanded' },
        EXPAND_TO_SECTION: {
          target: 'expanded',
          actions: ['expandSection', 'clearSelections', 'switchToFilters'],
        },
        SELECT_NODE: {
          target: 'expanded',
          actions: ['setSelectedNode', 'clearSelectedCluster', 'switchToNodeDetails'],
        },
        SELECT_CLUSTER: {
          target: 'expanded',
          actions: ['setSelectedCluster', 'clearSelectedNode', 'switchToClusterDetails'],
        },
      },
    },

    /**
     * Expanded state - sidebar is visible
     *
     * Handles:
     * - TOGGLE/COLLAPSE to hide
     * - Selection events (node/cluster)
     * - Tab switching
     * - Section accordion control
     */
    expanded: {
      entry: ['notifyCollapseChange'],
      on: {
        TOGGLE: { target: 'collapsed' },
        COLLAPSE: { target: 'collapsed' },
        SELECT_NODE: {
          actions: ['setSelectedNode', 'clearSelectedCluster', 'switchToNodeDetails'],
        },
        SELECT_CLUSTER: {
          actions: ['setSelectedCluster', 'clearSelectedNode', 'switchToClusterDetails'],
        },
        CLEAR_SELECTION: {
          actions: ['clearSelections', 'switchToFilters'],
        },
        SWITCH_TAB: {
          actions: ['switchTab'],
        },
        TOGGLE_SECTION: {
          actions: ['toggleSection'],
        },
        EXPAND_TO_SECTION: {
          actions: ['expandSection', 'clearSelections', 'switchToFilters'],
        },
      },
    },
  },

  // ==================== Action Implementations ====================

  implementations: {
    actions: {
      /** Store the selected node ID in context */
      setSelectedNode: ({ context, event }) => {
        if (event.type === 'SELECT_NODE') {
          context.set('selectedNodeId', event.nodeId);
        }
      },
      /** Store the selected cluster ID in context */
      setSelectedCluster: ({ context, event }) => {
        if (event.type === 'SELECT_CLUSTER') {
          context.set('selectedClusterId', event.clusterId);
        }
      },
      /** Clear selected node ID */
      clearSelectedNode: ({ context }) => {
        context.set('selectedNodeId', null);
      },
      /** Clear selected cluster ID */
      clearSelectedCluster: ({ context }) => {
        context.set('selectedClusterId', null);
      },
      /** Clear both node and cluster selections */
      clearSelections: ({ context }) => {
        context.set('selectedNodeId', null);
        context.set('selectedClusterId', null);
      },
      /** Switch to node details tab */
      switchToNodeDetails: ({ context }) => {
        context.set('activeTab', 'nodeDetails');
      },
      /** Switch to cluster details tab */
      switchToClusterDetails: ({ context }) => {
        context.set('activeTab', 'clusterDetails');
      },
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

export type { SidebarMachineSchema };
