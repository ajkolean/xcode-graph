import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { getBaseNodeSize, getNodeSize } from './sizing';

function makeNode(id: string, type = NodeType.Framework) {
  return { id, name: id, type, platform: Platform.iOS, origin: Origin.Local, project: 'P' };
}

describe('sizing', () => {
  describe('getBaseNodeSize', () => {
    it('returns 36 for app type', () => {
      expect(getBaseNodeSize('app')).toBe(36);
    });

    it('returns 28 for framework type', () => {
      expect(getBaseNodeSize('framework')).toBe(28);
    });

    it('returns 28 for cli type', () => {
      expect(getBaseNodeSize('cli')).toBe(28);
    });

    it('returns 24 for library type', () => {
      expect(getBaseNodeSize('library')).toBe(24);
    });

    it('returns 24 for package type', () => {
      expect(getBaseNodeSize('package')).toBe(24);
    });

    it('returns 16 for test-unit type', () => {
      expect(getBaseNodeSize('test-unit')).toBe(16);
    });

    it('returns 16 for test-ui type', () => {
      expect(getBaseNodeSize('test-ui')).toBe(16);
    });

    it('returns default size for unknown type', () => {
      expect(getBaseNodeSize('unknown')).toBe(20);
    });
  });

  describe('getNodeSize', () => {
    it('returns base size for node type', () => {
      const node = makeNode('n1', NodeType.App);
      expect(getNodeSize(node)).toBe(36);
    });

    it('returns framework base size', () => {
      const node = makeNode('n1', NodeType.Framework);
      expect(getNodeSize(node)).toBe(28);
    });

    it('returns default size for unknown type', () => {
      const node = makeNode('n1', 'unknown' as NodeType);
      expect(getNodeSize(node)).toBe(20);
    });
  });
});
