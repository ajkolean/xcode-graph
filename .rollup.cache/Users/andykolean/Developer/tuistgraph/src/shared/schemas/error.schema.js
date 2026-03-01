/**
 * Error Schema - Zod validation schemas for error handling
 *
 * @module schemas/error
 */
import { z } from 'zod';
import { ErrorCategory, ErrorSeverity } from './error.types';
// Re-export all types for backward compatibility
export * from './error.types';
// ==================== Enum Schemas ====================
export const ErrorSeveritySchema = z.enum(ErrorSeverity);
export const ErrorCategorySchema = z.enum(ErrorCategory);
// ==================== Error Schemas ====================
export const AppErrorSchema = z.object({
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
export const ErrorNotificationStateSchema = z.object({
    errors: z.array(AppErrorSchema),
    maxVisible: z.number().min(1).max(10),
});
//# sourceMappingURL=error.schema.js.map