// ============================================================================
// Atlas Layout Configuration
// ============================================================================

/**
 * Default layout configuration
 * Exported for parameter sweep testing
 */
export const DEFAULT_CONFIG = {
  // Node-level forces
  nodeRadius: 6,
  nodeCollisionPadding: 12,
  linkDistance: 45,
  linkStrength: 0.35,
  nodeCharge: -35,

  // Cross-cluster link handling
  crossClusterDistanceMul: 3.5,
  crossClusterStrengthMul: 0.02,

  // Cluster forces
  clusterStrength: 0.30,
  clusterDistanceMin: 20,
  clusterRepulsionStrength: 8000,
  clusterPadding: 120,
  clusterAttractionStrength: 0.20,
  clusterAttractionActivationDist: 500,
  clusterRepulsionYScale: 0.2,

  // Stratum configuration
  layerSpacing: 120,
  layerStrength: 0.35,

  // Dependency hang force
  hangGap: 72,
  hangStrength: 0.08,

  // Radial interior force
  radialStrength: 0.25,

  // Simulation
  iterations: 300,

  // 3D-specific
  initialZSpread: 400,
  zCenterStrength: 0.02,
  zStratumStrength: 0.18,
  zFanInStrength: 0.16,

  // Cluster sizing
  minClusterSize: 60,
  clusterNodeSpacing: 12,

  // Edge bundling
  bundlingCycles: 5,
  bundlingIterations: 80,
  compatibilityThreshold: 0.65,
  bundlingBudget: 40000,

  // Cluster strata configuration
  clusterStrataSpacing: 800,
  clusterHorizontalSpacing: 120,
  clusterMaxRowWidth: 900,
  clusterStrataAnchorStrength: 0.80,

  // Drift prevention
  clusterCenteringStrength: 0.75,
  clusterBoundingRadius: 1200,
  clusterBoundingStrength: 0.5,
  clusterStrataAlignmentStrength: 0.45,

  // 3D Z-axis role-based refinement (defaults)
  zRoleStrength: 0.12,
  zClampMin: -300,
  zClampMax: 300,
} as const;

/** Type for layout configuration */
export type LayoutConfig = typeof DEFAULT_CONFIG;

/**
 * Options for layout computation
 */
export interface LayoutOptions {
  /** Layout dimension: 2D or 3D (default: '2d') */
  dimension?: '2d' | '3d';
  
  /** Override specific config values */
  configOverrides?: Partial<LayoutConfig>;

  /** 
   * Callback to resolve Z-offset for a node.
   * Decouples domain-specific "Roles" from the layout engine.
   * Returns a number (e.g., -100 to +100) or 0.
   */
  getNodeZOffset?: (nodeId: string) => number;
}
