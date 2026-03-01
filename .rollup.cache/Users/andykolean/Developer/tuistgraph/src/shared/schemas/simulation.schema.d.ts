/**
 * Simulation Schema - Zod validation schemas for physics simulation
 *
 * @module schemas/simulation
 */
import { z } from 'zod';
import type { ClusterPosition, NodePosition } from './simulation.types';
export * from './simulation.types';
export declare const NodePositionSchema: z.ZodType<NodePosition>;
export declare const ClusterPositionSchema: z.ZodType<ClusterPosition>;
//# sourceMappingURL=simulation.schema.d.ts.map