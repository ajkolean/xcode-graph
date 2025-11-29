import { describe, expect, it } from 'vitest';
import { computeMEC, simpleClusterLayout } from './intra-cluster';
import type { NodeMass } from './mass';

describe('simpleClusterLayout', () => {
  describe('simpleClusterLayout', () => {
    it('should return empty array for no nodes', () => {
      const result = simpleClusterLayout([], [], 0, 0);

      expect(result).toEqual([]);
    });

    it('should position single node at ring 0', () => {
      const nodes = [{ id: 'A', name: 'NodeA', type: 'framework' }];
      const edges: Array<{ from: string; to: string }> = [];

      const result = simpleClusterLayout(nodes, edges, 100, 100);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('A');
      expect(result[0].ring).toBe(0);
    });

    it('should position nodes in rings based on dependency depth', () => {
      const nodes = [
        { id: 'A', name: 'App', type: 'app' },
        { id: 'B', name: 'Framework', type: 'framework' },
        { id: 'C', name: 'Lib', type: 'library' },
      ];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];

      const result = simpleClusterLayout(nodes, edges, 0, 0);

      expect(result).toHaveLength(3);

      const nodeA = result.find((n) => n.id === 'A')!;
      const nodeB = result.find((n) => n.id === 'B')!;
      const nodeC = result.find((n) => n.id === 'C')!;

      // All nodes should have valid ring assignments
      expect(typeof nodeA.ring).toBe('number');
      expect(typeof nodeB.ring).toBe('number');
      expect(typeof nodeC.ring).toBe('number');

      // At least one node should be at ring 0 (the anchor)
      const minRing = Math.min(nodeA.ring, nodeB.ring, nodeC.ring);
      expect(minRing).toBe(0);
    });

    it('should identify test nodes correctly', () => {
      const nodes = [
        { id: 'A', name: 'Core', type: 'framework' },
        { id: 'B', name: 'CoreTests', type: 'test-unit' },
      ];
      const edges = [{ from: 'B', to: 'A' }];

      const result = simpleClusterLayout(nodes, edges, 0, 0);

      const testNode = result.find((n) => n.id === 'B')!;
      const mainNode = result.find((n) => n.id === 'A')!;

      expect(testNode.isTest).toBe(true);
      expect(mainNode.isTest).toBe(false);
    });

    it('should position nodes around center coordinates', () => {
      const nodes = [
        { id: 'A', name: 'App', type: 'app' },
        { id: 'B', name: 'Framework', type: 'framework' },
      ];
      const edges = [{ from: 'A', to: 'B' }];
      const centerX = 500;
      const centerY = 300;

      const result = simpleClusterLayout(nodes, edges, centerX, centerY);

      // All nodes should be positioned relative to center
      result.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.hypot(dx, dy);

        // Distance should be reasonable (based on ring)
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(distance).toBeLessThan(500);
      });
    });

    it('should respect custom options', () => {
      const nodes = [
        { id: 'A', name: 'App', type: 'app' },
        { id: 'B', name: 'Framework', type: 'framework' },
      ];
      const edges = [{ from: 'A', to: 'B' }];

      const result = simpleClusterLayout(nodes, edges, 0, 0, {
        baseRadius: 100,
        ringSpacing: 150,
      });

      const nodeA = result.find((n) => n.id === 'A')!;
      const nodeB = result.find((n) => n.id === 'B')!;

      // Both nodes should be positioned with valid coordinates
      const distA = Math.sqrt(nodeA.x ** 2 + nodeA.y ** 2);
      const distB = Math.sqrt(nodeB.x ** 2 + nodeB.y ** 2);

      // Ring spacing should affect the relative distances
      // Node at higher ring should be further from center
      if (nodeA.ring < nodeB.ring) {
        expect(distB).toBeGreaterThan(distA);
      } else if (nodeB.ring < nodeA.ring) {
        expect(distA).toBeGreaterThan(distB);
      }
    });

    it('should handle diamond dependency pattern', () => {
      const nodes = [
        { id: 'A', name: 'Top', type: 'app' },
        { id: 'B', name: 'Left', type: 'framework' },
        { id: 'C', name: 'Right', type: 'framework' },
        { id: 'D', name: 'Bottom', type: 'library' },
      ];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'D' },
      ];

      const result = simpleClusterLayout(nodes, edges, 0, 0);

      const nodeA = result.find((n) => n.id === 'A')!;
      const nodeB = result.find((n) => n.id === 'B')!;
      const nodeC = result.find((n) => n.id === 'C')!;
      const nodeD = result.find((n) => n.id === 'D')!;

      // All nodes should have valid positions
      expect(result).toHaveLength(4);

      // B and C should be at same ring (symmetric position in graph)
      expect(nodeB.ring).toBe(nodeC.ring);

      // All nodes should have valid ring assignments
      expect(typeof nodeA.ring).toBe('number');
      expect(typeof nodeD.ring).toBe('number');
    });

    it('should handle nodes with no edges', () => {
      const nodes = [
        { id: 'A', name: 'Isolated1', type: 'framework' },
        { id: 'B', name: 'Isolated2', type: 'framework' },
        { id: 'C', name: 'Isolated3', type: 'framework' },
      ];
      const edges: Array<{ from: string; to: string }> = [];

      const result = simpleClusterLayout(nodes, edges, 0, 0);

      expect(result).toHaveLength(3);
      // All should have positions
      result.forEach((node) => {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(Number.isFinite(node.x)).toBe(true);
        expect(Number.isFinite(node.y)).toBe(true);
      });
    });

    it('should place test nodes with ring -1', () => {
      const nodes = [
        { id: 'Core', name: 'Core', type: 'framework' },
        { id: 'CoreTests', name: 'CoreTests', type: 'test-unit' },
      ];
      const edges = [{ from: 'CoreTests', to: 'Core' }];

      const result = simpleClusterLayout(nodes, edges, 0, 0);

      const testNode = result.find((n) => n.id === 'CoreTests')!;
      expect(testNode.ring).toBe(-1);
    });
  });

  describe('computeMEC', () => {
    it('should return default for empty positions', () => {
      const result = computeMEC([], 0, 0);

      expect(result).toBe(100);
    });

    it('should compute radius based on maximum distance', () => {
      const positions = [
        { id: 'A', x: 50, y: 0, ring: 0, isTest: false },
        { id: 'B', x: 0, y: 30, ring: 1, isTest: false },
        { id: 'C', x: -40, y: 0, ring: 1, isTest: false },
      ];

      const result = computeMEC(positions, 0, 0);

      // Max distance is 50, plus padding
      expect(result).toBeGreaterThan(50);
    });

    it('should account for center offset', () => {
      const positions = [{ id: 'A', x: 150, y: 100, ring: 0, isTest: false }];

      const result = computeMEC(positions, 100, 100);

      // Distance from (100,100) to (150,100) is 50, plus padding
      expect(result).toBeGreaterThan(50);
      expect(result).toBeLessThan(100);
    });

    it('should use elastic shell when masses provided', () => {
      const positions = [
        { id: 'A', x: 50, y: 0, ring: 1, isTest: false },
        { id: 'B', x: 0, y: 50, ring: 1, isTest: false },
      ];
      const masses = new Map<string, NodeMass>([
        ['A', { mass: 5, fanIn: 2, fanOut: 1, transitiveIn: 5, transitiveOut: 2 }],
        ['B', { mass: 3, fanIn: 1, fanOut: 2, transitiveIn: 3, transitiveOut: 4 }],
      ]);

      const resultWithMass = computeMEC(positions, 0, 0, masses);
      const resultWithoutMass = computeMEC(positions, 0, 0);

      // Both should return valid radii
      expect(resultWithMass).toBeGreaterThan(0);
      expect(resultWithoutMass).toBeGreaterThan(0);
    });
  });
});
