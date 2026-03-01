/**
 * Singleton error handling service. Dispatches AppError notifications via signals.
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
import {
  DEFAULT_TOAST_DURATION,
  ErrorCategory as ErrorCategoryEnum,
  ErrorSeverity as ErrorSeverityEnum,
} from '@shared/schemas/error.types';
import { addError, dismissError, removeError } from '@shared/signals/error.actions';

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

const DEFAULT_USER_MESSAGE = 'An unexpected error occurred';

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

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /** For testing only. */
  public static resetInstance(): void {
    if (ErrorService.instance) {
      ErrorService.instance.cleanup();
      ErrorService.instance = null;
    }
  }

  /**
   * Handle an error and create a notification
   *
   * @param error
   * @param options
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

    const errorMessage = this.extractErrorMessage(error);
    const errorDetails = this.extractErrorDetails(error);

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

    if (logToConsole) {
      this.logError(appError, error);
    }

    addError(appError);
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

  /**
   * Register an action handler for error actions
   *
   * @param actionType
   * @param handler
   */
  public registerActionHandler(actionType: string, handler: ErrorActionHandler): void {
    this.actionHandlers.set(actionType, handler);
  }

  /**
   * Unregister an action handler
   *
   * @param actionType
   */
  public unregisterActionHandler(actionType: string): void {
    this.actionHandlers.delete(actionType);
  }

  /**
   * Execute an error action
   *
   * @param error
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
   * @param errorId
   */
  public dismiss(errorId: string): void {
    const timer = this.autoDismissTimers.get(errorId);
    if (timer) {
      clearTimeout(timer);
      this.autoDismissTimers.delete(errorId);
    }

    dismissError(errorId);

    // Remove after animation (1 second)
    setTimeout(() => {
      removeError(errorId);
    }, 1000);
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

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

  /** Clears all timers on reset. */
  private cleanup(): void {
    for (const timer of this.autoDismissTimers.values()) {
      clearTimeout(timer);
    }
    this.autoDismissTimers.clear();
    this.actionHandlers.clear();
  }
}

export const errorService: ErrorService = ErrorService.getInstance();
