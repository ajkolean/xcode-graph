/**
 * Layout configuration constants
 * Centralized layout-related values to avoid duplication across layout algorithms
 */

/**
 * Layout spacing and padding constants
 */
export const LAYOUT_CONSTANTS = {
  /**
   * Minimal padding for cluster boundaries
   * Used in elastic shell and MEC calculations
   */
  CLUSTER_PADDING: 20,

  /**
   * Ring influence factor for shell pressure
   * Controls how outer rings push on cluster boundaries
   */
  RING_FACTOR: 0.3,
} as const;
