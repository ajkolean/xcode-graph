/**
 * Mass-based anchor selection for cluster layout
 *
 * Computes "gravitational mass" for each target based on:
 * - Fan-in: How many targets depend on this module (incoming edges)
 * - Fan-out: How many dependencies it has (outgoing edges)
 * - Depth: Position in dependency hierarchy
 * - Centrality: How central it is to the cluster's structure
 *
 * The target with greatest mass becomes the "sun" of the solar system.
 */

export interface NodeMass {
  nodeId: string;
  mass: number;
  fanIn: number;
  fanOut: number;
  depth: number;
  centrality: number;
}

interface AdjacencyList {
  forward: Map<string, string[]>;
  reverse: Map<string, string[]>;
}

/**
 * Build adjacency lists for the graph
 */
function buildAdjacency(
  nodeIds: string[],
  edges: Array<{ from: string; to: string }>,
): AdjacencyList {
  const forward = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();

  for (const id of nodeIds) {
    forward.set(id, []);
    reverse.set(id, []);
  }

  for (const edge of edges) {
    if (forward.has(edge.from)) {
      forward.get(edge.from)!.push(edge.to);
    }
    if (reverse.has(edge.to)) {
      reverse.get(edge.to)!.push(edge.from);
    }
  }

  return { forward, reverse };
}

/**
 * Compute depth of each node from roots (nodes with no dependencies)
 */
function computeDepthFromRoots(nodeIds: string[], adj: AdjacencyList): Map<string, number> {
  const depth = new Map<string, number>();
  const queue: string[] = [];

  // Find roots (nodes with no incoming edges)
  for (const id of nodeIds) {
    const incoming = adj.reverse.get(id) || [];
    if (incoming.length === 0) {
      depth.set(id, 0);
      queue.push(id);
    }
  }

  // BFS from roots
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depth.get(id)!;

    const outgoing = adj.forward.get(id) || [];
    for (const neighbor of outgoing) {
      if (!depth.has(neighbor)) {
        depth.set(neighbor, d + 1);
        queue.push(neighbor);
      }
    }
  }

  // Nodes not reachable from roots get max depth
  const maxDepth = Math.max(...Array.from(depth.values()), 0);
  for (const id of nodeIds) {
    if (!depth.has(id)) {
      depth.set(id, maxDepth + 1);
    }
  }

  return depth;
}

/**
 * Compute betweenness centrality (simplified approximation)
 * Measures how often a node appears on shortest paths between other nodes
 */
function computeCentrality(nodeIds: string[], adj: AdjacencyList): Map<string, number> {
  const centrality = new Map<string, number>();

  // Initialize
  for (const id of nodeIds) {
    centrality.set(id, 0);
  }

  // For each node as source
  for (const source of nodeIds) {
    const distance = new Map<string, number>();
    const pathCount = new Map<string, number>();
    const queue: string[] = [source];

    distance.set(source, 0);
    pathCount.set(source, 1);

    // BFS to find shortest paths
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distance.get(current)!;
      const currentPaths = pathCount.get(current)!;

      const neighbors = adj.forward.get(current) || [];
      for (const neighbor of neighbors) {
        if (!distance.has(neighbor)) {
          distance.set(neighbor, currentDist + 1);
          pathCount.set(neighbor, 0);
          queue.push(neighbor);
        }

        if (distance.get(neighbor) === currentDist + 1) {
          pathCount.set(neighbor, (pathCount.get(neighbor) || 0) + currentPaths);
        }
      }
    }

    // Accumulate centrality scores
    for (const [node, paths] of pathCount.entries()) {
      if (node !== source && paths > 0) {
        centrality.set(node, (centrality.get(node) || 0) + paths);
      }
    }
  }

  return centrality;
}

/**
 * Calculate mass for all nodes in a cluster
 *
 * Mass formula:
 * mass = (fanIn * 3) + (fanOut * 1) + (maxDepth - depth) * 2 + (centrality * 0.5)
 *
 * Rationale:
 * - Fan-in weighted heavily (3x): Being depended upon = architectural importance
 * - Fan-out weighted lightly (1x): Dependencies contribute to mass but less
 * - Inverse depth (2x): Deeper nodes are more foundational
 * - Centrality (0.5x): Nodes on many paths are structurally important
 */
export function computeNodeMasses(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
): Map<string, NodeMass> {
  // Filter out test nodes - they don't participate in mass calculation
  const mainNodes = nodes.filter((n) => !n.type.startsWith('test'));
  const mainNodeIds = mainNodes.map((n) => n.id);
  const mainNodeSet = new Set(mainNodeIds);

  // Filter edges to only include main nodes
  const mainEdges = edges.filter((e) => mainNodeSet.has(e.from) && mainNodeSet.has(e.to));

  const adj = buildAdjacency(mainNodeIds, mainEdges);
  const depths = computeDepthFromRoots(mainNodeIds, adj);
  const centralities = computeCentrality(mainNodeIds, adj);

  const maxDepth = Math.max(...Array.from(depths.values()), 0);
  const maxCentrality = Math.max(...Array.from(centralities.values()), 1);

  const masses = new Map<string, NodeMass>();

  for (const node of mainNodes) {
    const fanIn = (adj.reverse.get(node.id) || []).length;
    const fanOut = (adj.forward.get(node.id) || []).length;
    const depth = depths.get(node.id) || 0;
    const centrality = centralities.get(node.id) || 0;

    // Normalize centrality to 0-1 range
    const normalizedCentrality = maxCentrality > 0 ? centrality / maxCentrality : 0;

    // Calculate mass
    const mass =
      fanIn * 3 + // Fan-in: heavily weighted
      fanOut * 1 + // Fan-out: lightly weighted
      (maxDepth - depth) * 2 + // Inverse depth: foundational nodes are heavier
      normalizedCentrality * 0.5; // Centrality: structural importance

    masses.set(node.id, {
      nodeId: node.id,
      mass,
      fanIn,
      fanOut,
      depth,
      centrality: normalizedCentrality,
    });
  }

  return masses;
}

/**
 * Select the anchor node (sun) based on mass
 * Returns the node with highest mass
 */
export function selectMassBasedAnchor(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
): string | null {
  const masses = computeNodeMasses(nodes, edges);

  if (masses.size === 0) return null;

  let maxMass = -Infinity;
  let anchor: string | null = null;

  for (const [nodeId, massData] of masses.entries()) {
    if (massData.mass > maxMass) {
      maxMass = massData.mass;
      anchor = nodeId;
    }
  }

  return anchor;
}

/**
 * Select multiple anchors if the cluster is large or has multiple roots
 * Returns up to maxAnchors nodes with highest mass
 */
export function selectMultipleMassBasedAnchors(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
  maxAnchors: number = 3,
): string[] {
  const masses = computeNodeMasses(nodes, edges);

  if (masses.size === 0) return [];

  // Sort by mass descending
  const sorted = Array.from(masses.values()).sort((a, b) => b.mass - a.mass);

  // Take top N
  return sorted.slice(0, maxAnchors).map((m) => m.nodeId);
}
