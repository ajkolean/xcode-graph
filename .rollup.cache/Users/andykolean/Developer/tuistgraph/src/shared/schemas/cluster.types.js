/**
 * Cluster Types - Cluster layout and positioning types
 *
 * Pure TypeScript enums, interfaces, and constants for cluster grouping,
 * node roles, and layout configuration. No Zod dependency.
 *
 * @module schemas/cluster
 */
// ==================== Native Enums ====================
/**
 * Node role enum - determines positioning strategy within a cluster
 */
export var NodeRole;
(function (NodeRole) {
    NodeRole["Entry"] = "entry";
    NodeRole["InternalFramework"] = "internal-framework";
    NodeRole["InternalLib"] = "internal-lib";
    NodeRole["Utility"] = "utility";
    NodeRole["Test"] = "test";
    NodeRole["Tool"] = "tool";
})(NodeRole || (NodeRole = {}));
/**
 * Cluster type enum - distinguishes local projects from packages
 */
export var ClusterType;
(function (ClusterType) {
    ClusterType["Project"] = "project";
    ClusterType["Package"] = "package";
})(ClusterType || (ClusterType = {}));
/**
 * ELK Hierarchy Handling strategy
 */
export var ElkHierarchyHandling;
(function (ElkHierarchyHandling) {
    ElkHierarchyHandling["Inherit"] = "INHERIT";
    ElkHierarchyHandling["IncludeChildren"] = "INCLUDE_CHILDREN";
    ElkHierarchyHandling["SeparateChildren"] = "SEPARATE_CHILDREN";
})(ElkHierarchyHandling || (ElkHierarchyHandling = {}));
// ==================== Default Configuration ====================
/** Default layout configuration values */
export const DEFAULT_CLUSTER_CONFIG = {
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
// ==================== Value Arrays ====================
/** All node role values for iteration */
export const NODE_ROLE_VALUES = Object.values(NodeRole);
/** All cluster type values for iteration */
export const CLUSTER_TYPE_VALUES = Object.values(ClusterType);
//# sourceMappingURL=cluster.types.js.map