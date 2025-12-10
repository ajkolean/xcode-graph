import { describe, it, expect } from 'vitest';
import { tuistGraphData, rawTuistGraph } from './tuist-graph-data';

describe('tuist-graph-data fixture', () => {
  it('should load raw Tuist graph JSON', () => {
    expect(rawTuistGraph.name).toBe('Tuist');
    expect(rawTuistGraph.projects.length).toBeGreaterThan(0);
    expect(rawTuistGraph.dependencies.length).toBeGreaterThan(0);
  });

  it('should transform to GraphData format', () => {
    console.log('Nodes:', tuistGraphData.nodes.length);
    console.log('Edges:', tuistGraphData.edges.length);
    expect(tuistGraphData.nodes.length).toBeGreaterThan(0);
    expect(tuistGraphData.edges.length).toBeGreaterThan(0);
  });

  it('should have properly typed nodes', () => {
    const firstNode = tuistGraphData.nodes[0]!;
    expect(firstNode).toBeDefined();
    expect(typeof firstNode.id).toBe('string');
    expect(typeof firstNode.name).toBe('string');
    expect(firstNode.type).toBeDefined();
    expect(firstNode.platform).toBeDefined();
  });
});
