import type { Cluster, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { buildClusterGraph } from './cluster-graph';
import { DEFAULT_CONFIG, type LayoutOptions } from './config';
import { computeMicroLayoutsParallel } from './parallel-micro';
import { applyForceMassage } from './phases/force-massage';
import { computeMacroLayout, getLastMacroLayoutDebugData } from './phases/macro-layout';
import { computeClusterPorts, computeRoutedEdges } from './phases/port-routing';
import type { HierarchicalLayoutResult, RoutedEdge } from './types';

/**
 * Main layout computation - Hybrid ELK + D3 "Macro/Micro" Layout.
 *
 * Orchestrates:
 * 1. Micro-Layout: Computes internal "Solar System" layout for each cluster (D3)
 * 2. Macro-Layout: Computes "Tectonic Plate" layout for clusters (ELK Layered)
 * 3. Force Massage: Relaxes cluster positions to reduce overlaps
 * 4. Composition: Combines cluster and node positions
 * 5. Port Routing: Computes ports and routed edges for cross-cluster connections
 *
 * @param nodes - All graph nodes
 * @param edges - All graph edges
 * @param clusters - Pre-grouped clusters
 * @param opts - Layout options with optional config overrides and lifecycle hooks
 * @returns Complete layout result with node, cluster, and edge positions
 */
export async function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  opts: LayoutOptions = {},
): Promise<HierarchicalLayoutResult> {
  if (nodes.length === 0) {
    return {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
    };
  }

  const baseConfig = opts.configOverrides
    ? { ...DEFAULT_CONFIG, ...opts.configOverrides }
    : DEFAULT_CONFIG;

  // Enable ELK debug instrumentation in dev mode unless explicitly disabled
  /* v8 ignore start -- dev-only debug enablement */
  const config =
    import.meta.env.DEV && opts.configOverrides?.elkDebug !== false
      ? { ...baseConfig, elkDebug: true }
      : baseConfig;
  /* v8 ignore stop */

  // Hook: before layout starts
  opts.hooks?.onBeforeLayout?.(nodes, edges);

  // 1. Build Cluster Graph (Meta-Graph)
  const clusterGraph = buildClusterGraph(edges, clusters);

  // 2. Micro-Layout: Compute dimensions and internal positions for each cluster
  // (Parallelized across web workers for large cluster counts)
  const microLayouts = await computeMicroLayoutsParallel(clusters, config);

  // Hook: after micro layout
  opts.hooks?.onAfterMicroLayout?.(clusters);

  // 3. Macro-Layout: Compute cluster world positions using ELK
  let clusterPositions = await computeMacroLayout(clusterGraph, microLayouts, config);

  // 3b. Force-Directed Massage: Relax cluster positions to reduce overlaps/gaps
  clusterPositions = applyForceMassage(clusterPositions, clusterGraph, config);

  // 4. Composition: Calculate final world positions for nodes
  const nodePositions = new Map<string, NodePosition>();

  for (const cluster of clusters) {
    const clusterPos = clusterPositions.get(cluster.id);
    const micro = microLayouts.get(cluster.id);

    if (!clusterPos || !micro) continue;

    for (const [nodeId, relPos] of micro.relativePositions) {
      // Node position relative to cluster center
      // (Micro layout is already centered at 0,0)
      nodePositions.set(nodeId, {
        ...relPos,
        clusterId: cluster.id,
      });
    }

    clusterPos.nodeCount = cluster.nodes.length;
  }

  // 5. Port Routing: Compute ports and routed edges for cross-cluster edges
  // (Must be after node positions are computed)
  let routedEdges: RoutedEdge[] = [];
  if (config.portRoutingEnabled) {
    const clusterPorts = computeClusterPorts(clusterPositions, clusterGraph.edges, config);

    routedEdges = computeRoutedEdges(
      edges,
      nodePositions,
      clusterPositions,
      clusterPorts,
      clusterGraph.edges,
      clusterGraph.nodeToCluster,
      config,
    );
  }

  const result: HierarchicalLayoutResult = {
    nodePositions,
    clusterPositions,
    clusters,
    clusterEdges: clusterGraph.edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
    })),
    routedEdges,
    // Cycle data omitted for now (ELK handles topology)
    cycleNodes: new Set(),
    nodeSccId: new Map(),
    sccSizes: new Map(),
    elkDebug: config.elkDebug ? getLastMacroLayoutDebugData() : undefined,
  };

  // Hook: layout complete
  opts.hooks?.onLayoutComplete?.(result);

  return result;
}
