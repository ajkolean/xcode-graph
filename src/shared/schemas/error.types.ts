/**
 * Error Types - Error handling and notification types
 *
 * Pure TypeScript enums, interfaces, and constants for error severity levels,
 * categories, and error states. No Zod dependency.
 *
 * @module schemas/error
 */

/**
 * Error severity levels
 *
 * @public
 */
export enum ErrorSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}

/**
 * Error category enum - categorizes errors by domain
 *
 * @public
 */
export enum ErrorCategory {
  Network = 'network',
  Layout = 'layout',
  Rendering = 'rendering',
  Data = 'data',
  Worker = 'worker',
  State = 'state',
  Unknown = 'unknown',
}

/**
 * Application error with metadata
 *
 * @public
 */
export interface AppError {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  details?: string | undefined;
  timestamp: number;
  dismissed: boolean;
  dismissible: boolean;
  actionLabel?: string | undefined;
  actionType?: string | undefined;
}

/**
 * Error notification state
 *
 * @public
 */
export interface ErrorNotificationState {
  errors: AppError[];
  maxVisible: number;
}

/**
 * Default maximum visible toasts
 *
 * @public
 */
export const DEFAULT_MAX_VISIBLE_TOASTS = 3;

/**
 * Default toast duration by severity (milliseconds)
 *
 * @public
 */
export const DEFAULT_TOAST_DURATION: Record<ErrorSeverity, number> = {
  [ErrorSeverity.Info]: 3000,
  [ErrorSeverity.Warning]: 5000,
  [ErrorSeverity.Error]: 7000,
  [ErrorSeverity.Critical]: 0,
};
