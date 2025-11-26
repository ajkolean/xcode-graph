import { createMachine, type MachineSchema } from '@zag-js/core';

/**
 * Export format types
 */
export type ExportFormat = 'json' | 'png' | 'svg' | 'dot';

/**
 * Export modal machine schema
 */
interface ExportModalMachineSchema extends MachineSchema {
  props: {
    id: string;
    onOpenChange?: (open: boolean) => void;
    onExport?: (format: ExportFormat) => Promise<void>;
  };
  context: {
    selectedFormat: ExportFormat | null;
    exportProgress: number;
    error: string | null;
  };
  state: 'closed' | 'formatSelection' | 'exporting' | 'success' | 'error';
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'SELECT_FORMAT'; format: ExportFormat }
    | { type: 'START_EXPORT' }
    | { type: 'EXPORT_PROGRESS'; progress: number }
    | { type: 'EXPORT_SUCCESS' }
    | { type: 'EXPORT_ERROR'; error: string }
    | { type: 'RETRY' };
  action:
    | 'resetContext'
    | 'setFormat'
    | 'setProgress'
    | 'setError'
    | 'clearError'
    | 'notifyOpenChange';
  guard: 'hasSelectedFormat';
}

/**
 * Export modal state machine
 *
 * Manages the export modal state:
 * - closed: Modal is not visible
 * - formatSelection: User is selecting export format
 * - exporting: Export is in progress
 * - success: Export completed successfully
 * - error: Export failed with an error
 */
export const exportModalMachine = createMachine<ExportModalMachineSchema>({
  props({ props }) {
    return {
      id: props.id ?? 'export-modal',
      onOpenChange: props.onOpenChange,
      onExport: props.onExport,
    };
  },

  context({ bindable }) {
    return {
      selectedFormat: bindable(() => ({
        defaultValue: null,
      })),
      exportProgress: bindable(() => ({
        defaultValue: 0,
      })),
      error: bindable(() => ({
        defaultValue: null,
      })),
    };
  },

  initialState() {
    return 'closed';
  },

  states: {
    closed: {
      on: {
        OPEN: {
          target: 'formatSelection',
          actions: ['resetContext', 'notifyOpenChange'],
        },
      },
    },

    formatSelection: {
      on: {
        CLOSE: {
          target: 'closed',
          actions: ['notifyOpenChange'],
        },
        SELECT_FORMAT: {
          actions: ['setFormat'],
        },
        START_EXPORT: {
          target: 'exporting',
          guard: 'hasSelectedFormat',
        },
      },
    },

    exporting: {
      on: {
        EXPORT_PROGRESS: {
          actions: ['setProgress'],
        },
        EXPORT_SUCCESS: { target: 'success' },
        EXPORT_ERROR: {
          target: 'error',
          actions: ['setError'],
        },
      },
    },

    success: {
      on: {
        CLOSE: {
          target: 'closed',
          actions: ['notifyOpenChange'],
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: 'formatSelection',
          actions: ['clearError'],
        },
        CLOSE: {
          target: 'closed',
          actions: ['notifyOpenChange'],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasSelectedFormat: ({ context }) => context.get('selectedFormat') !== null,
    },
    actions: {
      resetContext: ({ context }) => {
        context.set('selectedFormat', null);
        context.set('exportProgress', 0);
        context.set('error', null);
      },
      setFormat: ({ context, event }) => {
        if (event.type === 'SELECT_FORMAT') {
          context.set('selectedFormat', event.format);
        }
      },
      setProgress: ({ context, event }) => {
        if (event.type === 'EXPORT_PROGRESS') {
          context.set('exportProgress', event.progress);
        }
      },
      setError: ({ context, event }) => {
        if (event.type === 'EXPORT_ERROR') {
          context.set('error', event.error);
        }
      },
      clearError: ({ context }) => {
        context.set('error', null);
        context.set('exportProgress', 0);
      },
      notifyOpenChange: ({ prop, state }) => {
        const onOpenChange = prop('onOpenChange');
        if (onOpenChange) {
          onOpenChange(state.get() !== 'closed');
        }
      },
    },
  },
});

export type { ExportModalMachineSchema };
