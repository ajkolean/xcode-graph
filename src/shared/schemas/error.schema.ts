/**
 * Error Schema - Error handling and notification types
 *
 * Defines schemas for error severity levels, categories, and error states.
 * Used by the centralized error service for consistent error handling.
 *
 * @module schemas/error
 */

import { z } from 'zod';

// ==================== Native Enums ====================

/**
 * Error severity levels
 *
 * - Info: Informational messages
 * - Warning: Warnings that don't prevent operation
 * - Error: Errors that affect functionality
 * - Critical: Critical errors requiring immediate attention
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
 * - Network: Network/API failures
 * - Layout: Graph layout computation errors
 * - Rendering: Visualization rendering errors
 * - Data: Data validation/parsing errors
 * - Worker: Web worker communication errors
 * - State: State management errors
 * - Unknown: Uncategorized errors
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

/**
 * Application error with metadata
 */
export interface AppError {
  /** Unique error identifier */
  id: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Error category */
  category: ErrorCategory;
  /** Human-readable error message */
  message: string;
  /** Optional technical details */
  details?: string | undefined;
  /** Timestamp when error occurred */
  timestamp: number;
  /** Whether error has been dismissed */
  dismissed: boolean;
  /** Whether error can be dismissed */
  dismissible: boolean;
  /** Optional action label (e.g., "Retry", "Reload") */
  actionLabel?: string | undefined;
  /** Optional action callback identifier */
  actionType?: string | undefined;
}

/**
 * Error notification state
 */
export interface ErrorNotificationState {
  /** Active error notifications */
  errors: AppError[];
  /** Maximum number of visible toasts */
  maxVisible: number;
}

// ==================== Enum Schemas ====================

export const ErrorSeveritySchema: z.ZodType<ErrorSeverity> = z.nativeEnum(ErrorSeverity);
export const ErrorCategorySchema: z.ZodType<ErrorCategory> = z.nativeEnum(ErrorCategory);

// ==================== Error Schemas ====================

/**
 * Application error schema
 */
export const AppErrorSchema: z.ZodType<AppError> = z.object({
  id: z.string(),
  severity: ErrorSeveritySchema,
  category: ErrorCategorySchema,
  message: z.string().min(1),
  details: z.string().optional(),
  timestamp: z.number(),
  dismissed: z.boolean(),
  dismissible: z.boolean(),
  actionLabel: z.string().optional(),
  actionType: z.string().optional(),
});

/**
 * Error notification state schema
 */
export const ErrorNotificationStateSchema: z.ZodType<ErrorNotificationState> = z.object({
  errors: z.array(AppErrorSchema),
  maxVisible: z.number().min(1).max(10),
});

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
  [ErrorSeverity.Critical]: 0, // Never auto-dismiss
};
