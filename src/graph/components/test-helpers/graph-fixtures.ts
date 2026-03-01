/**
 * Graph Test Fixtures
 *
 * Reusable test data generators for graph components.
 * Provides consistent mock data for nodes, edges, clusters, and positions.
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.types';
import {
  type GraphEdge,
  type GraphNode,
  NodeType,
  Origin,
  Platform,
} from '@shared/schemas/graph.types';

/**
 * Create a small test graph with 3 nodes and 2 edges
 */
export function createSmallTestGraph(): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = [
    {
      id: 'node1',
      name: 'AppTarget',
      type: NodeType.App,
      platform: Platform.iOS,
      project: 'ProjectA',
      origin: Origin.Local,
    },
    {
      id: 'node2',
      name: 'Framework1',
      type: NodeType.Framework,
      platform: Platform.iOS,
      project: 'ProjectA',
      origin: Origin.Local,
    },
    {
      id: 'node3',
      name: 'Framework2',
      type: NodeType.Framework,
      platform: Platform.iOS,
      project: 'ProjectB',
      origin: Origin.Local,
    },
  ];

  const edges: GraphEdge[] = [
    {
      source: 'node1',
      target: 'node2',
    },
    {
      source: 'node2',
      target: 'node3',
    },
  ];

  return { nodes, edges };
}

/**
 * Create a medium-sized test graph with multiple clusters
 */
export function createMediumTestGraph(): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = [
    // ProjectA nodes
    {
      id: 'app1',
      name: 'App',
      type: NodeType.App,
      platform: Platform.iOS,
      project: 'ProjectA',
      origin: Origin.Local,
    },
    {
      id: 'framework1',
      name: 'Core',
      type: NodeType.Framework,
      platform: Platform.iOS,
      project: 'ProjectA',
      origin: Origin.Local,
    },
    {
      id: 'framework2',
      name: 'UI',
      type: NodeType.Framework,
      platform: Platform.iOS,
      project: 'ProjectA',
      origin: Origin.Local,
    },
    // ProjectB nodes
    {
      id: 'lib1',
      name: 'Network',
      type: NodeType.Library,
      platform: Platform.iOS,
      project: 'ProjectB',
      origin: Origin.Local,
    },
    {
      id: 'lib2',
      name: 'Utils',
      type: NodeType.Library,
      platform: Platform.iOS,
      project: 'ProjectB',
      origin: Origin.Local,
    },
  ];

  const edges: GraphEdge[] = [
    { source: 'app1', target: 'framework1' },
    { source: 'app1', target: 'framework2' },
    { source: 'framework1', target: 'lib1' },
    { source: 'framework2', target: 'lib1' },
    { source: 'lib1', target: 'lib2' },
  ];

  return { nodes, edges };
}

/**
 * Create mock node positions for testing
 */
export function createMockNodePositions(nodeIds: string[]): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  nodeIds.forEach((id, index) => {
    positions.set(id, {
      id,
      clusterId: 'ProjectA',
      x: 100 + index * 150,
      y: 100 + index * 50,
      radius: 24,
      vx: 0,
      vy: 0,
    });
  });

  return positions;
}

/**
 * Create mock cluster positions for testing
 */
export function createMockClusterPositions(clusterIds: string[]): Map<string, ClusterPosition> {
  const positions = new Map<string, ClusterPosition>();

  clusterIds.forEach((id, index) => {
    positions.set(id, {
      id,
      x: 200 * index,
      y: 200 * index,
      width: 400,
      height: 300,
      vx: 0,
      vy: 0,
      nodeCount: 5,
    });
  });

  return positions;
}

/**
 * Create mock clusters from nodes
 */
export function createMockClusters(nodes: GraphNode[]): Cluster[] {
  const clusterMap = new Map<string, GraphNode[]>();

  // Group nodes by project
  for (const node of nodes) {
    const clusterId = node.project || 'External';
    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, []);
    }
    clusterMap.get(clusterId)?.push(node);
  }

  // Create clusters
  return Array.from(clusterMap.entries()).map(([id, clusterNodes]) => ({
    id,
    name: id,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: clusterNodes,
    anchors: [],
    metadata: new Map(),
  }));
}

/**
 * Create a single test node
 */
export function createTestNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'test-node',
    name: 'TestNode',
    type: NodeType.Framework,
    platform: Platform.iOS,
    project: 'TestProject',
    origin: Origin.Local,
    ...overrides,
  };
}

/**
 * Create a single test edge
 */
export function createTestEdge(source = 'node1', target = 'node2'): GraphEdge {
  return { source, target };
}

/**
 * Create transitive dependency result (for view mode testing)
 */
export function createTransitiveResult(
  nodeIds: string[],
  edgeKeys: string[],
): {
  nodes: Set<string>;
  edges: Set<string>;
  edgeDepths: Map<string, number>;
  maxDepth: number;
} {
  const edgeDepths = new Map<string, number>();
  edgeKeys.forEach((key, index) => {
    edgeDepths.set(key, index);
  });

  return {
    nodes: new Set(nodeIds),
    edges: new Set(edgeKeys),
    edgeDepths,
    maxDepth: edgeKeys.length - 1,
  };
}

/**
 * Create a large test graph for performance testing
 */
export function createLargeTestGraph(nodeCount = 100): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const projectIndex = Math.floor(i / 10);
    nodes.push({
      id: `node${i}`,
      name: `Node${i}`,
      type: i % 3 === 0 ? NodeType.App : i % 3 === 1 ? NodeType.Framework : NodeType.Library,
      platform: i % 2 === 0 ? Platform.iOS : Platform.macOS,
      project: `Project${projectIndex}`,
      origin: Origin.Local,
    });
  }

  // Create edges (each node connects to next)
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      source: `node${i}`,
      target: `node${i + 1}`,
    });
  }

  return { nodes, edges };
}

/**
 * Create viewport bounds for virtual rendering tests
 */
export interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function createViewportBounds(
  width = 1000,
  height = 800,
  panX = 0,
  panY = 0,
  zoom = 1,
): ViewportBounds {
  return {
    minX: -panX / zoom,
    minY: -panY / zoom,
    maxX: (width - panX) / zoom,
    maxY: (height - panY) / zoom,
  };
}

/**
 * Create a node positioned inside viewport
 */
export function createNodeInViewport(
  id: string,
  viewport: ViewportBounds,
): { node: GraphNode; position: NodePosition } {
  const x = (viewport.minX + viewport.maxX) / 2;
  const y = (viewport.minY + viewport.maxY) / 2;

  return {
    node: createTestNode({ id, name: `Node-${id}` }),
    position: { id, clusterId: 'test-cluster', x, y, radius: 24, vx: 0, vy: 0 },
  };
}

/**
 * Create a node positioned outside viewport
 */
export function createNodeOutsideViewport(
  id: string,
  viewport: ViewportBounds,
): { node: GraphNode; position: NodePosition } {
  const x = viewport.maxX + 500;
  const y = viewport.maxY + 500;

  return {
    node: createTestNode({ id, name: `Node-${id}` }),
    position: { id, clusterId: 'test-cluster', x, y, radius: 24, vx: 0, vy: 0 },
  };
}
