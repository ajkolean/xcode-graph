import type { FilterState } from '@shared/schemas/app.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import { applyGraphFilters } from './graph-filters';

const defaultFilters: FilterState = {
  nodeTypes: new Set(['app', 'package']),
  platforms: new Set(['iOS']),
  origins: new Set(['local', 'external']),
  projects: new Set(['Core']),
  packages: new Set(['AlamoFire']),
};

const nodes: GraphNode[] = [
  {
    id: 'app',
    name: 'MainApp',
    type: 'app',
    platform: 'iOS',
    origin: 'local',
    project: 'Core',
  },
  {
    id: 'pkg',
    name: 'AlamoFire',
    type: 'package',
    platform: 'iOS',
    origin: 'external',
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
