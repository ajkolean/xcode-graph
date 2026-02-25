/**
 * Cluster Schema - Cluster layout and positioning validation
 *
 * Defines schemas for cluster grouping, node roles, positioning,
 * and layout configuration. Used for organizing nodes into visual groups.
 *
 * @module schemas/cluster
 */

import { z } from 'zod';
import { type GraphNode, GraphNodeSchema, type Origin, OriginSchema } from './graph.schema';

// ==================== Native Enums ====================

/**
 * Node role enum - determines positioning strategy within a cluster
 *
 * - Entry: Main entry point/anchor (center of cluster)
 * - InternalFramework: Heavily depended-upon internal module
 * - InternalLib: Internal library with moderate dependencies
 * - Utility: Helper/utility with few dependencies
 * - Test: Test target (positioned in outer ring)
 * - Tool: CLI or development tool
 */
export enum NodeRole {
  Entry = 'entry',
  InternalFramework = 'internal-framework',
  InternalLib = 'internal-lib',
  Utility = 'utility',
  Test = 'test',
  Tool = 'tool',
}

/**
 * Cluster type enum - distinguishes local projects from packages
 */
export enum ClusterType {
  Project = 'project',
  Package = 'package',
}

/**
 * ELK Hierarchy Handling strategy
 * - INHERIT: Use parent's setting (root defaults to SEPARATE_CHILDREN)
 * - INCLUDE_CHILDREN: Layout node and all descendants in single run
 * - SEPARATE_CHILDREN: Each child triggers its own layout run
 */
export enum ElkHierarchyHandling {
  Inherit = 'INHERIT',
  IncludeChildren = 'INCLUDE_CHILDREN',
  SeparateChildren = 'SEPARATE_CHILDREN',
}

/**
 * ELK-specific layout options that can be set per-cluster
 */
export interface ClusterElkOptions {
  hierarchyHandling?: ElkHierarchyHandling | undefined;
}

// ==================== Type Definitions ====================

/** Node metadata within cluster */
export interface ClusterNodeMetadata {
  /** Reference to the node */
  nodeId: string;
  /** Positioning role */
  role: NodeRole;
  /** Ring layer (0 = center, higher = outer) */
  layer: number;
  /** Whether this is an entry point */
  isAnchor: boolean;
  /** Whether external nodes depend on this */
  hasExternalDependents: boolean;
  /** For tests, IDs of nodes being tested */
  testSubjects?: string[] | undefined;
  /** Number of nodes depending on this */
  dependencyCount: number;
  /** Number of nodes this depends on */
  dependsOnCount: number;
}

/** Cluster bounding box */
export interface ClusterBounds {
  /** X position of top-left corner */
  x: number;
  /** Y position of top-left corner */
  y: number;
  /** Width of bounding box */
  width: number;
  /** Height of bounding box */
  height: number;
}

/**
 * Cluster type with runtime metadata Map
 *
 * Uses Map for O(1) node metadata lookup at runtime
 */
export interface Cluster {
  /** Unique cluster identifier */
  id: string;
  /** Display name */
  name: string;
  /** Whether project or package */
  type: ClusterType;
  /** Local or external origin */
  origin: Origin;
  /** Path to the project/package directory */
  path?: string | undefined;
  /** Nodes belonging to this cluster */
  nodes: GraphNode[];
  /** IDs of anchor/entry nodes */
  anchors: string[];
  /** Node metadata as Map for efficient lookup */
  metadata: Map<string, ClusterNodeMetadata>;
  /** ELK layout options for this cluster (overrides global config) */
  elkOptions?: ClusterElkOptions | undefined;
  /** Visual bounding box */
  bounds?: ClusterBounds | undefined;
}

/** Serialized cluster format (metadata as array for JSON) */
export interface ClusterSerialized extends Omit<Cluster, 'metadata'> {
  /** Node metadata as array for serialization */
  metadata: ClusterNodeMetadata[];
}

/** Node with position data */
export interface PositionedNode {
  /** The graph node */
  node: GraphNode;
  /** X position in graph coordinates */
  x: number;
  /** Y position in graph coordinates */
  y: number;
  /** Parent cluster ID */
  clusterId: string;
  /** Layout metadata */
  metadata: ClusterNodeMetadata;
  /** X position relative to cluster center */
  localX?: number | undefined;
  /** Y position relative to cluster center */
  localY?: number | undefined;
  /** Target distance from center (ring layout) */
  targetRadius?: number | undefined;
  /** Target angle in radians (ring layout) */
  targetAngle?: number | undefined;
}

/** Physics force strengths */
export interface ForceStrength {
  /** Boundary containment force */
  boundary: number;
  /** Radial positioning force */
  radial: number;
  /** Collision avoidance force */
  collision: number;
  /** Anchor attraction force */
  anchor: number;
  /** Test node satellite orbit force */
  testSatellite: number;
}

/** Layout configuration */
export interface ClusterLayoutConfig {
  /** Padding inside cluster boundary */
  clusterPadding: number;
  /** Spacing between clusters */
  clusterSpacing: number;
  /** Spacing between ring layers */
  layerSpacing: number;
  /** Minimum spacing between nodes */
  minNodeSpacing: number;
  /** Base ring radius */
  ringRadius: number;
  /** Size of anchor nodes */
  anchorNodeSize: number;
  /** Size of normal nodes */
  normalNodeSize: number;
  /** Size of test nodes */
  testNodeSize: number;
  /** Orbit radius for test nodes */
  testOrbitRadius: number;
  /** Physics force strengths */
  forceStrength: ForceStrength;
}

// ==================== Enum Schemas ====================

export const NodeRoleSchema: z.ZodType<NodeRole> = z.nativeEnum(NodeRole);
export const ClusterTypeSchema: z.ZodType<ClusterType> = z.nativeEnum(ClusterType);

// ==================== Entity Schemas ====================

/**
 * Extended node metadata for cluster layout
 */
export const ClusterNodeMetadataSchema: z.ZodType<ClusterNodeMetadata> = z.object({
  nodeId: z.string(),
  role: NodeRoleSchema,
  layer: z.number().int().nonnegative(),
  isAnchor: z.boolean(),
  hasExternalDependents: z.boolean(),
  testSubjects: z.array(z.string()).optional(),
  dependencyCount: z.number().int().nonnegative(),
  dependsOnCount: z.number().int().nonnegative(),
});

/**
 * Cluster bounding box schema
 */
export const ClusterBoundsSchema: z.ZodType<ClusterBounds> = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/**
 * Cluster schema - validates serialized cluster format
 *
 * Note: metadata is an array in schema (JSON-serializable),
 * but a Map at runtime for O(1) lookup
 */
export const ClusterSchema: z.ZodType<ClusterSerialized> = z.object({
  id: z.string(),
  name: z.string(),
  type: ClusterTypeSchema,
  origin: OriginSchema,
  path: z.string().optional(),
  nodes: z.array(GraphNodeSchema),
  anchors: z.array(z.string()),
  metadata: z.array(ClusterNodeMetadataSchema),
  elkOptions: z
    .object({
      hierarchyHandling: z.nativeEnum(ElkHierarchyHandling).optional(),
    })
    .optional(),
  bounds: ClusterBoundsSchema.optional(),
});

/**
 * Positioned node with cluster layout information
 */
export const PositionedNodeSchema: z.ZodType<PositionedNode> = z.object({
  node: GraphNodeSchema,
  x: z.number(),
  y: z.number(),
  clusterId: z.string(),
  metadata: ClusterNodeMetadataSchema,
  localX: z.number().optional(),
  localY: z.number().optional(),
  targetRadius: z.number().optional(),
  targetAngle: z.number().optional(),
});

// ==================== Configuration Schemas ====================

/**
 * Force strength configuration for physics simulation
 */
export const ForceStrengthSchema: z.ZodType<ForceStrength> = z.object({
  boundary: z.number(),
  radial: z.number(),
  collision: z.number(),
  anchor: z.number(),
  testSatellite: z.number(),
});

/**
 * Cluster layout configuration schema
 */
export const ClusterLayoutConfigSchema: z.ZodType<ClusterLayoutConfig> = z.object({
  clusterPadding: z.number(),
  clusterSpacing: z.number(),
  layerSpacing: z.number(),
  minNodeSpacing: z.number(),
  ringRadius: z.number(),
  anchorNodeSize: z.number(),
  normalNodeSize: z.number(),
  testNodeSize: z.number(),
  testOrbitRadius: z.number(),
  forceStrength: ForceStrengthSchema,
});

// ==================== Default Configuration ====================

/** Default layout configuration values */
export const DEFAULT_CLUSTER_CONFIG: ClusterLayoutConfig = {
  ringRadius: 75,
  layerSpacing: 75,
  minNodeSpacing: 55,
  testOrbitRadius: 40,
  clusterPadding: 35,
  clusterSpacing: 80,
  anchorNodeSize: 16,
  normalNodeSize: 12,
  testNodeSize: 10,
  forceStrength: {
    anchor: 0.9,
    radial: 0.4,
    testSatellite: 0.6,
    collision: 0.5,
    boundary: 0.6,
  },
};

// ==================== Value Arrays ====================

/** All node role values for iteration */
export const NODE_ROLE_VALUES: NodeRole[] = Object.values(NodeRole);
/** All cluster type values for iteration */
export const CLUSTER_TYPE_VALUES: ClusterType[] = Object.values(ClusterType);
