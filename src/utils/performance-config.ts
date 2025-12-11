/**
 * Performance Configuration
 *
 * Adjustable limits for rendering performance with large graphs.
 */

export interface PerformanceConfig {
  /** Maximum edges to render at once */
  maxEdges: number;
  /** Maximum nodes to render at once */
  maxNodes: number;
  /** Disable CSS transitions during interactions */
  disableTransitionsOnInteraction: boolean;
  /** Throttle hover updates (ms between updates) */
  hoverThrottleMs: number;
  /** Enable viewport culling */
  enableViewportCulling: boolean;
}

/** Default performance config for large graphs (>200 nodes or >500 edges) */
export const LARGE_GRAPH_CONFIG: PerformanceConfig = {
  maxEdges: 500,
  maxNodes: 300,
  disableTransitionsOnInteraction: true,
  hoverThrottleMs: 16, // ~60fps
  enableViewportCulling: true,
};

/** Default performance config for small graphs */
export const SMALL_GRAPH_CONFIG: PerformanceConfig = {
  maxEdges: Infinity,
  maxNodes: Infinity,
  disableTransitionsOnInteraction: false,
  hoverThrottleMs: 0,
  enableViewportCulling: false,
};

/** Auto-select config based on graph size */
export function getPerformanceConfig(nodeCount: number, edgeCount: number): PerformanceConfig {
  if (nodeCount > 200 || edgeCount > 500) {
    console.log(
      `[Performance] Using LARGE_GRAPH_CONFIG for ${nodeCount} nodes, ${edgeCount} edges`,
    );
    return LARGE_GRAPH_CONFIG;
  }
  return SMALL_GRAPH_CONFIG;
}

/** Current active config */
let activeConfig: PerformanceConfig = SMALL_GRAPH_CONFIG;

export function setPerformanceConfig(config: PerformanceConfig) {
  activeConfig = config;
}

export function getActivePerformanceConfig(): PerformanceConfig {
  return activeConfig;
}
