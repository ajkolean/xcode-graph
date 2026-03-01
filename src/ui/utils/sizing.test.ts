import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { computeNodeWeights, getBaseNodeSize, getNodeSize } from './sizing';

function makeNode(id: string, type = NodeType.Framework) {
  return { id, name: id, type, platform: Platform.iOS, origin: Origin.Local, project: 'P' };
}

describe('sizing', () => {
  describe('getBaseNodeSize', () => {
    it('returns 18 for app type', () => {
      expect(getBaseNodeSize('app')).toBe(18);
    });

    it('returns 14 for framework type', () => {
      expect(getBaseNodeSize('framework')).toBe(14);
    });

    it('returns 14 for cli type', () => {
      expect(getBaseNodeSize('cli')).toBe(14);
    });

    it('returns 12 for library type', () => {
      expect(getBaseNodeSize('library')).toBe(12);
    });

    it('returns 12 for package type', () => {
      expect(getBaseNodeSize('package')).toBe(12);
    });

    it('returns 8 for test-unit type', () => {
      expect(getBaseNodeSize('test-unit')).toBe(8);
    });

    it('returns 8 for test-ui type', () => {
      expect(getBaseNodeSize('test-ui')).toBe(8);
    });

    it('returns default size for unknown type', () => {
      expect(getBaseNodeSize('unknown')).toBe(10);
    });
  });

  describe('getNodeSize', () => {
    it('scales size with weight using hyperbolic function', () => {
      const node = makeNode('n1', NodeType.App);
      const sizeNoWeight = getNodeSize(node, []);
      const sizeWithWeight = getNodeSize(node, [], 10);
      expect(sizeWithWeight).toBeGreaterThan(sizeNoWeight);
    });

    it('caps scale factor at 3x', () => {
      const node = makeNode('n1', NodeType.App);
      const size = getNodeSize(node, [], 10000);
      expect(size).toBeLessThanOrEqual(18 * 3);
    });

    it('uses weight 0 to produce 1x scale', () => {
      const node = makeNode('n1', NodeType.Framework);
      const size = getNodeSize(node, [], 0);
      expect(size).toBe(14);
    });

    it('falls back to edge count when no weight', () => {
      const node = makeNode('n1', NodeType.Framework);
      const edges = [
        { source: 'n1', target: 'n2' },
        { source: 'n3', target: 'n1' },
      ];
      const size = getNodeSize(node, edges);
      expect(size).toBeGreaterThan(14);
    });

    it('caps edge-count scale at 0.3 extra', () => {
      const node = makeNode('n1', NodeType.Framework);
      const edges = Array.from({ length: 50 }, (_, i) => ({
        source: 'n1',
        target: `t${i}`,
      }));
      const size = getNodeSize(node, edges);
      expect(size).toBeLessThanOrEqual(14 * 1.3 + 0.01);
    });
  });

  describe('computeNodeWeights', () => {
    it('returns empty map for no nodes', () => {
      const weights = computeNodeWeights([], []);
      expect(weights.size).toBe(0);
    });

    it('returns 0 weight for leaf nodes', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [{ source: 'n1', target: 'n2' }];
      const weights = computeNodeWeights(nodes, edges);
      expect(weights.get('n2')).toBe(0);
    });

    it('counts transitive dependencies', () => {
      const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
      const edges = [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ];
      const weights = computeNodeWeights(nodes, edges);
      expect(weights.get('a')).toBe(2); // b + c
      expect(weights.get('b')).toBe(1); // c
      expect(weights.get('c')).toBe(0);
    });

    it('handles diamond dependency graph', () => {
      const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')];
      const edges = [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ];
      const weights = computeNodeWeights(nodes, edges);
      expect(weights.get('a')).toBeGreaterThan(0);
      expect(weights.get('d')).toBe(0);
    });

    it('handles isolated nodes', () => {
      const nodes = [makeNode('a'), makeNode('b')];
      const weights = computeNodeWeights(nodes, []);
      expect(weights.get('a')).toBe(0);
      expect(weights.get('b')).toBe(0);
    });
  });
});
