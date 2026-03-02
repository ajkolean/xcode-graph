/**
 * Cluster fixtures
 */

import { type Cluster, type ClusterNodeMetadata, ClusterType, NodeRole } from '@shared/schemas';
import { type GraphNode, NodeType, Origin } from '@shared/schemas/graph.types';
import { range } from '@shared/utils/collections';
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
  /** Returns the node role based on its position in the default cluster. */
  const getRoleForIndex = (idx: number): NodeRole => {
    if (idx === 0) return NodeRole.Entry;
    if (idx === 2) return NodeRole.Test;
    return NodeRole.InternalLib;
  };

  defaultNodes.forEach((node, index) => {
    metadata.set(
      node.id,
      createNodeMetadata(node.id, {
        role: getRoleForIndex(index),
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

  /** Returns the node role based on its index within the generated cluster. */
  const roleForIndex = (i: number): NodeRole => {
    if (i === 0) return NodeRole.Entry;
    if (i === nodeCount - 1 && nodeCount > 2) return NodeRole.Test;
    return NodeRole.InternalLib;
  };

  range(nodeCount).forEach((i) => {
    const id = `node-${i}`;
    const isAnchor = i === 0;
    const isTest = i === nodeCount - 1 && nodeCount > 2;

    /** Determines the node type based on whether the node is an anchor, test, or internal library. */
    const getNodeType = (): NodeType => {
      if (isTest) return NodeType.TestUnit;
      if (isAnchor) return NodeType.Framework;
      return NodeType.Library;
    };

    nodes.push(
      createNode({
        id,
        name: `Node${i}`,
        type: getNodeType(),
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
