/**
 * Mock Cluster data for Storybook stories
 */

import {
  type Cluster,
  type ClusterNodeMetadata,
  ClusterType,
  NodeRole,
} from '@shared/schemas/cluster.schema';
import { Origin } from '@shared/schemas/graph.schema';
import { mockGraphNodes } from './mockNodes';

// ========================================
// Helper function to create cluster metadata
// ========================================

function createClusterMetadata(nodeIds: string[]): Map<string, ClusterNodeMetadata> {
  const metadata = new Map<string, ClusterNodeMetadata>();

  nodeIds.forEach((nodeId, index) => {
    metadata.set(nodeId, {
      nodeId,
      role:
        index === 0
          ? NodeRole.Entry
          : index < 3
            ? NodeRole.InternalFramework
            : NodeRole.InternalLib,
      layer: Math.floor(index / 3),
      isAnchor: index === 0,
      hasExternalDependents: index < 2,
      dependencyCount: Math.max(0, 5 - index),
      dependsOnCount: index,
    });
  });

  return metadata;
}

// ========================================
// Individual Cluster Presets
// ========================================

export const mockClusterSmall: Cluster = {
  id: 'utils-kit',
  name: 'UtilsKit',
  type: ClusterType.Project,
  origin: Origin.Local,
  nodes: mockGraphNodes.slice(0, 3),
  anchors: [mockGraphNodes[0]!.id],
  metadata: createClusterMetadata(mockGraphNodes.slice(0, 3).map((n) => n.id)),
  bounds: {
    x: 100,
    y: 100,
    width: 200,
    height: 150,
  },
};

export const mockClusterMedium: Cluster = {
  id: 'feature-kit',
  name: 'FeatureKit',
  type: ClusterType.Project,
  origin: Origin.Local,
  nodes: mockGraphNodes.slice(0, 8),
  anchors: [mockGraphNodes[0]!.id, mockGraphNodes[1]!.id],
  metadata: createClusterMetadata(mockGraphNodes.slice(0, 8).map((n) => n.id)),
  bounds: {
    x: 150,
    y: 120,
    width: 300,
    height: 250,
  },
};

export const mockClusterLarge: Cluster = {
  id: 'main-app',
  name: 'MainApp',
  type: ClusterType.Project,
  origin: Origin.Local,
  nodes: mockGraphNodes.slice(0, 15),
  anchors: [mockGraphNodes[0]!.id, mockGraphNodes[2]!.id],
  metadata: createClusterMetadata(mockGraphNodes.slice(0, 15).map((n) => n.id)),
  bounds: {
    x: 200,
    y: 150,
    width: 400,
    height: 350,
  },
};

export const mockClusterPackage: Cluster = {
  id: 'alamofire',
  name: 'Alamofire',
  type: ClusterType.Package,
  origin: Origin.External,
  nodes: mockGraphNodes.slice(2, 7),
  anchors: [mockGraphNodes[2]!.id],
  metadata: createClusterMetadata(mockGraphNodes.slice(2, 7).map((n) => n.id)),
  bounds: {
    x: 500,
    y: 200,
    width: 250,
    height: 200,
  },
};

export const mockClusterExternal: Cluster = {
  id: 'swift-nio',
  name: 'SwiftNIO',
  type: ClusterType.Package,
  origin: Origin.External,
  nodes: mockGraphNodes.slice(5, 9),
  anchors: [mockGraphNodes[5]!.id],
  metadata: createClusterMetadata(mockGraphNodes.slice(5, 9).map((n) => n.id)),
  bounds: {
    x: 600,
    y: 250,
    width: 220,
    height: 180,
  },
};

// ========================================
// Collections
// ========================================

export const allClusterSizes: Cluster[] = [mockClusterSmall, mockClusterMedium, mockClusterLarge];

export const allClusterTypes: Cluster[] = [
  mockClusterMedium, // project, local
  mockClusterPackage, // package, external
];

export const allClusters: Cluster[] = [
  mockClusterSmall,
  mockClusterMedium,
  mockClusterLarge,
  mockClusterPackage,
  mockClusterExternal,
];
