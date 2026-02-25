/**
 * Graph Schema - Core graph data validation
 *
 * Defines Zod schemas for validating graph nodes, edges, and data.
 * These schemas ensure type safety and data integrity for graph operations.
 *
 * @module schemas/graph
 */

import { z } from 'zod';

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
export enum NodeType {
  App = 'app',
  Framework = 'framework',
  Library = 'library',
  TestUnit = 'test-unit',
  TestUi = 'test-ui',
  Cli = 'cli',
  Package = 'package',
}

/**
 * Platform enum - Apple platform targets
 */
export enum Platform {
  iOS = 'iOS',
  macOS = 'macOS',
  visionOS = 'visionOS',
  tvOS = 'tvOS',
  watchOS = 'watchOS',
}

/**
 * Origin enum - source of the node
 *
 * - Local: Part of the workspace/project
 * - External: Third-party dependency
 */
export enum Origin {
  Local = 'local',
  External = 'external',
}

/**
 * Dependency kind enum - type of dependency relationship
 *
 * - Target: Dependency on another target in same project
 * - Project: Cross-project/cross-package dependency
 * - Sdk: System SDK/framework dependency
 * - XCFramework: Binary XCFramework dependency
 */
export enum DependencyKind {
  Target = 'target',
  Project = 'project',
  Sdk = 'sdk',
  XCFramework = 'xcframework',
}

/**
 * Source type enum - where the project/package came from
 *
 * - Local: Local workspace project
 * - Registry: Downloaded from Swift Package Registry
 * - Git: Cloned from Git repository
 */
export enum SourceType {
  Local = 'local',
  Registry = 'registry',
  Git = 'git',
}

// ==================== Type Definitions ====================

/** Deployment target versions per platform */
export interface DeploymentTargets {
  iOS?: string | undefined;
  macOS?: string | undefined;
  tvOS?: string | undefined;
  watchOS?: string | undefined;
  visionOS?: string | undefined;
}

/** Target destination enum */
export type Destination =
  | 'iPhone'
  | 'iPad'
  | 'mac'
  | 'macCatalyst'
  | 'macWithiPadDesign'
  | 'appleTv'
  | 'appleWatch'
  | 'appleVision'
  | 'appleVisionWithiPadDesign';

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

// ==================== Enum Schemas ====================

export const NodeTypeSchema: z.ZodType<NodeType> = z.nativeEnum(NodeType);
export const PlatformSchema: z.ZodType<Platform> = z.nativeEnum(Platform);
export const OriginSchema: z.ZodType<Origin> = z.nativeEnum(Origin);
export const DependencyKindSchema: z.ZodType<DependencyKind> = z.nativeEnum(DependencyKind);
export const SourceTypeSchema: z.ZodType<SourceType> = z.nativeEnum(SourceType);

// ==================== Entity Schemas ====================

export const BuildSettingsSchema = z.object({
  swiftVersion: z.string().optional(),
  compilationConditions: z.array(z.string()).optional(),
  codeSignIdentity: z.string().optional(),
  developmentTeam: z.string().optional(),
  provisioningProfile: z.string().optional(),
});

export const DeploymentTargetsSchema = z.object({
  iOS: z.string().optional(),
  macOS: z.string().optional(),
  tvOS: z.string().optional(),
  watchOS: z.string().optional(),
  visionOS: z.string().optional(),
});

export const DestinationSchema = z.enum([
  'iPhone',
  'iPad',
  'mac',
  'macCatalyst',
  'macWithiPadDesign',
  'appleTv',
  'appleWatch',
  'appleVision',
  'appleVisionWithiPadDesign',
]);

/**
 * Graph node schema - validates individual graph nodes
 */
export const GraphNodeSchema: z.ZodType<GraphNode> = z.object({
  id: z.string().min(1, 'Node ID is required'),
  name: z.string().min(1, 'Node name is required'),
  type: NodeTypeSchema,
  platform: PlatformSchema,
  origin: OriginSchema,
  project: z.string().optional(),
  targetCount: z.number().int().nonnegative().optional(),
  bundleId: z.string().optional(),
  productName: z.string().optional(),
  deploymentTargets: DeploymentTargetsSchema.optional(),
  destinations: z.array(DestinationSchema).optional(),
  sourcePaths: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  path: z.string().optional(),
  isRemote: z.boolean().optional(),
  buildSettings: BuildSettingsSchema.optional(),
  sourceCount: z.number().int().nonnegative().optional(),
  resourceCount: z.number().int().nonnegative().optional(),
  notableResources: z.array(z.string()).optional(),
});

/**
 * Graph edge schema - validates directed edges between nodes
 */
export const GraphEdgeSchema: z.ZodType<GraphEdge> = z.object({
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
  kind: DependencyKindSchema.optional(),
  platformConditions: z.array(PlatformSchema).optional(),
});

/**
 * Graph data schema with referential integrity validation
 *
 * Validates that all edge endpoints reference existing nodes
 */
export const GraphDataSchema: z.ZodType<GraphData> = z
  .object({
    nodes: z.array(GraphNodeSchema),
    edges: z.array(GraphEdgeSchema),
  })
  .refine(
    (data) => {
      const nodeIds = new Set(data.nodes.map((n) => n.id));
      return data.edges.every((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    },
    { message: 'All edge endpoints must reference existing nodes' },
  );

// ==================== Value Arrays ====================

/** All node type values as array for iteration */
export const NODE_TYPE_VALUES: NodeType[] = Object.values(NodeType);
/** All platform values as array for iteration */
export const PLATFORM_VALUES: Platform[] = Object.values(Platform);
/** All origin values as array for iteration */
export const ORIGIN_VALUES: Origin[] = Object.values(Origin);
/** All dependency kind values as array for iteration */
export const DEPENDENCY_KIND_VALUES: DependencyKind[] = Object.values(DependencyKind);
/** All source type values as array for iteration */
export const SOURCE_TYPE_VALUES: SourceType[] = Object.values(SourceType);
