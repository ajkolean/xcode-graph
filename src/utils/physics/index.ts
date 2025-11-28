/**
 * Physics Utilities Module
 *
 * Force-based calculations for graph layout simulation:
 * - Collision detection and resolution
 * - Spatial indexing for O(n) performance
 * - Position update and velocity damping
 *
 * @module utils/physics
 */

// ==================== Collision Forces ====================

export {
  applyCollisionForces,
  applyBoundaryForces,
  calculateRepulsionForce,
  type ForceConfig,
} from './collision';

// ==================== Spatial Indexing ====================

export { SpatialHash, type SpatialHashConfig } from './spatial-hash';
