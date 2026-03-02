/**
 * Cluster Types - Cluster layout and positioning types
 *
 * Pure TypeScript enums, interfaces, and constants for cluster grouping,
 * node roles, and layout configuration. No Zod dependency.
 *
 * @module schemas/cluster
 */

import type { GraphNode, Origin } from './graph.types';

/**
 * Node role enum - determines positioning strategy within a cluster
 */
export enum NodeRole {
  Entry = 'entry',
  InternalFramework = 'internal-framework',
  InternalLib = 'internal-lib',
  Utility = 'utility',
  Test = 'test',
  Tool = 'tool',
}

/**
 * Cluster type enum - distinguishes local projects from packages
 */
export enum ClusterType {
  Project = 'project',
  Package = 'package',
}

/**
 * ELK Hierarchy Handling strategy
 */
export enum ElkHierarchyHandling {
  Inherit = 'INHERIT',
  IncludeChildren = 'INCLUDE_CHILDREN',
  SeparateChildren = 'SEPARATE_CHILDREN',
}

/**
 * ELK-specific layout options that can be set per-cluster
 */
export interface ClusterElkOptions {
  hierarchyHandling?: ElkHierarchyHandling;
}

/** Node metadata within cluster */
export interface ClusterNodeMetadata {
  nodeId: string;
  role: NodeRole;
  layer: number;
  isAnchor: boolean;
  hasExternalDependents: boolean;
  testSubjects?: string[];
  dependencyCount: number;
  dependsOnCount: number;
}

/** Cluster bounding box */
export interface ClusterBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Cluster type with runtime metadata Map */
export interface Cluster {
  id: string;
  name: string;
  type: ClusterType;
  origin: Origin;
  path?: string;
  nodes: GraphNode[];
  anchors: string[];
  metadata: Map<string, ClusterNodeMetadata>;
  elkOptions?: ClusterElkOptions;
  bounds?: ClusterBounds;
}

/** Serialized cluster format (metadata as array for JSON) */
export interface ClusterSerialized extends Omit<Cluster, 'metadata'> {
  metadata: ClusterNodeMetadata[];
}

/** Node with position data */
export interface PositionedNode {
  node: GraphNode;
  x: number;
  y: number;
  clusterId: string;
  metadata: ClusterNodeMetadata;
  localX?: number;
  localY?: number;
  targetRadius?: number;
  targetAngle?: number;
}

/** Physics force strengths */
export interface ForceStrength {
  boundary: number;
  radial: number;
  collision: number;
  anchor: number;
  testSatellite: number;
}

/** Layout configuration */
export interface ClusterLayoutConfig {
  clusterPadding: number;
  clusterSpacing: number;
  layerSpacing: number;
  minNodeSpacing: number;
  ringRadius: number;
  anchorNodeSize: number;
  normalNodeSize: number;
  testNodeSize: number;
  testOrbitRadius: number;
  forceStrength: ForceStrength;
}

/** Default layout configuration values */
export const DEFAULT_CLUSTER_CONFIG: ClusterLayoutConfig = {
  ringRadius: 75,
  layerSpacing: 75,
  minNodeSpacing: 55,
  testOrbitRadius: 40,
  clusterPadding: 35,
  clusterSpacing: 80,
  anchorNodeSize: 16,
  normalNodeSize: 12,
  testNodeSize: 10,
  forceStrength: {
    anchor: 0.9,
    radial: 0.4,
    testSatellite: 0.6,
    collision: 0.5,
    boundary: 0.6,
  },
};

/** All node role values for iteration */
export const NODE_ROLE_VALUES: NodeRole[] = Object.values(NodeRole);
/** All cluster type values for iteration */
export const CLUSTER_TYPE_VALUES: ClusterType[] = Object.values(ClusterType);
