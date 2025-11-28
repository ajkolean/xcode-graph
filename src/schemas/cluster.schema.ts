/**
 * Cluster Schema - Cluster layout and positioning validation
 *
 * Defines schemas for cluster grouping, node roles, positioning,
 * and layout configuration. Used for organizing nodes into visual groups.
 *
 * @module schemas/cluster
 */

import { z } from 'zod';
import { GraphNodeSchema, OriginSchema } from './graph.schema';

// ==================== Enum Schemas ====================

/**
 * Node role within a cluster - determines positioning strategy
 *
 * - entry: Main entry point/anchor (center of cluster)
 * - internal-framework: Heavily depended-upon internal module
 * - internal-lib: Internal library with moderate dependencies
 * - utility: Helper/utility with few dependencies
 * - test: Test target (positioned in outer ring)
 * - tool: CLI or development tool
 */
export const NodeRoleSchema = z.enum([
  'entry',
  'internal-framework',
  'internal-lib',
  'utility',
  'test',
  'tool',
]);

/**
 * Cluster type schema - distinguishes local projects from packages
 */
export const ClusterTypeSchema = z.enum(['project', 'package']);

// ==================== Metadata Schemas ====================

/**
 * Extended node metadata for cluster layout
 */
export const ClusterNodeMetadataSchema = z.object({
  /** Reference to the node */
  nodeId: z.string(),
  /** Positioning role */
  role: NodeRoleSchema,
  /** Ring layer (0 = center, higher = outer) */
  layer: z.number().int().nonnegative(),
  /** Whether this is an entry point */
  isAnchor: z.boolean(),
  /** Whether external nodes depend on this */
  hasExternalDependents: z.boolean(),
  /** For tests, IDs of nodes being tested */
  testSubjects: z.array(z.string()).optional(),
  /** Number of nodes depending on this */
  dependencyCount: z.number().int().nonnegative(),
  /** Number of nodes this depends on */
  dependsOnCount: z.number().int().nonnegative(),
});

/**
 * Cluster bounding box schema
 */
export const ClusterBoundsSchema = z.object({
  /** X position of top-left corner */
  x: z.number(),
  /** Y position of top-left corner */
  y: z.number(),
  /** Width of bounding box */
  width: z.number().positive(),
  /** Height of bounding box */
  height: z.number().positive(),
});

// ==================== Entity Schemas ====================

/**
 * Cluster schema - represents a project or package group
 *
 * Note: metadata is a Map at runtime but not validated here
 * since Maps aren't JSON-serializable
 */
export const ClusterSchema = z.object({
  /** Unique cluster identifier */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Whether project or package */
  type: ClusterTypeSchema,
  /** Local or external origin */
  origin: OriginSchema,
  /** Nodes belonging to this cluster */
  nodes: z.array(GraphNodeSchema),
  /** IDs of anchor/entry nodes */
  anchors: z.array(z.string()),
  /** Visual bounding box */
  bounds: ClusterBoundsSchema.optional(),
});

/**
 * Positioned node with cluster layout information
 */
export const PositionedNodeSchema = z.object({
  /** The graph node */
  node: GraphNodeSchema,
  /** X position in graph coordinates */
  x: z.number(),
  /** Y position in graph coordinates */
  y: z.number(),
  /** Parent cluster ID */
  clusterId: z.string(),
  /** Layout metadata */
  metadata: ClusterNodeMetadataSchema,
  /** X position relative to cluster center */
  localX: z.number().optional(),
  /** Y position relative to cluster center */
  localY: z.number().optional(),
  /** Target distance from center (ring layout) */
  targetRadius: z.number().optional(),
  /** Target angle in radians (ring layout) */
  targetAngle: z.number().optional(),
});

// ==================== Configuration Schemas ====================

/**
 * Force strength configuration for physics simulation
 */
export const ForceStrengthSchema = z.object({
  /** Boundary containment force */
  boundary: z.number(),
  /** Radial positioning force */
  radial: z.number(),
  /** Collision avoidance force */
  collision: z.number(),
  /** Anchor attraction force */
  anchor: z.number(),
  /** Test node satellite orbit force */
  testSatellite: z.number(),
});

/**
 * Cluster layout configuration schema
 */
export const ClusterLayoutConfigSchema = z.object({
  /** Padding inside cluster boundary */
  clusterPadding: z.number(),
  /** Spacing between clusters */
  clusterSpacing: z.number(),
  /** Spacing between ring layers */
  layerSpacing: z.number(),
  /** Minimum spacing between nodes */
  minNodeSpacing: z.number(),
  /** Base ring radius */
  ringRadius: z.number(),
  /** Size of anchor nodes */
  anchorNodeSize: z.number(),
  /** Size of normal nodes */
  normalNodeSize: z.number(),
  /** Size of test nodes */
  testNodeSize: z.number(),
  /** Orbit radius for test nodes */
  testOrbitRadius: z.number(),
  /** Physics force strengths */
  forceStrength: ForceStrengthSchema,
});

// ==================== Type Exports ====================

/** Node role values */
export type NodeRole = z.infer<typeof NodeRoleSchema>;
/** Cluster type values */
export type ClusterType = z.infer<typeof ClusterTypeSchema>;
/** Node metadata within cluster */
export type ClusterNodeMetadata = z.infer<typeof ClusterNodeMetadataSchema>;
/** Cluster bounding box */
export type ClusterBounds = z.infer<typeof ClusterBoundsSchema>;
/** Node with position data */
export type PositionedNode = z.infer<typeof PositionedNodeSchema>;
/** Physics force strengths */
export type ForceStrength = z.infer<typeof ForceStrengthSchema>;
/** Layout configuration */
export type ClusterLayoutConfig = z.infer<typeof ClusterLayoutConfigSchema>;

/**
 * Cluster type with runtime metadata Map
 *
 * Extends schema type with Map for O(1) node metadata lookup
 */
export interface Cluster extends Omit<z.infer<typeof ClusterSchema>, 'metadata'> {
  metadata: Map<string, ClusterNodeMetadata>;
}

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
export const NODE_ROLE_VALUES = NodeRoleSchema.options;
/** All cluster type values for iteration */
export const CLUSTER_TYPE_VALUES = ClusterTypeSchema.options;
