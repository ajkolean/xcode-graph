/**
 * Cluster fixtures
 */

import type { GraphNode } from '@/schemas/graph.schema';
import type { Cluster, ClusterNodeMetadata, NodeRole } from '@/schemas';
import { createNode } from './nodes';

/**
 * Create cluster node metadata
 */
export function createNodeMetadata(
  nodeId: string,
  overrides: Partial<ClusterNodeMetadata> = {},
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
    metadata.set(
      node.id,
      createNodeMetadata(node.id, {
        role: index === 0 ? 'entry' : index === 2 ? 'test' : 'internal-lib',
        layer: index === 0 ? 0 : 1,
        isAnchor: index === 0,
      }),
    );
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

    nodes.push(
      createNode({
        id,
        name: `Node${i}`,
        type: isTest ? 'test-unit' : isAnchor ? 'framework' : 'library',
      }),
    );

    metadata.set(
      id,
      createNodeMetadata(id, {
        role: isAnchor ? 'entry' : isTest ? 'test' : 'internal-lib',
        layer: isAnchor ? 0 : 1,
        isAnchor,
      }),
    );
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
