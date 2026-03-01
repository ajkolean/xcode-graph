/**
 * Graph Types - Core graph data types
 *
 * Pure TypeScript enums, interfaces, and constants for graph nodes, edges, and data.
 * No Zod dependency — see graph.schema.ts for validation schemas.
 *
 * @module schemas/graph
 */
// ==================== Native Enums ====================
/**
 * Node type enum - defines the category of a graph node
 *
 * - App: Runnable application target
 * - Framework: Reusable framework/module
 * - Library: Static/dynamic library
 * - TestUnit: Unit test target
 * - TestUi: UI/integration test target
 * - Cli: Command-line tool
 * - Package: External dependency
 */
export var NodeType;
(function (NodeType) {
    NodeType["App"] = "app";
    NodeType["Framework"] = "framework";
    NodeType["Library"] = "library";
    NodeType["TestUnit"] = "test-unit";
    NodeType["TestUi"] = "test-ui";
    NodeType["Cli"] = "cli";
    NodeType["Package"] = "package";
})(NodeType || (NodeType = {}));
/**
 * Platform enum - Apple platform targets
 */
export var Platform;
(function (Platform) {
    Platform["iOS"] = "iOS";
    Platform["macOS"] = "macOS";
    Platform["visionOS"] = "visionOS";
    Platform["tvOS"] = "tvOS";
    Platform["watchOS"] = "watchOS";
})(Platform || (Platform = {}));
/**
 * Origin enum - source of the node
 *
 * - Local: Part of the workspace/project
 * - External: Third-party dependency
 */
export var Origin;
(function (Origin) {
    Origin["Local"] = "local";
    Origin["External"] = "external";
})(Origin || (Origin = {}));
/**
 * Dependency kind enum - type of dependency relationship
 *
 * - Target: Dependency on another target in same project
 * - Project: Cross-project/cross-package dependency
 * - Sdk: System SDK/framework dependency
 * - XCFramework: Binary XCFramework dependency
 */
export var DependencyKind;
(function (DependencyKind) {
    DependencyKind["Target"] = "target";
    DependencyKind["Project"] = "project";
    DependencyKind["Sdk"] = "sdk";
    DependencyKind["XCFramework"] = "xcframework";
})(DependencyKind || (DependencyKind = {}));
/**
 * Source type enum - where the project/package came from
 *
 * - Local: Local workspace project
 * - Registry: Downloaded from Swift Package Registry
 * - Git: Cloned from Git repository
 */
export var SourceType;
(function (SourceType) {
    SourceType["Local"] = "local";
    SourceType["Registry"] = "registry";
    SourceType["Git"] = "git";
})(SourceType || (SourceType = {}));
// ==================== Value Arrays ====================
/** All node type values as array for iteration */
export const NODE_TYPE_VALUES = Object.values(NodeType);
/** All platform values as array for iteration */
export const PLATFORM_VALUES = Object.values(Platform);
/** All origin values as array for iteration */
export const ORIGIN_VALUES = Object.values(Origin);
/** All source type values as array for iteration */
export const SOURCE_TYPE_VALUES = Object.values(SourceType);
//# sourceMappingURL=graph.types.js.map