/**
 * App Types - Application state types
 *
 * Pure TypeScript enums, interfaces, and constants for view modes, filter states,
 * and UI configuration. No Zod dependency — see app.schema.ts for validation schemas.
 *
 * @module schemas/app
 */
import type { NodeType, Origin, Platform } from './graph.types';
/**
 * Active tab enum - application navigation tabs
 */
export declare enum ActiveTab {
    Overview = "overview",
    Builds = "builds",
    TestRuns = "test-runs",
    ModuleCache = "module-cache",
    XcodeCache = "xcode-cache",
    Previews = "previews",
    Qa = "qa",
    Bundles = "bundles",
    Graph = "graph"
}
/**
 * View mode enum - determines graph visualization mode
 */
export declare enum ViewMode {
    Full = "full",
    Focused = "focused",
    Path = "path",
    Dependents = "dependents",
    Both = "both"
}
/** Serializable filter state with arrays */
export interface FilterStateInput {
    nodeTypes: string[];
    platforms: string[];
    origins: string[];
    projects: string[];
    packages: string[];
}
/** Runtime filter state with Sets for efficient lookup */
export interface FilterState {
    nodeTypes: Set<NodeType>;
    platforms: Set<Platform>;
    origins: Set<Origin>;
    projects: Set<string>;
    packages: Set<string>;
}
/**
 * Serialize FilterState back to arrays for persistence
 */
export declare function serializeFilterState(state: FilterState): FilterStateInput;
/** All active tab values for iteration */
export declare const ACTIVE_TAB_VALUES: ActiveTab[];
/** All view mode values for iteration */
export declare const VIEW_MODE_VALUES: ViewMode[];
/** Default active tab */
export declare const DEFAULT_ACTIVE_TAB: ActiveTab;
//# sourceMappingURL=app.types.d.ts.map