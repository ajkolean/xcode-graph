/**
 * Singleton error handling service. Dispatches AppError notifications via signals.
 *
 * ## Error Handling Convention
 *
 * This project uses a three-tier error handling strategy:
 *
 * 1. **System boundary errors** (layout failures, data loading, network) —
 *    Use `ErrorService.getInstance().handleError(err, { category, userMessage })`.
 *    These create user-visible toast notifications and are logged with full context.
 *
 * 2. **UI interaction errors** (non-critical, recoverable) —
 *    Use `console.warn(...)` with a descriptive message.
 *    These are developer-visible only and do not surface to end users.
 *
 * 3. **Worker/fallback errors** (web worker failures with graceful degradation) —
 *    Always log with `console.warn(message, error)` before falling back.
 *    Never silently swallow errors in catch blocks.
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

/** Delay before removing a dismissed error from state, allowing exit animation (ms) */
const ERROR_REMOVAL_DELAY_MS = 1000;

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

/** Generates a unique error ID using timestamp and random suffix. */
function generateErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extracts a human-readable message from an unknown error value.
 * @param error - The caught error (Error, string, object, or unknown)
 * @returns The error message string, or 'Unknown error' as fallback
 */
function extractErrorMessage(error: unknown): string {
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
 * Extracts detail information (stack trace or JSON) from an unknown error value.
 * @param error - The caught error
 * @returns Stack trace string, JSON representation, or undefined
 */
function extractErrorDetails(error: unknown): string | undefined {
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
 * Logs an AppError to the console at the appropriate level based on severity.
 * @param appError - The structured application error
 * @param originalError - The original caught error for context
 */
function logError(appError: AppError, originalError: unknown): void {
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
    /* v8 ignore next 2 */
    default:
      break;
  }
}

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
   * Returns the singleton ErrorService instance, creating it if necessary.
   * @returns The shared ErrorService instance
   */
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
   * Handle an error and create a notification.
   *
   * @param error - The caught error (Error, string, or unknown)
   * @param options - Configuration for severity, category, and display
   * @returns The created AppError dispatched to signals
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

    const errorMessage = extractErrorMessage(error);
    const errorDetails = extractErrorDetails(error);

    const appError: AppError = {
      id: generateErrorId(),
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
      logError(appError, error);
    }

    addError(appError);
    this.setupAutoDismiss(appError.id, severity, autoDismissMs);

    return appError;
  }

  /**
   * Handle a critical error that cannot be dismissed.
   *
   * @param error - The caught error
   * @param userMessage - Optional user-facing message override
   * @returns The created AppError
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
   * Handle a warning notification.
   *
   * @param message - Warning message to display
   * @param category - Optional error category
   * @returns The created AppError
   */
  public handleWarning(message: string, category?: ErrorCategory): AppError {
    return this.handleError(new Error(message), {
      severity: ErrorSeverityEnum.Warning,
      category: category || ErrorCategoryEnum.Unknown,
      userMessage: message,
    });
  }

  /**
   * Handle an info notification (not logged to console).
   *
   * @param message - Info message to display
   * @returns The created AppError
   */
  public handleInfo(message: string): AppError {
    return this.handleError(new Error(message), {
      severity: ErrorSeverityEnum.Info,
      userMessage: message,
      logToConsole: false,
    });
  }

  /**
   * Register an action handler for error actions.
   *
   * @param actionType - Unique identifier for the action (e.g. `'retry-fetch'`)
   * @param handler - Callback invoked when the user triggers this action
   */
  public registerActionHandler(actionType: string, handler: ErrorActionHandler): void {
    this.actionHandlers.set(actionType, handler);
  }

  /**
   * Unregister an action handler.
   *
   * @param actionType - The action type to remove
   */
  public unregisterActionHandler(actionType: string): void {
    this.actionHandlers.delete(actionType);
  }

  /**
   * Execute the registered action handler for an error's action type.
   *
   * @param error - The error whose action to execute
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
   * Dismiss an error notification. Clears any auto-dismiss timer
   * and removes the error from state after a 1-second animation delay.
   *
   * @param errorId - ID of the error to dismiss
   */
  public dismiss(errorId: string): void {
    const timer = this.autoDismissTimers.get(errorId);
    if (timer) {
      clearTimeout(timer);
      this.autoDismissTimers.delete(errorId);
    }

    dismissError(errorId);

    // Remove after animation
    setTimeout(() => {
      removeError(errorId);
    }, ERROR_REMOVAL_DELAY_MS);
  }

  /**
   * Schedules automatic dismissal of an error notification after a duration.
   * Uses custom duration if provided, otherwise falls back to severity-based defaults.
   * @param errorId - ID of the error to auto-dismiss
   * @param severity - Error severity, used to determine default duration
   * @param customDurationMs - Optional override for the dismiss delay in milliseconds
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
