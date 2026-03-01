/**
 * Mock GraphEdge data for tests and fixtures
 */

import type { GraphEdge } from '@shared/schemas/graph.types';

export const mockEdge: GraphEdge = {
  source: 'app-1',
  target: 'framework-1',
};

export const mockEdgeReverse: GraphEdge = {
  source: 'framework-1',
  target: 'library-1',
};

export const mockGraphEdges: GraphEdge[] = [
  // MainApp dependencies
  { source: 'app-main', target: 'fw-networking' },
  { source: 'app-main', target: 'fw-ui' },
  { source: 'app-main', target: 'fw-auth' },
  { source: 'app-main', target: 'lib-models' },
  { source: 'app-main', target: 'pkg-swiftui' },

  // WatchApp dependencies
  { source: 'app-watch', target: 'fw-networking' },
  { source: 'app-watch', target: 'lib-utils' },

  // Framework dependencies
  { source: 'fw-networking', target: 'lib-utils' },
  { source: 'fw-networking', target: 'lib-models' },
  { source: 'fw-networking', target: 'pkg-alamofire' },
  { source: 'fw-ui', target: 'lib-utils' },
  { source: 'fw-ui', target: 'pkg-swiftui' },
  { source: 'fw-auth', target: 'fw-networking' },
  { source: 'fw-auth', target: 'lib-models' },

  // Library dependencies
  { source: 'lib-models', target: 'lib-utils' },

  // Test dependencies
  { source: 'test-networking', target: 'fw-networking' },
  { source: 'test-auth', target: 'fw-auth' },
  { source: 'test-ui-main', target: 'app-main' },

  // CLI dependencies
  { source: 'cli-codegen', target: 'lib-utils' },
  { source: 'cli-codegen', target: 'lib-models' },
];

export const fewEdges: GraphEdge[] = [
  { source: 'app-1', target: 'framework-1' },
  { source: 'framework-1', target: 'library-1' },
  { source: 'app-1', target: 'library-1' },
];

export const manyEdges: GraphEdge[] = mockGraphEdges;

/**
 * Get edges for a specific source node
 */
export function getEdgesForSource(sourceId: string): GraphEdge[] {
  return mockGraphEdges.filter((e) => e.source === sourceId);
}

/**
 * Get edges for a specific target node (dependents)
 */
export function getEdgesForTarget(targetId: string): GraphEdge[] {
  return mockGraphEdges.filter((e) => e.target === targetId);
}

/**
 * Get all edges connected to a node (both source and target)
 */
export function getConnectedEdges(nodeId: string): GraphEdge[] {
  return mockGraphEdges.filter((e) => e.source === nodeId || e.target === nodeId);
}
