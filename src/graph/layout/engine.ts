import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { Cluster } from '@shared/schemas';
import { DEFAULT_CONFIG, type LayoutOptions } from './config';
import type { HierarchicalLayoutResult } from './types';
import { prepareLayout } from './phases/preparation';
import { runSimulation } from './phases/simulation';
import { processResults } from './phases/post-processing';

/**
 * Main layout computation - "Dependency Atlas" style
 * 
 * Orchestrates the layout process in 3 phases:
 * 1. Preparation: Data analysis, strata computation, initial positioning
 * 2. Simulation: Physics execution (now purely D3-driven)
 * 3. Post-processing: Edge bundling, relative coordinate conversion
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  opts: LayoutOptions = {},
): HierarchicalLayoutResult {
  if (nodes.length === 0) {
    return {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
    };
  }

  // Merge config
  const config = opts.configOverrides
    ? { ...DEFAULT_CONFIG, ...opts.configOverrides }
    : DEFAULT_CONFIG;

  // Phase 1: Preparation
  const prepData = prepareLayout(nodes, edges, clusters, config, opts.dimension);

  // Phase 2: Simulation
  runSimulation(prepData, config, opts);

  // Phase 3: Post-processing
  return processResults(prepData, nodes, edges, clusters, config, opts);
}
