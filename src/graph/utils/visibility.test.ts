import { NodeType } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { createNode } from '../../fixtures';
import { matchesSearch } from './visibility';

describe('matchesSearch', () => {
  const node = createNode({
    id: '1',
    name: 'HomeFeature',
    type: NodeType.Framework,
    project: 'Features',
  });

  it('should return true for empty search query', () => {
    expect(matchesSearch(node, '')).toBe(true);
  });

  it('should match by node name (case-insensitive)', () => {
    expect(matchesSearch(node, 'home')).toBe(true);
    expect(matchesSearch(node, 'HOME')).toBe(true);
    expect(matchesSearch(node, 'HomeFeature')).toBe(true);
  });

  it('should match by node type', () => {
    expect(matchesSearch(node, 'framework')).toBe(true);
    expect(matchesSearch(node, 'FRAMEWORK')).toBe(true);
  });

  it('should match by project name', () => {
    expect(matchesSearch(node, 'features')).toBe(true);
    expect(matchesSearch(node, 'Features')).toBe(true);
  });

  it('should return false when nothing matches', () => {
    expect(matchesSearch(node, 'nonexistent')).toBe(false);
  });

  it('should handle partial matches', () => {
    expect(matchesSearch(node, 'Feat')).toBe(true);
  });

  it('should handle node without project', () => {
    const nodeWithoutProject = createNode({ id: '2', name: 'Orphan' });
    expect(matchesSearch(nodeWithoutProject, 'Orphan')).toBe(true);
    expect(matchesSearch(nodeWithoutProject, 'project')).toBe(false);
  });
});
