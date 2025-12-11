/**
 * ELK-based clustered layout
 * - Nodes inside a cluster: force-directed using real intra-cluster edges
 * - Clusters themselves: force-directed using inter-cluster edges
 * - Goal: look good, not be strictly hierarchical
 */

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled';

export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
}

const elk = new ELK();

// Visual / layout constants
const NODE_WIDTH = 12;
const NODE_HEIGHT = 12;
const NODE_RADIUS = 6;
const CLUSTER_PADDING = 24;
const MIN_CLUSTER_SIZE = 80;

interface ClusterLayout {
  id: string;
  nodePositions: Map<string, { x: number; y: number }>; // relative to cluster center
  width: number; // full cluster width (for box)
  height: number; // full cluster height
}

interface ClusterCenter {
  id: string;
  x: number;
  y: number;
}

interface ClusterEdge {
  sourceClusterId: string;
  targetClusterId: string;
  count: number; // aggregated number of node→node edges
}

/**
 * Extract source/target ids from GraphEdge.
 * Adjust here if your schema uses different field names.
 */
function getEdgeEndpoints(edge: GraphEdge): { sourceId?: string; targetId?: string } {
  const anyEdge = edge as any;

  const sourceId: string | undefined =
    anyEdge.source ?? anyEdge.sourceId ?? anyEdge.from ?? anyEdge.start;
  const targetId: string | undefined =
    anyEdge.target ?? anyEdge.targetId ?? anyEdge.to ?? anyEdge.end;

  return { sourceId, targetId };
}

/**
 * Partition edges according to cluster membership:
 * - nodeToClusterId: node -> cluster
 * - intraClusterEdges: edges where both ends are in the same cluster
 * - interClusterEdges: aggregated edges between distinct clusters
 */
function partitionEdgesByCluster(
  _nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
): {
  nodeToClusterId: Map<string, string>;
  intraClusterEdges: Map<string, GraphEdge[]>;
  interClusterEdges: ClusterEdge[];
} {
  const nodeToClusterId = new Map<string, string>();
  const intraClusterEdges = new Map<string, GraphEdge[]>();
  const interClusterEdgeMap = new Map<string, ClusterEdge>();

  // Map node -> cluster using the clusters array
  for (const cluster of clusters) {
    for (const node of cluster.nodes ?? []) {
      if (node && node.id != null) {
        nodeToClusterId.set(String(node.id), cluster.id);
      }
    }
  }

  // Split edges into intra- / inter-cluster
  for (const edge of edges) {
    const { sourceId, targetId } = getEdgeEndpoints(edge);
    if (!sourceId || !targetId) continue;

    const sourceClusterId = nodeToClusterId.get(String(sourceId));
    const targetClusterId = nodeToClusterId.get(String(targetId));

    if (!sourceClusterId || !targetClusterId) {
      // Edge touches nodes not in any cluster: ignore for now
      continue;
    }

    if (sourceClusterId === targetClusterId) {
      const list = intraClusterEdges.get(sourceClusterId);
      if (list) {
        list.push(edge);
      } else {
        intraClusterEdges.set(sourceClusterId, [edge]);
      }
    } else {
      // Aggregate edges between the same pair of clusters
      const key = `${sourceClusterId}->${targetClusterId}`;
      const existing = interClusterEdgeMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        interClusterEdgeMap.set(key, {
          sourceClusterId,
          targetClusterId,
          count: 1,
        });
      }
    }
  }

  return {
    nodeToClusterId,
    intraClusterEdges,
    interClusterEdges: Array.from(interClusterEdgeMap.values()),
  };
}

function buildElkEdgesFromGraphEdges(edges: GraphEdge[]): ElkExtendedEdge[] {
  return edges.map((edge, index) => {
    const { sourceId, targetId } = getEdgeEndpoints(edge);
    if (!sourceId || !targetId) {
      // ELK will ignore edges without endpoints; still give it a stable id
      return {
        id: (edge as any).id ?? `e-${index}`,
        sources: [],
        targets: [],
      } as ElkExtendedEdge;
    }

    return {
      id: (edge as any).id ?? `e-${index}-${sourceId}-${targetId}`,
      sources: [String(sourceId)],
      targets: [String(targetId)],
    } as ElkExtendedEdge;
  });
}

/**
 * Layout nodes within a single cluster using ELK's force-directed algorithm.
 * Positions are returned relative to the cluster's center.
 */
async function layoutClusterWithElk(
  cluster: Cluster,
  edges: GraphEdge[] = [],
): Promise<ClusterLayout> {
  const nodePositions = new Map<string, { x: number; y: number }>();

  if (!cluster.nodes || cluster.nodes.length === 0) {
    return {
      id: cluster.id,
      nodePositions,
      width: MIN_CLUSTER_SIZE,
      height: MIN_CLUSTER_SIZE,
    };
  }

  // ELK child nodes
  const elkNodes: ElkNode[] = cluster.nodes.map((node) => ({
    id: String(node.id),
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }));

  const elkEdges: ElkExtendedEdge[] = buildElkEdgesFromGraphEdges(edges);

  // Rough pre-size; ELK will refine
  const approxSize = Math.max(MIN_CLUSTER_SIZE, 40 + cluster.nodes.length * 20);

  const graph: ElkNode = {
    id: cluster.id,
    width: approxSize,
    height: approxSize,
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.spacing.nodeNode': '40',
      'elk.force.repulsion': '1200',
      'elk.force.iterations': '250',
      'org.eclipse.elk.separateConnectedComponents': 'false',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layout = await elk.layout(graph);
  const children = layout.children ?? [];

  if (children.length === 0) {
    return {
      id: cluster.id,
      nodePositions,
      width: MIN_CLUSTER_SIZE,
      height: MIN_CLUSTER_SIZE,
    };
  }

  // Prefer ELK's computed width/height; fall back to approx
  const layoutWidth =
    typeof layout.width === 'number' && layout.width > 0 ? layout.width : approxSize;
  const layoutHeight =
    typeof layout.height === 'number' && layout.height > 0 ? layout.height : approxSize;

  const centerX = layoutWidth / 2;
  const centerY = layoutHeight / 2;

  let minRelX = Number.POSITIVE_INFINITY;
  let maxRelX = Number.NEGATIVE_INFINITY;
  let minRelY = Number.POSITIVE_INFINITY;
  let maxRelY = Number.NEGATIVE_INFINITY;

  // Convert ELK node positions into coordinates relative to cluster center,
  // with positions referring to node centers.
  for (const node of children) {
    if (!node.id) continue;

    const nodeX = node.x ?? 0; // top-left
    const nodeY = node.y ?? 0;
    const nodeWidth = node.width ?? NODE_WIDTH;
    const nodeHeight = node.height ?? NODE_HEIGHT;

    const nodeCenterX = nodeX + nodeWidth / 2;
    const nodeCenterY = nodeY + nodeHeight / 2;

    const relX = nodeCenterX - centerX;
    const relY = nodeCenterY - centerY;

    nodePositions.set(node.id, { x: relX, y: relY });

    if (relX < minRelX) minRelX = relX;
    if (relX > maxRelX) maxRelX = relX;
    if (relY < minRelY) minRelY = relY;
    if (relY > maxRelY) maxRelY = relY;
  }

  if (!Number.isFinite(minRelX) || !Number.isFinite(minRelY)) {
    return {
      id: cluster.id,
      nodePositions,
      width: MIN_CLUSTER_SIZE,
      height: MIN_CLUSTER_SIZE,
    };
  }

  const contentWidth = maxRelX - minRelX + NODE_WIDTH;
  const contentHeight = maxRelY - minRelY + NODE_HEIGHT;

  const width = Math.max(MIN_CLUSTER_SIZE, contentWidth + CLUSTER_PADDING * 2);
  const height = Math.max(MIN_CLUSTER_SIZE, contentHeight + CLUSTER_PADDING * 2);

  return {
    id: cluster.id,
    nodePositions,
    width,
    height,
  };
}

/**
 * Layout clusters as nodes in a higher-level graph using ELK's force-directed algorithm.
 * Returns cluster centers relative to the full graph center.
 */
async function layoutClustersWithElk(
  clusterLayouts: ClusterLayout[],
  clusterEdges: ClusterEdge[],
): Promise<ClusterCenter[]> {
  if (clusterLayouts.length === 0) return [];

  if (clusterLayouts.length === 1) {
    return [
      {
        id: clusterLayouts[0]!.id,
        x: 0,
        y: 0,
      },
    ];
  }

  const elkNodes: ElkNode[] = clusterLayouts.map((cl) => ({
    id: cl.id,
    width: cl.width,
    height: cl.height,
  }));

  // We ignore weight for now; ELK doesn't easily take edge weights.
  const elkEdges: ElkExtendedEdge[] = clusterEdges.map((edge, index) => ({
    id: `c-${index}-${edge.sourceClusterId}-${edge.targetClusterId}`,
    sources: [edge.sourceClusterId],
    targets: [edge.targetClusterId],
  }));

  const graph: ElkNode = {
    id: 'clusters-root',
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.spacing.nodeNode': '90',
      'elk.force.repulsion': '900',
      'elk.force.iterations': '400',
      'org.eclipse.elk.separateConnectedComponents': 'false',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layout = await elk.layout(graph);
  const children = layout.children ?? [];

  if (children.length === 0) {
    // Fallback: trivial row layout
    return clusterLayouts.map((cl, index) => ({
      id: cl.id,
      x: index * (cl.width + 40),
      y: 0,
    }));
  }

  const totalWidth = typeof layout.width === 'number' && layout.width > 0 ? layout.width : 0;
  const totalHeight = typeof layout.height === 'number' && layout.height > 0 ? layout.height : 0;

  const centerX = totalWidth / 2;
  const centerY = totalHeight / 2;

  return children.map((node) => {
    const nodeWidth = node.width ?? MIN_CLUSTER_SIZE;
    const nodeHeight = node.height ?? MIN_CLUSTER_SIZE;

    const nodeCenterX = (node.x ?? 0) + nodeWidth / 2;
    const nodeCenterY = (node.y ?? 0) + nodeHeight / 2;

    return {
      id: node.id!,
      x: nodeCenterX - centerX,
      y: nodeCenterY - centerY,
    };
  });
}

/**
 * Main clustered layout.
 *
 * - Uses actual GraphEdge connectivity.
 * - Cluster-internal layout: force-directed.
 * - Cluster-level layout: also force-directed (non-hierarchical).
 * - Node positions are RELATIVE to the center of their cluster.
 */
export async function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
): Promise<HierarchicalLayoutResult> {
  const { nodeToClusterId, intraClusterEdges, interClusterEdges } = partitionEdgesByCluster(
    nodes,
    edges,
    clusters,
  );

  // Layout each cluster (sequentially; easy to switch to Promise.all if desired)
  const clusterLayouts: ClusterLayout[] = [];
  for (const cluster of clusters) {
    const clusterEdgesForThisCluster = intraClusterEdges.get(cluster.id) ?? [];
    const layout = await layoutClusterWithElk(cluster, clusterEdgesForThisCluster);
    clusterLayouts.push(layout);
  }

  // Layout clusters as a higher-level graph (force layout)
  const clusterCenters = await layoutClustersWithElk(clusterLayouts, interClusterEdges);

  const clusterCenterMap = new Map<string, ClusterCenter>();
  for (const center of clusterCenters) {
    clusterCenterMap.set(center.id, center);
  }

  const clusterPosMap = new Map<string, ClusterPosition>();
  const nodePosMap = new Map<string, NodePosition>();

  for (const clLayout of clusterLayouts) {
    const center = clusterCenterMap.get(clLayout.id);
    if (!center) continue;

    clusterPosMap.set(clLayout.id, {
      id: clLayout.id,
      x: center.x,
      y: center.y,
      width: clLayout.width,
      height: clLayout.height,
      vx: 0,
      vy: 0,
      nodeCount: clLayout.nodePositions.size,
    });

    for (const [nodeId, relPos] of clLayout.nodePositions) {
      const clusterId = nodeToClusterId.get(nodeId) ?? clLayout.id;

      nodePosMap.set(nodeId, {
        id: nodeId,
        x: relPos.x,
        y: relPos.y,
        vx: 0,
        vy: 0,
        clusterId,
        radius: NODE_RADIUS,
      });
    }
  }

  return {
    clusterPositions: clusterPosMap,
    nodePositions: nodePosMap,
    clusters,
  };
}
