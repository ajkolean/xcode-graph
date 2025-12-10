/**
 * Tests for shared collision detection logic
 */

import { describe, expect, it } from 'vitest';
import { randomNumber } from '../../../shared/utils/random';
import {
  applyCollisionForces,
  type CollisionEntity,
  CollisionPresets,
  calculateBoundingRadius,
  updatePositions,
} from './collision';

describe('applyCollisionForces', () => {
  describe('Basic Collision Detection', () => {
    it('should apply repulsion forces to overlapping entities', () => {
      const entities: CollisionEntity[] = [
        { id: 'a', x: 0, y: 0, radius: 10, vx: 0, vy: 0 },
        { id: 'b', x: 5, y: 0, radius: 10, vx: 0, vy: 0 }, // Overlapping!
      ];

      applyCollisionForces(entities, 1, CollisionPresets.NODE_COLLISION);

      // A should be pushed left (negative vx)
      expect(entities[0].vx).toBeLessThan(0);

      // B should be pushed right (positive vx)
      expect(entities[1].vx).toBeGreaterThan(0);
    });

    it('should not apply forces to well-separated entities', () => {
      const entities: CollisionEntity[] = [
        { id: 'a', x: 0, y: 0, radius: 10, vx: 0, vy: 0 },
        { id: 'b', x: 1000, y: 1000, radius: 10, vx: 0, vy: 0 }, // Far apart
      ];

      applyCollisionForces(entities, 1, CollisionPresets.NODE_COLLISION);

      // No forces should be applied
      expect(entities[0].vx).toBe(0);
      expect(entities[0].vy).toBe(0);
      expect(entities[1].vx).toBe(0);
      expect(entities[1].vy).toBe(0);
    });

    it('should handle empty entity list', () => {
      expect(() => {
        applyCollisionForces([], 1, CollisionPresets.NODE_COLLISION);
      }).not.toThrow();
    });

    it('should handle single entity', () => {
      const entities: CollisionEntity[] = [{ id: 'a', x: 0, y: 0, radius: 10, vx: 0, vy: 0 }];

      applyCollisionForces(entities, 1, CollisionPresets.NODE_COLLISION);

      // No changes (nothing to collide with)
      expect(entities[0].vx).toBe(0);
      expect(entities[0].vy).toBe(0);
    });
  });

  describe('Force Strength', () => {
    it('should scale forces with alpha parameter', () => {
      const entities: CollisionEntity[] = [
        { id: 'a', x: 0, y: 0, radius: 10, vx: 0, vy: 0 },
        { id: 'b', x: 5, y: 0, radius: 10, vx: 0, vy: 0 },
      ];

      // High alpha (strong forces)
      applyCollisionForces(entities, 1, CollisionPresets.NODE_COLLISION);
      const strongForce = Math.abs(entities[0].vx);

      // Reset
      entities[0].vx = 0;
      entities[0].vy = 0;
      entities[1].vx = 0;
      entities[1].vy = 0;

      // Low alpha (weak forces)
      applyCollisionForces(entities, 0.1, CollisionPresets.NODE_COLLISION);
      const weakForce = Math.abs(entities[0].vx);

      expect(strongForce).toBeGreaterThan(weakForce);
    });

    it('should respect forceStrength config', () => {
      const entities: CollisionEntity[] = [
        { id: 'a', x: 0, y: 0, radius: 10, vx: 0, vy: 0 },
        { id: 'b', x: 5, y: 0, radius: 10, vx: 0, vy: 0 },
      ];

      applyCollisionForces(entities, 1, {
        separationPadding: 8,
        forceStrength: 0.1, // Weak
      });

      const weakForce = Math.abs(entities[0].vx);

      // Reset
      entities[0].vx = 0;
      entities[1].vx = 0;

      applyCollisionForces(entities, 1, {
        separationPadding: 8,
        forceStrength: 0.9, // Strong
      });

      const strongForce = Math.abs(entities[0].vx);

      expect(strongForce).toBeGreaterThan(weakForce);
    });
  });

  describe('Separation Padding', () => {
    it('should maintain minimum separation', () => {
      const entities: CollisionEntity[] = [
        { id: 'a', x: 0, y: 0, radius: 10, vx: 0, vy: 0 },
        { id: 'b', x: 20, y: 0, radius: 10, vx: 0, vy: 0 },
      ];

      // With padding of 8, min separation is 10+10+8 = 28
      // Current distance is 20, so they should repel
      applyCollisionForces(entities, 1, {
        separationPadding: 8,
        forceStrength: 0.3,
      });

      expect(entities[0].vx).toBeLessThan(0); // Push left
      expect(entities[1].vx).toBeGreaterThan(0); // Push right
    });
  });

  describe('Performance', () => {
    it('should use spatial hash for large entity counts', () => {
      const entities: CollisionEntity[] = [];

      for (let i = 0; i < 1000; i++) {
        entities.push({
          id: `entity-${i}`,
          x: randomNumber(0, 5000),
          y: randomNumber(0, 5000),
          radius: 10,
          vx: 0,
          vy: 0,
        });
      }

      const start = Date.now();
      applyCollisionForces(entities, 1, CollisionPresets.NODE_COLLISION);
      const duration = Date.now() - start;

      // Should be fast even with 1000 entities
      expect(duration).toBeLessThan(100);
    });
  });
});

describe('updatePositions', () => {
  it('should update positions based on velocity', () => {
    const entities: CollisionEntity[] = [{ id: 'a', x: 0, y: 0, radius: 10, vx: 10, vy: 5 }];

    updatePositions(entities, 1);

    expect(entities[0].x).toBe(10);
    expect(entities[0].y).toBe(5);
  });

  it('should apply alpha multiplier', () => {
    const entities: CollisionEntity[] = [{ id: 'a', x: 0, y: 0, radius: 10, vx: 10, vy: 10 }];

    updatePositions(entities, 0.5); // Half strength

    expect(entities[0].x).toBe(5);
    expect(entities[0].y).toBe(5);
  });

  it('should apply damping to velocities', () => {
    const entities: CollisionEntity[] = [{ id: 'a', x: 0, y: 0, radius: 10, vx: 10, vy: 10 }];

    updatePositions(entities, 1, 0.7);

    expect(entities[0].vx).toBe(7); // 10 * 0.7
    expect(entities[0].vy).toBe(7);
  });

  it('should skip entities with no velocity', () => {
    const entities: CollisionEntity[] = [
      { id: 'a', x: 100, y: 100, radius: 10 }, // No vx/vy
    ];

    updatePositions(entities, 1);

    expect(entities[0].x).toBe(100); // Unchanged
    expect(entities[0].y).toBe(100);
  });
});

describe('calculateBoundingRadius', () => {
  it('should calculate radius for square', () => {
    const radius = calculateBoundingRadius(100, 100);
    expect(radius).toBeCloseTo(70.7, 1); // sqrt(100² + 100²) / 2
  });

  it('should calculate radius for rectangle', () => {
    const radius = calculateBoundingRadius(300, 400);
    expect(radius).toBe(250); // sqrt(300² + 400²) / 2 = 500 / 2
  });

  it('should handle zero dimensions', () => {
    const radius = calculateBoundingRadius(0, 0);
    expect(radius).toBe(0);
  });
});

describe('CollisionPresets', () => {
  it('should have NODE_COLLISION preset', () => {
    expect(CollisionPresets.NODE_COLLISION).toBeDefined();
    expect(CollisionPresets.NODE_COLLISION.separationPadding).toBe(8);
    expect(CollisionPresets.NODE_COLLISION.forceStrength).toBe(0.3);
  });

  it('should have CLUSTER_SPACING preset', () => {
    expect(CollisionPresets.CLUSTER_SPACING).toBeDefined();
    expect(CollisionPresets.CLUSTER_SPACING.separationPadding).toBe(80);
    expect(CollisionPresets.CLUSTER_SPACING.forceStrength).toBe(0.4);
  });

  it('should have GENTLE preset', () => {
    expect(CollisionPresets.GENTLE).toBeDefined();
    expect(CollisionPresets.GENTLE.forceStrength).toBeLessThan(
      CollisionPresets.NODE_COLLISION.forceStrength,
    );
  });

  it('should have STRONG preset', () => {
    expect(CollisionPresets.STRONG).toBeDefined();
    expect(CollisionPresets.STRONG.forceStrength).toBeGreaterThan(
      CollisionPresets.NODE_COLLISION.forceStrength,
    );
  });
});
