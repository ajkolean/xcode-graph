/**
 * Error Signals - Error notification state management
 *
 * Manages error notification state including active errors,
 * dismissed errors, and toast visibility settings.
 *
 * @module signals/error
 */

import { type Signal, signal } from '@lit-labs/signals';
import type { AppError } from '@shared/schemas/error.types';
import { DEFAULT_MAX_VISIBLE_TOASTS } from '@shared/schemas/error.types';

/** Active error notifications */
export const errors: Signal.State<AppError[]> = signal<AppError[]>([]);

/** Maximum number of visible toasts at once */
export const maxVisibleToasts: Signal.State<number> = signal<number>(DEFAULT_MAX_VISIBLE_TOASTS);

/**
 * Get visible (non-dismissed) errors.
 *
 * @returns Array of errors that have not been dismissed
 */
export function getVisibleErrors(): AppError[] {
  return errors.get().filter((error) => !error.dismissed);
}

/**
 * Get errors to display in toast notifications (up to `maxVisibleToasts`).
 *
 * @returns Array of non-dismissed errors, limited to the configured maximum
 */
export function getToastErrors(): AppError[] {
  const visible = getVisibleErrors();
  const max = maxVisibleToasts.get();
  return visible.slice(0, max);
}

/**
 * Get an error by its unique ID.
 *
 * @param id - The error ID to look up
 * @returns The matching error, or `undefined` if not found
 */
export function getErrorById(id: string): AppError | undefined {
  return errors.get().find((error) => error.id === id);
}

/**
 * Reset all error signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetErrorSignals(): void {
  errors.set([]);
  maxVisibleToasts.set(DEFAULT_MAX_VISIBLE_TOASTS);
}
