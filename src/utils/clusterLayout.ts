/**
 * Cluster-level layout using DAG condensation and layering
 * With barycentric crossing reduction for cleaner edge routing
 */

import { assignLayers, tarjanSCC } from './graphAlgorithms';

export interface SuperNode {
  id: string;
  members: string[]; // cluster/project ids in this SCC
}

export interface SuperEdge {
  from: string;
  to: string;
}

export interface ClusterLayoutResult {
  clusterId: string;
  projectIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
}

/**
 * Condense graph into DAG by collapsing SCCs
 */
export function condenseToDAG(
  clusterIds: string[],
  edges: Array<{ from: string; to: string }>,
): {
  superNodes: SuperNode[];
  superEdges: SuperEdge[];
  nodeToSccId: Map<string, string>;
} {
  // Build adjacency for SCC detection
  const adj = new Map<string, string[]>();
  for (const id of clusterIds) {
    adj.set(id, []);
  }
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
    if (!adj.has(e.to)) adj.set(e.to, []);
  }

  const sccs = tarjanSCC(adj);

  const nodeToSccId = new Map<string, string>();
  const superNodes: SuperNode[] = [];

  sccs.forEach((members, idx) => {
    const id = `scc_${idx}`;
    superNodes.push({ id, members });
    for (const m of members) {
      nodeToSccId.set(m, id);
    }
  });

  // Build super-edges (edges between different SCCs)
  const superEdgesSet = new Set<string>();
  for (const e of edges) {
    const fromScc = nodeToSccId.get(e.from);
    const toScc = nodeToSccId.get(e.to);
    if (fromScc && toScc && fromScc !== toScc) {
      superEdgesSet.add(`${fromScc}::${toScc}`);
    }
  }

  const superEdges: SuperEdge[] = Array.from(superEdgesSet).map((s) => {
    const [from, to] = s.split('::');
    return { from, to };
  });

  return { superNodes, superEdges, nodeToSccId };
}

/**
 * Compute barycenter (average position) of neighbors in an adjacent layer
 */
function computeBarycenter(
  _nodeId: string,
  neighborIds: string[],
  positionMap: Map<string, number>,
): number {
  if (neighborIds.length === 0) return 0;

  const positions = neighborIds
    .map((id) => positionMap.get(id))
    .filter((p): p is number => p !== undefined);

  if (positions.length === 0) return 0;

  return positions.reduce((sum, p) => sum + p, 0) / positions.length;
}

// Helper: Build parent-child adjacency from edges
function buildParentChildAdjacency(
  superEdges: SuperEdge[],
): { parents: Map<string, string[]>; children: Map<string, string[]> } {
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();

  for (const edge of superEdges) {
    if (!parents.has(edge.to)) parents.set(edge.to, []);
    if (!children.has(edge.from)) children.set(edge.from, []);
    parents.get(edge.to)!.push(edge.from);
    children.get(edge.from)!.push(edge.to);
  }

  return { parents, children };
}

// Helper: Initialize position map from layer nodes
function initPositionMap(layerToNodes: Map<number, SuperNode[]>): Map<string, number> {
  const position = new Map<string, number>();
  for (const [_layer, nodes] of layerToNodes.entries()) {
    for (let idx = 0; idx < nodes.length; idx++) {
      position.set(nodes[idx].id, idx);
    }
  }
  return position;
}

// Helper: Sort nodes by barycenter and update positions
function sortLayerByBarycenter(
  nodes: SuperNode[],
  direction: 'down' | 'up',
  parents: Map<string, string[]>,
  children: Map<string, string[]>,
  position: Map<string, number>,
): SuperNode[] {
  const scored = nodes.map((node) => {
    const neighborIds =
      direction === 'down' ? parents.get(node.id) || [] : children.get(node.id) || [];
    const barycenter = computeBarycenter(node.id, neighborIds, position);
    return { node, barycenter };
  });

  scored.sort((a, b) => a.barycenter - b.barycenter);

  const sorted = scored.map((s) => s.node);
  for (let idx = 0; idx < sorted.length; idx++) {
    position.set(sorted[idx].id, idx);
  }

  return sorted;
}

/**
 * Perform one iteration of barycentric crossing reduction
 * Processes layers in alternating directions (down then up)
 */
function reduceCrossingsIteration(
  layerToNodes: Map<number, SuperNode[]>,
  superEdges: SuperEdge[],
  direction: 'down' | 'up',
): Map<number, SuperNode[]> {
  const result = new Map<number, SuperNode[]>();
  const { parents, children } = buildParentChildAdjacency(superEdges);
  const position = initPositionMap(layerToNodes);

  const layers = Array.from(layerToNodes.keys()).sort((a, b) => a - b);
  const orderedLayers = direction === 'down' ? layers : layers.reverse();

  for (const layer of orderedLayers) {
    const nodes = layerToNodes.get(layer);
    if (!nodes || nodes.length <= 1) {
      result.set(layer, nodes || []);
      continue;
    }

    const sorted = sortLayerByBarycenter(nodes, direction, parents, children, position);
    result.set(layer, sorted);
  }

  return result;
}

/**
 * Apply multiple iterations of crossing reduction
 */
function reduceCrossings(
  layerToNodes: Map<number, SuperNode[]>,
  superEdges: SuperEdge[],
  iterations: number = 3,
): Map<number, SuperNode[]> {
  let current = layerToNodes;

  for (let i = 0; i < iterations; i++) {
    const direction = i % 2 === 0 ? 'down' : 'up';
    current = reduceCrossingsIteration(current, superEdges, direction);
  }

  return current;
}

/**
 * Layout clusters in layers with proper spacing and crossing reduction
 */
export function layoutClusters(
  superNodes: SuperNode[],
  superEdges: SuperEdge[],
  clusterDimensions: Map<string, number>, // Actual computed dimensions
  options: {
    layerGapY?: number;
    clusterGapX?: number;
  } = {},
): ClusterLayoutResult[] {
  const {
    layerGapY = 280, // Reduced from 450
    clusterGapX = 60, // Reduced from 100
  } = options;

  // Assign layers based on topological depth
  const superDepth = assignLayers(
    superNodes.map((s) => s.id),
    superEdges,
  );

  // Group by layer
  const layerToNodes = new Map<number, SuperNode[]>();
  for (const sn of superNodes) {
    const d = superDepth[sn.id] || 0;
    if (!layerToNodes.has(d)) layerToNodes.set(d, []);
    layerToNodes.get(d)!.push(sn);
  }

  // Apply barycentric crossing reduction
  const optimizedLayers = reduceCrossings(layerToNodes, superEdges, 3);

  const layouts: ClusterLayoutResult[] = [];

  console.log('🎯 Laying out clusters with dimensions...');

  for (const [layer, sns] of optimizedLayers.entries()) {
    // Compute actual widths for this layer based on cluster dimensions
    const widths = sns.map((sn) => {
      // Get the first member's dimension (SCCs share same dimension)
      const firstMember = sn.members[0];
      const dimension = clusterDimensions.get(firstMember) || 250;

      console.log(
        `  Layer ${layer}, SCC ${sn.id}, members: [${sn.members.join(', ')}], firstMember: ${firstMember}, dimension: ${dimension}`,
      );

      return dimension;
    });

    // Calculate total layer width including gaps
    const totalGaps = (sns.length - 1) * clusterGapX;
    const totalWidth = widths.reduce((sum, w) => sum + w, 0);
    const layerWidth = totalWidth + totalGaps;
    const startX = -layerWidth / 2;

    let currentX = startX;
    sns.forEach((sn, idx) => {
      const width = widths[idx];
      const height = width; // Square clusters

      const x = currentX + width / 2;
      const y = layer * layerGapY;

      layouts.push({
        clusterId: sn.id,
        projectIds: sn.members,
        x,
        y,
        width,
        height,
        layer,
      });

      currentX += width + clusterGapX;
    });
  }

  return layouts;
}

/**
 * Compute complete cluster layout from raw cluster data
 */
export function computeClusterLayout(
  clusterIds: string[],
  clusterEdges: Array<{ from: string; to: string }>,
  clusterDimensions?: Map<string, number>,
): {
  layouts: ClusterLayoutResult[];
  superNodes: SuperNode[];
  superEdges: SuperEdge[];
} {
  const { superNodes, superEdges } = condenseToDAG(clusterIds, clusterEdges);

  // Use provided dimensions or create default map
  const dimensions = clusterDimensions || new Map(clusterIds.map((id) => [id, 250]));

  const layouts = layoutClusters(superNodes, superEdges, dimensions);

  return { layouts, superNodes, superEdges };
}
