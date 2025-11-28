/**
 * Cluster fixtures
 */

import { range } from '@shared/collections';
import { type Cluster, type ClusterNodeMetadata, ClusterType, NodeRole } from '@shared/schemas';
import { type GraphNode, NodeType, Origin } from '@shared/schemas/graph.schema';
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
    role: NodeRole.InternalLib,
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
    createNode({ id: 'cluster-main', name: 'Main', type: NodeType.Framework }),
    createNode({ id: 'cluster-lib', name: 'Lib', type: NodeType.Library }),
    createNode({ id: 'cluster-test', name: 'MainTests', type: NodeType.TestUnit }),
  ];

  const metadata = new Map<string, ClusterNodeMetadata>();
  defaultNodes.forEach((node, index) => {
    metadata.set(
      node.id,
      createNodeMetadata(node.id, {
        role: index === 0 ? NodeRole.Entry : index === 2 ? NodeRole.Test : NodeRole.InternalLib,
        layer: index === 0 ? 0 : 1,
        isAnchor: index === 0,
      }),
    );
  });

  return {
    id: 'test-cluster',
    name: 'TestCluster',
    type: ClusterType.Project,
    origin: Origin.Local,
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

  const roleForIndex = (i: number): NodeRole =>
    i === 0
      ? NodeRole.Entry
      : i === nodeCount - 1 && nodeCount > 2
        ? NodeRole.Test
        : NodeRole.InternalLib;

  range(nodeCount).forEach((i) => {
    const id = `node-${i}`;
    const isAnchor = i === 0;
    const isTest = i === nodeCount - 1 && nodeCount > 2;

    nodes.push(
      createNode({
        id,
        name: `Node${i}`,
        type: isTest ? NodeType.TestUnit : isAnchor ? NodeType.Framework : NodeType.Library,
      }),
    );

    metadata.set(
      id,
      createNodeMetadata(id, {
        role: roleForIndex(i),
        layer: isAnchor ? 0 : 1,
        isAnchor,
      }),
    );
  });

  return {
    id: `cluster-${nodeCount}`,
    name: `Cluster${nodeCount}`,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes,
    metadata,
    anchors: nodeCount > 0 ? ['node-0'] : [],
  };
}
