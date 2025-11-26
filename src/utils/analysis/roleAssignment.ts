/**
 * Node role assignment utilities
 */

import type { GraphNode } from '../../data/mockGraphData';
import type { NodeRole } from '../../types/cluster';

/**
 * Determines the role of a node based on its type and characteristics
 */
export function determineRole(node: GraphNode, isAnchor: boolean, isTest: boolean): NodeRole {
  if (isTest) return 'test';
  if (isAnchor) return 'entry';

  // Role based on node type
  if (node.type === 'app' || node.type === 'cli') return 'entry';
  if (node.type === 'framework') return 'internal-framework';
  if (node.type === 'library') return 'internal-lib';
  if (node.type === 'package') return 'utility';

  // Default role
  return 'internal-lib';
}

/**
 * Checks if a node should be an anchor (entry point)
 */
export function shouldBeAnchor(
  node: GraphNode,
  externalDependentCount: number,
  internalDependentCount: number,
): boolean {
  // Apps and CLIs are always anchors
  if (node.type === 'app' || node.type === 'cli') {
    return true;
  }

  // Nodes with many external dependents are entry points
  if (externalDependentCount >= 3) {
    return true;
  }

  // Frameworks with dependents can be anchors
  if (node.type === 'framework' && internalDependentCount > 0) {
    return true;
  }

  return false;
}

/**
 * Gets role display name
 */
export function getRoleDisplayName(role: NodeRole): string {
  const names: Record<NodeRole, string> = {
    entry: 'Entry Point',
    'internal-framework': 'Framework',
    'internal-lib': 'Library',
    utility: 'Utility',
    tool: 'Tool',
    test: 'Test',
  };
  return names[role] || role;
}
