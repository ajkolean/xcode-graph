/**
 * Mock GraphNode data for tests and fixtures
 */

import { type GraphNode, NodeType, Origin, Platform } from '@shared/schemas/graph.types';


export const mockAppNode: GraphNode = {
  id: 'app-1',
  name: 'MyApp',
  type: NodeType.App,
  platform: Platform.iOS,
  origin: Origin.Local,
  project: 'MainApp',
  targetCount: 25,
};

export const mockFrameworkNode: GraphNode = {
  id: 'framework-1',
  name: 'NetworkingKit',
  type: NodeType.Framework,
  platform: Platform.iOS,
  origin: Origin.Local,
  project: 'FeatureKit',
  targetCount: 12,
};

export const mockLibraryNode: GraphNode = {
  id: 'library-1',
  name: 'UtilitiesLib',
  type: NodeType.Library,
  platform: Platform.iOS,
  origin: Origin.Local,
  project: 'FeatureKit',
  targetCount: 8,
};

export const mockTestUnitNode: GraphNode = {
  id: 'test-unit-1',
  name: 'NetworkingTests',
  type: NodeType.TestUnit,
  platform: Platform.iOS,
  origin: Origin.Local,
  project: 'FeatureKit',
  targetCount: 3,
};

export const mockTestUINode: GraphNode = {
  id: 'test-ui-1',
  name: 'AppUITests',
  type: NodeType.TestUi,
  platform: Platform.iOS,
  origin: Origin.Local,
  project: 'MainApp',
  targetCount: 5,
};

export const mockCliNode: GraphNode = {
  id: 'cli-1',
  name: 'CodeGenTool',
  type: NodeType.Cli,
  platform: Platform.macOS,
  origin: Origin.Local,
  project: 'DevTools',
  targetCount: 2,
};

export const mockPackageNode: GraphNode = {
  id: 'package-1',
  name: 'Alamofire',
  type: NodeType.Package,
  platform: Platform.iOS,
  origin: Origin.External,
  targetCount: 0,
};


export const allNodeTypes: GraphNode[] = [
  mockAppNode,
  mockFrameworkNode,
  mockLibraryNode,
  mockTestUnitNode,
  mockTestUINode,
  mockCliNode,
  mockPackageNode,
];


export const allPlatforms: GraphNode[] = [
  { ...mockAppNode, id: 'ios-node', name: 'iOS App', platform: Platform.iOS },
  { ...mockAppNode, id: 'macos-node', name: 'macOS App', platform: Platform.macOS },
  { ...mockAppNode, id: 'tvos-node', name: 'tvOS App', platform: Platform.tvOS },
  { ...mockAppNode, id: 'watchos-node', name: 'watchOS App', platform: Platform.watchOS },
  { ...mockAppNode, id: 'visionos-node', name: 'visionOS App', platform: Platform.visionOS },
];


export const mockGraphNodes: GraphNode[] = [
  // Apps
  {
    id: 'app-main',
    name: 'MainApp',
    type: NodeType.App,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'MainApp',
    targetCount: 15,
  },
  {
    id: 'app-watch',
    name: 'WatchApp',
    type: NodeType.App,
    platform: Platform.watchOS,
    origin: Origin.Local,
    project: 'WatchApp',
    targetCount: 5,
  },

  // Frameworks
  {
    id: 'fw-networking',
    name: 'NetworkingKit',
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 8,
  },
  {
    id: 'fw-ui',
    name: 'UIComponents',
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 12,
  },
  {
    id: 'fw-auth',
    name: 'Authentication',
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 6,
  },

  // Libraries
  {
    id: 'lib-utils',
    name: 'Utilities',
    type: NodeType.Library,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 4,
  },
  {
    id: 'lib-models',
    name: 'DataModels',
    type: NodeType.Library,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 10,
  },

  // Test Units
  {
    id: 'test-networking',
    name: 'NetworkingTests',
    type: NodeType.TestUnit,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 1,
  },
  {
    id: 'test-auth',
    name: 'AuthTests',
    type: NodeType.TestUnit,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'FeatureKit',
    targetCount: 1,
  },

  // Test UI
  {
    id: 'test-ui-main',
    name: 'MainAppUITests',
    type: NodeType.TestUi,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'MainApp',
    targetCount: 1,
  },

  // CLI
  {
    id: 'cli-codegen',
    name: 'CodeGenerator',
    type: NodeType.Cli,
    platform: Platform.macOS,
    origin: Origin.Local,
    project: 'DevTools',
    targetCount: 3,
  },

  // Packages (External)
  {
    id: 'pkg-alamofire',
    name: 'Alamofire',
    type: NodeType.Package,
    platform: Platform.iOS,
    origin: Origin.External,
    targetCount: 0,
  },
  {
    id: 'pkg-swiftui',
    name: 'SwiftUI',
    type: NodeType.Package,
    platform: Platform.iOS,
    origin: Origin.External,
    targetCount: 0,
  },
];


/**
 * Get mock nodes with dependencies
 */
export function getNodeWithDependencies(nodeId: string = 'app-main'): {
  node: GraphNode;
  dependencies: GraphNode[];
  dependents: GraphNode[];
} {
  const found = mockGraphNodes.find((n) => n.id === nodeId) ?? mockGraphNodes[0];
  const node = found ?? mockGraphNodes[0];
  if (!node) throw new Error(`No mock node found for id: ${nodeId}`);
  const dependencies = mockGraphNodes.slice(2, 7); // Some frameworks and libraries
  const dependents = mockGraphNodes.slice(0, 2); // Some apps

  return {
    node,
    dependencies: dependencies,
    dependents: dependents,
  };
}

/**
 * Get nodes for a specific project
 */
export function getNodesForProject(projectName: string): GraphNode[] {
  return mockGraphNodes.filter((n) => n.project === projectName);
}
