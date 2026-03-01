/**
 * Utilities for calculating node sizes
 */
import { buildAdjacency } from '@graph/utils/traversal';
/**
 * Base sizes for different node types
 */
const BASE_NODE_SIZES = {
    app: 18,
    framework: 14,
    cli: 14,
    library: 12,
    package: 12,
    'test-unit': 8,
    'test-ui': 8,
};
const DEFAULT_BASE_SIZE = 10;
/**
 * Calculates the size of a node based on its type and transitive weight.
 * When weight is provided, uses a hyperbolic scale for smoother differentiation.
 * Falls back to direct edge count when weight is not available.
 *
 * @param node - The graph node to size
 * @param edges - All graph edges (used as fallback when weight is not provided)
 * @param weight - Optional pre-computed transitive dependency weight
 * @returns Computed radius in graph units
 */
export function getNodeSize(node, edges, weight) {
    const baseSize = BASE_NODE_SIZES[node.type] ?? DEFAULT_BASE_SIZE;
    if (weight !== undefined) {
        // Hyperbolic scale: weight 0 → 1x, weight 1 → 1.17x, weight 10 → 2x, weight 100 → 3x
        const scaleFactor = 1 + (2.25 * weight) / (weight + 12.5);
        return baseSize * Math.min(scaleFactor, 3.0);
    }
    // Fallback: direct edge count
    const depCount = edges.filter((e) => e.source === node.id || e.target === node.id).length;
    const scaleFactor = 1 + Math.min(depCount * 0.03, 0.3);
    return baseSize * scaleFactor;
}
/**
 * Gets the base size for a node type without connection scaling.
 *
 * @param type - The node type string (e.g., `'app'`, `'framework'`)
 * @returns Base radius in graph units
 */
export function getBaseNodeSize(type) {
    return BASE_NODE_SIZES[type] ?? DEFAULT_BASE_SIZE;
}
/**
 * Compute transitive dependency weight for every node in a single pass.
 *
 * Uses Kahn's topological sort, then accumulates bottom-up (leaves first).
 * Each node's weight = total number of transitive dependencies.
 * O(n + e) time complexity, called once when graph data changes.
 */
function buildAdjacencyData(nodes, edges) {
    const { outgoing, incoming } = buildAdjacency(edges);
    // Ensure all nodes are present (topological sort requires every node in the map)
    for (const node of nodes) {
        if (!outgoing.has(node.id))
            outgoing.set(node.id, []);
    }
    // Derive inDegree counts from the incoming adjacency list
    const inDegree = new Map();
    for (const node of nodes) {
        inDegree.set(node.id, incoming.get(node.id)?.length ?? 0);
    }
    return { outgoing, inDegree };
}
function topologicalSort(outgoing, inDegree) {
    const queue = [];
    for (const [id, deg] of inDegree) {
        if (deg === 0)
            queue.push(id);
    }
    const topoOrder = [];
    while (queue.length > 0) {
        const id = queue.shift();
        if (id === undefined)
            break;
        topoOrder.push(id);
        for (const neighbor of outgoing.get(id) ?? []) {
            const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
            inDegree.set(neighbor, newDeg);
            if (newDeg === 0)
                queue.push(neighbor);
        }
    }
    return topoOrder;
}
/**
 * Compute transitive dependency weight for every node in a single pass.
 *
 * Uses Kahn's topological sort, then accumulates bottom-up (leaves first).
 * Each node's weight equals the total number of transitive dependencies.
 *
 * @param nodes - All graph nodes
 * @param edges - All graph edges
 * @returns Map from node ID to its transitive dependency count
 */
export function computeNodeWeights(nodes, edges) {
    const { outgoing, inDegree } = buildAdjacencyData(nodes, edges);
    const topoOrder = topologicalSort(outgoing, inDegree);
    // Process in reverse topological order (leaves first)
    // weight = sum of (1 + child weight) for each outgoing edge
    const weights = new Map();
    for (let i = topoOrder.length - 1; i >= 0; i--) {
        const id = topoOrder[i];
        if (id === undefined)
            continue;
        let weight = 0;
        for (const child of outgoing.get(id) ?? []) {
            weight += 1 + (weights.get(child) ?? 0);
        }
        weights.set(id, weight);
    }
    return weights;
}
//# sourceMappingURL=sizing.js.map