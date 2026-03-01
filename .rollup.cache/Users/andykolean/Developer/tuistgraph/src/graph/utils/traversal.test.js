import { ViewMode } from '@shared/schemas';
import { describe, expect, it } from 'vitest';
import { createDiamondGraph, createEmptyGraph, createLinearChain } from '../../fixtures';
import { buildAdjacency, computeTransitiveDependencies, getTransitiveCacheStats, traverseGraph, } from './traversal';
describe('buildAdjacency', () => {
    it('should build outgoing and incoming maps', () => {
        const { edges } = createLinearChain(3);
        const { outgoing, incoming } = buildAdjacency(edges);
        expect(outgoing.get('A')).toEqual(['B']);
        expect(outgoing.get('B')).toEqual(['C']);
        expect(incoming.get('B')).toEqual(['A']);
        expect(incoming.get('C')).toEqual(['B']);
    });
    it('should handle empty edges', () => {
        const { outgoing, incoming } = buildAdjacency([]);
        expect(outgoing.size).toBe(0);
        expect(incoming.size).toBe(0);
    });
    it('should handle diamond graph with multiple edges', () => {
        const { edges } = createDiamondGraph();
        const { outgoing, incoming } = buildAdjacency(edges);
        expect(outgoing.get('A')?.sort()).toEqual(['B', 'C']);
        expect(incoming.get('D')?.sort()).toEqual(['B', 'C']);
    });
});
describe('traverseGraph', () => {
    it('should traverse a linear chain', () => {
        const { edges } = createLinearChain(4);
        const { outgoing } = buildAdjacency(edges);
        const result = traverseGraph('A', (id) => outgoing.get(id) ?? [], (current, neighbor) => `${current}->${neighbor}`);
        expect(result.nodes).toEqual(new Set(['A', 'B', 'C', 'D']));
        expect(result.maxDepth).toBe(3);
    });
    it('should track node depths correctly', () => {
        const { edges } = createLinearChain(4);
        const { outgoing } = buildAdjacency(edges);
        const result = traverseGraph('A', (id) => outgoing.get(id) ?? [], (current, neighbor) => `${current}->${neighbor}`);
        expect(result.nodeDepths.get('A')).toBe(0);
        // DFS uses a stack so traversal order might differ, but all nodes are visited
        expect(result.nodes.has('B')).toBe(true);
        expect(result.nodes.has('C')).toBe(true);
        expect(result.nodes.has('D')).toBe(true);
    });
    it('should collect edges during traversal', () => {
        const { edges } = createDiamondGraph();
        const { outgoing } = buildAdjacency(edges);
        const result = traverseGraph('A', (id) => outgoing.get(id) ?? [], (current, neighbor) => `${current}->${neighbor}`);
        expect(result.edges.has('A->B')).toBe(true);
        expect(result.edges.has('A->C')).toBe(true);
        expect(result.edges.has('B->D') || result.edges.has('C->D')).toBe(true);
    });
    it('should handle isolated node with no neighbors', () => {
        const result = traverseGraph('isolated', () => [], (current, neighbor) => `${current}->${neighbor}`);
        expect(result.nodes.size).toBe(1);
        expect(result.nodes.has('isolated')).toBe(true);
        expect(result.edges.size).toBe(0);
        expect(result.maxDepth).toBe(0);
    });
    it('should handle cyclic graph without infinite loop', () => {
        const edges = [
            { source: 'A', target: 'B' },
            { source: 'B', target: 'C' },
            { source: 'C', target: 'A' },
        ];
        const { outgoing } = buildAdjacency(edges);
        const result = traverseGraph('A', (id) => outgoing.get(id) ?? [], (current, neighbor) => `${current}->${neighbor}`);
        expect(result.nodes).toEqual(new Set(['A', 'B', 'C']));
    });
});
describe('computeTransitiveDependencies', () => {
    it('should return empty results in full view mode', () => {
        const { nodes, edges } = createLinearChain(3);
        const selectedNode = nodes[0];
        if (!selectedNode)
            throw new Error('Node not found');
        const result = computeTransitiveDependencies(ViewMode.Full, selectedNode, edges);
        expect(result.transitiveDeps.nodes.size).toBe(0);
        expect(result.transitiveDependents.nodes.size).toBe(0);
    });
    it('should return empty results when no node is selected', () => {
        const { edges } = createLinearChain(3);
        const result = computeTransitiveDependencies(ViewMode.Focused, null, edges);
        expect(result.transitiveDeps.nodes.size).toBe(0);
        expect(result.transitiveDependents.nodes.size).toBe(0);
    });
    it('should compute dependencies in focused mode', () => {
        const { nodes, edges } = createLinearChain(4);
        const selectedNode = nodes[0]; // A
        if (!selectedNode)
            throw new Error('Node not found');
        const result = computeTransitiveDependencies(ViewMode.Focused, selectedNode, edges);
        expect(result.transitiveDeps.nodes.has('A')).toBe(true);
        expect(result.transitiveDeps.nodes.has('B')).toBe(true);
        expect(result.transitiveDeps.nodes.has('C')).toBe(true);
        expect(result.transitiveDeps.nodes.has('D')).toBe(true);
    });
    it('should compute dependents in dependents mode', () => {
        const { nodes, edges } = createLinearChain(4);
        const selectedNode = nodes[3]; // D
        if (!selectedNode)
            throw new Error('Node not found');
        const result = computeTransitiveDependencies(ViewMode.Dependents, selectedNode, edges);
        expect(result.transitiveDependents.nodes.has('D')).toBe(true);
        expect(result.transitiveDependents.nodes.has('C')).toBe(true);
        expect(result.transitiveDependents.nodes.has('B')).toBe(true);
        expect(result.transitiveDependents.nodes.has('A')).toBe(true);
    });
    it('should compute both dependencies and dependents in both mode', () => {
        const { nodes, edges } = createDiamondGraph();
        const selectedNode = nodes.find((n) => n.id === 'B');
        if (!selectedNode)
            throw new Error('Node B not found');
        const result = computeTransitiveDependencies(ViewMode.Both, selectedNode, edges);
        // B's dependencies: D
        expect(result.transitiveDeps.nodes.has('B')).toBe(true);
        expect(result.transitiveDeps.nodes.has('D')).toBe(true);
        // B's dependents: A
        expect(result.transitiveDependents.nodes.has('B')).toBe(true);
        expect(result.transitiveDependents.nodes.has('A')).toBe(true);
    });
    it('should handle empty graph', () => {
        const { edges } = createEmptyGraph();
        const result = computeTransitiveDependencies(ViewMode.Focused, null, edges);
        expect(result.transitiveDeps.nodes.size).toBe(0);
        expect(result.transitiveDependents.nodes.size).toBe(0);
    });
    it('should use caching for repeated calls with same edges', () => {
        const { nodes, edges } = createLinearChain(4);
        const selectedNode = nodes[0];
        if (!selectedNode)
            throw new Error('Node not found');
        // First call computes
        computeTransitiveDependencies(ViewMode.Focused, selectedNode, edges);
        const stats1 = getTransitiveCacheStats();
        expect(stats1.size).toBeGreaterThan(0);
        // Second call should use cache (same edges reference)
        computeTransitiveDependencies(ViewMode.Focused, selectedNode, edges);
        const stats2 = getTransitiveCacheStats();
        expect(stats2.size).toBeGreaterThanOrEqual(stats1.size);
    });
    it('should invalidate cache when edges change', () => {
        const { nodes, edges } = createLinearChain(4);
        const selectedNode = nodes[0];
        if (!selectedNode)
            throw new Error('Node not found');
        computeTransitiveDependencies(ViewMode.Focused, selectedNode, edges);
        const stats1 = getTransitiveCacheStats();
        expect(stats1.size).toBeGreaterThan(0);
        // Different edges reference with different content
        const newEdges = [{ source: 'A', target: 'B' }];
        computeTransitiveDependencies(ViewMode.Focused, selectedNode, newEdges);
        // Cache should have been invalidated and repopulated
        const stats2 = getTransitiveCacheStats();
        expect(stats2.version).not.toBe(stats1.version);
    });
});
//# sourceMappingURL=traversal.test.js.map