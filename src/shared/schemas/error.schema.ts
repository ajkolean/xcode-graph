/**
 * Error Schema - Zod validation schemas for error handling
 *
 * @module schemas/error
 */

import { z } from 'zod';
import type { AppError, ErrorNotificationState } from './error.types';
import { ErrorCategory, ErrorSeverity } from './error.types';

// Re-export all types for backward compatibility
export * from './error.types';

export const ErrorSeveritySchema: z.ZodType<ErrorSeverity> = z.enum(ErrorSeverity);
export const ErrorCategorySchema: z.ZodType<ErrorCategory> = z.enum(ErrorCategory);

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

export const ErrorNotificationStateSchema: z.ZodType<ErrorNotificationState> = z.object({
  errors: z.array(AppErrorSchema),
  maxVisible: z.number().min(1).max(10),
});
