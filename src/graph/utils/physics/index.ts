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
  type CollisionConfig,
  type CollisionEntity,
  CollisionPresets,
  calculateBoundingRadius,
  updatePositionMap,
  updatePositions,
} from './collision';

// ==================== Spatial Indexing ====================

export {
  createSpatialHash,
  type SpatialEntity,
  SpatialHash,
  type SpatialHashConfig,
} from './spatial-hash';
