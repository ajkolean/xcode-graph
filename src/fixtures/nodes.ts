/**
 * Node fixture builders
 */

import type { GraphNode } from '@/schemas/graph.schema';

/**
 * Create a single test node with sensible defaults
 */
export function createNode(
  overrides: Partial<GraphNode> & { id: string; name: string },
): GraphNode {
  return {
    type: 'framework',
    platform: 'iOS',
    origin: 'local',
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
      type: 'app',
      platform: 'iOS',
      origin: 'local',
      project: 'Main',
    }),
    createNode({
      id: '2',
      name: 'Framework1',
      type: 'framework',
      platform: 'iOS',
      origin: 'local',
      project: 'Core',
    }),
    createNode({
      id: '3',
      name: 'Library1',
      type: 'library',
      platform: 'macOS',
      origin: 'local',
      project: 'Core',
    }),
    createNode({
      id: '4',
      name: 'Test1',
      type: 'test-unit',
      platform: 'iOS',
      origin: 'local',
      project: 'Core',
    }),
    createNode({
      id: '5',
      name: 'TestUI1',
      type: 'test-ui',
      platform: 'iOS',
      origin: 'local',
      project: 'Main',
    }),
    createNode({
      id: '6',
      name: 'CLI1',
      type: 'cli',
      platform: 'macOS',
      origin: 'local',
      project: 'Tools',
    }),
    createNode({ id: '7', name: 'Package1', type: 'package', platform: 'iOS', origin: 'external' }),
    createNode({
      id: '8',
      name: 'Package2',
      type: 'package',
      platform: 'visionOS',
      origin: 'external',
    }),
  ];
}
