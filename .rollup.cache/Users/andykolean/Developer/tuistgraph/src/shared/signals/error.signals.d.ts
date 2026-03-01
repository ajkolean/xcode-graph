/**
 * Error Signals - Error notification state management
 *
 * Manages error notification state including active errors,
 * dismissed errors, and toast visibility settings.
 *
 * @module signals/error
 */
import { type Signal } from '@lit-labs/signals';
import type { AppError } from '@shared/schemas/error.types';
/** Active error notifications */
export declare const errors: Signal.State<AppError[]>;
/** Maximum number of visible toasts at once */
export declare const maxVisibleToasts: Signal.State<number>;
/**
 * Get visible (non-dismissed) errors
 */
export declare function getVisibleErrors(): AppError[];
/**
 * Get errors to display in toast notifications (up to maxVisible)
 */
export declare function getToastErrors(): AppError[];
/**
 * Get error by ID
 */
export declare function getErrorById(id: string): AppError | undefined;
/**
 * Reset all error signals to their initial state.
 * Useful for testing and cleanup.
 */
export declare function resetErrorSignals(): void;
