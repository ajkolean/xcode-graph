/**
 * Simulation Types - Physics simulation state types
 *
 * Pure TypeScript interfaces for node and cluster positions during layout animation.
 * No Zod dependency — see simulation.schema.ts for validation schemas.
 *
 * @module schemas/simulation
 */

/**
 * Node position during simulation
 *
 * @public
 */
export interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z?: number | undefined;
  vz?: number | undefined;
  clusterId: string;
  radius: number;
  targetRadius?: number | undefined;
  targetAngle?: number | undefined;
  isAnchor?: boolean | undefined;
  isTest?: boolean | undefined;
  testSubject?: string | undefined;
}

/**
 * Cluster position during simulation
 *
 * @public
 */
export interface ClusterPosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z?: number | undefined;
  vz?: number | undefined;
  width: number;
  height: number;
  depth?: number | undefined;
  nodeCount: number;
}
