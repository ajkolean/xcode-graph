/**
 * Error Schema - Zod validation schemas for error handling
 *
 * @module schemas/error
 */
import { z } from 'zod';
import type { AppError, ErrorNotificationState } from './error.types';
import { ErrorCategory, ErrorSeverity } from './error.types';
export * from './error.types';
export declare const ErrorSeveritySchema: z.ZodType<ErrorSeverity>;
export declare const ErrorCategorySchema: z.ZodType<ErrorCategory>;
export declare const AppErrorSchema: z.ZodType<AppError>;
export declare const ErrorNotificationStateSchema: z.ZodType<ErrorNotificationState>;
