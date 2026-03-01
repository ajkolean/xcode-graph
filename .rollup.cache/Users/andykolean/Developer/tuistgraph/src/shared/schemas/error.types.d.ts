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
 */
export declare enum ErrorSeverity {
    Info = "info",
    Warning = "warning",
    Error = "error",
    Critical = "critical"
}
/**
 * Error category enum - categorizes errors by domain
 */
export declare enum ErrorCategory {
    Network = "network",
    Layout = "layout",
    Rendering = "rendering",
    Data = "data",
    Worker = "worker",
    State = "state",
    Unknown = "unknown"
}
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
/** Default maximum visible toasts */
export declare const DEFAULT_MAX_VISIBLE_TOASTS = 3;
/** Default toast duration by severity (milliseconds) */
export declare const DEFAULT_TOAST_DURATION: Record<ErrorSeverity, number>;
//# sourceMappingURL=error.types.d.ts.map