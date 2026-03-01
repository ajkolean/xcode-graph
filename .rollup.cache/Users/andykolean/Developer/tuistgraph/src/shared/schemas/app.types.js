/**
 * App Types - Application state types
 *
 * Pure TypeScript enums, interfaces, and constants for view modes, filter states,
 * and UI configuration. No Zod dependency — see app.schema.ts for validation schemas.
 *
 * @module schemas/app
 */
// ==================== Native Enums ====================
/**
 * Active tab enum - application navigation tabs
 */
export var ActiveTab;
(function (ActiveTab) {
    ActiveTab["Overview"] = "overview";
    ActiveTab["Builds"] = "builds";
    ActiveTab["TestRuns"] = "test-runs";
    ActiveTab["ModuleCache"] = "module-cache";
    ActiveTab["XcodeCache"] = "xcode-cache";
    ActiveTab["Previews"] = "previews";
    ActiveTab["Qa"] = "qa";
    ActiveTab["Bundles"] = "bundles";
    ActiveTab["Graph"] = "graph";
})(ActiveTab || (ActiveTab = {}));
/**
 * View mode enum - determines graph visualization mode
 */
export var ViewMode;
(function (ViewMode) {
    ViewMode["Full"] = "full";
    ViewMode["Focused"] = "focused";
    ViewMode["Path"] = "path";
    ViewMode["Dependents"] = "dependents";
    ViewMode["Both"] = "both";
})(ViewMode || (ViewMode = {}));
/**
 * Serialize FilterState back to arrays for persistence
 */
export function serializeFilterState(state) {
    return {
        nodeTypes: Array.from(state.nodeTypes),
        platforms: Array.from(state.platforms),
        origins: Array.from(state.origins),
        projects: Array.from(state.projects),
        packages: Array.from(state.packages),
    };
}
// ==================== Value Arrays ====================
/** All active tab values for iteration */
export const ACTIVE_TAB_VALUES = Object.values(ActiveTab);
/** All view mode values for iteration */
export const VIEW_MODE_VALUES = Object.values(ViewMode);
/** Default active tab */
export const DEFAULT_ACTIVE_TAB = ActiveTab.Graph;
//# sourceMappingURL=app.types.js.map