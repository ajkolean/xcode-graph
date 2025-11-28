/**
 * Mock position data for Storybook stories
 *
 * Provides deterministic node and cluster positions for consistent rendering
 */

import type { ClusterPosition, NodePosition } from '@shared/schemas/simulation.schema';

// ========================================
// Node Positions
// ========================================

export const mockNodePositions = new Map<string, NodePosition>([
  // MainApp cluster nodes
  [
    'app-main',
    {
      id: 'app-main',
      x: 250,
      y: 200,
      vx: 0,
      vy: 0,
      clusterId: 'main-app',
      radius: 16,
      isAnchor: true,
    },
  ],
  [
    'app-watch',
    {
      id: 'app-watch',
      x: 350,
      y: 200,
      vx: 0,
      vy: 0,
      clusterId: 'main-app',
      radius: 14,
    },
  ],

  // FeatureKit cluster nodes
  [
    'fw-networking',
    {
      id: 'fw-networking',
      x: 600,
      y: 200,
      vx: 0,
      vy: 0,
      clusterId: 'feature-kit',
      radius: 14,
      isAnchor: true,
    },
  ],
  [
    'fw-ui',
    {
      id: 'fw-ui',
      x: 680,
      y: 200,
      vx: 0,
      vy: 0,
      clusterId: 'feature-kit',
      radius: 14,
    },
  ],
  [
    'lib-utils',
    {
      id: 'lib-utils',
      x: 600,
      y: 280,
      vx: 0,
      vy: 0,
      clusterId: 'feature-kit',
      radius: 12,
    },
  ],
  [
    'lib-models',
    {
      id: 'lib-models',
      x: 680,
      y: 280,
      vx: 0,
      vy: 0,
      clusterId: 'feature-kit',
      radius: 12,
    },
  ],

  // Test nodes
  [
    'test-networking-unit',
    {
      id: 'test-networking-unit',
      x: 550,
      y: 250,
      vx: 0,
      vy: 0,
      clusterId: 'feature-kit',
      radius: 10,
      isTest: true,
      testSubject: 'fw-networking',
    },
  ],
  [
    'test-ui-unit',
    {
      id: 'test-ui-unit',
      x: 730,
      y: 250,
      vx: 0,
      vy: 0,
      clusterId: 'feature-kit',
      radius: 10,
      isTest: true,
      testSubject: 'fw-ui',
    },
  ],

  // Package cluster nodes
  [
    'pkg-alamofire',
    {
      id: 'pkg-alamofire',
      x: 250,
      y: 500,
      vx: 0,
      vy: 0,
      clusterId: 'alamofire',
      radius: 14,
      isAnchor: true,
    },
  ],
  [
    'pkg-swiftnio',
    {
      id: 'pkg-swiftnio',
      x: 600,
      y: 500,
      vx: 0,
      vy: 0,
      clusterId: 'swift-nio',
      radius: 14,
      isAnchor: true,
    },
  ],
]);

// ========================================
// Cluster Positions
// ========================================

export const mockClusterPositions = new Map<string, ClusterPosition>([
  [
    'main-app',
    {
      id: 'main-app',
      x: 200,
      y: 150,
      vx: 0,
      vy: 0,
      width: 250,
      height: 200,
      nodeCount: 15,
    },
  ],
  [
    'feature-kit',
    {
      id: 'feature-kit',
      x: 550,
      y: 150,
      vx: 0,
      vy: 0,
      width: 300,
      height: 250,
      nodeCount: 8,
    },
  ],
  [
    'utils-kit',
    {
      id: 'utils-kit',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      width: 200,
      height: 150,
      nodeCount: 3,
    },
  ],
  [
    'alamofire',
    {
      id: 'alamofire',
      x: 180,
      y: 450,
      vx: 0,
      vy: 0,
      width: 220,
      height: 180,
      nodeCount: 5,
    },
  ],
  [
    'swift-nio',
    {
      id: 'swift-nio',
      x: 530,
      y: 450,
      vx: 0,
      vy: 0,
      width: 220,
      height: 180,
      nodeCount: 4,
    },
  ],
]);

// ========================================
// Helper functions
// ========================================

/**
 * Get node position by ID, with fallback to default
 */
export function getNodePosition(nodeId: string): NodePosition {
  return (
    mockNodePositions.get(nodeId) || {
      id: nodeId,
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      clusterId: 'unknown',
      radius: 12,
    }
  );
}

/**
 * Get cluster position by ID, with fallback to default
 */
export function getClusterPosition(clusterId: string): ClusterPosition {
  return (
    mockClusterPositions.get(clusterId) || {
      id: clusterId,
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      width: 200,
      height: 150,
      nodeCount: 0,
    }
  );
}

/**
 * Get all node IDs that have positions
 */
export function getAllPositionedNodeIds(): string[] {
  return Array.from(mockNodePositions.keys());
}

/**
 * Get all cluster IDs that have positions
 */
export function getAllPositionedClusterIds(): string[] {
  return Array.from(mockClusterPositions.keys());
}
