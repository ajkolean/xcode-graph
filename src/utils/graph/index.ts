/**
 * Graph Utilities Module
 *
 * Utilities for graph data manipulation and analysis:
 * - Node connections and edge traversal
 * - Visibility calculations for filtering/search
 * - Color mapping for node types
 * - Dependency and filter computations
 *
 * @module utils/graph
 */

// ==================== Node Connections ====================
export { getConnectedNodes, type ConnectionResult } from './connections';

// ==================== Node Visibility ====================

export { isNodeVisible, type VisibilityOptions } from './visibility';

// ==================== Filtering ====================

export { generateColorMap } from './filters';

// ==================== Node Computations ====================

export {
  computeNodeDependencies,
  computeFilters,
  computeClusterStats,
} from './node-utils';

// ==================== Graph Filtering ====================

export { applyGraphFilters } from './graph-filters';

// ==================== Graph Traversal ====================

export {
  computeTransitiveDependencies,
  type TransitiveResult,
} from './traversal';
