import { createMachine, type MachineSchema } from '@zag-js/core';

/**
 * Keyboard shortcuts panel machine schema
 */
interface KeyboardShortcutsMachineSchema extends MachineSchema {
  props: {
    id: string;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  };
  state: 'closed' | 'open';
  event: { type: 'TOGGLE' } | { type: 'OPEN' } | { type: 'CLOSE' };
  action: 'notifyOpenChange';
}

/**
 * Keyboard shortcuts panel state machine
 *
 * Simple toggle machine for the keyboard shortcuts panel.
 * States: closed, open
 */
export const keyboardShortcutsMachine = createMachine<KeyboardShortcutsMachineSchema>({
  props({ props }) {
    return {
      id: props.id ?? 'keyboard-shortcuts',
      defaultOpen: props.defaultOpen ?? false,
      onOpenChange: props.onOpenChange,
    };
  },

  initialState({ prop }) {
    return prop('defaultOpen') ? 'open' : 'closed';
  },

  states: {
    closed: {
      on: {
        TOGGLE: { target: 'open' },
        OPEN: { target: 'open' },
      },
    },
    open: {
      entry: ['notifyOpenChange'],
      on: {
        TOGGLE: { target: 'closed' },
        CLOSE: { target: 'closed' },
      },
      exit: ['notifyOpenChange'],
    },
  },

  implementations: {
    actions: {
      notifyOpenChange: ({ prop, state }) => {
        const onOpenChange = prop('onOpenChange');
        if (onOpenChange) {
          onOpenChange(state.get() === 'open');
        }
      },
    },
  },
});

export type { KeyboardShortcutsMachineSchema };
