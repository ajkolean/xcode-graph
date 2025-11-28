/**
 * Collision Detection and Resolution
 *
 * Shared collision logic for both nodes and clusters.
 * Uses spatial hashing for efficient O(n log n) performance.
 *
 * @module utils/physics/collision
 */

import { SpatialHash } from './spatial-hash';

// ==================== Type Definitions ====================

/**
 * Entity with position, size, and optional velocity
 */
export interface CollisionEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx?: number;
  vy?: number;
}

/**
 * Configuration for collision force calculations
 */
export interface CollisionConfig {
  minDistance?: number; // Maximum distance to check collisions
  separationPadding: number; // Extra padding between entities
  forceStrength: number; // Force multiplier (0.0 - 1.0)
  damping?: number; // Velocity damping (0.0 - 1.0)
}

// ==================== Force Application ====================

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

  const { minDistance = 100, separationPadding, forceStrength } = config;

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
    const vx = entity.vx ?? 0;
    const vy = entity.vy ?? 0;
    if (vx === 0 && vy === 0) continue;

    // Update position
    entity.x += vx * alpha;
    entity.y += vy * alpha;

    // Apply damping
    entity.vx = vx * damping;
    entity.vy = vy * damping;
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

// ==================== Link Forces ====================

/**
 * Entity with position, velocity, and cluster membership
 */
export interface LinkEntity {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  clusterId?: string;
}

/**
 * Edge connecting two entities
 */
export interface LinkEdge {
  source: string;
  target: string;
}

/**
 * Configuration for link force calculations
 */
export interface LinkForceConfig {
  targetDistance: number; // Ideal distance between linked nodes
  strength: number; // Force multiplier (0.0 - 1.0)
  sameClusterOnly?: boolean; // Only apply forces within same cluster
}

/**
 * Apply spring-like link forces between connected nodes
 * Uses Hooke's law to pull/push nodes toward target distance
 *
 * @param edges - Array of edges connecting nodes
 * @param positions - Map of node positions by ID
 * @param alpha - Force strength multiplier (typically 0-1, decays over time)
 * @param config - Link force configuration
 */
export function applyLinkForces<T extends LinkEntity>(
  edges: LinkEdge[],
  positions: Map<string, T>,
  alpha: number,
  config: LinkForceConfig,
): void {
  const { targetDistance, strength, sameClusterOnly = true } = config;

  for (const edge of edges) {
    const source = positions.get(edge.source);
    const target = positions.get(edge.target);

    if (!source || !target) continue;

    // Skip cross-cluster edges if configured
    if (sameClusterOnly && source.clusterId !== target.clusterId) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) continue;

    // Spring force (Hooke's law)
    const displacement = distance - targetDistance;
    const force = displacement * strength * alpha;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    // Apply force to both ends (equal and opposite)
    source.vx = (source.vx || 0) + fx * 0.5;
    source.vy = (source.vy || 0) + fy * 0.5;
    target.vx = (target.vx || 0) - fx * 0.5;
    target.vy = (target.vy || 0) - fy * 0.5;
  }
}

// ==================== Configuration Presets ====================

/**
 * Pre-configured collision settings for common use cases
 */
export const CollisionPresets: Record<string, CollisionConfig> = {
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

/**
 * Pre-configured link force settings for common use cases
 */
export const LinkForcePresets = {
  /**
   * Default link forces for graph edges
   */
  DEFAULT: {
    targetDistance: 70,
    strength: 0.05,
    sameClusterOnly: true,
  },

  /**
   * Stronger attraction for tighter layouts
   */
  TIGHT: {
    targetDistance: 50,
    strength: 0.1,
    sameClusterOnly: true,
  },

  /**
   * Looser attraction for spread layouts
   */
  LOOSE: {
    targetDistance: 100,
    strength: 0.03,
    sameClusterOnly: true,
  },
} as const;
