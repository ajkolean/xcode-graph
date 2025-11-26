import { z } from 'zod';

/**
 * Node position schema for simulation
 */
export const NodePositionSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  clusterId: z.string(),
  radius: z.number(),
  targetRadius: z.number().optional(),
  targetAngle: z.number().optional(),
  isAnchor: z.boolean().optional(),
  isTest: z.boolean().optional(),
  testSubject: z.string().optional(),
});

/**
 * Cluster position schema for simulation
 */
export const ClusterPositionSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  nodeCount: z.number().int().nonnegative(),
});

// Type exports
export type NodePosition = z.infer<typeof NodePositionSchema>;
export type ClusterPosition = z.infer<typeof ClusterPositionSchema>;
