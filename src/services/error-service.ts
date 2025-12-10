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

import type { AppError, ErrorCategory, ErrorSeverity } from '@shared/schemas/error.schema';
import {
  DEFAULT_TOAST_DURATION,
  ErrorCategory as ErrorCategoryEnum,
  ErrorSeverity as ErrorSeverityEnum,
} from '@shared/schemas/error.schema';
import { addError, dismissError, removeError } from '@shared/signals/error.actions';

// ==================== Type Definitions ====================

/**
 * Options for handling an error
 */
export interface ErrorHandlingOptions {
  /** Error category - defaults to Unknown */
  category?: ErrorCategory;
  /** Error severity - defaults to Error */
  severity?: ErrorSeverity;
  /** User-facing message - defaults to generic message */
  userMessage?: string;
  /** Whether error can be dismissed - defaults to true */
  dismissible?: boolean;
  /** Optional action label (e.g., "Retry") */
  actionLabel?: string;
  /** Optional action type identifier */
  actionType?: string;
  /** Whether to log to console - defaults to true */
  logToConsole?: boolean;
  /** Auto-dismiss duration in ms - defaults based on severity */
  autoDismissMs?: number;
}

/**
 * Error action handler callback
 */
export type ErrorActionHandler = (error: AppError) => void | Promise<void>;

// ==================== Constants ====================

const DEFAULT_USER_MESSAGE = 'An unexpected error occurred';

// ==================== Service Class ====================

/**
 * Centralized error handling service (Singleton)
 */
export class ErrorService {
  private static instance: ErrorService | null = null;

  /** Map of action type to handler function */
  private actionHandlers = new Map<string, ErrorActionHandler>();

  /** Map of error ID to auto-dismiss timeout */
  private autoDismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    if (ErrorService.instance) {
      ErrorService.instance.cleanup();
      ErrorService.instance = null;
    }
  }

  // ========================================
  // Error Handling
  // ========================================

  /**
   * Handle an error and create a notification
   *
   * @param error - The error to handle (Error object or string)
   * @param options - Configuration options
   * @returns The created AppError
   */
  public handleError(error: unknown, options: ErrorHandlingOptions = {}): AppError {
    const {
      category = ErrorCategoryEnum.Unknown,
      severity = ErrorSeverityEnum.Error,
      userMessage,
      dismissible = true,
      actionLabel,
      actionType,
      logToConsole = true,
      autoDismissMs,
    } = options;

    // Extract error details
    const errorMessage = this.extractErrorMessage(error);
    const errorDetails = this.extractErrorDetails(error);

    // Create app error
    const appError: AppError = {
      id: this.generateErrorId(),
      severity,
      category,
      message: userMessage || errorMessage || DEFAULT_USER_MESSAGE,
      details: errorDetails,
      timestamp: Date.now(),
      dismissed: false,
      dismissible,
      actionLabel,
      actionType,
    };

    // Log to console if enabled
    if (logToConsole) {
      this.logError(appError, error);
    }

    // Add to signal state
    addError(appError);

    // Set up auto-dismiss if configured
    this.setupAutoDismiss(appError.id, severity, autoDismissMs);

    return appError;
  }

  /**
   * Handle a critical error that cannot be dismissed
   */
  public handleCriticalError(error: unknown, userMessage?: string): AppError {
    return this.handleError(error, {
      severity: ErrorSeverityEnum.Critical,
      category: ErrorCategoryEnum.Unknown,
      userMessage,
      dismissible: false,
    });
  }

  /**
   * Handle a warning
   */
  public handleWarning(message: string, category?: ErrorCategory): AppError {
    return this.handleError(new Error(message), {
      severity: ErrorSeverityEnum.Warning,
      category: category || ErrorCategoryEnum.Unknown,
      userMessage: message,
    });
  }

  /**
   * Handle an info notification
   */
  public handleInfo(message: string): AppError {
    return this.handleError(new Error(message), {
      severity: ErrorSeverityEnum.Info,
      userMessage: message,
      logToConsole: false,
    });
  }

  // ========================================
  // Error Actions
  // ========================================

  /**
   * Register an action handler for error actions
   *
   * @param actionType - The action type identifier
   * @param handler - The handler function
   */
  public registerActionHandler(actionType: string, handler: ErrorActionHandler): void {
    this.actionHandlers.set(actionType, handler);
  }

  /**
   * Unregister an action handler
   *
   * @param actionType - The action type identifier
   */
  public unregisterActionHandler(actionType: string): void {
    this.actionHandlers.delete(actionType);
  }

  /**
   * Execute an error action
   *
   * @param error - The error with action
   */
  public async executeAction(error: AppError): Promise<void> {
    if (!error.actionType) {
      return;
    }

    const handler = this.actionHandlers.get(error.actionType);
    if (!handler) {
      console.warn(`[ErrorService] No handler registered for action type: ${error.actionType}`);
      return;
    }

    try {
      await handler(error);
    } catch (actionError) {
      console.error('[ErrorService] Error executing action:', actionError);
      this.handleError(actionError, {
        category: ErrorCategoryEnum.Unknown,
        userMessage: 'Failed to execute error action',
      });
    }
  }

  /**
   * Dismiss an error notification
   *
   * @param errorId - The error ID to dismiss
   */
  public dismiss(errorId: string): void {
    // Clear auto-dismiss timer
    const timer = this.autoDismissTimers.get(errorId);
    if (timer) {
      clearTimeout(timer);
      this.autoDismissTimers.delete(errorId);
    }

    // Dismiss error
    dismissError(errorId);

    // Remove after animation (1 second)
    setTimeout(() => {
      removeError(errorId);
    }, 1000);
  }

  // ========================================
  // Private Helpers
  // ========================================

  /**
   * Generate a unique error ID
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Extract error message from unknown error type
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Unknown error';
  }

  /**
   * Extract detailed error information
   */
  private extractErrorDetails(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    if (error && typeof error === 'object') {
      try {
        return JSON.stringify(error, null, 2);
      } catch {
        return String(error);
      }
    }
    return undefined;
  }

  /**
   * Log error to console with appropriate level
   */
  private logError(appError: AppError, originalError: unknown): void {
    const prefix = `[ErrorService][${appError.category}]`;
    const logData = {
      severity: appError.severity,
      message: appError.message,
      details: appError.details,
      originalError,
    };

    switch (appError.severity) {
      case ErrorSeverityEnum.Critical:
      case ErrorSeverityEnum.Error:
        console.error(prefix, logData);
        break;
      case ErrorSeverityEnum.Warning:
        console.warn(prefix, logData);
        break;
      case ErrorSeverityEnum.Info:
        console.log(prefix, logData);
        break;
    }
  }

  /**
   * Set up auto-dismiss timer for error
   */
  private setupAutoDismiss(
    errorId: string,
    severity: ErrorSeverity,
    customDurationMs?: number,
  ): void {
    const duration = customDurationMs ?? DEFAULT_TOAST_DURATION[severity];

    if (duration === 0) {
      return; // Never auto-dismiss
    }

    const timer = setTimeout(() => {
      this.dismiss(errorId);
      this.autoDismissTimers.delete(errorId);
    }, duration);

    this.autoDismissTimers.set(errorId, timer);
  }

  /**
   * Clean up all timers (called on reset)
   */
  private cleanup(): void {
    for (const timer of this.autoDismissTimers.values()) {
      clearTimeout(timer);
    }
    this.autoDismissTimers.clear();
    this.actionHandlers.clear();
  }
}

/**
 * Export singleton instance for convenience
 */
export const errorService = ErrorService.getInstance();
