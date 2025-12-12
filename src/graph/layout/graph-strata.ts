/**
 * Graph Strata Computation
 *
 * Computes global architectural strata using Strongly Connected Components (SCC)
 * and longest-path depth on the condensation DAG.
 *
 * Key insight: Nodes in the same SCC are at the same stratum (cycles are "knots")
 * Edge direction: source -> target means source DEPENDS ON target
 * Visual rule: dependents above dependencies (Y(source) < Y(target))
 */

export interface StrataResult {
  /** Global stratum for each node (0 = top-level entry, higher = deeper dependency) */
  nodeStratum: Map<string, number>;
  /** SCC ID for each node (nodes in same SCC share an ID) */
  nodeSccId: Map<string, number>;
  /** Size of each SCC (size > 1 indicates a cycle) */
  sccSizes: Map<number, number>;
  /** Nodes that are part of cycles (SCC size > 1) */
  cycleNodes: Set<string>;
  /** Maximum stratum value */
  maxStratum: number;
}

interface TarjanState {
  index: number;
  stack: string[];
  onStack: Set<string>;
  indices: Map<string, number>;
  lowLinks: Map<string, number>;
  sccs: string[][];
}

/**
 * Tarjan's algorithm for finding Strongly Connected Components
 * Returns SCCs in reverse topological order (sinks first)
 */
function tarjanSCC(nodes: string[], adjacency: Map<string, string[]>): string[][] {
  const state: TarjanState = {
    index: 0,
    stack: [],
    onStack: new Set(),
    indices: new Map(),
    lowLinks: new Map(),
    sccs: [],
  };

  function strongConnect(v: string) {
    state.indices.set(v, state.index);
    state.lowLinks.set(v, state.index);
    state.index++;
    state.stack.push(v);
    state.onStack.add(v);

    const neighbors = adjacency.get(v) ?? [];
    for (const w of neighbors) {
      if (!state.indices.has(w)) {
        // w has not been visited; recurse
        strongConnect(w);
        state.lowLinks.set(v, Math.min(state.lowLinks.get(v)!, state.lowLinks.get(w)!));
      } else if (state.onStack.has(w)) {
        // w is on the stack, so it's in the current SCC
        state.lowLinks.set(v, Math.min(state.lowLinks.get(v)!, state.indices.get(w)!));
      }
    }

    // If v is a root node, pop the stack and generate an SCC
    if (state.lowLinks.get(v) === state.indices.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = state.stack.pop()!;
        state.onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      state.sccs.push(scc);
    }
  }

  for (const v of nodes) {
    if (!state.indices.has(v)) {
      strongConnect(v);
    }
  }

  return state.sccs;
}

/**
 * Compute global node strata based on dependency direction
 *
 * Uses SCC to handle cycles, then computes longest path on the condensation DAG.
 * Stratum 0 = entry points (nodes with no dependents)
 * Higher stratum = deeper in the dependency tree
 */
export function computeNodeStrata(
  nodes: Array<{ id: string }>,
  edges: Array<{ source: string; target: string }>,
): StrataResult {
  const nodeIds = nodes.map((n) => n.id);
  const nodeSet = new Set(nodeIds);

  // Build adjacency list (source -> target means source depends on target)
  // So adjacency is "depends on" direction
  const adjacency = new Map<string, string[]>();
  for (const id of nodeIds) {
    adjacency.set(id, []);
  }

  for (const edge of edges) {
    if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
      adjacency.get(edge.source)?.push(edge.target);
    }
  }

  // Step 1: Find SCCs using Tarjan's algorithm
  const sccs = tarjanSCC(nodeIds, adjacency);

  // Map nodes to their SCC ID
  const nodeSccId = new Map<string, number>();
  const sccSizes = new Map<number, number>();
  const cycleNodes = new Set<string>();

  for (let sccId = 0; sccId < sccs.length; sccId++) {
    const scc = sccs[sccId]!;
    sccSizes.set(sccId, scc.length);

    for (const nodeId of scc) {
      nodeSccId.set(nodeId, sccId);
      if (scc.length > 1) {
        cycleNodes.add(nodeId);
      }
    }
  }

  // Step 2: Build the condensation DAG (SCC graph)
  // Edge from SCC_a to SCC_b means some node in a depends on some node in b
  const sccAdjacency = new Map<number, Set<number>>();
  const sccInDegree = new Map<number, number>();

  for (let i = 0; i < sccs.length; i++) {
    sccAdjacency.set(i, new Set());
    sccInDegree.set(i, 0);
  }

  for (const edge of edges) {
    if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) continue;

    const srcScc = nodeSccId.get(edge.source)!;
    const tgtScc = nodeSccId.get(edge.target)!;

    if (srcScc !== tgtScc) {
      // Add edge in the "depends on" direction
      if (!sccAdjacency.get(srcScc)!.has(tgtScc)) {
        sccAdjacency.get(srcScc)!.add(tgtScc);
      }
    }
  }

  // Calculate in-degree for topological order
  // In-degree here counts how many SCCs depend ON this SCC (reverse direction)
  const reverseSccAdjacency = new Map<number, Set<number>>();
  for (let i = 0; i < sccs.length; i++) {
    reverseSccAdjacency.set(i, new Set());
  }

  for (const [srcScc, targets] of sccAdjacency) {
    for (const tgtScc of targets) {
      reverseSccAdjacency.get(tgtScc)!.add(srcScc);
    }
  }

  // Step 3: Compute longest path depth using topological order
  // SCCs with no incoming edges (no dependents) are at stratum 0
  // Stratum increases along dependency direction

  // Find SCCs with no reverse edges (nothing depends on them) - these are entry points
  for (const [sccId, deps] of reverseSccAdjacency) {
    sccInDegree.set(sccId, deps.size);
  }

  // Use Kahn's algorithm variant for longest path
  const sccDepth = new Map<number, number>();
  const queue: number[] = [];

  for (let i = 0; i < sccs.length; i++) {
    if (sccInDegree.get(i) === 0) {
      queue.push(i);
      sccDepth.set(i, 0);
    }
  }

  // Process in topological order, propagating max depths
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = sccDepth.get(current)!;

    // For each SCC that "current" depends on, update its depth
    for (const targetScc of sccAdjacency.get(current) ?? []) {
      const newDepth = currentDepth + 1;
      const existingDepth = sccDepth.get(targetScc) ?? -1;

      if (newDepth > existingDepth) {
        sccDepth.set(targetScc, newDepth);
      }

      // Decrement in-degree for topological processing
      const newInDegree = sccInDegree.get(targetScc)! - 1;
      sccInDegree.set(targetScc, newInDegree);

      // Need to re-add to queue to propagate updated depth
      // But only add once when in-degree reaches 0
      if (newInDegree === 0) {
        queue.push(targetScc);
      }
    }
  }

  // Handle disconnected components (assign depth 0 if not computed)
  for (let i = 0; i < sccs.length; i++) {
    if (!sccDepth.has(i)) {
      sccDepth.set(i, 0);
    }
  }

  // Step 4: Map SCC depths back to nodes
  const nodeStratum = new Map<string, number>();
  let maxStratum = 0;

  for (const [nodeId, sccId] of nodeSccId) {
    const stratum = sccDepth.get(sccId) ?? 0;
    nodeStratum.set(nodeId, stratum);
    maxStratum = Math.max(maxStratum, stratum);
  }

  return {
    nodeStratum,
    nodeSccId,
    sccSizes,
    cycleNodes,
    maxStratum,
  };
}

/**
 * Compute fan-in (number of dependents) for each node
 * Higher fan-in = more things depend on this node = "gravity" in 3D
 */
export function computeFanIn(
  nodes: Array<{ id: string }>,
  edges: Array<{ source: string; target: string }>,
): Map<string, number> {
  const fanIn = new Map<string, number>();
  const nodeSet = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    fanIn.set(node.id, 0);
  }

  for (const edge of edges) {
    if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
      // source depends on target, so target has a dependent
      fanIn.set(edge.target, (fanIn.get(edge.target) ?? 0) + 1);
    }
  }

  return fanIn;
}

/**
 * Compute cross-cluster edge weights
 * Returns a map of "clusterA|clusterB" -> count (sorted alphabetically)
 */
export function computeCrossClusterWeights(
  edges: Array<{ source: string; target: string }>,
  nodeToCluster: Map<string, string>,
): Map<string, number> {
  const weights = new Map<string, number>();

  for (const edge of edges) {
    const sourceCluster = nodeToCluster.get(edge.source);
    const targetCluster = nodeToCluster.get(edge.target);

    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }

    // Create consistent key (alphabetically sorted)
    const key =
      sourceCluster < targetCluster
        ? `${sourceCluster}|${targetCluster}`
        : `${targetCluster}|${sourceCluster}`;

    weights.set(key, (weights.get(key) ?? 0) + 1);
  }

  return weights;
}
