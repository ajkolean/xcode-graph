/**
 * Graph structure fixtures - common graph patterns for testing
 */

import { range } from '@shared/collections';
import { adjacentPairs } from '@shared/pairwise';
import { type GraphEdge, type GraphNode, NodeType, Origin } from '@shared/schemas/graph.schema';
import { createNode } from './nodes';

/**
 * Create a simple linear dependency chain: A -> B -> C -> D
 * Supports arbitrary lengths with numeric IDs for chains > 26 nodes
 */
export function createLinearChain(length: number = 4): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Generate node IDs - use letters for short chains, numbers for long ones
  const ids = range(length).map((i) => {
    if (length <= 26) {
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]!;
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
export function createDiamondGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    createNode({ id: 'A', name: 'Top' }),
    createNode({ id: 'B', name: 'Left' }),
    createNode({ id: 'C', name: 'Right' }),
    createNode({ id: 'D', name: 'Bottom' }),
  ];

  const edges: GraphEdge[] = [
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
export function createCyclicGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    createNode({ id: 'A', name: 'NodeA' }),
    createNode({ id: 'B', name: 'NodeB' }),
    createNode({ id: 'C', name: 'NodeC' }),
  ];

  const edges: GraphEdge[] = [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'A' }, // Creates cycle
  ];

  return { nodes, edges };
}

/**
 * Create a realistic project-like graph with multiple node types
 */
export function createProjectGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
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

  const edges: GraphEdge[] = [
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
export function createEmptyGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return { nodes: [], edges: [] };
}

/**
 * Create a graph with a single isolated node
 */
export function createSingleNodeGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return {
    nodes: [createNode({ id: 'single', name: 'SingleNode' })],
    edges: [],
  };
}
