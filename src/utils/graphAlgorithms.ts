/**
 * Core graph algorithms for layout computation
 * Based on hierarchical two-graph system with SCC condensation
 */

export interface AdjacencyList {
  forward: Map<string, string[]>; // node -> dependencies
  reverse: Map<string, string[]>; // node -> dependents
}

/**
 * Build adjacency lists for directed graph
 */
export function buildAdjacency(
  nodes: string[],
  edges: Array<{ from: string; to: string }>,
): AdjacencyList {
  const forward = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();

  for (const n of nodes) {
    forward.set(n, []);
    reverse.set(n, []);
  }

  for (const e of edges) {
    if (!forward.has(e.from)) forward.set(e.from, []);
    if (!forward.has(e.to)) forward.set(e.to, []);
    if (!reverse.has(e.from)) reverse.set(e.from, []);
    if (!reverse.has(e.to)) reverse.set(e.to, []);

    forward.get(e.from)!.push(e.to);
    reverse.get(e.to)!.push(e.from);
  }

  return { forward, reverse };
}

/**
 * Tarjan's algorithm for finding strongly connected components
 */
export function tarjanSCC(adj: Map<string, string[]>): string[][] {
  const nodes = Array.from(adj.keys());
  const index: Map<string, number> = new Map();
  const lowlink: Map<string, number> = new Map();
  const onStack: Set<string> = new Set();
  const stack: string[] = [];
  const sccs: string[][] = [];
  let currentIndex = 0;

  function strongconnect(v: string) {
    index.set(v, currentIndex);
    lowlink.set(v, currentIndex);
    currentIndex++;
    stack.push(v);
    onStack.add(v);

    const neighbors = adj.get(v) || [];
    for (const w of neighbors) {
      if (!index.has(w)) {
        strongconnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!));
      }
    }

    if (lowlink.get(v) === index.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      sccs.push(scc);
    }
  }

  for (const v of nodes) {
    if (!index.has(v)) {
      strongconnect(v);
    }
  }

  return sccs;
}

/**
 * Topological sort using Kahn's algorithm
 */
export function topoSort(nodes: string[], edges: Array<{ from: string; to: string }>): string[] {
  const incoming: Record<string, number> = {};
  const outgoing: Record<string, string[]> = {};

  for (const n of nodes) {
    incoming[n] = 0;
    outgoing[n] = [];
  }

  for (const e of edges) {
    incoming[e.to]++;
    outgoing[e.from].push(e.to);
  }

  const queue: string[] = [];
  for (const n of nodes) {
    if (incoming[n] === 0) queue.push(n);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    result.push(n);
    for (const v of outgoing[n]) {
      incoming[v]--;
      if (incoming[v] === 0) queue.push(v);
    }
  }

  return result;
}

/**
 * Assign layers based on longest path from sources
 */
export function assignLayers(
  nodes: string[],
  edges: Array<{ from: string; to: string }>,
): Record<string, number> {
  const preds = new Map<string, string[]>();
  for (const n of nodes) preds.set(n, []);
  for (const e of edges) {
    preds.get(e.to)!.push(e.from);
  }

  const order = topoSort(nodes, edges);
  const depth: Record<string, number> = {};

  for (const n of order) {
    const p = preds.get(n)!;
    if (p.length === 0) {
      depth[n] = 0;
    } else {
      depth[n] = Math.max(...p.map((x) => depth[x] ?? 0)) + 1;
    }
  }

  return depth;
}

/**
 * Compute fanIn/fanOut scores for importance ranking
 */
export function computeNodeScores(
  nodes: string[],
  edges: Array<{ from: string; to: string }>,
): {
  fanIn: Record<string, number>;
  fanOut: Record<string, number>;
  coreScore: Record<string, number>;
} {
  const fanIn: Record<string, number> = {};
  const fanOut: Record<string, number> = {};

  for (const n of nodes) {
    fanIn[n] = 0;
    fanOut[n] = 0;
  }

  for (const e of edges) {
    fanOut[e.from] = (fanOut[e.from] || 0) + 1;
    fanIn[e.to] = (fanIn[e.to] || 0) + 1;
  }

  const coreScore: Record<string, number> = {};
  for (const n of nodes) {
    // Core things are depended on (fanIn) and may depend on others (fanOut)
    coreScore[n] = fanIn[n] * 2 + fanOut[n];
  }

  return { fanIn, fanOut, coreScore };
}
