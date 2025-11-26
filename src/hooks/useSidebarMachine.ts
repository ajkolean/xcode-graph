import { useMachine } from '@zag-js/react';
import { useCallback, useId } from 'react';
import {
  type SidebarSection,
  type SidebarTab,
  sidebarMachine,
} from '../machines/sidebar.machine';

interface UseSidebarMachineProps {
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

/**
 * React hook for the sidebar state machine
 *
 * Provides a convenient API for managing sidebar state including:
 * - Collapsed/expanded state
 * - Active tab management
 * - Section expansion (accordion behavior)
 * - Node/cluster selection
 */
export function useSidebarMachine(props: UseSidebarMachineProps = {}) {
  const id = useId();
  const service = useMachine(sidebarMachine, {
    id,
    defaultCollapsed: props.defaultCollapsed,
    onCollapseChange: props.onCollapseChange,
  });

  // Current state
  const isCollapsed = service.state.matches('collapsed');
  const isExpanded = service.state.matches('expanded');
  const activeTab = service.context.get('activeTab');
  const expandedSections = service.context.get('expandedSections');
  const selectedNodeId = service.context.get('selectedNodeId');
  const selectedClusterId = service.context.get('selectedClusterId');

  // Actions
  const toggle = useCallback(() => {
    service.send({ type: 'TOGGLE' });
  }, [service]);

  const expand = useCallback(() => {
    service.send({ type: 'EXPAND' });
  }, [service]);

  const collapse = useCallback(() => {
    service.send({ type: 'COLLAPSE' });
  }, [service]);

  const selectNode = useCallback(
    (nodeId: string) => {
      service.send({ type: 'SELECT_NODE', nodeId });
    },
    [service],
  );

  const selectCluster = useCallback(
    (clusterId: string) => {
      service.send({ type: 'SELECT_CLUSTER', clusterId });
    },
    [service],
  );

  const clearSelection = useCallback(() => {
    service.send({ type: 'CLEAR_SELECTION' });
  }, [service]);

  const switchTab = useCallback(
    (tab: SidebarTab) => {
      service.send({ type: 'SWITCH_TAB', tab });
    },
    [service],
  );

  const toggleSection = useCallback(
    (section: SidebarSection) => {
      service.send({ type: 'TOGGLE_SECTION', section });
    },
    [service],
  );

  const expandToSection = useCallback(
    (section: SidebarSection) => {
      service.send({ type: 'EXPAND_TO_SECTION', section });
    },
    [service],
  );

  return {
    // State
    isCollapsed,
    isExpanded,
    activeTab,
    expandedSections,
    selectedNodeId,
    selectedClusterId,

    // Actions
    toggle,
    expand,
    collapse,
    selectNode,
    selectCluster,
    clearSelection,
    switchTab,
    toggleSection,
    expandToSection,

    // Raw service for advanced use cases
    service,
  };
}

export type { SidebarTab, SidebarSection };
