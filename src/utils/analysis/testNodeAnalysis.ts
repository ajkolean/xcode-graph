/**
 * Test node identification and analysis
 */

import type { GraphNode } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';

/**
 * Identifies test nodes and their subjects
 */
export function identifyTestNodes(
  cluster: Cluster,
  dependencies: Map<string, Set<string>>,
): {
  testNodes: Set<string>;
  testSubjects: Map<string, string[]>;
} {
  const testNodes = new Set<string>();
  const testSubjects = new Map<string, string[]>();

  cluster.nodes.forEach((node) => {
    if (node.type === 'test-unit' || node.type === 'test-ui') {
      testNodes.add(node.id);

      // Find what this test depends on (its subjects)
      const subjects = Array.from(dependencies.get(node.id) || []).filter((depId) => {
        const depNode = cluster.nodes.find((n) => n.id === depId);
        return depNode && depNode.type !== 'test-unit' && depNode.type !== 'test-ui';
      });

      if (subjects.length > 0) {
        testSubjects.set(node.id, subjects);
      }
    }
  });

  return { testNodes, testSubjects };
}

/**
 * Checks if a node is a test node
 */
export function isTestNode(node: GraphNode): boolean {
  return node.type === 'test-unit' || node.type === 'test-ui';
}
