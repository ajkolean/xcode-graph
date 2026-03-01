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
export declare enum NodeRole {
    Entry = "entry",
    InternalFramework = "internal-framework",
    InternalLib = "internal-lib",
    Utility = "utility",
    Test = "test",
    Tool = "tool"
}
/**
 * Cluster type enum - distinguishes local projects from packages
 */
export declare enum ClusterType {
    Project = "project",
    Package = "package"
}
/**
 * ELK Hierarchy Handling strategy
 */
export declare enum ElkHierarchyHandling {
    Inherit = "INHERIT",
    IncludeChildren = "INCLUDE_CHILDREN",
    SeparateChildren = "SEPARATE_CHILDREN"
}
/**
 * ELK-specific layout options that can be set per-cluster
 */
export interface ClusterElkOptions {
    hierarchyHandling?: ElkHierarchyHandling | undefined;
}
/** Node metadata within cluster */
export interface ClusterNodeMetadata {
    nodeId: string;
    role: NodeRole;
    layer: number;
    isAnchor: boolean;
    hasExternalDependents: boolean;
    testSubjects?: string[] | undefined;
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
    path?: string | undefined;
    nodes: GraphNode[];
    anchors: string[];
    metadata: Map<string, ClusterNodeMetadata>;
    elkOptions?: ClusterElkOptions | undefined;
    bounds?: ClusterBounds | undefined;
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
    localX?: number | undefined;
    localY?: number | undefined;
    targetRadius?: number | undefined;
    targetAngle?: number | undefined;
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
export declare const DEFAULT_CLUSTER_CONFIG: ClusterLayoutConfig;
/** All node role values for iteration */
export declare const NODE_ROLE_VALUES: NodeRole[];
/** All cluster type values for iteration */
export declare const CLUSTER_TYPE_VALUES: ClusterType[];
//# sourceMappingURL=cluster.types.d.ts.map