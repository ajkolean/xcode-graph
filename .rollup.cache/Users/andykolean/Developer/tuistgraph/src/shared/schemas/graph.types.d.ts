/**
 * Graph Types - Core graph data types
 *
 * Pure TypeScript enums, interfaces, and constants for graph nodes, edges, and data.
 * No Zod dependency — see graph.schema.ts for validation schemas.
 *
 * @module schemas/graph
 */
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
export declare enum NodeType {
    App = "app",
    Framework = "framework",
    Library = "library",
    TestUnit = "test-unit",
    TestUi = "test-ui",
    Cli = "cli",
    Package = "package"
}
/**
 * Platform enum - Apple platform targets
 */
export declare enum Platform {
    iOS = "iOS",
    macOS = "macOS",
    visionOS = "visionOS",
    tvOS = "tvOS",
    watchOS = "watchOS"
}
/**
 * Origin enum - source of the node
 *
 * - Local: Part of the workspace/project
 * - External: Third-party dependency
 */
export declare enum Origin {
    Local = "local",
    External = "external"
}
/**
 * Dependency kind enum - type of dependency relationship
 *
 * - Target: Dependency on another target in same project
 * - Project: Cross-project/cross-package dependency
 * - Sdk: System SDK/framework dependency
 * - XCFramework: Binary XCFramework dependency
 */
export declare enum DependencyKind {
    Target = "target",
    Project = "project",
    Sdk = "sdk",
    XCFramework = "xcframework"
}
/**
 * Source type enum - where the project/package came from
 *
 * - Local: Local workspace project
 * - Registry: Downloaded from Swift Package Registry
 * - Git: Cloned from Git repository
 */
export declare enum SourceType {
    Local = "local",
    Registry = "registry",
    Git = "git"
}
/** Deployment target versions per platform */
export interface DeploymentTargets {
    iOS?: string | undefined;
    macOS?: string | undefined;
    tvOS?: string | undefined;
    watchOS?: string | undefined;
    visionOS?: string | undefined;
}
/** Target destination enum */
export type Destination = 'iPhone' | 'iPad' | 'mac' | 'macCatalyst' | 'macWithiPadDesign' | 'appleTv' | 'appleWatch' | 'appleVision' | 'appleVisionWithiPadDesign';
/** Curated build settings extracted from target */
export interface BuildSettings {
    /** Swift language version */
    swiftVersion?: string | undefined;
    /** Active compilation conditions (DEBUG, RELEASE, etc.) */
    compilationConditions?: string[] | undefined;
    /** Code signing identity */
    codeSignIdentity?: string | undefined;
    /** Development team ID */
    developmentTeam?: string | undefined;
    /** Provisioning profile specifier */
    provisioningProfile?: string | undefined;
}
/** Foreign build info (non-Xcode build systems like KMP/Gradle, Bazel, CMake) */
export interface ForeignBuildInfo {
    /** Build script content */
    script: string;
    /** Output xcframework path */
    outputPath: string;
    /** Output linking type (static or dynamic) */
    outputLinking: string;
    /** Total number of inputs */
    inputCount: number;
    /** Input breakdown by type */
    inputs: {
        files: string[];
        folders: string[];
        scripts: string[];
    };
}
/** Graph node structure */
export interface GraphNode {
    /** Unique identifier for the node */
    id: string;
    /** Display name of the node */
    name: string;
    /** Type/category of the node */
    type: NodeType;
    /** Target platform */
    platform: Platform;
    /** Whether local or external */
    origin: Origin;
    /** Parent project/package name */
    project?: string | undefined;
    /** Number of targets in this node */
    targetCount?: number | undefined;
    /** Bundle identifier for the target */
    bundleId?: string | undefined;
    /** Product name for the target */
    productName?: string | undefined;
    /** Deployment target versions per platform */
    deploymentTargets?: DeploymentTargets | undefined;
    /** Supported destinations (devices) */
    destinations?: Destination[] | undefined;
    /** Source file paths */
    sourcePaths?: string[] | undefined;
    /** Metadata tags */
    tags?: string[] | undefined;
    /** Path to the target/project */
    path?: string | undefined;
    /** Whether this is a remote/external target type */
    isRemote?: boolean | undefined;
    /** Curated build settings (from Release config) */
    buildSettings?: BuildSettings | undefined;
    /** Total source file count */
    sourceCount?: number | undefined;
    /** Total resource file count */
    resourceCount?: number | undefined;
    /** Notable resources (privacy manifests, storyboards, etc.) */
    notableResources?: string[] | undefined;
    /** Foreign build info (non-Xcode build systems) */
    foreignBuild?: ForeignBuildInfo | undefined;
}
/** Graph edge structure */
export interface GraphEdge {
    /** ID of the source node (depends on target) */
    source: string;
    /** ID of the target node (dependency) */
    target: string;
    /** Type of dependency (target, project, sdk, xcframework) */
    kind?: DependencyKind | undefined;
    /** Platform conditions for this edge (e.g., ["iOS", "macOS"]) */
    platformConditions?: Platform[] | undefined;
}
/** Complete graph data structure */
export interface GraphData {
    /** All nodes in the graph */
    nodes: GraphNode[];
    /** All edges (dependencies) in the graph */
    edges: GraphEdge[];
}
/** All node type values as array for iteration */
export declare const NODE_TYPE_VALUES: NodeType[];
/** All platform values as array for iteration */
export declare const PLATFORM_VALUES: Platform[];
/** All origin values as array for iteration */
export declare const ORIGIN_VALUES: Origin[];
/** All source type values as array for iteration */
export declare const SOURCE_TYPE_VALUES: SourceType[];
//# sourceMappingURL=graph.types.d.ts.map