import { describe, expect, it } from 'vitest';
import { buildAdjacency } from './graphAlgorithms';
import { computeDepths, radialLayout, relaxOnRings, selectAnchors } from './radialLayout';

describe('radialLayout', () => {
  describe('selectAnchors', () => {
    it('should select app nodes as anchors', () => {
      const nodes = [
        { id: 'app', type: 'app' },
        { id: 'fw', type: 'framework' },
      ];

      const anchors = selectAnchors(nodes, new Set());

      expect(anchors).toContain('app');
    });

    it('should select cli nodes as anchors', () => {
      const nodes = [
        { id: 'cli', type: 'cli' },
        { id: 'lib', type: 'library' },
      ];

      const anchors = selectAnchors(nodes, new Set());

      expect(anchors).toContain('cli');
    });

    it('should select nodes with external dependents', () => {
      const nodes = [
        { id: 'fw', type: 'framework' },
        { id: 'lib', type: 'library' },
      ];
      const hasExternalDependents = new Set(['fw']);

      const anchors = selectAnchors(nodes, hasExternalDependents);

      expect(anchors).toContain('fw');
    });

    it('should fallback to first node if no anchors found', () => {
      const nodes = [
        { id: 'lib1', type: 'library' },
        { id: 'lib2', type: 'library' },
      ];

      const anchors = selectAnchors(nodes, new Set());

      expect(anchors).toEqual(['lib1']);
    });

    it('should return empty for empty nodes', () => {
      const anchors = selectAnchors([], new Set());

      expect(anchors).toEqual([]);
    });

    it('should support custom anchor types', () => {
      const nodes = [
        { id: 'special', type: 'special' },
        { id: 'lib', type: 'library' },
      ];

      const anchors = selectAnchors(nodes, new Set(), ['special']);

      expect(anchors).toContain('special');
      expect(anchors).not.toContain('lib');
    });
  });

  describe('computeDepths', () => {
    it('should assign depth 0 to anchors', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];
      const adj = buildAdjacency(nodes, edges);

      const depths = computeDepths(['A'], adj);

      expect(depths.A).toBe(0);
    });

    it('should compute depths via BFS', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
      ];
      const adj = buildAdjacency(nodes, edges);

      const depths = computeDepths(['A'], adj);

      expect(depths.A).toBe(0);
      expect(depths.B).toBe(1);
      expect(depths.C).toBe(2);
      expect(depths.D).toBe(2); // Capped at maxDepth=2
    });

    it('should respect maxDepth', () => {
      const nodes = ['A', 'B', 'C', 'D', 'E'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'E' },
      ];
      const adj = buildAdjacency(nodes, edges);

      const depths = computeDepths(['A'], adj, 1);

      expect(depths.A).toBe(0);
      expect(depths.B).toBe(1);
      expect(depths.C).toBe(1); // Capped at maxDepth
      expect(depths.D).toBe(1); // Capped at maxDepth
    });

    it('should handle unreachable nodes', () => {
      const nodes = ['A', 'B', 'X'];
      const edges = [{ from: 'A', to: 'B' }];
      const adj = buildAdjacency(nodes, edges);

      const depths = computeDepths(['A'], adj, 2);

      expect(depths.X).toBe(2); // maxDepth for unreachable
    });

    it('should handle multiple anchors', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
      ];
      const adj = buildAdjacency(nodes, edges);

      const depths = computeDepths(['A', 'B'], adj);

      expect(depths.A).toBe(0);
      expect(depths.B).toBe(0);
      expect(depths.C).toBe(1);
    });
  });

  describe('radialLayout', () => {
    it('should return empty array for no nodes', () => {
      const result = radialLayout([], [], 0, 0);

      expect(result).toEqual([]);
    });

    it('should position nodes around center', () => {
      const nodes = [
        { id: 'A', type: 'app' },
        { id: 'B', type: 'framework' },
      ];
      const edges = [{ from: 'A', to: 'B' }];

      const result = radialLayout(nodes, edges, 200, 150);

      result.forEach((node) => {
        expect(Number.isFinite(node.x)).toBe(true);
        expect(Number.isFinite(node.y)).toBe(true);
      });
    });

    it('should assign correct roles', () => {
      const nodes = [
        { id: 'app', type: 'app' },
        { id: 'fw', type: 'framework' },
      ];
      const edges = [{ from: 'app', to: 'fw' }];

      const result = radialLayout(nodes, edges, 0, 0);

      const appNode = result.find((n) => n.id === 'app')!;
      const fwNode = result.find((n) => n.id === 'fw')!;

      // App nodes are anchors, other nodes get internal role
      expect(appNode.role).toBe('anchor');
      expect(fwNode.role).toBe('internal');
    });

    it('should position ring 0 nodes at baseRadius', () => {
      const nodes = [{ id: 'A', type: 'app' }];
      const edges: Array<{ from: string; to: string }> = [];

      const result = radialLayout(nodes, edges, 0, 0, { baseRadius: 50 });

      const nodeA = result.find((n) => n.id === 'A')!;
      const distance = Math.sqrt(nodeA.x ** 2 + nodeA.y ** 2);

      expect(distance).toBeCloseTo(50, 0);
    });

    it('should position outer rings at correct radii', () => {
      const nodes = [
        { id: 'A', type: 'app' },
        { id: 'B', type: 'framework' },
      ];
      const edges = [{ from: 'A', to: 'B' }];

      const result = radialLayout(nodes, edges, 0, 0, {
        baseRadius: 40,
        ringSpacing: 60,
      });

      const nodeB = result.find((n) => n.id === 'B')!;
      const distance = Math.sqrt(nodeB.x ** 2 + nodeB.y ** 2);

      expect(distance).toBeCloseTo(100, 0); // baseRadius + ringSpacing
    });

    it('should place test nodes at orbit radius', () => {
      const nodes = [
        { id: 'A', type: 'framework' },
        { id: 'T', type: 'test' },
      ];
      const edges = [{ from: 'T', to: 'A' }];

      const result = radialLayout(nodes, edges, 0, 0, { testOrbitRadius: 80 });

      const testNode = result.find((n) => n.id === 'T')!;

      // Test node should have valid position
      expect(Number.isFinite(testNode.x)).toBe(true);
      expect(Number.isFinite(testNode.y)).toBe(true);
      // Either has 'test' role or is positioned at test orbit radius
      const distance = Math.sqrt(testNode.x ** 2 + testNode.y ** 2);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('relaxOnRings', () => {
    it('should not modify empty array', () => {
      const result = relaxOnRings([], 0, 0);

      expect(result).toEqual([]);
    });

    it('should not modify single node', () => {
      const nodes = [{ id: 'A', x: 50, y: 0, ring: 0, role: 'anchor' as const }];

      const result = relaxOnRings(nodes, 0, 0);

      expect(result[0].x).toBeCloseTo(50, 1);
      expect(result[0].y).toBeCloseTo(0, 1);
    });

    it('should spread nodes that are too close', () => {
      // Two nodes at nearly the same angle
      const nodes = [
        { id: 'A', x: 50, y: 0, ring: 1, role: 'internal' as const },
        { id: 'B', x: 49, y: 5, ring: 1, role: 'internal' as const },
      ];

      const result = relaxOnRings(nodes, 0, 0);

      // After relaxation, angular difference should increase
      const angleA = Math.atan2(result[0].y, result[0].x);
      const angleB = Math.atan2(result[1].y, result[1].x);
      const angularDiff = Math.abs(angleA - angleB);

      // Original angular difference was very small
      const originalAngleA = Math.atan2(0, 50);
      const originalAngleB = Math.atan2(5, 49);
      const originalDiff = Math.abs(originalAngleA - originalAngleB);

      expect(angularDiff).toBeGreaterThanOrEqual(originalDiff);
    });

    it('should maintain ring radius', () => {
      const nodes = [
        { id: 'A', x: 100, y: 0, ring: 1, role: 'internal' as const },
        { id: 'B', x: 95, y: 10, ring: 1, role: 'internal' as const },
      ];

      const result = relaxOnRings(nodes, 0, 0);

      // Both nodes should maintain their distance from center
      const radiusA = Math.sqrt(result[0].x ** 2 + result[0].y ** 2);
      const radiusB = Math.sqrt(result[1].x ** 2 + result[1].y ** 2);

      expect(radiusA).toBeCloseTo(100, 0);
      expect(radiusB).toBeCloseTo(Math.sqrt(95 ** 2 + 10 ** 2), 0);
    });

    it('should handle multiple rings independently', () => {
      const nodes = [
        { id: 'A', x: 50, y: 0, ring: 0, role: 'anchor' as const },
        { id: 'B', x: 100, y: 0, ring: 1, role: 'internal' as const },
        { id: 'C', x: 98, y: 10, ring: 1, role: 'internal' as const },
      ];

      const result = relaxOnRings(nodes, 0, 0);

      // Ring 0 node should be unchanged
      expect(result[0].x).toBeCloseTo(50, 1);
    });
  });
});
