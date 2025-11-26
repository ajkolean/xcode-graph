import { GraphNode } from '../data/mockGraphData';

/**
 * Node role within a cluster - determines positioning strategy
 */
export type NodeRole = 
  | 'entry'              // App, main CLI, primary frameworks
  | 'internal-framework' // Shared frameworks used within project
  | 'internal-lib'       // Libraries used within project
  | 'utility'            // Helper libs, small components
  | 'test'               // Test targets
  | 'tool';              // Auxiliary executables

/**
 * Extended node metadata for cluster layout
 */
export interface ClusterNodeMetadata {
  nodeId: string;
  role: NodeRole;
  layer: number;           // Distance from anchor (0 = anchor)
  isAnchor: boolean;
  hasExternalDependents: boolean;
  testSubjects?: string[]; // For test nodes: what they test
  dependencyCount: number; // Number of nodes depending on this
  dependsOnCount: number;  // Number of nodes this depends on
}

/**
 * Cluster represents a project or package group
 */
export interface Cluster {
  id: string;
  name: string;
  type: 'project' | 'package';
  origin: 'local' | 'external';
  nodes: GraphNode[];
  metadata: Map<string, ClusterNodeMetadata>;
  anchors: string[]; // IDs of anchor nodes
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Positioned node with cluster layout information
 */
export interface PositionedNode {
  node: GraphNode;
  x: number;
  y: number;
  clusterId: string;
  metadata: ClusterNodeMetadata;
  // Local coordinates within cluster card
  localX?: number;
  localY?: number;
  targetRadius?: number; // Target distance from cluster center
  targetAngle?: number;  // Target angle in radians
}

/**
 * Layout configuration
 */
export interface ClusterLayoutConfig {
  // Spacing
  clusterPadding: number;        // Padding inside cluster card
  clusterSpacing: number;        // Space between clusters
  layerSpacing: number;          // Radial distance between layers
  minNodeSpacing: number;        // Minimum space between nodes
  ringRadius: number;            // Base radius for ring layout
  
  // Node sizing
  anchorNodeSize: number;
  normalNodeSize: number;
  testNodeSize: number;
  
  // Test satellite positioning
  testOrbitRadius: number;       // Distance from subject node
  
  // Force simulation
  forceStrength: {
    boundary: number;            // Keep nodes in cluster bounds
    radial: number;              // Pull toward target radius
    collision: number;           // Avoid overlaps
    anchor: number;              // Pin anchors to center
    testSatellite: number;       // Bind tests to subjects
  };
}

export const DEFAULT_CLUSTER_CONFIG: ClusterLayoutConfig = {
  ringRadius: 75,          // Base radius for ring layout
  layerSpacing: 75,        // Distance between concentric rings
  minNodeSpacing: 55,      // Minimum arc length between nodes (increased to prevent label overlap)
  testOrbitRadius: 40,     // Distance of test satellites from subject
  clusterPadding: 35,      // Padding inside cluster bounds
  clusterSpacing: 80,      // Space between clusters
  anchorNodeSize: 16,      // Size for anchor nodes
  normalNodeSize: 12,      // Size for regular nodes
  testNodeSize: 10,        // Size for test nodes
  forceStrength: {
    anchor: 0.9,           // Pin entry points to center (increased)
    radial: 0.4,           // Pull nodes to target layer/angle (increased)
    testSatellite: 0.6,    // Bind tests to subjects
    collision: 0.5,        // Node separation (increased)
    boundary: 0.6          // Keep nodes inside cluster (increased)
  }
};