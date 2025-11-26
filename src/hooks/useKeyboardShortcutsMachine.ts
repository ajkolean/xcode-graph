import { useMachine } from '@zag-js/react';
import { useCallback, useId } from 'react';
import { keyboardShortcutsMachine } from '../machines/keyboardShortcuts.machine';

interface UseKeyboardShortcutsMachineProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * React hook for the keyboard shortcuts panel state machine
 *
 * Provides a simple API for toggling the keyboard shortcuts panel.
 */
export function useKeyboardShortcutsMachine(props: UseKeyboardShortcutsMachineProps = {}) {
  const id = useId();
  const service = useMachine(keyboardShortcutsMachine, {
    id,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });

  // Current state
  const isOpen = service.state.matches('open');
  const isClosed = service.state.matches('closed');

  // Actions
  const toggle = useCallback(() => {
    service.send({ type: 'TOGGLE' });
  }, [service]);

  const open = useCallback(() => {
    service.send({ type: 'OPEN' });
  }, [service]);

  const close = useCallback(() => {
    service.send({ type: 'CLOSE' });
  }, [service]);

  return {
    // State
    isOpen,
    isClosed,

    // Actions
    toggle,
    open,
    close,

    // Raw service for advanced use cases
    service,
  };
}
