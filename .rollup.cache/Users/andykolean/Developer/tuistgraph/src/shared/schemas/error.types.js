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
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["Info"] = "info";
    ErrorSeverity["Warning"] = "warning";
    ErrorSeverity["Error"] = "error";
    ErrorSeverity["Critical"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * Error category enum - categorizes errors by domain
 */
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["Network"] = "network";
    ErrorCategory["Layout"] = "layout";
    ErrorCategory["Rendering"] = "rendering";
    ErrorCategory["Data"] = "data";
    ErrorCategory["Worker"] = "worker";
    ErrorCategory["State"] = "state";
    ErrorCategory["Unknown"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));
// ==================== Defaults ====================
/** Default maximum visible toasts */
export const DEFAULT_MAX_VISIBLE_TOASTS = 3;
/** Default toast duration by severity (milliseconds) */
export const DEFAULT_TOAST_DURATION = {
    [ErrorSeverity.Info]: 3000,
    [ErrorSeverity.Warning]: 5000,
    [ErrorSeverity.Error]: 7000,
    [ErrorSeverity.Critical]: 0,
};
//# sourceMappingURL=error.types.js.map