/**
 * Simulation Schema - Physics simulation state validation
 *
 * Defines schemas for node and cluster positions during layout animation.
 * Tracks position, velocity, and physics properties.
 *
 * @module schemas/simulation
 */

import { z } from 'zod';

// ==================== Type Definitions ====================

/** Node position during simulation */
export interface NodePosition {
  /** Node identifier */
  id: string;
  /** X position in graph coordinates */
  x: number;
  /** Y position in graph coordinates */
  y: number;
  /** X velocity for physics animation */
  vx: number;
  /** Y velocity for physics animation */
  vy: number;
  /** Z position in 3D mode */
  z?: number;
  /** Z velocity in 3D mode */
  vz?: number;
  /** Parent cluster ID */
  clusterId: string;
  /** Visual radius of the node */
  radius: number;
  /** Target distance from cluster center */
  targetRadius?: number;
  /** Target angle in radians */
  targetAngle?: number;
  /** Whether this is an anchor/entry point */
  isAnchor?: boolean;
  /** Whether this is a test node */
  isTest?: boolean;
  /** For test nodes, the subject being tested */
  testSubject?: string;
}

/** Cluster position during simulation */
export interface ClusterPosition {
  /** Cluster identifier */
  id: string;
  /** X position of cluster center */
  x: number;
  /** Y position of cluster center */
  y: number;
  /** X velocity for physics animation */
  vx: number;
  /** Y velocity for physics animation */
  vy: number;
  /** Z position of cluster center in 3D mode */
  z?: number;
  /** Z velocity in 3D mode */
  vz?: number;
  /** Width of cluster bounding box */
  width: number;
  /** Height of cluster bounding box */
  height: number;
  /** Depth of cluster bounding box in 3D mode */
  depth?: number;
  /** Number of nodes in this cluster */
  nodeCount: number;
}

// ==================== Position Schemas ====================

/**
 * Node position schema - tracks node state during simulation
 */
export const NodePositionSchema: z.ZodType<NodePosition> = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  z: z.number().optional(),
  vz: z.number().optional(),
  clusterId: z.string(),
  radius: z.number(),
  targetRadius: z.number().optional(),
  targetAngle: z.number().optional(),
  isAnchor: z.boolean().optional(),
  isTest: z.boolean().optional(),
  testSubject: z.string().optional(),
});

/**
 * Cluster position schema - tracks cluster state during simulation
 */
export const ClusterPositionSchema: z.ZodType<ClusterPosition> = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  z: z.number().optional(),
  vz: z.number().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive().optional(),
  nodeCount: z.number().int().nonnegative(),
});
