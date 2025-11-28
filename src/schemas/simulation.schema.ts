/**
 * Simulation Schema - Physics simulation state validation
 *
 * Defines schemas for node and cluster positions during layout animation.
 * Tracks position, velocity, and physics properties.
 *
 * @module schemas/simulation
 */

import { z } from 'zod';

// ==================== Position Schemas ====================

/**
 * Node position schema - tracks node state during simulation
 */
export const NodePositionSchema = z.object({
  /** Node identifier */
  id: z.string(),
  /** X position in graph coordinates */
  x: z.number(),
  /** Y position in graph coordinates */
  y: z.number(),
  /** X velocity for physics animation */
  vx: z.number(),
  /** Y velocity for physics animation */
  vy: z.number(),
  /** Parent cluster ID */
  clusterId: z.string(),
  /** Visual radius of the node */
  radius: z.number(),
  /** Target distance from cluster center */
  targetRadius: z.number().optional(),
  /** Target angle in radians */
  targetAngle: z.number().optional(),
  /** Whether this is an anchor/entry point */
  isAnchor: z.boolean().optional(),
  /** Whether this is a test node */
  isTest: z.boolean().optional(),
  /** For test nodes, the subject being tested */
  testSubject: z.string().optional(),
});

/**
 * Cluster position schema - tracks cluster state during simulation
 */
export const ClusterPositionSchema = z.object({
  /** Cluster identifier */
  id: z.string(),
  /** X position of cluster center */
  x: z.number(),
  /** Y position of cluster center */
  y: z.number(),
  /** X velocity for physics animation */
  vx: z.number(),
  /** Y velocity for physics animation */
  vy: z.number(),
  /** Width of cluster bounding box */
  width: z.number().positive(),
  /** Height of cluster bounding box */
  height: z.number().positive(),
  /** Number of nodes in this cluster */
  nodeCount: z.number().int().nonnegative(),
});

// ==================== Type Exports ====================

/** Node position during simulation */
export type NodePosition = z.infer<typeof NodePositionSchema>;
/** Cluster position during simulation */
export type ClusterPosition = z.infer<typeof ClusterPositionSchema>;
