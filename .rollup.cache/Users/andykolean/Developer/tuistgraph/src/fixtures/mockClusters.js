/**
 * Mock Cluster data for tests and fixtures
 */
import { ClusterType, NodeRole, } from '@shared/schemas/cluster.types';
import { Origin } from '@shared/schemas/graph.types';
import { mockGraphNodes } from './mockNodes';
// Pre-extract node IDs used in cluster anchors to avoid non-null assertions
const node0Id = mockGraphNodes[0]?.id ?? '';
const node1Id = mockGraphNodes[1]?.id ?? '';
const node2Id = mockGraphNodes[2]?.id ?? '';
const node5Id = mockGraphNodes[5]?.id ?? '';
// ========================================
// Helper function to create cluster metadata
// ========================================
function createClusterMetadata(nodeIds) {
    const metadata = new Map();
    const getRoleForIndex = (idx) => {
        if (idx === 0)
            return NodeRole.Entry;
        if (idx < 3)
            return NodeRole.InternalFramework;
        return NodeRole.InternalLib;
    };
    nodeIds.forEach((nodeId, index) => {
        metadata.set(nodeId, {
            nodeId,
            role: getRoleForIndex(index),
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
export const mockClusterSmall = {
    id: 'utils-kit',
    name: 'UtilsKit',
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: mockGraphNodes.slice(0, 3),
    anchors: [node0Id],
    metadata: createClusterMetadata(mockGraphNodes.slice(0, 3).map((n) => n.id)),
    bounds: {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
    },
};
export const mockClusterMedium = {
    id: 'feature-kit',
    name: 'FeatureKit',
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: mockGraphNodes.slice(0, 8),
    anchors: [node0Id, node1Id],
    metadata: createClusterMetadata(mockGraphNodes.slice(0, 8).map((n) => n.id)),
    bounds: {
        x: 150,
        y: 120,
        width: 300,
        height: 250,
    },
};
export const mockClusterLarge = {
    id: 'main-app',
    name: 'MainApp',
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: mockGraphNodes.slice(0, 15),
    anchors: [node0Id, node2Id],
    metadata: createClusterMetadata(mockGraphNodes.slice(0, 15).map((n) => n.id)),
    bounds: {
        x: 200,
        y: 150,
        width: 400,
        height: 350,
    },
};
export const mockClusterPackage = {
    id: 'alamofire',
    name: 'Alamofire',
    type: ClusterType.Package,
    origin: Origin.External,
    nodes: mockGraphNodes.slice(2, 7),
    anchors: [node2Id],
    metadata: createClusterMetadata(mockGraphNodes.slice(2, 7).map((n) => n.id)),
    bounds: {
        x: 500,
        y: 200,
        width: 250,
        height: 200,
    },
};
export const mockClusterExternal = {
    id: 'swift-nio',
    name: 'SwiftNIO',
    type: ClusterType.Package,
    origin: Origin.External,
    nodes: mockGraphNodes.slice(5, 9),
    anchors: [node5Id],
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
export const allClusterSizes = [mockClusterSmall, mockClusterMedium, mockClusterLarge];
export const allClusterTypes = [
    mockClusterMedium, // project, local
    mockClusterPackage, // package, external
];
export const allClusters = [
    mockClusterSmall,
    mockClusterMedium,
    mockClusterLarge,
    mockClusterPackage,
    mockClusterExternal,
];
//# sourceMappingURL=mockClusters.js.map