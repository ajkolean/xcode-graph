/**
 * Error Actions - State mutation functions for error signals
 *
 * Contains all actions for modifying error notification state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/error.actions
 */
import type { AppError, ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
/**
 * Add a new error notification
 * @param error - The error to add
 */
export declare function addError(error: AppError): void;
/**
 * Remove an error by ID
 * @param id - The error ID to remove
 */
export declare function removeError(id: string): void;
/**
 * Dismiss an error by ID (marks as dismissed but doesn't remove)
 * @param id - The error ID to dismiss
 */
export declare function dismissError(id: string): void;
/**
 * Clear all errors
 */
export declare function clearAllErrors(): void;
/**
 * Clear all dismissed errors
 */
export declare function clearDismissedErrors(): void;
/**
 * Clear errors by severity
 * @param severity - The severity level to clear
 */
export declare function clearErrorsBySeverity(severity: ErrorSeverity): void;
/**
 * Clear errors by category
 * @param category - The category to clear
 */
export declare function clearErrorsByCategory(category: ErrorCategory): void;
/**
 * Set maximum visible toasts
 * @param max - Maximum number of visible toasts (1-10)
 */
export declare function setMaxVisibleToasts(max: number): void;
