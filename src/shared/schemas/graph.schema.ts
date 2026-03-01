/**
 * Graph Schema - Zod validation schemas for graph data
 *
 * @module schemas/graph
 */

import { z } from 'zod';
import type {
  BuildSettings,
  DeploymentTargets,
  Destination,
  ForeignBuildInfo,
  GraphData,
  GraphEdge,
  GraphNode,
} from './graph.types';
import { DependencyKind, NodeType, Origin, Platform, SourceType } from './graph.types';

// Re-export all types for backward compatibility
export * from './graph.types';

// ==================== Enum Schemas ====================

export const NodeTypeSchema: z.ZodType<NodeType> = z.enum(NodeType);
export const PlatformSchema: z.ZodType<Platform> = z.enum(Platform);
export const OriginSchema: z.ZodType<Origin> = z.enum(Origin);
export const DependencyKindSchema: z.ZodType<DependencyKind> = z.enum(DependencyKind);
export const SourceTypeSchema: z.ZodType<SourceType> = z.enum(SourceType);

// ==================== Entity Schemas ====================

export const BuildSettingsSchema: z.ZodType<BuildSettings> = z.object({
  swiftVersion: z.string().optional(),
  compilationConditions: z.array(z.string()).optional(),
  codeSignIdentity: z.string().optional(),
  developmentTeam: z.string().optional(),
  provisioningProfile: z.string().optional(),
});

export const ForeignBuildInfoSchema: z.ZodType<ForeignBuildInfo> = z.object({
  script: z.string(),
  outputPath: z.string(),
  outputLinking: z.string(),
  inputCount: z.number().int().nonnegative(),
  inputs: z.object({
    files: z.array(z.string()),
    folders: z.array(z.string()),
    scripts: z.array(z.string()),
  }),
});

export const DeploymentTargetsSchema: z.ZodType<DeploymentTargets> = z.object({
  iOS: z.string().optional(),
  macOS: z.string().optional(),
  tvOS: z.string().optional(),
  watchOS: z.string().optional(),
  visionOS: z.string().optional(),
});

export const DestinationSchema: z.ZodType<Destination> = z.enum([
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
  foreignBuild: ForeignBuildInfoSchema.optional(),
});

export const GraphEdgeSchema: z.ZodType<GraphEdge> = z.object({
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
  kind: DependencyKindSchema.optional(),
  platformConditions: z.array(PlatformSchema).optional(),
});

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
    { error: 'All edge endpoints must reference existing nodes' },
  );

// ==================== Lenient Schemas (Boundary Validation) ====================

export const LenientNodeTypeSchema = z.enum(NodeType).catch(NodeType.Library);
export const LenientPlatformSchema = z.enum(Platform).catch(Platform.macOS);
export const LenientOriginSchema = z.enum(Origin).catch(Origin.Local);
export const LenientDependencyKindSchema = z.enum(DependencyKind).catch(DependencyKind.Target);

const LenientGraphNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  name: z.string().min(1, 'Node name is required'),
  type: LenientNodeTypeSchema,
  platform: LenientPlatformSchema,
  origin: LenientOriginSchema,
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
  foreignBuild: ForeignBuildInfoSchema.optional(),
});

const LenientGraphEdgeSchema = z.object({
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
  kind: LenientDependencyKindSchema.optional(),
  platformConditions: z.array(LenientPlatformSchema).optional(),
});

export const LenientGraphDataSchema = z.object({
  nodes: z.array(LenientGraphNodeSchema),
  edges: z.array(LenientGraphEdgeSchema),
});
