/**
 * Shared test fixtures for tuistgraph tests
 * Provides reusable test data builders for GraphNode, GraphEdge, Cluster, and FilterState
 */

import type { GraphNode, GraphEdge } from '../data/mockGraphData';
import type { FilterState } from '../types/app';
import type { Cluster, ClusterNodeMetadata, NodeRole } from '../types/cluster';

// ============================================================================
// GRAPH NODE FIXTURES
// ============================================================================

/**
 * Create a single test node with sensible defaults
 */
export function createNode(overrides: Partial<GraphNode> & { id: string; name: string }): GraphNode {
  return {
    type: 'framework',
    platform: 'iOS',
    origin: 'local',
    ...overrides,
  };
}

/**
 * Create a simple linear dependency chain: A -> B -> C -> D
 */
export function createLinearChain(length: number = 4): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < length; i++) {
    nodes.push(createNode({ id: letters[i], name: `Node${letters[i]}` }));
    if (i > 0) {
      edges.push({ source: letters[i - 1], target: letters[i] });
    }
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
    createNode({ id: 'app', name: 'MainApp', type: 'app', project: 'App' }),

    // Feature modules
    createNode({ id: 'feature-home', name: 'HomeFeature', type: 'framework', project: 'Features' }),
    createNode({ id: 'feature-profile', name: 'ProfileFeature', type: 'framework', project: 'Features' }),

    // Core modules
    createNode({ id: 'core', name: 'Core', type: 'framework', project: 'Core' }),
    createNode({ id: 'networking', name: 'Networking', type: 'framework', project: 'Core' }),
    createNode({ id: 'utils', name: 'Utils', type: 'library', project: 'Core' }),

    // Tests
    createNode({ id: 'core-tests', name: 'CoreTests', type: 'test-unit', project: 'Core' }),
    createNode({ id: 'app-tests', name: 'MainAppTests', type: 'test-unit', project: 'App' }),

    // External packages
    createNode({ id: 'alamofire', name: 'Alamofire', type: 'package', origin: 'external' }),
    createNode({ id: 'kingfisher', name: 'Kingfisher', type: 'package', origin: 'external' }),
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
 * Create nodes with specific types for filter testing
 */
export function createNodesForFilterTesting(): GraphNode[] {
  return [
    createNode({ id: '1', name: 'App1', type: 'app', platform: 'iOS', origin: 'local', project: 'Main' }),
    createNode({ id: '2', name: 'Framework1', type: 'framework', platform: 'iOS', origin: 'local', project: 'Core' }),
    createNode({ id: '3', name: 'Library1', type: 'library', platform: 'macOS', origin: 'local', project: 'Core' }),
    createNode({ id: '4', name: 'Test1', type: 'test-unit', platform: 'iOS', origin: 'local', project: 'Core' }),
    createNode({ id: '5', name: 'TestUI1', type: 'test-ui', platform: 'iOS', origin: 'local', project: 'Main' }),
    createNode({ id: '6', name: 'CLI1', type: 'cli', platform: 'macOS', origin: 'local', project: 'Tools' }),
    createNode({ id: '7', name: 'Package1', type: 'package', platform: 'iOS', origin: 'external' }),
    createNode({ id: '8', name: 'Package2', type: 'package', platform: 'visionOS', origin: 'external' }),
  ];
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

// ============================================================================
// FILTER FIXTURES
// ============================================================================

/**
 * Create a FilterState that includes everything
 */
export function createAllInclusiveFilters(): FilterState {
  return {
    nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
    platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
    origins: new Set(['local', 'external']),
    projects: new Set(['Main', 'Core', 'Features', 'Tools', 'App']),
    packages: new Set(['Alamofire', 'Kingfisher', 'Package1', 'Package2']),
  };
}

/**
 * Create a FilterState that excludes everything
 */
export function createEmptyFilters(): FilterState {
  return {
    nodeTypes: new Set(),
    platforms: new Set(),
    origins: new Set(),
    projects: new Set(),
    packages: new Set(),
  };
}

/**
 * Create a FilterState with only specific node types
 */
export function createNodeTypeFilter(types: GraphNode['type'][]): FilterState {
  return {
    ...createAllInclusiveFilters(),
    nodeTypes: new Set(types),
  };
}

// ============================================================================
// CLUSTER FIXTURES
// ============================================================================

/**
 * Create cluster node metadata
 */
export function createNodeMetadata(
  nodeId: string,
  overrides: Partial<ClusterNodeMetadata> = {}
): ClusterNodeMetadata {
  return {
    nodeId,
    role: 'internal-lib' as NodeRole,
    layer: 1,
    isAnchor: false,
    hasExternalDependents: false,
    dependencyCount: 0,
    dependsOnCount: 0,
    ...overrides,
  };
}

/**
 * Create a test cluster
 */
export function createCluster(overrides: Partial<Cluster> = {}): Cluster {
  const defaultNodes = [
    createNode({ id: 'cluster-main', name: 'Main', type: 'framework' }),
    createNode({ id: 'cluster-lib', name: 'Lib', type: 'library' }),
    createNode({ id: 'cluster-test', name: 'MainTests', type: 'test-unit' }),
  ];

  const metadata = new Map<string, ClusterNodeMetadata>();
  defaultNodes.forEach((node, index) => {
    metadata.set(node.id, createNodeMetadata(node.id, {
      role: index === 0 ? 'entry' : index === 2 ? 'test' : 'internal-lib',
      layer: index === 0 ? 0 : 1,
      isAnchor: index === 0,
    }));
  });

  return {
    id: 'test-cluster',
    name: 'TestCluster',
    type: 'project',
    origin: 'local',
    nodes: defaultNodes,
    metadata,
    anchors: ['cluster-main'],
    ...overrides,
  };
}

/**
 * Create a cluster with specific node count
 */
export function createClusterWithNodes(nodeCount: number): Cluster {
  const nodes: GraphNode[] = [];
  const metadata = new Map<string, ClusterNodeMetadata>();

  for (let i = 0; i < nodeCount; i++) {
    const id = `node-${i}`;
    const isAnchor = i === 0;
    const isTest = i === nodeCount - 1 && nodeCount > 2;

    nodes.push(createNode({
      id,
      name: `Node${i}`,
      type: isTest ? 'test-unit' : isAnchor ? 'framework' : 'library',
    }));

    metadata.set(id, createNodeMetadata(id, {
      role: isAnchor ? 'entry' : isTest ? 'test' : 'internal-lib',
      layer: isAnchor ? 0 : 1,
      isAnchor,
    }));
  }

  return {
    id: `cluster-${nodeCount}`,
    name: `Cluster${nodeCount}`,
    type: 'project',
    origin: 'local',
    nodes,
    metadata,
    anchors: nodeCount > 0 ? ['node-0'] : [],
  };
}

// ============================================================================
// EDGE FIXTURES
// ============================================================================

/**
 * Convert edges from {from, to} format to {source, target} format
 */
export function convertEdgeFormat(edges: Array<{ from: string; to: string }>): GraphEdge[] {
  return edges.map(e => ({ source: e.from, target: e.target }));
}

/**
 * Create edges for a set of nodes (fully connected)
 */
export function createFullyConnectedEdges(nodeIds: string[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      edges.push({ source: nodeIds[i], target: nodeIds[j] });
    }
  }
  return edges;
}

// ============================================================================
// POSITION FIXTURES (for layout tests)
// ============================================================================

export interface TestPosition {
  id: string;
  x: number;
  y: number;
  ring?: number;
}

/**
 * Create node positions in a circle
 */
export function createCircularPositions(nodeIds: string[], radius: number = 100): TestPosition[] {
  return nodeIds.map((id, index) => {
    const angle = (2 * Math.PI * index) / nodeIds.length;
    return {
      id,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      ring: 1,
    };
  });
}

/**
 * Create node positions at origin
 */
export function createCenteredPositions(nodeIds: string[]): TestPosition[] {
  return nodeIds.map(id => ({ id, x: 0, y: 0, ring: 0 }));
}
