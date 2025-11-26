import { describe, expect, it } from 'vitest';
import { computeMEC, sectorLayout } from './sectorLayout';

describe('sectorLayout', () => {
  describe('sectorLayout', () => {
    it('should return empty array for no nodes', () => {
      const result = sectorLayout([], [], 0, 0);

      expect(result).toEqual([]);
    });

    it('should position single node', () => {
      const nodes = [{ id: 'A', type: 'framework', name: 'NodeA' }];
      const edges: Array<{ from: string; to: string }> = [];

      const result = sectorLayout(nodes, edges, 100, 100);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('A');
    });

    it('should assign roles based on node type', () => {
      const nodes = [
        { id: 'app', type: 'app', name: 'MainApp' },
        { id: 'fw', type: 'framework', name: 'Framework' },
        { id: 'lib', type: 'library', name: 'Library' },
        { id: 'test', type: 'test', name: 'Tests' },
      ];
      const edges = [
        { from: 'app', to: 'fw' },
        { from: 'fw', to: 'lib' },
        { from: 'test', to: 'fw' },
      ];

      const result = sectorLayout(nodes, edges, 0, 0);

      const appNode = result.find((n) => n.id === 'app')!;
      const fwNode = result.find((n) => n.id === 'fw')!;
      const testNode = result.find((n) => n.id === 'test')!;

      expect(appNode.role).toBe('anchor');
      expect(fwNode.role).toBe('framework');
      expect(testNode.role).toBe('test');
      expect(testNode.isTest).toBe(true);
    });

    it('should position nodes in rings based on depth', () => {
      const nodes = [
        { id: 'A', type: 'app', name: 'App' },
        { id: 'B', type: 'framework', name: 'Framework' },
        { id: 'C', type: 'library', name: 'Library' },
      ];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];

      const result = sectorLayout(nodes, edges, 0, 0);

      const nodeA = result.find((n) => n.id === 'A')!;
      const nodeB = result.find((n) => n.id === 'B')!;
      const nodeC = result.find((n) => n.id === 'C')!;

      expect(nodeA.ring).toBe(0);
      expect(nodeB.ring).toBe(1);
      expect(nodeC.ring).toBe(2);
    });

    it('should place nodes around center coordinates', () => {
      const nodes = [
        { id: 'A', type: 'app', name: 'App' },
        { id: 'B', type: 'framework', name: 'Framework' },
      ];
      const edges = [{ from: 'A', to: 'B' }];
      const centerX = 200;
      const centerY = 150;

      const result = sectorLayout(nodes, edges, centerX, centerY);

      // Nodes should be around center
      result.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        expect(distance).toBeGreaterThanOrEqual(0);
        expect(distance).toBeLessThan(400);
      });
    });

    it('should position test nodes as satellites', () => {
      const nodes = [
        { id: 'Core', type: 'framework', name: 'Core' },
        { id: 'CoreTests', type: 'test', name: 'CoreTests' },
      ];
      const edges = [{ from: 'CoreTests', to: 'Core' }];

      const result = sectorLayout(nodes, edges, 0, 0);

      const testNode = result.find((n) => n.id === 'CoreTests')!;

      expect(testNode.isTest).toBe(true);
      expect(testNode.ring).toBe(-1); // Satellite marker
    });

    it('should handle cli type as anchor', () => {
      const nodes = [
        { id: 'cli', type: 'cli', name: 'CLI' },
        { id: 'lib', type: 'library', name: 'Lib' },
      ];
      const edges = [{ from: 'cli', to: 'lib' }];

      const result = sectorLayout(nodes, edges, 0, 0);

      const cliNode = result.find((n) => n.id === 'cli')!;
      expect(cliNode.role).toBe('anchor');
    });

    it('should fallback to first framework as anchor', () => {
      const nodes = [
        { id: 'fw1', type: 'framework', name: 'Framework1' },
        { id: 'fw2', type: 'framework', name: 'Framework2' },
      ];
      const edges = [{ from: 'fw1', to: 'fw2' }];

      const result = sectorLayout(nodes, edges, 0, 0);

      // One should be at ring 0 (as fallback anchor)
      const ring0Nodes = result.filter((n) => n.ring === 0);
      expect(ring0Nodes.length).toBeGreaterThan(0);
    });

    it('should respect custom options', () => {
      const nodes = [
        { id: 'A', type: 'app', name: 'App' },
        { id: 'B', type: 'framework', name: 'Framework' },
      ];
      const edges = [{ from: 'A', to: 'B' }];

      const result = sectorLayout(nodes, edges, 0, 0, {
        baseRadius: 80,
        ringSpacing: 100,
      });

      const nodeB = result.find((n) => n.id === 'B')!;
      const distB = Math.sqrt(nodeB.x ** 2 + nodeB.y ** 2);

      // Ring 1 should be at baseRadius + ringSpacing = 180
      expect(distB).toBeCloseTo(180, 0);
    });

    it('should handle disconnected components', () => {
      const nodes = [
        { id: 'A', type: 'app', name: 'App' },
        { id: 'B', type: 'framework', name: 'Framework' },
        { id: 'C', type: 'library', name: 'Library' }, // Disconnected
      ];
      const edges = [{ from: 'A', to: 'B' }];

      const result = sectorLayout(nodes, edges, 0, 0);

      expect(result).toHaveLength(3);
      result.forEach((node) => {
        expect(Number.isFinite(node.x)).toBe(true);
        expect(Number.isFinite(node.y)).toBe(true);
      });
    });
  });

  describe('computeMEC', () => {
    it('should return default for empty positions', () => {
      const result = computeMEC([], 0, 0);

      expect(result).toBe(100);
    });

    it('should compute radius with padding', () => {
      const positions = [{ id: 'A', x: 60, y: 0, ring: 0, role: 'anchor' as const, isTest: false }];

      const result = computeMEC(positions, 0, 0);

      // Distance is 60, plus padding of 40
      expect(result).toBe(100);
    });

    it('should account for center offset', () => {
      const positions = [
        { id: 'A', x: 150, y: 100, ring: 0, role: 'anchor' as const, isTest: false },
      ];

      const result = computeMEC(positions, 100, 100);

      // Distance from (100,100) to (150,100) is 50, plus padding
      expect(result).toBe(90);
    });

    it('should use maximum distance among all nodes', () => {
      const positions = [
        { id: 'A', x: 30, y: 0, ring: 0, role: 'anchor' as const, isTest: false },
        { id: 'B', x: 0, y: 100, ring: 1, role: 'framework' as const, isTest: false },
        { id: 'C', x: -50, y: 0, ring: 1, role: 'internal' as const, isTest: false },
      ];

      const result = computeMEC(positions, 0, 0);

      // Max distance is 100 (node B), plus padding of 40
      expect(result).toBe(140);
    });
  });
});
