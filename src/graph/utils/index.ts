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

export {
  getConnectedNodes,
  getConnectionCount,
  getDependencyCount,
  getDependentCount,
} from './connections';
export { generateColorMap } from './filters';
export { applyGraphFilters } from './graph-filters';

export {
  computeClusterStats,
  computeFilters,
  computeNodeDependencies,
} from './node-utils';
export {
  buildAdjacency,
  computeTransitiveDependencies,
  type TransitiveResult,
  traverseGraph,
} from './traversal';
export {
  getConnectedNodeIds,
  matchesSearch,
  shouldDimNode,
  shouldShowEdge,
} from './visibility';
