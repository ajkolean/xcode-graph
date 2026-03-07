/**
 * Default layout configuration.
 * Contains tuning parameters for ELK macro-layout, D3 micro-layout, edge routing, and clustering.
 * Exported for parameter sweep testing.
 *
 * @public
 */
export const DEFAULT_CONFIG = {
  // Node-level forces (D3 Legacy)
  nodeRadius: 6,
  nodeCollisionPadding: 20,
  linkDistance: 45,
  linkStrength: 0.35,
  nodeCharge: -35,

  // Cross-cluster link handling (D3 Legacy)
  crossClusterDistanceMul: 3.5,
  crossClusterStrengthMul: 0.02,

  // Cluster forces (D3 Legacy)
  clusterStrength: 0.3,
  clusterDistanceMin: 20,
  clusterRepulsionStrength: 8000,
  clusterPadding: 120,
  clusterAttractionStrength: 0.2,
  clusterAttractionActivationDist: 500,
  clusterRepulsionYScale: 0.2,

  // Stratum configuration
  layerSpacing: 120,
  layerStrength: 0.35,

  // Dependency hang force (D3 Legacy)
  hangGap: 72,
  hangStrength: 0.08,

  // Radial interior force (D3 Legacy)
  radialStrength: 0.25,

  // Simulation
  iterations: 300,

  // Cluster sizing
  minClusterSize: 60,
  clusterNodeSpacing: 12,

  // Edge bundling
  bundlingCycles: 5,
  bundlingIterations: 80,
  compatibilityThreshold: 0.65,
  bundlingBudget: 40000,

  // Cluster strata configuration (D3 Legacy)
  clusterStrataSpacing: 800,
  clusterHorizontalSpacing: 120,
  clusterMaxRowWidth: 900,
  clusterStrataAnchorStrength: 0.8,

  // Drift prevention (D3 Legacy)
  clusterCenteringStrength: 0.75,
  clusterBoundingRadius: 1200,
  clusterBoundingStrength: 0.5,
  clusterStrataAlignmentStrength: 0.45,

  /** Direction of flow: 'RIGHT' (left-\>right) or 'DOWN' (top-\>bottom) */
  elkDirection: 'DOWN',

  /** Main algorithm: 'layered' is best for dependencies */
  elkAlgorithm: 'layered',

  /** Edge routing style: 'ORTHOGONAL' (rectilinear) or 'SPLINES' (curved) */
  elkEdgeRouting: 'ORTHOGONAL',

  /** Spacing between nodes in the same layer */
  elkNodeSpacing: 280,

  /** Spacing between layers (ranks) */
  elkLayerSpacing: 300,

  /** Padding around clusters */
  elkPadding: 100,

  /** Whether to simplify edge routing by merging ports */
  elkMergeEdges: true,

  /** Maximum width target for wrapping */
  elkMaxWidth: 2000,

  /** Maximum height target for wrapping */
  elkMaxHeight: 2000,

  /** Hierarchy handling strategy for ELK layout */
  elkHierarchyHandling: 'SEPARATE_CHILDREN',

  /** Enable port-based edge routing for cross-cluster edges */
  portRoutingEnabled: true,

  /** Minimum spacing between ports on a cluster boundary (pixels) */
  portSpacing: 20,

  /** Margin from cluster corners for port placement (pixels) */
  portMargin: 30,

  /** Maximum number of ports per side (prevents overcrowding) */
  maxPortsPerSide: 8,

  /** ELK crossing minimization thoroughness (1-10, default 7). Lower = faster, slightly lower quality */
  elkThoroughness: 7,

  /** ELK greedy switch type for crossing minimization post-processing */
  elkGreedySwitchType: 'TWO_SIDED' as 'TWO_SIDED' | 'ONE_SIDED' | 'OFF',

  /** Enable ELK debug instrumentation (logging, timing, option validation) */
  elkDebug: false,

  /** Timeout in ms for ELK layout call (0 = no timeout) */
  elkLayoutTimeout: 0,
} as const;

/**
 * ELK Hierarchy Handling strategy
 *
 * @public
 */
export enum ElkHierarchyHandling {
  Inherit = 'INHERIT',
  IncludeChildren = 'INCLUDE_CHILDREN',
  SeparateChildren = 'SEPARATE_CHILDREN',
}

/**
 * ELK-specific layout options that can be set per-cluster
 *
 * @public
 */
export interface ClusterElkOptions {
  hierarchyHandling?: ElkHierarchyHandling;
}

/**
 * Type for layout configuration
 *
 * @public
 */
export type LayoutConfig = Omit<typeof DEFAULT_CONFIG, 'elkDebug'> & { readonly elkDebug: boolean };

/**
 * Options passed to the main layout computation function.
 * Allows overriding config values and hooking into layout lifecycle stages.
 *
 * @public
 */
export interface LayoutOptions {
  /** Override specific config values */
  configOverrides?: Partial<LayoutConfig>;
  /** Lifecycle hooks for observing layout stages */
  hooks?: import('./types').LayoutHooks;
}
