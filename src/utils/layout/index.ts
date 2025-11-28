/**
 * Layout Utilities Module
 *
 * Graph layout algorithms for hierarchical cluster visualization:
 * - Hierarchical positioning (orchestrates all layout phases)
 * - Cluster-level DAG layout (inter-cluster arrangement)
 * - Intra-cluster node arrangement (ring-based)
 * - Graph algorithms (SCC, layering)
 *
 * @module utils/layout
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
