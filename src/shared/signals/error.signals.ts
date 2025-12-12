/**
 * Error Signals - Error notification state management
 *
 * Manages error notification state including active errors,
 * dismissed errors, and toast visibility settings.
 *
 * @module signals/error
 */

import { signal } from "@lit-labs/signals";
import type { AppError } from "@shared/schemas/error.schema";
import { DEFAULT_MAX_VISIBLE_TOASTS } from "@shared/schemas/error.schema";

// ==================== State Signals ====================

/** Active error notifications */
export const errors = signal<AppError[]>([]);

/** Maximum number of visible toasts at once */
export const maxVisibleToasts = signal<number>(DEFAULT_MAX_VISIBLE_TOASTS);

// ==================== Computed Properties ====================

/**
 * Get visible (non-dismissed) errors
 */
export function getVisibleErrors(): AppError[] {
  return errors.get().filter((error) => !error.dismissed);
}

/**
 * Get errors to display in toast notifications (up to maxVisible)
 */
export function getToastErrors(): AppError[] {
  const visible = getVisibleErrors();
  const max = maxVisibleToasts.get();
  return visible.slice(0, max);
}

/**
 * Get error by ID
 */
export function getErrorById(id: string): AppError | undefined {
  return errors.get().find((error) => error.id === id);
}

// ==================== Reset Utility ====================

/**
 * Reset all error signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetErrorSignals(): void {
  errors.set([]);
  maxVisibleToasts.set(DEFAULT_MAX_VISIBLE_TOASTS);
}
