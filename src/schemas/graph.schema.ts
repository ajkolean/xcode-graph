import { z } from 'zod';

/**
 * Node type schema - matches GraphNode['type']
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
 * Platform schema - matches GraphNode['platform']
 */
export const PlatformSchema = z.enum(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']);

/**
 * Origin schema - matches GraphNode['origin']
 */
export const OriginSchema = z.enum(['local', 'external']);

/**
 * Graph node schema
 */
export const GraphNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  name: z.string().min(1, 'Node name is required'),
  type: NodeTypeSchema,
  platform: PlatformSchema,
  origin: OriginSchema,
  project: z.string().optional(),
  targetCount: z.number().int().nonnegative().optional(),
});

/**
 * Graph edge schema
 */
export const GraphEdgeSchema = z.object({
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
});

/**
 * Graph data schema with referential integrity validation
 */
export const GraphDataSchema = z
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

// Type exports - inferred from schemas
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type Origin = z.infer<typeof OriginSchema>;
export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type GraphData = z.infer<typeof GraphDataSchema>;

// Re-export schema values as arrays for iteration
export const NODE_TYPE_VALUES = NodeTypeSchema.options;
export const PLATFORM_VALUES = PlatformSchema.options;
export const ORIGIN_VALUES = OriginSchema.options;
