/**
 * Tests for Spatial Hash Grid
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createSpatialHash, type SpatialEntity, SpatialHash } from './spatial-hash';

describe('SpatialHash', () => {
  let hash: SpatialHash<SpatialEntity>;

  beforeEach(() => {
    hash = new SpatialHash({ cellSize: 100 });
  });

  describe('Basic Operations', () => {
    it('should insert and retrieve entities', () => {
      const entity: SpatialEntity = { x: 50, y: 50, radius: 10, id: '1' };
      hash.insert(entity);

      const nearby = hash.getNearby(entity);
      expect(nearby).toContain(entity);
    });

    it('should handle multiple entities in same cell', () => {
      const entities: SpatialEntity[] = [
        { x: 25, y: 25, radius: 10, id: '1' },
        { x: 30, y: 30, radius: 10, id: '2' },
        { x: 35, y: 35, radius: 10, id: '3' },
      ];

      hash.insertMany(entities);
      const nearby = hash.getNearby(entities[0]);

      expect(nearby.length).toBeGreaterThanOrEqual(3);
    });

    it('should clear all entities', () => {
      const entity: SpatialEntity = { x: 50, y: 50, radius: 10, id: '1' };
      hash.insert(entity);

      hash.clear();
      const nearby = hash.getNearby(entity);

      expect(nearby).toHaveLength(0);
    });
  });

  describe('Spatial Partitioning', () => {
    it('should partition entities into different cells', () => {
      const farApart: SpatialEntity[] = [
        { x: 0, y: 0, radius: 10, id: '1' }, // Cell (0, 0)
        { x: 500, y: 500, radius: 10, id: '2' }, // Cell (5, 5)
      ];

      hash.insertMany(farApart);

      // Entities far apart should not be in each other's nearby list
      const nearby1 = hash.getNearby(farApart[0]);
      const nearby2 = hash.getNearby(farApart[1]);

      // Each should only find itself
      expect(nearby1.some((e) => e.id === '2')).toBe(false);
      expect(nearby2.some((e) => e.id === '1')).toBe(false);
    });

    it('should find entities in adjacent cells', () => {
      const nearBoundary: SpatialEntity[] = [
        { x: 95, y: 95, radius: 10, id: '1' }, // Near cell boundary
        { x: 105, y: 105, radius: 10, id: '2' }, // Just across boundary
      ];

      hash.insertMany(nearBoundary);

      // Should find each other because of adjacent cell checking
      const nearby1 = hash.getNearby(nearBoundary[0]);
      expect(nearby1.some((e) => e.id === '2')).toBe(true);
    });
  });

  describe('Collision Detection', () => {
    it('should find all potential collision pairs', () => {
      const entities: SpatialEntity[] = [
        { x: 10, y: 10, radius: 5, id: '1' },
        { x: 15, y: 15, radius: 5, id: '2' }, // Close to 1
        { x: 500, y: 500, radius: 5, id: '3' }, // Far from others
      ];

      hash.insertMany(entities);
      const pairs = hash.getPotentialCollisions();

      // Should find (1,2) pair but not include (1,3) or (2,3)
      expect(pairs.length).toBeGreaterThan(0);

      // Verify pair structure
      const pair12 = pairs.find(
        ([a, b]) => (a.id === '1' && b.id === '2') || (a.id === '2' && b.id === '1'),
      );
      expect(pair12).toBeDefined();
    });

    it('should not duplicate pairs', () => {
      const closeEntities: SpatialEntity[] = [
        { x: 50, y: 50, radius: 10, id: '1' },
        { x: 55, y: 55, radius: 10, id: '2' },
        { x: 60, y: 60, radius: 10, id: '3' },
      ];

      hash.insertMany(closeEntities);
      const pairs = hash.getPotentialCollisions();

      // Check no duplicates
      const pairKeys = pairs.map(([a, b]) => `${a.id}-${b.id}`);
      const uniqueKeys = new Set(pairKeys);
      expect(pairKeys.length).toBe(uniqueKeys.size);
    });
  });

  describe('Region Queries', () => {
    it('should find entities in a region', () => {
      const entities: SpatialEntity[] = [
        { x: 25, y: 25, radius: 5, id: '1' }, // Inside region
        { x: 75, y: 75, radius: 5, id: '2' }, // Inside region
        { x: 200, y: 200, radius: 5, id: '3' }, // Outside region
      ];

      hash.insertMany(entities);
      const inRegion = hash.queryRegion(0, 0, 100, 100);

      expect(inRegion).toHaveLength(2);
      expect(inRegion.some((e) => e.id === '1')).toBe(true);
      expect(inRegion.some((e) => e.id === '2')).toBe(true);
      expect(inRegion.some((e) => e.id === '3')).toBe(false);
    });

    it('should handle empty regions', () => {
      const entities: SpatialEntity[] = [{ x: 500, y: 500, radius: 5, id: '1' }];

      hash.insertMany(entities);
      const inRegion = hash.queryRegion(0, 0, 100, 100);

      expect(inRegion).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle entities at origin', () => {
      const entity: SpatialEntity = { x: 0, y: 0, radius: 10, id: '1' };
      hash.insert(entity);

      const nearby = hash.getNearby(entity);
      expect(nearby).toContain(entity);
    });

    it('should handle negative coordinates', () => {
      const entity: SpatialEntity = { x: -100, y: -100, radius: 10, id: '1' };
      hash.insert(entity);

      const nearby = hash.getNearby(entity);
      expect(nearby).toContain(entity);
    });

    it('should handle large radius entities spanning multiple cells', () => {
      const largeEntity: SpatialEntity = { x: 150, y: 150, radius: 100, id: 'large' };
      hash.insert(largeEntity);

      const stats = hash.getStats();
      expect(stats.totalCells).toBeGreaterThan(1); // Should span multiple cells
    });

    it('should handle zero radius', () => {
      const pointEntity: SpatialEntity = { x: 50, y: 50, radius: 0, id: '1' };
      hash.insert(pointEntity);

      const nearby = hash.getNearby(pointEntity);
      expect(nearby).toContain(pointEntity);
    });
  });

  describe('Performance', () => {
    it('should handle many entities efficiently', () => {
      const manyEntities: SpatialEntity[] = [];

      // Create 1000 entities in a 1000x1000 grid
      for (let i = 0; i < 1000; i++) {
        manyEntities.push({
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          radius: 10,
          id: `entity-${i}`,
        });
      }

      const start = Date.now();
      hash.insertMany(manyEntities);
      const insertTime = Date.now() - start;

      expect(insertTime).toBeLessThan(100); // Should be very fast

      // Query should also be fast
      const queryStart = Date.now();
      const nearby = hash.getNearby(manyEntities[0]);
      const queryTime = Date.now() - queryStart;

      expect(queryTime).toBeLessThan(10); // O(1) average case
      expect(nearby.length).toBeLessThan(200); // Should only return nearby entities (much less than 1000)
    });

    it('should reduce collision checks dramatically', () => {
      const entities: SpatialEntity[] = [];

      // Create 100 entities spread out
      for (let i = 0; i < 100; i++) {
        entities.push({
          x: (i % 10) * 200, // Spread in grid pattern
          y: Math.floor(i / 10) * 200,
          radius: 10,
          id: `entity-${i}`,
        });
      }

      hash.insertMany(entities);
      const pairs = hash.getPotentialCollisions();

      // O(n²) would be 4950 pairs (100 * 99 / 2)
      // Spatial hash should drastically reduce this
      expect(pairs.length).toBeLessThan(500); // Less than 10% of O(n²)
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      const entities: SpatialEntity[] = [
        { x: 25, y: 25, radius: 10, id: '1' },
        { x: 30, y: 30, radius: 10, id: '2' },
        { x: 200, y: 200, radius: 10, id: '3' },
      ];

      hash.insertMany(entities);
      const stats = hash.getStats();

      expect(stats.totalEntities).toBeGreaterThan(0);
      expect(stats.totalCells).toBeGreaterThan(0);
      expect(stats.avgEntitiesPerCell).toBeGreaterThan(0);
    });
  });
});

describe('createSpatialHash helper', () => {
  it('should create hash with auto-calculated cell size', () => {
    const entities: SpatialEntity[] = [
      { x: 0, y: 0, radius: 10, id: '1' },
      { x: 100, y: 100, radius: 20, id: '2' },
    ];

    const hash = createSpatialHash(entities);
    const nearby = hash.getNearby(entities[0]);

    expect(nearby).toContain(entities[0]);
  });

  it('should use provided cell size', () => {
    const entities: SpatialEntity[] = [
      { x: 0, y: 0, radius: 10, id: '1' },
      { x: 100, y: 100, radius: 10, id: '2' },
    ];

    const hash = createSpatialHash(entities, 50);
    const stats = hash.getStats();

    expect(stats.totalCells).toBeGreaterThan(0);
  });

  it('should handle empty entity list', () => {
    const hash = createSpatialHash([]);
    const stats = hash.getStats();

    expect(stats.totalEntities).toBe(0);
    expect(stats.totalCells).toBe(0);
  });
});
