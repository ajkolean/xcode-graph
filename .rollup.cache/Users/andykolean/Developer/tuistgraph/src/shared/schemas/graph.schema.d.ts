/**
 * Graph Schema - Zod validation schemas for graph data
 *
 * @module schemas/graph
 */
import { z } from 'zod';
import type { BuildSettings, DeploymentTargets, Destination, ForeignBuildInfo, GraphData, GraphEdge, GraphNode } from './graph.types';
import { DependencyKind, NodeType, Origin, Platform, SourceType } from './graph.types';
export * from './graph.types';
export declare const NodeTypeSchema: z.ZodType<NodeType>;
export declare const PlatformSchema: z.ZodType<Platform>;
export declare const OriginSchema: z.ZodType<Origin>;
export declare const DependencyKindSchema: z.ZodType<DependencyKind>;
export declare const SourceTypeSchema: z.ZodType<SourceType>;
export declare const BuildSettingsSchema: z.ZodType<BuildSettings>;
export declare const ForeignBuildInfoSchema: z.ZodType<ForeignBuildInfo>;
export declare const DeploymentTargetsSchema: z.ZodType<DeploymentTargets>;
export declare const DestinationSchema: z.ZodType<Destination>;
export declare const GraphNodeSchema: z.ZodType<GraphNode>;
export declare const GraphEdgeSchema: z.ZodType<GraphEdge>;
export declare const GraphDataSchema: z.ZodType<GraphData>;
export declare const LenientNodeTypeSchema: z.ZodCatch<z.ZodEnum<typeof NodeType>>;
export declare const LenientPlatformSchema: z.ZodCatch<z.ZodEnum<typeof Platform>>;
export declare const LenientOriginSchema: z.ZodCatch<z.ZodEnum<typeof Origin>>;
export declare const LenientDependencyKindSchema: z.ZodCatch<z.ZodEnum<typeof DependencyKind>>;
export declare const LenientGraphDataSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodCatch<z.ZodEnum<typeof NodeType>>;
        platform: z.ZodCatch<z.ZodEnum<typeof Platform>>;
        origin: z.ZodCatch<z.ZodEnum<typeof Origin>>;
        project: z.ZodOptional<z.ZodString>;
        targetCount: z.ZodOptional<z.ZodNumber>;
        bundleId: z.ZodOptional<z.ZodString>;
        productName: z.ZodOptional<z.ZodString>;
        deploymentTargets: z.ZodOptional<z.ZodType<DeploymentTargets, unknown, z.core.$ZodTypeInternals<DeploymentTargets, unknown>>>;
        destinations: z.ZodOptional<z.ZodArray<z.ZodType<Destination, unknown, z.core.$ZodTypeInternals<Destination, unknown>>>>;
        sourcePaths: z.ZodOptional<z.ZodArray<z.ZodString>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        path: z.ZodOptional<z.ZodString>;
        isRemote: z.ZodOptional<z.ZodBoolean>;
        buildSettings: z.ZodOptional<z.ZodType<BuildSettings, unknown, z.core.$ZodTypeInternals<BuildSettings, unknown>>>;
        sourceCount: z.ZodOptional<z.ZodNumber>;
        resourceCount: z.ZodOptional<z.ZodNumber>;
        notableResources: z.ZodOptional<z.ZodArray<z.ZodString>>;
        foreignBuild: z.ZodOptional<z.ZodType<ForeignBuildInfo, unknown, z.core.$ZodTypeInternals<ForeignBuildInfo, unknown>>>;
    }, z.core.$strip>>;
    edges: z.ZodArray<z.ZodObject<{
        source: z.ZodString;
        target: z.ZodString;
        kind: z.ZodOptional<z.ZodCatch<z.ZodEnum<typeof DependencyKind>>>;
        platformConditions: z.ZodOptional<z.ZodArray<z.ZodCatch<z.ZodEnum<typeof Platform>>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
