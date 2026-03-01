/**
 * Edge fixtures
 */
import { pairwise } from '@shared/pairwise';
/**
 * Convert edges from {from, to} format to {source, target} format
 */
export function convertEdgeFormat(edges) {
    return edges.map((e) => ({ source: e.from, target: e.to }));
}
/**
 * Create edges for a set of nodes (fully connected)
 */
export function createFullyConnectedEdges(nodeIds) {
    const edges = [];
    for (const [source, target] of pairwise(nodeIds)) {
        edges.push({ source, target });
    }
    return edges;
}
//# sourceMappingURL=edges.js.map