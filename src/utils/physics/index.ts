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
  updatePositions,
  updatePositionMap,
  calculateBoundingRadius,
  CollisionPresets,
  type CollisionConfig,
  type CollisionEntity,
} from './collision';

// ==================== Spatial Indexing ====================

export {
  SpatialHash,
  createSpatialHash,
  type SpatialHashConfig,
  type SpatialEntity,
} from './spatial-hash';
