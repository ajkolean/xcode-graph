/**
 * Error Actions - State mutation functions for error signals
 *
 * Contains all actions for modifying error notification state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/error.actions
 */

import type { AppError, ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
import { errors, maxVisibleToasts } from './error.signals';

/**
 * Add a new error notification
 * @param error - The error to add
 */
export function addError(error: AppError): void {
  const currentErrors = errors.get();
  errors.set([...currentErrors, error]);
}

/**
 * Remove an error by ID
 * @param id - The error ID to remove
 */
export function removeError(id: string): void {
  const currentErrors = errors.get();
  errors.set(currentErrors.filter((error) => error.id !== id));
}

/**
 * Dismiss an error by ID (marks as dismissed but doesn't remove)
 * @param id - The error ID to dismiss
 */
export function dismissError(id: string): void {
  const currentErrors = errors.get();
  errors.set(
    currentErrors.map((error) => (error.id === id ? { ...error, dismissed: true } : error)),
  );
}

/**
 * Clear all errors
 */
export function clearAllErrors(): void {
  errors.set([]);
}

/**
 * Clear all dismissed errors
 */
export function clearDismissedErrors(): void {
  const currentErrors = errors.get();
  errors.set(currentErrors.filter((error) => !error.dismissed));
}

/**
 * Clear errors by severity
 * @param severity - The severity level to clear
 */
export function clearErrorsBySeverity(severity: ErrorSeverity): void {
  const currentErrors = errors.get();
  errors.set(currentErrors.filter((error) => error.severity !== severity));
}

/**
 * Clear errors by category
 * @param category - The category to clear
 */
export function clearErrorsByCategory(category: ErrorCategory): void {
  const currentErrors = errors.get();
  errors.set(currentErrors.filter((error) => error.category !== category));
}

/**
 * Set maximum visible toasts
 * @param max - Maximum number of visible toasts (1-10)
 */
export function setMaxVisibleToasts(max: number): void {
  maxVisibleToasts.set(Math.max(1, Math.min(10, max)));
}
