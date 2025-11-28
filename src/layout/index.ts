/**
 * Layout Module - Graph Layout Algorithms
 *
 * Top-level module for hierarchical cluster-based graph visualization.
 * Implements a multi-phase "Solar System" layout model.
 *
 * ## Execution Flow (4 phases)
 * 1. **Cluster Grouping**: `groupIntoClusters()` - Group nodes by project/origin
 * 2. **Cluster-Level DAG**: `computeClusterLayout()` - Position clusters hierarchically
 * 3. **Intra-Cluster Ring**: `simpleClusterLayout()` - Position nodes within clusters
 * 4. **Cluster Sizing**: `computeElasticShellRadius()` - Calculate cluster boundaries
 *
 * ## Solar System Model
 * - **Sun**: Mass-based anchor node (high fan-in/fan-out, centrality)
 * - **Planets**: Other nodes orbiting in rings around the sun
 * - **Ring Depth**: Distance from sun based on dependency depth
 * - **Elastic Shell**: Cluster boundary that expands/contracts with node mass
 *
 * @module layout
 * @see {@link @/controllers/graph-layout.controller} - Controller that uses this module
 */

// ==================== Main Orchestrator ====================

export {
  computeHierarchicalLayout,
  type HierarchicalLayoutResult,
} from './hierarchical';

// ==================== Cluster-Level Layout ====================

export {
  computeClusterLayout,
  condenseToDAG,
  type ClusterLayoutResult,
  type SuperNode,
  type SuperEdge,
} from './cluster-dag';

// ==================== Intra-Cluster Layout ====================

export {
  simpleClusterLayout,
  computeMEC,
  type NodeCartesian,
  type SimpleLayoutOptions,
} from './intra-cluster';

// ==================== Graph Algorithms ====================

export {
  buildAdjacency,
  tarjanSCC,
  assignLayers,
  type AdjacencyList,
} from './algorithms';

// ==================== Cluster Analysis ====================

export {
  analyzeCluster,
  identifyAnchors,
  determineRole,
} from './cluster-analysis';

// ==================== Cluster Grouping ====================

export { groupIntoClusters, arrangeClusterGrid } from './cluster-grouping';

// ==================== Mass Calculation ====================

export {
  computeNodeMasses,
  selectMassBasedAnchor,
  type NodeMass,
} from './mass';

// ==================== Elastic Shell ====================

export {
  computeElasticShellRadius,
  type ElasticShellConfig,
  type NodeWithPosition,
} from './elastic-shell';
