import { useMachine } from '@zag-js/react';
import { useCallback, useId } from 'react';
import { type ExportFormat, exportModalMachine } from '../machines/exportModal.machine';

interface UseExportModalMachineProps {
  onOpenChange?: (open: boolean) => void;
  onExport?: (format: ExportFormat) => Promise<void>;
}

/**
 * React hook for the export modal state machine
 *
 * Provides a convenient API for managing export modal state including:
 * - Modal visibility
 * - Format selection
 * - Export progress tracking
 * - Error handling
 */
export function useExportModalMachine(props: UseExportModalMachineProps = {}) {
  const id = useId();
  const service = useMachine(exportModalMachine, {
    id,
    onOpenChange: props.onOpenChange,
    onExport: props.onExport,
  });

  // Current state
  const isClosed = service.state.matches('closed');
  const isOpen = !service.state.matches('closed');
  const isSelectingFormat = service.state.matches('formatSelection');
  const isExporting = service.state.matches('exporting');
  const isSuccess = service.state.matches('success');
  const isError = service.state.matches('error');

  const selectedFormat = service.context.get('selectedFormat');
  const exportProgress = service.context.get('exportProgress');
  const error = service.context.get('error');

  // Actions
  const open = useCallback(() => {
    service.send({ type: 'OPEN' });
  }, [service]);

  const close = useCallback(() => {
    service.send({ type: 'CLOSE' });
  }, [service]);

  const selectFormat = useCallback(
    (format: ExportFormat) => {
      service.send({ type: 'SELECT_FORMAT', format });
    },
    [service],
  );

  const startExport = useCallback(() => {
    service.send({ type: 'START_EXPORT' });
  }, [service]);

  const setProgress = useCallback(
    (progress: number) => {
      service.send({ type: 'EXPORT_PROGRESS', progress });
    },
    [service],
  );

  const exportSuccess = useCallback(() => {
    service.send({ type: 'EXPORT_SUCCESS' });
  }, [service]);

  const exportError = useCallback(
    (errorMessage: string) => {
      service.send({ type: 'EXPORT_ERROR', error: errorMessage });
    },
    [service],
  );

  const retry = useCallback(() => {
    service.send({ type: 'RETRY' });
  }, [service]);

  return {
    // State
    isClosed,
    isOpen,
    isSelectingFormat,
    isExporting,
    isSuccess,
    isError,
    selectedFormat,
    exportProgress,
    error,

    // Actions
    open,
    close,
    selectFormat,
    startExport,
    setProgress,
    exportSuccess,
    exportError,
    retry,

    // Raw service for advanced use cases
    service,
  };
}

export type { ExportFormat };
