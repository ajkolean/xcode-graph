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

// ==================== Type Definitions ====================

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
  project?: string;
  /** Number of targets in this node */
  targetCount?: number;
}

/** Graph edge structure */
export interface GraphEdge {
  /** ID of the source node (depends on target) */
  source: string;
  /** ID of the target node (dependency) */
  target: string;
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

// ==================== Entity Schemas ====================

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
});

/**
 * Graph edge schema - validates directed edges between nodes
 */
export const GraphEdgeSchema: z.ZodType<GraphEdge> = z.object({
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
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
