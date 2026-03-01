/**
 * Cluster Schema - Zod validation schemas for cluster layout
 *
 * @module schemas/cluster
 */
import { z } from 'zod';
import type { ClusterBounds, ClusterLayoutConfig, ClusterNodeMetadata, ClusterSerialized, ForceStrength, PositionedNode } from './cluster.types';
import { ClusterType, NodeRole } from './cluster.types';
export * from './cluster.types';
export declare const NodeRoleSchema: z.ZodType<NodeRole>;
export declare const ClusterTypeSchema: z.ZodType<ClusterType>;
export declare const ClusterNodeMetadataSchema: z.ZodType<ClusterNodeMetadata>;
export declare const ClusterBoundsSchema: z.ZodType<ClusterBounds>;
export declare const ClusterSchema: z.ZodType<ClusterSerialized>;
export declare const PositionedNodeSchema: z.ZodType<PositionedNode>;
export declare const ForceStrengthSchema: z.ZodType<ForceStrength>;
export declare const ClusterLayoutConfigSchema: z.ZodType<ClusterLayoutConfig>;
//# sourceMappingURL=cluster.schema.d.ts.map