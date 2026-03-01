import type { GraphEdge } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import {
  getConnectedNodes,
  getConnectionCount,
  getDependencyCount,
  getDependentCount,
} from './connections';

// Test fixtures
const createTestEdges = (): GraphEdge[] => [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'C' },
  { source: 'B', target: 'D' },
  { source: 'C', target: 'D' },
  { source: 'E', target: 'A' },
];

describe('nodeConnections', () => {
  describe('getConnectedNodes', () => {
    it('should return all connected nodes (both directions)', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('A', edges);

      expect(result.has('B')).toBe(true);
      expect(result.has('C')).toBe(true);
      expect(result.has('E')).toBe(true);
      expect(result.size).toBe(3);
    });

    it('should return empty set for isolated node', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('isolated', edges);

      expect(result.size).toBe(0);
    });

    it('should handle node with only outgoing edges', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('E', edges);

      expect(result.has('A')).toBe(true);
      expect(result.size).toBe(1);
    });

    it('should handle node with only incoming edges', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('D', edges);

      expect(result.has('B')).toBe(true);
      expect(result.has('C')).toBe(true);
      expect(result.size).toBe(2);
    });
  });

  describe('getConnectionCount', () => {
    it('should count total connections (both directions)', () => {
      const edges = createTestEdges();

      // A has 2 outgoing (to B, C) + 1 incoming (from E) = 3
      expect(getConnectionCount('A', edges)).toBe(3);

      // D has 0 outgoing + 2 incoming (from B, C) = 2
      expect(getConnectionCount('D', edges)).toBe(2);

      // E has 1 outgoing + 0 incoming = 1
      expect(getConnectionCount('E', edges)).toBe(1);
    });

    it('should return 0 for isolated node', () => {
      const edges = createTestEdges();

      expect(getConnectionCount('isolated', edges)).toBe(0);
    });
  });

  describe('getDependencyCount', () => {
    it('should count outgoing edges only', () => {
      const edges = createTestEdges();

      // A has 2 outgoing (to B, C)
      expect(getDependencyCount('A', edges)).toBe(2);

      // D has 0 outgoing
      expect(getDependencyCount('D', edges)).toBe(0);

      // B has 1 outgoing (to D)
      expect(getDependencyCount('B', edges)).toBe(1);
    });

    it('should return 0 for isolated node', () => {
      const edges = createTestEdges();

      expect(getDependencyCount('isolated', edges)).toBe(0);
    });
  });

  describe('getDependentCount', () => {
    it('should count incoming edges only', () => {
      const edges = createTestEdges();

      // A has 1 incoming (from E)
      expect(getDependentCount('A', edges)).toBe(1);

      // D has 2 incoming (from B, C)
      expect(getDependentCount('D', edges)).toBe(2);

      // E has 0 incoming
      expect(getDependentCount('E', edges)).toBe(0);
    });

    it('should return 0 for isolated node', () => {
      const edges = createTestEdges();

      expect(getDependentCount('isolated', edges)).toBe(0);
    });
  });
});
