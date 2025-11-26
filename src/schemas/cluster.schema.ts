import { z } from 'zod';
import { GraphNodeSchema, OriginSchema } from './graph.schema';

/**
 * Node role within a cluster - determines positioning strategy
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
 * Cluster type schema
 */
export const ClusterTypeSchema = z.enum(['project', 'package']);

/**
 * Extended node metadata for cluster layout
 */
export const ClusterNodeMetadataSchema = z.object({
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
 * Cluster bounds schema
 */
export const ClusterBoundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/**
 * Cluster schema - represents a project or package group
 * Note: metadata is a Map at runtime, but we validate the structure
 */
export const ClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ClusterTypeSchema,
  origin: OriginSchema,
  nodes: z.array(GraphNodeSchema),
  anchors: z.array(z.string()),
  bounds: ClusterBoundsSchema.optional(),
  // Note: metadata Map is not validated in schema as Maps aren't JSON-serializable
  // It's constructed at runtime from validated ClusterNodeMetadata
});

/**
 * Positioned node with cluster layout information
 */
export const PositionedNodeSchema = z.object({
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

/**
 * Force strength configuration schema
 */
export const ForceStrengthSchema = z.object({
  boundary: z.number(),
  radial: z.number(),
  collision: z.number(),
  anchor: z.number(),
  testSatellite: z.number(),
});

/**
 * Cluster layout configuration schema
 */
export const ClusterLayoutConfigSchema = z.object({
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

// Type exports
export type NodeRole = z.infer<typeof NodeRoleSchema>;
export type ClusterType = z.infer<typeof ClusterTypeSchema>;
export type ClusterNodeMetadata = z.infer<typeof ClusterNodeMetadataSchema>;
export type ClusterBounds = z.infer<typeof ClusterBoundsSchema>;
export type PositionedNode = z.infer<typeof PositionedNodeSchema>;
export type ForceStrength = z.infer<typeof ForceStrengthSchema>;
export type ClusterLayoutConfig = z.infer<typeof ClusterLayoutConfigSchema>;

// Cluster type with runtime metadata Map
export interface Cluster extends Omit<z.infer<typeof ClusterSchema>, 'metadata'> {
  metadata: Map<string, ClusterNodeMetadata>;
}

// Default configuration
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

// Re-export schema values
export const NODE_ROLE_VALUES = NodeRoleSchema.options;
export const CLUSTER_TYPE_VALUES = ClusterTypeSchema.options;
