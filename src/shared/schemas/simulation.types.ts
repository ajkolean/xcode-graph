/**
 * Simulation Types - Physics simulation state types
 *
 * Pure TypeScript interfaces for node and cluster positions during layout animation.
 * No Zod dependency — see simulation.schema.ts for validation schemas.
 *
 * @module schemas/simulation
 */

/** Node position during simulation */
export interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z?: number;
  vz?: number;
  clusterId: string;
  radius: number;
  targetRadius?: number;
  targetAngle?: number;
  isAnchor?: boolean;
  isTest?: boolean;
  testSubject?: string;
}

/** Cluster position during simulation */
export interface ClusterPosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z?: number;
  vz?: number;
  width: number;
  height: number;
  depth?: number;
  nodeCount: number;
}
