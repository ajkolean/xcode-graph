/**
 * Mock GraphNode data for Storybook stories
 */

import type { GraphNode } from '@/schemas/graph.schema';

// ========================================
// Individual Node Type Examples
// ========================================

export const mockAppNode: GraphNode = {
  id: 'app-1',
  name: 'MyApp',
  type: 'app',
  platform: 'iOS',
  origin: 'local',
  project: 'MainApp',
  targetCount: 25,
};

export const mockFrameworkNode: GraphNode = {
  id: 'framework-1',
  name: 'NetworkingKit',
  type: 'framework',
  platform: 'iOS',
  origin: 'local',
  project: 'FeatureKit',
  targetCount: 12,
};

export const mockLibraryNode: GraphNode = {
  id: 'library-1',
  name: 'UtilitiesLib',
  type: 'library',
  platform: 'iOS',
  origin: 'local',
  project: 'FeatureKit',
  targetCount: 8,
};

export const mockTestUnitNode: GraphNode = {
  id: 'test-unit-1',
  name: 'NetworkingTests',
  type: 'test-unit',
  platform: 'iOS',
  origin: 'local',
  project: 'FeatureKit',
  targetCount: 3,
};

export const mockTestUINode: GraphNode = {
  id: 'test-ui-1',
  name: 'AppUITests',
  type: 'test-ui',
  platform: 'iOS',
  origin: 'local',
  project: 'MainApp',
  targetCount: 5,
};

export const mockCliNode: GraphNode = {
  id: 'cli-1',
  name: 'CodeGenTool',
  type: 'cli',
  platform: 'macOS',
  origin: 'local',
  project: 'DevTools',
  targetCount: 2,
};

export const mockPackageNode: GraphNode = {
  id: 'package-1',
  name: 'Alamofire',
  type: 'package',
  platform: 'iOS',
  origin: 'external',
  targetCount: 0,
};

// ========================================
// Collections by Type
// ========================================

export const allNodeTypes: GraphNode[] = [
  mockAppNode,
  mockFrameworkNode,
  mockLibraryNode,
  mockTestUnitNode,
  mockTestUINode,
  mockCliNode,
  mockPackageNode,
];

// ========================================
// Collections by Platform
// ========================================

export const allPlatforms: GraphNode[] = [
  { ...mockAppNode, id: 'ios-node', name: 'iOS App', platform: 'iOS' },
  { ...mockAppNode, id: 'macos-node', name: 'macOS App', platform: 'macOS' },
  { ...mockAppNode, id: 'tvos-node', name: 'tvOS App', platform: 'tvOS' },
  { ...mockAppNode, id: 'watchos-node', name: 'watchOS App', platform: 'watchOS' },
  { ...mockAppNode, id: 'visionos-node', name: 'visionOS App', platform: 'visionOS' },
];

// ========================================
// Sample Graph Data
// ========================================

export const mockGraphNodes: GraphNode[] = [
  // Apps
  {
    id: 'app-main',
    name: 'MainApp',
    type: 'app',
    platform: 'iOS',
    origin: 'local',
    project: 'MainApp',
    targetCount: 15,
  },
  {
    id: 'app-watch',
    name: 'WatchApp',
    type: 'app',
    platform: 'watchOS',
    origin: 'local',
    project: 'WatchApp',
    targetCount: 5,
  },

  // Frameworks
  {
    id: 'fw-networking',
    name: 'NetworkingKit',
    type: 'framework',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 8,
  },
  {
    id: 'fw-ui',
    name: 'UIComponents',
    type: 'framework',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 12,
  },
  {
    id: 'fw-auth',
    name: 'Authentication',
    type: 'framework',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 6,
  },

  // Libraries
  {
    id: 'lib-utils',
    name: 'Utilities',
    type: 'library',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 4,
  },
  {
    id: 'lib-models',
    name: 'DataModels',
    type: 'library',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 10,
  },

  // Test Units
  {
    id: 'test-networking',
    name: 'NetworkingTests',
    type: 'test-unit',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 1,
  },
  {
    id: 'test-auth',
    name: 'AuthTests',
    type: 'test-unit',
    platform: 'iOS',
    origin: 'local',
    project: 'FeatureKit',
    targetCount: 1,
  },

  // Test UI
  {
    id: 'test-ui-main',
    name: 'MainAppUITests',
    type: 'test-ui',
    platform: 'iOS',
    origin: 'local',
    project: 'MainApp',
    targetCount: 1,
  },

  // CLI
  {
    id: 'cli-codegen',
    name: 'CodeGenerator',
    type: 'cli',
    platform: 'macOS',
    origin: 'local',
    project: 'DevTools',
    targetCount: 3,
  },

  // Packages (External)
  {
    id: 'pkg-alamofire',
    name: 'Alamofire',
    type: 'package',
    platform: 'iOS',
    origin: 'external',
    targetCount: 0,
  },
  {
    id: 'pkg-swiftui',
    name: 'SwiftUI',
    type: 'package',
    platform: 'iOS',
    origin: 'external',
    targetCount: 0,
  },
];

// ========================================
// Utility Functions
// ========================================

/**
 * Get mock nodes with dependencies
 */
export function getNodeWithDependencies(nodeId: string = 'app-main') {
  const node = mockGraphNodes.find((n) => n.id === nodeId) || mockGraphNodes[0];
  const dependencies = mockGraphNodes.slice(2, 7); // Some frameworks and libraries
  const dependents = mockGraphNodes.slice(0, 2); // Some apps

  return {
    node,
    dependencies,
    dependents,
  };
}

/**
 * Get nodes for a specific project
 */
export function getNodesForProject(projectName: string) {
  return mockGraphNodes.filter((n) => n.project === projectName);
}
