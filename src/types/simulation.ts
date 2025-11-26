/**
 * Shared types for graph simulation
 */

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  clusterId: string;
  radius: number;
  // Radial positioning targets
  targetRadius?: number;
  targetAngle?: number;
  isAnchor?: boolean;
  isTest?: boolean;
  testSubject?: string; // For test satellites
}

export interface ClusterPosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  nodeCount: number;
}
