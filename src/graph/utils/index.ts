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
export { generateColorMap } from './filter-colors';
export { getFuzzyMatchIds } from './fuzzy-search';
export { applyGraphFilters, matchesSearch } from './graph-filters';
export {
  computeClusterStats,
  computeFilters,
  computeNodeDependencies,
} from './node-utils';
export { buildNodeQuadtree, findNodeAt, type IndexedNode } from './spatial-index';
export {
  bfsTraverseGraph,
  buildAdjacency,
  computeTransitiveDependencies,
  type TransitiveResult,
  traverseGraph,
} from './traversal';
