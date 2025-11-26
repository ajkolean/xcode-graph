import { createMachine, type MachineSchema } from '@zag-js/core';

/**
 * Sidebar tab types
 */
export type SidebarTab = 'nodeDetails' | 'clusterDetails' | 'filters';

/**
 * Section keys for accordion expansion
 */
export type SidebarSection = 'productTypes' | 'platforms' | 'projects' | 'packages';

/**
 * Sidebar machine schema
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

/**
 * Sidebar state machine
 *
 * Manages the right sidebar state:
 * - Collapsed/expanded state
 * - Active tab (nodeDetails, clusterDetails, filters)
 * - Section expansion (accordion behavior)
 * - Node/cluster selection
 */
export const sidebarMachine = createMachine<SidebarMachineSchema>({
  props({ props }) {
    return {
      id: props.id ?? 'sidebar',
      defaultCollapsed: props.defaultCollapsed ?? false,
      onCollapseChange: props.onCollapseChange,
    };
  },

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

  initialState({ prop }) {
    return prop('defaultCollapsed') ? 'collapsed' : 'expanded';
  },

  states: {
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

  implementations: {
    actions: {
      setSelectedNode: ({ context, event }) => {
        if (event.type === 'SELECT_NODE') {
          context.set('selectedNodeId', event.nodeId);
        }
      },
      setSelectedCluster: ({ context, event }) => {
        if (event.type === 'SELECT_CLUSTER') {
          context.set('selectedClusterId', event.clusterId);
        }
      },
      clearSelectedNode: ({ context }) => {
        context.set('selectedNodeId', null);
      },
      clearSelectedCluster: ({ context }) => {
        context.set('selectedClusterId', null);
      },
      clearSelections: ({ context }) => {
        context.set('selectedNodeId', null);
        context.set('selectedClusterId', null);
      },
      switchToNodeDetails: ({ context }) => {
        context.set('activeTab', 'nodeDetails');
      },
      switchToClusterDetails: ({ context }) => {
        context.set('activeTab', 'clusterDetails');
      },
      switchToFilters: ({ context }) => {
        context.set('activeTab', 'filters');
      },
      switchTab: ({ context, event }) => {
        if (event.type === 'SWITCH_TAB') {
          context.set('activeTab', event.tab);
        }
      },
      toggleSection: ({ context, event }) => {
        if (event.type === 'TOGGLE_SECTION') {
          const sections = context.get('expandedSections');
          context.set('expandedSections', {
            ...sections,
            [event.section]: !sections[event.section],
          });
        }
      },
      expandSection: ({ context, event }) => {
        if (event.type === 'EXPAND_TO_SECTION') {
          const sections = context.get('expandedSections');
          context.set('expandedSections', {
            ...sections,
            [event.section]: true,
          });
        }
      },
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
