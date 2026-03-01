/**
 * Error Service - Centralized error handling and notification
 *
 * Singleton service that provides a consistent interface for error handling
 * across the application. Integrates with signals for reactive UI updates.
 *
 * Features:
 * - Automatic error categorization
 * - Configurable severity levels
 * - User-facing notifications via signals
 * - Optional actions (retry, reload, etc.)
 * - Automatic toast dismissal based on severity
 *
 * @module services/error-service
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   ErrorService.getInstance().handleError(error, {
 *     category: ErrorCategory.Network,
 *     severity: ErrorSeverity.Error,
 *     userMessage: 'Failed to load graph data',
 *     actionLabel: 'Retry',
 *     actionType: 'retry-fetch'
 *   });
 * }
 * ```
 */
import type { AppError, ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
/**
 * Options for handling an error
 */
export interface ErrorHandlingOptions {
    /** Error category - defaults to Unknown */
    category?: ErrorCategory | undefined;
    /** Error severity - defaults to Error */
    severity?: ErrorSeverity | undefined;
    /** User-facing message - defaults to generic message */
    userMessage?: string | undefined;
    /** Whether error can be dismissed - defaults to true */
    dismissible?: boolean | undefined;
    /** Optional action label (e.g., "Retry") */
    actionLabel?: string | undefined;
    /** Optional action type identifier */
    actionType?: string | undefined;
    /** Whether to log to console - defaults to true */
    logToConsole?: boolean | undefined;
    /** Auto-dismiss duration in ms - defaults based on severity */
    autoDismissMs?: number | undefined;
}
/**
 * Error action handler callback
 */
export type ErrorActionHandler = (error: AppError) => void | Promise<void>;
/**
 * Centralized error handling service (Singleton)
 */
export declare class ErrorService {
    private static instance;
    /** Map of action type to handler function */
    private actionHandlers;
    /** Map of error ID to auto-dismiss timeout */
    private autoDismissTimers;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): ErrorService;
    /**
     * Reset singleton instance (for testing)
     */
    static resetInstance(): void;
    /**
     * Handle an error and create a notification
     *
     * @param error - The error to handle (Error object or string)
     * @param options - Configuration options
     * @returns The created AppError
     */
    handleError(error: unknown, options?: ErrorHandlingOptions): AppError;
    /**
     * Handle a critical error that cannot be dismissed
     */
    handleCriticalError(error: unknown, userMessage?: string): AppError;
    /**
     * Handle a warning
     */
    handleWarning(message: string, category?: ErrorCategory): AppError;
    /**
     * Handle an info notification
     */
    handleInfo(message: string): AppError;
    /**
     * Register an action handler for error actions
     *
     * @param actionType - The action type identifier
     * @param handler - The handler function
     */
    registerActionHandler(actionType: string, handler: ErrorActionHandler): void;
    /**
     * Unregister an action handler
     *
     * @param actionType - The action type identifier
     */
    unregisterActionHandler(actionType: string): void;
    /**
     * Execute an error action
     *
     * @param error - The error with action
     */
    executeAction(error: AppError): Promise<void>;
    /**
     * Dismiss an error notification
     *
     * @param errorId - The error ID to dismiss
     */
    dismiss(errorId: string): void;
    /**
     * Generate a unique error ID
     */
    private generateErrorId;
    /**
     * Extract error message from unknown error type
     */
    private extractErrorMessage;
    /**
     * Extract detailed error information
     */
    private extractErrorDetails;
    /**
     * Log error to console with appropriate level
     */
    private logError;
    /**
     * Set up auto-dismiss timer for error
     */
    private setupAutoDismiss;
    /**
     * Clean up all timers (called on reset)
     */
    private cleanup;
}
/**
 * Export singleton instance for convenience
 */
export declare const errorService: ErrorService;
//# sourceMappingURL=error-service.d.ts.map