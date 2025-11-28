/**
 * Graph Schema - Core graph data validation
 *
 * Defines Zod schemas for validating graph nodes, edges, and data.
 * These schemas ensure type safety and data integrity for graph operations.
 *
 * @module schemas/graph
 */

import { z } from 'zod';

// ==================== Enum Schemas ====================

/**
 * Node type schema - defines the category of a graph node
 *
 * - app: Runnable application target
 * - framework: Reusable framework/module
 * - library: Static/dynamic library
 * - test-unit: Unit test target
 * - test-ui: UI/integration test target
 * - cli: Command-line tool
 * - package: External dependency
 */
export const NodeTypeSchema = z.enum([
  'app',
  'framework',
  'library',
  'test-unit',
  'test-ui',
  'cli',
  'package',
]);

/**
 * Platform schema - Apple platform targets
 */
export const PlatformSchema = z.enum(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']);

/**
 * Origin schema - source of the node
 *
 * - local: Part of the workspace/project
 * - external: Third-party dependency
 */
export const OriginSchema = z.enum(['local', 'external']);

// ==================== Entity Schemas ====================

/**
 * Graph node schema - validates individual graph nodes
 */
export const GraphNodeSchema = z.object({
  /** Unique identifier for the node */
  id: z.string().min(1, 'Node ID is required'),
  /** Display name of the node */
  name: z.string().min(1, 'Node name is required'),
  /** Type/category of the node */
  type: NodeTypeSchema,
  /** Target platform */
  platform: PlatformSchema,
  /** Whether local or external */
  origin: OriginSchema,
  /** Parent project/package name */
  project: z.string().optional(),
  /** Number of targets in this node */
  targetCount: z.number().int().nonnegative().optional(),
});

/**
 * Graph edge schema - validates directed edges between nodes
 */
export const GraphEdgeSchema = z.object({
  /** ID of the source node (depends on target) */
  source: z.string().min(1, 'Edge source is required'),
  /** ID of the target node (dependency) */
  target: z.string().min(1, 'Edge target is required'),
});

/**
 * Graph data schema with referential integrity validation
 *
 * Validates that all edge endpoints reference existing nodes
 */
export const GraphDataSchema = z
  .object({
    /** All nodes in the graph */
    nodes: z.array(GraphNodeSchema),
    /** All edges (dependencies) in the graph */
    edges: z.array(GraphEdgeSchema),
  })
  .refine(
    (data) => {
      const nodeIds = new Set(data.nodes.map((n) => n.id));
      return data.edges.every((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    },
    { message: 'All edge endpoints must reference existing nodes' },
  );

// ==================== Type Exports ====================

/** Node type enum values */
export type NodeType = z.infer<typeof NodeTypeSchema>;
/** Platform enum values */
export type Platform = z.infer<typeof PlatformSchema>;
/** Origin enum values */
export type Origin = z.infer<typeof OriginSchema>;
/** Graph node structure */
export type GraphNode = z.infer<typeof GraphNodeSchema>;
/** Graph edge structure */
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
/** Complete graph data structure */
export type GraphData = z.infer<typeof GraphDataSchema>;

// ==================== Value Arrays ====================

/** All node type values as array for iteration */
export const NODE_TYPE_VALUES = NodeTypeSchema.options;
/** All platform values as array for iteration */
export const PLATFORM_VALUES = PlatformSchema.options;
/** All origin values as array for iteration */
export const ORIGIN_VALUES = OriginSchema.options;
