import type { GraphEdge } from '@shared/schemas/graph.types';
import { NodeType } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { createDiamondGraph, createNode } from '../../fixtures';
import { getConnectedNodeIds, matchesSearch, shouldDimNode, shouldShowEdge } from './visibility';

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

describe('getConnectedNodeIds', () => {
  it('should return empty set when no node is selected', () => {
    const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];
    const result = getConnectedNodeIds(null, edges);
    expect(result.size).toBe(0);
  });

  it('should include the selected node itself', () => {
    const selectedNode = createNode({ id: 'A', name: 'NodeA' });
    const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];

    const result = getConnectedNodeIds(selectedNode, edges);

    expect(result.has('A')).toBe(true);
  });

  it('should include direct dependencies and dependents', () => {
    const { nodes, edges } = createDiamondGraph();
    const selectedNode = nodes.find((n) => n.id === 'B');
    if (!selectedNode) throw new Error('Node B not found');

    const result = getConnectedNodeIds(selectedNode, edges);

    expect(result.has('B')).toBe(true);
    expect(result.has('A')).toBe(true); // dependent
    expect(result.has('D')).toBe(true); // dependency
  });

  it('should not include nodes that are not directly connected', () => {
    const { nodes, edges } = createDiamondGraph();
    const selectedNode = nodes.find((n) => n.id === 'B');
    if (!selectedNode) throw new Error('Node B not found');

    const result = getConnectedNodeIds(selectedNode, edges);

    // C is not directly connected to B
    expect(result.has('C')).toBe(false);
  });

  it('should handle isolated node with no edges', () => {
    const selectedNode = createNode({ id: 'isolated', name: 'Isolated' });

    const result = getConnectedNodeIds(selectedNode, []);

    expect(result.size).toBe(1);
    expect(result.has('isolated')).toBe(true);
  });
});

describe('shouldDimNode', () => {
  const nodeA = createNode({ id: 'A', name: 'HomeFeature', type: NodeType.Framework });
  const nodeB = createNode({ id: 'B', name: 'CoreLib', type: NodeType.Library });

  it('should not dim when no search query and no selection', () => {
    expect(shouldDimNode(nodeA, null, new Set(), '')).toBe(false);
  });

  it('should dim node when search query does not match', () => {
    expect(shouldDimNode(nodeB, null, new Set(), 'Home')).toBe(true);
  });

  it('should not dim node when search query matches', () => {
    expect(shouldDimNode(nodeA, null, new Set(), 'Home')).toBe(false);
  });

  it('should dim node when selected node exists and node is not connected', () => {
    const selectedNode = createNode({ id: 'selected', name: 'Selected' });
    const connectedNodes = new Set(['selected', 'A']);

    expect(shouldDimNode(nodeB, selectedNode, connectedNodes, '')).toBe(true);
  });

  it('should not dim node when it is connected to selected node', () => {
    const selectedNode = createNode({ id: 'selected', name: 'Selected' });
    const connectedNodes = new Set(['selected', 'A']);

    expect(shouldDimNode(nodeA, selectedNode, connectedNodes, '')).toBe(false);
  });

  it('should prioritize search over selection', () => {
    const selectedNode = createNode({ id: 'selected', name: 'Selected' });
    const connectedNodes = new Set(['selected', 'A']);

    // B is connected but doesn't match search
    expect(shouldDimNode(nodeB, selectedNode, connectedNodes, 'nonexistent')).toBe(true);
  });
});

describe('shouldShowEdge', () => {
  const nodes = [
    createNode({ id: 'A', name: 'HomeFeature', type: NodeType.Framework }),
    createNode({ id: 'B', name: 'CoreLib', type: NodeType.Library }),
    createNode({ id: 'C', name: 'Utils', type: NodeType.Library }),
  ];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edge: GraphEdge = { source: 'A', target: 'B' };

  it('should show all edges when no search and no selection', () => {
    expect(shouldShowEdge(edge, null, '', nodeMap)).toBe(true);
  });

  it('should show edge when both nodes match search', () => {
    const nodeA = createNode({ id: 'A', name: 'FeatureLib', type: NodeType.Framework });
    const nodeB = createNode({ id: 'B', name: 'CoreLib', type: NodeType.Library });
    const testNodeMap = new Map([
      [nodeA.id, nodeA],
      [nodeB.id, nodeB],
    ]);

    expect(shouldShowEdge(edge, null, 'Lib', testNodeMap)).toBe(true);
  });

  it('should hide edge when only source matches search', () => {
    expect(shouldShowEdge(edge, null, 'Home', nodeMap)).toBe(false);
  });

  it('should hide edge when only target matches search', () => {
    expect(shouldShowEdge(edge, null, 'CoreLib', nodeMap)).toBe(false);
  });

  it('should show edge connected to selected node', () => {
    const selectedNode = nodes[0];
    if (!selectedNode) throw new Error('Node not found');
    expect(shouldShowEdge(edge, selectedNode, '', nodeMap)).toBe(true);
  });

  it('should hide edge not connected to selected node', () => {
    const selectedNode = nodes[2]; // C
    if (!selectedNode) throw new Error('Node C not found');
    expect(shouldShowEdge(edge, selectedNode, '', nodeMap)).toBe(false);
  });

  it('should hide edge when source or target node does not exist', () => {
    const orphanEdge: GraphEdge = { source: 'X', target: 'Y' };
    expect(shouldShowEdge(orphanEdge, null, 'anything', nodeMap)).toBe(false);
  });
});
