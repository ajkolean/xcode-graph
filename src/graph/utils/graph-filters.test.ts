import type { FilterState } from '@shared/schemas/app.types';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { createNode } from '../../fixtures';
import { applyGraphFilters, matchesSearch } from './graph-filters';

const defaultFilters: FilterState = {
  nodeTypes: new Set([NodeType.App, NodeType.Package]),
  platforms: new Set([Platform.iOS]),
  origins: new Set([Origin.Local, Origin.External]),
  projects: new Set(['Core']),
  packages: new Set(['AlamoFire']),
};

const nodes: GraphNode[] = [
  {
    id: 'app',
    name: 'MainApp',
    type: NodeType.App,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'Core',
  },
  {
    id: 'pkg',
    name: 'AlamoFire',
    type: NodeType.Package,
    platform: Platform.iOS,
    origin: Origin.External,
    project: 'Vendor',
  },
];

const edges: GraphEdge[] = [{ source: 'app', target: 'pkg' }];

describe('applyGraphFilters', () => {
  it('matches search by project name', () => {
    const result = applyGraphFilters(nodes, edges, defaultFilters, 'core');

    expect(result.filteredNodes.map((n) => n.id)).toEqual(['app']);
    expect(result.filteredEdges).toHaveLength(0);
    expect(result.searchResults).toBe(1);
  });

  it('matches search by package name', () => {
    const result = applyGraphFilters(nodes, edges, defaultFilters, 'alamo');

    expect(result.filteredNodes.map((n) => n.id)).toEqual(['pkg']);
    expect(result.filteredEdges).toHaveLength(0);
    expect(result.searchResults).toBe(1);
  });
});

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
