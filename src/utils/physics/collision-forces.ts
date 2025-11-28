/**
 * Shared Collision Detection Logic
 *
 * Eliminates duplication between node and cluster collision detection.
 * Uses spatial hashing for O(n log n) performance.
 */

import { type SpatialEntity, SpatialHash } from '../spatial-hash';

export interface CollisionEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx?: number;
  vy?: number;
}

export interface CollisionConfig {
  minDistance?: number; // Maximum distance to check collisions
  separationPadding: number; // Extra padding between entities
  forceStrength: number; // Force multiplier (0.0 - 1.0)
  damping?: number; // Velocity damping (0.0 - 1.0)
}

/**
 * Apply collision forces between entities using spatial hashing
 * Generic function that works for both nodes and clusters
 *
 * @param entities - Array of entities with position and radius
 * @param alpha - Force strength multiplier (typically 0-1, decays over time)
 * @param config - Collision configuration
 */
export function applyCollisionForces<T extends CollisionEntity>(
  entities: T[],
  alpha: number,
  config: CollisionConfig,
): void {
  if (entities.length === 0) return;

  const { minDistance = 100, separationPadding, forceStrength, damping = 0.7 } = config;

  // Use spatial hash for efficient O(n log n) collision detection
  const cellSize = Math.max(...entities.map((e) => e.radius * 2 + separationPadding)) || 50;
  const spatialHash = new SpatialHash<T>({ cellSize });
  spatialHash.insertMany(entities);

  const pairs = spatialHash.getPotentialCollisions();

  // Apply collision forces to each pair
  for (const [a, b] of pairs) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Skip if too far apart or overlapping exactly
    if (distance === 0 || distance > minDistance) continue;

    const minSeparation = a.radius + b.radius + separationPadding;

    if (distance < minSeparation) {
      const overlap = minSeparation - distance;
      const force = overlap * forceStrength * alpha;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      // Apply forces (repulsion)
      a.vx = (a.vx || 0) - fx;
      a.vy = (a.vy || 0) - fy;
      b.vx = (b.vx || 0) + fx;
      b.vy = (b.vy || 0) + fy;
    }
  }
}

/**
 * Update entity positions based on velocities
 * Applies damping for smooth settling
 *
 * @param entities - Array of entities with position and velocity
 * @param alpha - Animation progress multiplier (0-1)
 * @param damping - Velocity damping factor (0-1), default 0.7
 */
export function updatePositions<T extends CollisionEntity>(
  entities: T[],
  alpha: number,
  damping = 0.7,
): void {
  for (const entity of entities) {
    if (!entity.vx && !entity.vy) continue;

    // Update position
    entity.x += entity.vx * alpha;
    entity.y += entity.vy * alpha;

    // Apply damping
    entity.vx *= damping;
    entity.vy *= damping;
  }
}

/**
 * Calculate effective radius for rectangular bounds (clusters)
 * Returns radius of bounding circle
 */
export function calculateBoundingRadius(width: number, height: number): number {
  return Math.sqrt(width * width + height * height) / 2;
}

/**
 * Batch update positions for Map-based storage
 * Efficiently updates all entities in a Map
 */
export function updatePositionMap<T extends CollisionEntity>(
  positions: Map<string, T>,
  alpha: number,
  damping = 0.7,
): void {
  const entities = Array.from(positions.values());
  updatePositions(entities, alpha, damping);
}

/**
 * Configuration presets for common use cases
 */
export const CollisionPresets = {
  /**
   * For graph nodes within clusters
   */
  NODE_COLLISION: {
    minDistance: 100,
    separationPadding: 8,
    forceStrength: 0.3,
    damping: 0.7,
  },

  /**
   * For cluster spacing
   */
  CLUSTER_SPACING: {
    minDistance: Infinity, // Check all pairs
    separationPadding: 80,
    forceStrength: 0.4,
    damping: 0.7,
  },

  /**
   * Gentle forces for subtle settling
   */
  GENTLE: {
    minDistance: 100,
    separationPadding: 10,
    forceStrength: 0.2,
    damping: 0.8,
  },

  /**
   * Strong forces for fast separation
   */
  STRONG: {
    minDistance: 150,
    separationPadding: 20,
    forceStrength: 0.6,
    damping: 0.5,
  },
} as const;
