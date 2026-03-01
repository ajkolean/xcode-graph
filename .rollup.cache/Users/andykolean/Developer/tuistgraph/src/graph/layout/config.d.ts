/**
 * Default layout configuration
 * Exported for parameter sweep testing
 */
export declare const DEFAULT_CONFIG: {
    readonly nodeRadius: 6;
    readonly nodeCollisionPadding: 20;
    readonly linkDistance: 45;
    readonly linkStrength: 0.35;
    readonly nodeCharge: -35;
    readonly crossClusterDistanceMul: 3.5;
    readonly crossClusterStrengthMul: 0.02;
    readonly clusterStrength: 0.3;
    readonly clusterDistanceMin: 20;
    readonly clusterRepulsionStrength: 8000;
    readonly clusterPadding: 120;
    readonly clusterAttractionStrength: 0.2;
    readonly clusterAttractionActivationDist: 500;
    readonly clusterRepulsionYScale: 0.2;
    readonly layerSpacing: 120;
    readonly layerStrength: 0.35;
    readonly hangGap: 72;
    readonly hangStrength: 0.08;
    readonly radialStrength: 0.25;
    readonly iterations: 300;
    readonly minClusterSize: 60;
    readonly clusterNodeSpacing: 12;
    readonly bundlingCycles: 5;
    readonly bundlingIterations: 80;
    readonly compatibilityThreshold: 0.65;
    readonly bundlingBudget: 40000;
    readonly clusterStrataSpacing: 800;
    readonly clusterHorizontalSpacing: 120;
    readonly clusterMaxRowWidth: 900;
    readonly clusterStrataAnchorStrength: 0.8;
    readonly clusterCenteringStrength: 0.75;
    readonly clusterBoundingRadius: 1200;
    readonly clusterBoundingStrength: 0.5;
    readonly clusterStrataAlignmentStrength: 0.45;
    /** Direction of flow: 'RIGHT' (left->right) or 'DOWN' (top->bottom) */
    readonly elkDirection: "DOWN";
    /** Main algorithm: 'layered' is best for dependencies */
    readonly elkAlgorithm: "layered";
    /** Edge routing style: 'ORTHOGONAL' (rectilinear) or 'SPLINES' (curved) */
    readonly elkEdgeRouting: "ORTHOGONAL";
    /** Spacing between nodes in the same layer */
    readonly elkNodeSpacing: 200;
    /** Spacing between layers (ranks) */
    readonly elkLayerSpacing: 300;
    /** Padding around clusters */
    readonly elkPadding: 100;
    /** Whether to simplify edge routing by merging ports */
    readonly elkMergeEdges: true;
    /** Maximum width target for wrapping */
    readonly elkMaxWidth: 2000;
    /** Maximum height target for wrapping */
    readonly elkMaxHeight: 2000;
    /** Hierarchy handling strategy for ELK layout */
    readonly elkHierarchyHandling: "SEPARATE_CHILDREN";
    /** Enable port-based edge routing for cross-cluster edges */
    readonly portRoutingEnabled: true;
    /** Minimum spacing between ports on a cluster boundary (pixels) */
    readonly portSpacing: 20;
    /** Margin from cluster corners for port placement (pixels) */
    readonly portMargin: 30;
    /** Maximum number of ports per side (prevents overcrowding) */
    readonly maxPortsPerSide: 8;
};
/**
 * ELK Hierarchy Handling strategy
 * - INHERIT: Use parent's setting (root defaults to SEPARATE_CHILDREN)
 * - INCLUDE_CHILDREN: Layout node and all descendants in single run
 * - SEPARATE_CHILDREN: Each child triggers its own layout run
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
/** Type for layout configuration */
export type LayoutConfig = typeof DEFAULT_CONFIG;
/**
 * Options for layout computation
 */
export interface LayoutOptions {
    /** Override specific config values */
    configOverrides?: Partial<LayoutConfig>;
    /** Function to compute Z-axis offset for a node (for 3D depth model) */
    getNodeZOffset?: (nodeId: string) => number;
}
