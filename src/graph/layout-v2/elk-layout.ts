/**
 * ELK-based hierarchical layout
 * Uses elkjs library for professional graph layout
 */

import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';

export interface HierarchicalLayoutResult {
  clusterPositions: Map<string, ClusterPosition>;
  nodePositions: Map<string, NodePosition>;
  clusters: Cluster[];
}

const elk = new ELK();

/**
 * Layout nodes within a cluster using ELK with complete graph (invisible edges)
 */
async function layoutClusterWithElk(cluster: Cluster) {
  if (cluster.nodes.length === 0) {
    return { id: cluster.id, nodePositions: new Map(), size: 80 };
  }

  const NODE_WIDTH = 12;
  const NODE_HEIGHT = 12;

  // Pre-calculate cluster size based on node count
  const size = 100 + cluster.nodes.length * 10;
  const clusterWidth = size;
  const clusterHeight = size;

  // Create complete graph - every node connects to every other
  const elkNodes: ElkNode[] = cluster.nodes.map(n => ({
    id: n.id,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }));

  const elkEdges: ElkExtendedEdge[] = [];
  for (let i = 0; i < cluster.nodes.length; i++) {
    for (let j = i + 1; j < cluster.nodes.length; j++) {
      const nodeI = cluster.nodes[i];
      const nodeJ = cluster.nodes[j];
      if (!nodeI || !nodeJ) continue;

      elkEdges.push({
        id: `${nodeI.id}-${nodeJ.id}`,
        sources: [nodeI.id],
        targets: [nodeJ.id],
      });
    }
  }

  const graph: ElkNode = {
    id: 'cluster',
    width: clusterWidth,
    height: clusterHeight,
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.spacing.nodeNode': '25',
      'elk.force.repulsion': '80',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layout = await elk.layout(graph);

  // Extract positions (relative to 0,0)
  const nodePositions = new Map<string, { x: number; y: number }>();
  const centerX = clusterWidth / 2;
  const centerY = clusterHeight / 2;

  for (const node of layout.children ?? []) {
    const x = (node.x ?? 0) - centerX; // Center at origin
    const y = (node.y ?? 0) - centerY;
    nodePositions.set(node.id, { x, y });
  }

  return { id: cluster.id, nodePositions, size };
}

/**
 * Layout clusters using ELK with complete graph (invisible edges)
 */
async function layoutClustersWithElk(
  clusterLayouts: Array<{ id: string; nodePositions: Map<string, { x: number; y: number }>; size: number }>,
) {
  if (clusterLayouts.length === 0) return [];
  if (clusterLayouts.length === 1) {
    const cl = clusterLayouts[0];
    return cl ? [{ id: cl.id, x: 0, y: 0 }] : [];
  }

  // Create complete graph of clusters
  const elkNodes: ElkNode[] = clusterLayouts.map(cl => ({
    id: cl.id,
    width: cl.size,
    height: cl.size,
  }));

  const elkEdges: ElkExtendedEdge[] = [];
  for (let i = 0; i < clusterLayouts.length; i++) {
    for (let j = i + 1; j < clusterLayouts.length; j++) {
      const clI = clusterLayouts[i];
      const clJ = clusterLayouts[j];
      if (!clI || !clJ) continue;

      elkEdges.push({
        id: `${clI.id}-${clJ.id}`,
        sources: [clI.id],
        targets: [clJ.id],
      });
    }
  }

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.spacing.nodeNode': '60',
      'elk.force.repulsion': '200',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layout = await elk.layout(graph);

  // Extract cluster positions (centered at origin)
  const centerX = (layout.width ?? 0) / 2;
  const centerY = (layout.height ?? 0) / 2;

  return (layout.children ?? []).map(node => ({
    id: node.id,
    x: (node.x ?? 0) - centerX,
    y: (node.y ?? 0) - centerY,
  }));
}

/**
 * Main ELK-based hierarchical layout
 */
export async function computeHierarchicalLayout(
  _nodes: GraphNode[],
  _edges: GraphEdge[],
  clusters: Cluster[],
): Promise<HierarchicalLayoutResult> {
  // Step 1: Layout each cluster
  const clusterLayouts = await Promise.all(clusters.map(c => layoutClusterWithElk(c)));

  // Step 2: Layout clusters
  const clusterPositions = await layoutClustersWithElk(clusterLayouts);

  // Step 3: Build result
  const clusterPosMap = new Map<string, ClusterPosition>();
  const nodePosMap = new Map<string, NodePosition>();

  for (const clLayout of clusterLayouts) {
    const center = clusterPositions.find(p => p.id === clLayout.id);
    if (!center) continue;

    clusterPosMap.set(clLayout.id, {
      id: clLayout.id,
      x: center.x,
      y: center.y,
      width: clLayout.size,
      height: clLayout.size,
      vx: 0,
      vy: 0,
      nodeCount: clLayout.nodePositions.size,
    });

    // Store nodes with RELATIVE positions
    for (const [nodeId, relPos] of clLayout.nodePositions) {
      nodePosMap.set(nodeId, {
        id: nodeId,
        x: relPos.x,
        y: relPos.y,
        vx: 0,
        vy: 0,
        clusterId: clLayout.id,
        radius: 6,
      });
    }
  }

  return { clusterPositions: clusterPosMap, nodePositions: nodePosMap, clusters };
}
