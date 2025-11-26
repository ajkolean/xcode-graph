import { createMachine, type MachineSchema } from '@zag-js/core';

/**
 * View mode machine schema
 */
interface ViewModeMachineSchema extends MachineSchema {
  props: {
    id: string;
    selectedNodeId?: string | null;
    onModeChange?: (mode: string) => void;
  };
  context: {
    selectedNodeId: string | null;
  };
  state: 'full' | 'focused' | 'dependents' | 'both' | 'impact';
  event:
    | { type: 'SELECT_NODE'; nodeId: string }
    | { type: 'DESELECT_NODE' }
    | { type: 'TOGGLE_FOCUS' }
    | { type: 'TOGGLE_DEPENDENTS' }
    | { type: 'SHOW_IMPACT' }
    | { type: 'RESET' };
  action: 'setSelectedNode' | 'clearSelectedNode' | 'notifyModeChange';
  guard: 'hasSelectedNode';
}

/**
 * View mode state machine
 *
 * Handles complex view mode transitions:
 * - full: Show all nodes
 * - focused: Show selected node and its dependencies
 * - dependents: Show selected node and nodes that depend on it
 * - both: Show both dependencies and dependents
 * - impact: Show impact analysis view
 */
export const viewModeMachine = createMachine<ViewModeMachineSchema>({
  props({ props }) {
    return {
      id: props.id ?? 'view-mode',
      selectedNodeId: props.selectedNodeId ?? null,
      onModeChange: props.onModeChange,
    };
  },

  context({ prop, bindable }) {
    return {
      selectedNodeId: bindable(() => ({
        defaultValue: prop('selectedNodeId'),
      })),
    };
  },

  initialState({ prop }) {
    return 'full';
  },

  states: {
    full: {
      on: {
        SELECT_NODE: {
          actions: ['setSelectedNode'],
        },
        TOGGLE_FOCUS: {
          target: 'focused',
          guard: 'hasSelectedNode',
        },
        TOGGLE_DEPENDENTS: {
          target: 'dependents',
          guard: 'hasSelectedNode',
        },
        SHOW_IMPACT: {
          target: 'impact',
          guard: 'hasSelectedNode',
        },
      },
    },

    focused: {
      entry: ['notifyModeChange'],
      on: {
        SELECT_NODE: {
          actions: ['setSelectedNode'],
        },
        TOGGLE_FOCUS: { target: 'full' },
        TOGGLE_DEPENDENTS: { target: 'both' },
        SHOW_IMPACT: { target: 'impact' },
        DESELECT_NODE: {
          target: 'full',
          actions: ['clearSelectedNode'],
        },
        RESET: { target: 'full' },
      },
    },

    dependents: {
      entry: ['notifyModeChange'],
      on: {
        SELECT_NODE: {
          actions: ['setSelectedNode'],
        },
        TOGGLE_DEPENDENTS: { target: 'full' },
        TOGGLE_FOCUS: { target: 'both' },
        SHOW_IMPACT: { target: 'impact' },
        DESELECT_NODE: {
          target: 'full',
          actions: ['clearSelectedNode'],
        },
        RESET: { target: 'full' },
      },
    },

    both: {
      entry: ['notifyModeChange'],
      on: {
        SELECT_NODE: {
          actions: ['setSelectedNode'],
        },
        TOGGLE_FOCUS: { target: 'dependents' },
        TOGGLE_DEPENDENTS: { target: 'focused' },
        SHOW_IMPACT: { target: 'impact' },
        DESELECT_NODE: {
          target: 'full',
          actions: ['clearSelectedNode'],
        },
        RESET: { target: 'full' },
      },
    },

    impact: {
      entry: ['notifyModeChange'],
      on: {
        SELECT_NODE: {
          actions: ['setSelectedNode'],
        },
        TOGGLE_FOCUS: { target: 'focused' },
        TOGGLE_DEPENDENTS: { target: 'dependents' },
        DESELECT_NODE: {
          target: 'full',
          actions: ['clearSelectedNode'],
        },
        RESET: { target: 'full' },
      },
    },
  },

  implementations: {
    guards: {
      hasSelectedNode: ({ context }) => context.get('selectedNodeId') !== null,
    },
    actions: {
      setSelectedNode: ({ context, event }) => {
        if (event.type === 'SELECT_NODE') {
          context.set('selectedNodeId', event.nodeId);
        }
      },
      clearSelectedNode: ({ context }) => {
        context.set('selectedNodeId', null);
      },
      notifyModeChange: ({ prop, state }) => {
        const onModeChange = prop('onModeChange');
        if (onModeChange) {
          onModeChange(state.get());
        }
      },
    },
  },
});

export type { ViewModeMachineSchema };
