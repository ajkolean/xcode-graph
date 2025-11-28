/**
 * Node fixture builders
 */

import { type GraphNode, NodeType, Origin, Platform } from '@shared/schemas/graph.schema';

/**
 * Create a single test node with sensible defaults
 */
export function createNode(
  overrides: Partial<GraphNode> & { id: string; name: string },
): GraphNode {
  return {
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    ...overrides,
  };
}

/**
 * Create nodes with specific types for filter testing
 */
export function createNodesForFilterTesting(): GraphNode[] {
  return [
    createNode({
      id: '1',
      name: 'App1',
      type: NodeType.App,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'Main',
    }),
    createNode({
      id: '2',
      name: 'Framework1',
      type: NodeType.Framework,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'Core',
    }),
    createNode({
      id: '3',
      name: 'Library1',
      type: NodeType.Library,
      platform: Platform.macOS,
      origin: Origin.Local,
      project: 'Core',
    }),
    createNode({
      id: '4',
      name: 'Test1',
      type: NodeType.TestUnit,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'Core',
    }),
    createNode({
      id: '5',
      name: 'TestUI1',
      type: NodeType.TestUi,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'Main',
    }),
    createNode({
      id: '6',
      name: 'CLI1',
      type: NodeType.Cli,
      platform: Platform.macOS,
      origin: Origin.Local,
      project: 'Tools',
    }),
    createNode({
      id: '7',
      name: 'Package1',
      type: NodeType.Package,
      platform: Platform.iOS,
      origin: Origin.External,
    }),
    createNode({
      id: '8',
      name: 'Package2',
      type: NodeType.Package,
      platform: Platform.visionOS,
      origin: Origin.External,
    }),
  ];
}
