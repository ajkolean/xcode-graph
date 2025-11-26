import { useMachine } from '@zag-js/react';
import { useCallback, useId } from 'react';
import type { ViewMode } from '../schemas/app.schema';
import { viewModeMachine } from '../machines/viewMode.machine';

interface UseViewModeMachineProps {
  selectedNodeId?: string | null;
  onModeChange?: (mode: ViewMode) => void;
}

/**
 * React hook for the view mode state machine
 *
 * Provides a convenient API for managing view mode state transitions
 * with proper React integration.
 */
export function useViewModeMachine(props: UseViewModeMachineProps = {}) {
  const id = useId();
  const service = useMachine(viewModeMachine, {
    id,
    selectedNodeId: props.selectedNodeId,
    onModeChange: props.onModeChange,
  });

  // Current view mode derived from state
  const mode = service.state.get() as ViewMode;
  const selectedNodeId = service.context.get('selectedNodeId');

  // Derived boolean states
  const isFullView = service.state.matches('full');
  const isFocused = service.state.matches('focused');
  const isDependents = service.state.matches('dependents');
  const isBoth = service.state.matches('both');
  const isImpact = service.state.matches('impact');

  // Actions
  const selectNode = useCallback(
    (nodeId: string) => {
      service.send({ type: 'SELECT_NODE', nodeId });
    },
    [service],
  );

  const deselectNode = useCallback(() => {
    service.send({ type: 'DESELECT_NODE' });
  }, [service]);

  const toggleFocus = useCallback(() => {
    service.send({ type: 'TOGGLE_FOCUS' });
  }, [service]);

  const toggleDependents = useCallback(() => {
    service.send({ type: 'TOGGLE_DEPENDENTS' });
  }, [service]);

  const showImpact = useCallback(() => {
    service.send({ type: 'SHOW_IMPACT' });
  }, [service]);

  const reset = useCallback(() => {
    service.send({ type: 'RESET' });
  }, [service]);

  return {
    // State
    mode,
    selectedNodeId,

    // Derived state
    isFullView,
    isFocused,
    isDependents,
    isBoth,
    isImpact,

    // Actions
    selectNode,
    deselectNode,
    toggleFocus,
    toggleDependents,
    showImpact,
    reset,

    // Raw service for advanced use cases
    service,
  };
}
