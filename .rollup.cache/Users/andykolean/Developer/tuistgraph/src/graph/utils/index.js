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
export { getConnectedNodes, getConnectionCount, getDependencyCount, getDependentCount, } from './connections';
// ==================== Node Visibility ====================
export { getConnectedNodeIds, matchesSearch, shouldDimNode, shouldShowEdge, } from './visibility';
// ==================== Filtering ====================
export { generateColorMap } from './filters';
// ==================== Node Computations ====================
export { computeClusterStats, computeFilters, computeNodeDependencies, } from './node-utils';
// ==================== Graph Filtering ====================
export { applyGraphFilters } from './graph-filters';
// ==================== Graph Traversal ====================
export { buildAdjacency, computeTransitiveDependencies, traverseGraph, } from './traversal';
// Physics utilities removed - D3 handles force simulation
//# sourceMappingURL=index.js.map