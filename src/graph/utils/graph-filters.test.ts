import type { FilterState } from '@shared/schemas/app.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import { applyGraphFilters } from './graph-filters';

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
