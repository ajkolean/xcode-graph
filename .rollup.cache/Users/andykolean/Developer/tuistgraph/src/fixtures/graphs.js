/**
 * Graph structure fixtures - common graph patterns for testing
 */
import { range } from '@shared/collections';
import { adjacentPairs } from '@shared/pairwise';
import { NodeType, Origin } from '@shared/schemas/graph.types';
import { createNode } from './nodes';
/**
 * Create a simple linear dependency chain: A -> B -> C -> D
 * Supports arbitrary lengths with numeric IDs for chains > 26 nodes
 */
export function createLinearChain(length = 4) {
    const nodes = [];
    const edges = [];
    // Generate node IDs - use letters for short chains, numbers for long ones
    const ids = range(length).map((i) => {
        if (length <= 26) {
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i] ?? `node-${i}`;
        }
        return `node-${i}`;
    });
    nodes.push(...ids.map((id) => createNode({ id, name: `Node${id}` })));
    for (const [source, target] of adjacentPairs(ids)) {
        edges.push({ source, target });
    }
    return { nodes, edges };
}
/**
 * Create a diamond dependency pattern:
 *     A
 *    / \
 *   B   C
 *    \ /
 *     D
 */
export function createDiamondGraph() {
    const nodes = [
        createNode({ id: 'A', name: 'Top' }),
        createNode({ id: 'B', name: 'Left' }),
        createNode({ id: 'C', name: 'Right' }),
        createNode({ id: 'D', name: 'Bottom' }),
    ];
    const edges = [
        { source: 'A', target: 'B' },
        { source: 'A', target: 'C' },
        { source: 'B', target: 'D' },
        { source: 'C', target: 'D' },
    ];
    return { nodes, edges };
}
/**
 * Create a graph with a cycle: A -> B -> C -> A
 */
export function createCyclicGraph() {
    const nodes = [
        createNode({ id: 'A', name: 'NodeA' }),
        createNode({ id: 'B', name: 'NodeB' }),
        createNode({ id: 'C', name: 'NodeC' }),
    ];
    const edges = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'C', target: 'A' }, // Creates cycle
    ];
    return { nodes, edges };
}
/**
 * Create a realistic project-like graph with multiple node types
 */
export function createProjectGraph() {
    const nodes = [
        // App target
        createNode({ id: 'app', name: 'MainApp', type: NodeType.App, project: 'App' }),
        // Feature modules
        createNode({
            id: 'feature-home',
            name: 'HomeFeature',
            type: NodeType.Framework,
            project: 'Features',
        }),
        createNode({
            id: 'feature-profile',
            name: 'ProfileFeature',
            type: NodeType.Framework,
            project: 'Features',
        }),
        // Core modules
        createNode({ id: 'core', name: 'Core', type: NodeType.Framework, project: 'Core' }),
        createNode({ id: 'networking', name: 'Networking', type: NodeType.Framework, project: 'Core' }),
        createNode({ id: 'utils', name: 'Utils', type: NodeType.Library, project: 'Core' }),
        // Tests
        createNode({ id: 'core-tests', name: 'CoreTests', type: NodeType.TestUnit, project: 'Core' }),
        createNode({ id: 'app-tests', name: 'MainAppTests', type: NodeType.TestUnit, project: 'App' }),
        // External packages
        createNode({
            id: 'alamofire',
            name: 'Alamofire',
            type: NodeType.Package,
            origin: Origin.External,
        }),
        createNode({
            id: 'kingfisher',
            name: 'Kingfisher',
            type: NodeType.Package,
            origin: Origin.External,
        }),
    ];
    const edges = [
        // App depends on features
        { source: 'app', target: 'feature-home' },
        { source: 'app', target: 'feature-profile' },
        // Features depend on core
        { source: 'feature-home', target: 'core' },
        { source: 'feature-home', target: 'kingfisher' },
        { source: 'feature-profile', target: 'core' },
        // Core dependencies
        { source: 'core', target: 'networking' },
        { source: 'core', target: 'utils' },
        { source: 'networking', target: 'alamofire' },
        { source: 'networking', target: 'utils' },
        // Test dependencies
        { source: 'core-tests', target: 'core' },
        { source: 'app-tests', target: 'app' },
    ];
    return { nodes, edges };
}
/**
 * Create an empty graph
 */
export function createEmptyGraph() {
    return { nodes: [], edges: [] };
}
/**
 * Create a graph with a single isolated node
 */
export function createSingleNodeGraph() {
    return {
        nodes: [createNode({ id: 'single', name: 'SingleNode' })],
        edges: [],
    };
}
/**
 * Create a graph with multiple SCCs (Strongly Connected Components)
 * Useful for testing cycle detection and highlighting
 *
 * Structure:
 * - Cycle 1: A -> B -> C -> A (3-node cycle)
 * - Cycle 2: D -> E -> D (2-node cycle)
 * - Linear: F -> G -> H (no cycle)
 * - Cross-component edges connecting them
 */
export function createMultiCycleGraph() {
    const nodes = [
        // Cycle 1
        createNode({ id: 'A', name: 'CycleA1', project: 'Cycle1' }),
        createNode({ id: 'B', name: 'CycleA2', project: 'Cycle1' }),
        createNode({ id: 'C', name: 'CycleA3', project: 'Cycle1' }),
        // Cycle 2
        createNode({ id: 'D', name: 'CycleB1', project: 'Cycle2' }),
        createNode({ id: 'E', name: 'CycleB2', project: 'Cycle2' }),
        // Linear (no cycle)
        createNode({ id: 'F', name: 'Linear1', project: 'Linear' }),
        createNode({ id: 'G', name: 'Linear2', project: 'Linear' }),
        createNode({ id: 'H', name: 'Linear3', project: 'Linear' }),
    ];
    const edges = [
        // Cycle 1: A -> B -> C -> A
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'C', target: 'A' },
        // Cycle 2: D -> E -> D
        { source: 'D', target: 'E' },
        { source: 'E', target: 'D' },
        // Linear: F -> G -> H
        { source: 'F', target: 'G' },
        { source: 'G', target: 'H' },
        // Cross-component edges
        { source: 'A', target: 'D' }, // Cycle1 -> Cycle2
        { source: 'D', target: 'F' }, // Cycle2 -> Linear
    ];
    return { nodes, edges };
}
/**
 * Create a layered graph with clear strata structure
 * Each layer depends on the next, creating a clean hierarchical layout
 *
 * @param layers Number of horizontal layers
 * @param nodesPerLayer Number of nodes in each layer
 */
export function createLayeredGraph(layers = 4, nodesPerLayer = 3) {
    const nodes = [];
    const edges = [];
    for (let layer = 0; layer < layers; layer++) {
        const projectName = `Layer${layer}`;
        for (let i = 0; i < nodesPerLayer; i++) {
            const id = `L${layer}N${i}`;
            nodes.push(createNode({
                id,
                name: `Layer${layer}Node${i}`,
                project: projectName,
            }));
            // Connect to nodes in next layer
            if (layer < layers - 1) {
                // Each node connects to 1-2 nodes in the next layer
                const targetIndex = i % nodesPerLayer;
                edges.push({
                    source: id,
                    target: `L${layer + 1}N${targetIndex}`,
                });
                // Add a second connection for some nodes to create more interesting structure
                if (i > 0) {
                    edges.push({
                        source: id,
                        target: `L${layer + 1}N${(targetIndex + 1) % nodesPerLayer}`,
                    });
                }
            }
        }
    }
    return { nodes, edges };
}
/**
 * Create a multi-cluster graph with cross-cluster dependencies
 * Useful for testing cluster layout and edge bundling
 *
 * @param clusterCount Number of clusters to create
 * @param nodesPerCluster Number of nodes in each cluster
 */
export function createMultiClusterGraph(clusterCount = 4, nodesPerCluster = 5) {
    const nodes = [];
    const edges = [];
    for (let c = 0; c < clusterCount; c++) {
        const projectName = `Cluster${c}`;
        // Create nodes for this cluster
        for (let i = 0; i < nodesPerCluster; i++) {
            const id = `C${c}N${i}`;
            const isEntry = i === 0;
            nodes.push(createNode({
                id,
                name: `${projectName}Node${i}`,
                project: projectName,
                type: isEntry ? NodeType.App : NodeType.Framework,
            }));
            // Intra-cluster edges (linear chain within cluster)
            if (i > 0) {
                edges.push({
                    source: `C${c}N${i - 1}`,
                    target: id,
                });
            }
        }
        // Cross-cluster edges (entry node of each cluster depends on entry of next)
        if (c < clusterCount - 1) {
            edges.push({
                source: `C${c}N0`,
                target: `C${c + 1}N0`,
            });
            // Add some additional cross-cluster edges for variety
            if (nodesPerCluster > 2) {
                edges.push({
                    source: `C${c}N1`,
                    target: `C${c + 1}N${Math.floor(nodesPerCluster / 2)}`,
                });
            }
        }
    }
    return { nodes, edges };
}
//# sourceMappingURL=graphs.js.map