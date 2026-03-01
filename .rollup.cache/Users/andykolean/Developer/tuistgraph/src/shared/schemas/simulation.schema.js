/**
 * Simulation Schema - Zod validation schemas for physics simulation
 *
 * @module schemas/simulation
 */
import { z } from 'zod';
// Re-export all types for backward compatibility
export * from './simulation.types';
// ==================== Position Schemas ====================
export const NodePositionSchema = z.object({
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
export const ClusterPositionSchema = z.object({
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
//# sourceMappingURL=simulation.schema.js.map