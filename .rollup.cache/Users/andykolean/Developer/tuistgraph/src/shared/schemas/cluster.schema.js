/**
 * Cluster Schema - Zod validation schemas for cluster layout
 *
 * @module schemas/cluster
 */
import { z } from 'zod';
import { ClusterType, ElkHierarchyHandling, NodeRole } from './cluster.types';
import { GraphNodeSchema, OriginSchema } from './graph.schema';
// Re-export all types for backward compatibility
export * from './cluster.types';
// ==================== Enum Schemas ====================
export const NodeRoleSchema = z.enum(NodeRole);
export const ClusterTypeSchema = z.enum(ClusterType);
// ==================== Entity Schemas ====================
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
export const ClusterBoundsSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
});
export const ClusterSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(ClusterType),
    origin: OriginSchema,
    path: z.string().optional(),
    nodes: z.array(GraphNodeSchema),
    anchors: z.array(z.string()),
    metadata: z.array(ClusterNodeMetadataSchema),
    elkOptions: z
        .object({
        hierarchyHandling: z.enum(ElkHierarchyHandling).optional(),
    })
        .optional(),
    bounds: ClusterBoundsSchema.optional(),
});
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
// ==================== Configuration Schemas ====================
export const ForceStrengthSchema = z.object({
    boundary: z.number(),
    radial: z.number(),
    collision: z.number(),
    anchor: z.number(),
    testSatellite: z.number(),
});
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
//# sourceMappingURL=cluster.schema.js.map