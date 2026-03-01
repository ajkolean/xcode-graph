/**
 * Error Types - Error handling and notification types
 *
 * Pure TypeScript enums, interfaces, and constants for error severity levels,
 * categories, and error states. No Zod dependency.
 *
 * @module schemas/error
 */

// ==================== Native Enums ====================

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}

/**
 * Error category enum - categorizes errors by domain
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

// ==================== Type Definitions ====================

/** Application error with metadata */
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

/** Error notification state */
export interface ErrorNotificationState {
  errors: AppError[];
  maxVisible: number;
}

// ==================== Value Arrays ====================

/** All error severity values for iteration */
export const ERROR_SEVERITY_VALUES: ErrorSeverity[] = Object.values(ErrorSeverity);
/** All error category values for iteration */
export const ERROR_CATEGORY_VALUES: ErrorCategory[] = Object.values(ErrorCategory);

// ==================== Defaults ====================

/** Default maximum visible toasts */
export const DEFAULT_MAX_VISIBLE_TOASTS = 3;

/** Default toast duration by severity (milliseconds) */
export const DEFAULT_TOAST_DURATION: Record<ErrorSeverity, number> = {
  [ErrorSeverity.Info]: 3000,
  [ErrorSeverity.Warning]: 5000,
  [ErrorSeverity.Error]: 7000,
  [ErrorSeverity.Critical]: 0,
};
