/**
 * Layout Reporter - Position dump and analysis utilities
 *
 * Generates human-readable reports of cluster and node positions
 * for layout review and optimization.
 */

import type { ClusterPosition } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.types';
import type { HierarchicalLayoutResult } from './types';

/** Position report entry for a single cluster */
export interface ClusterReport {
  id: string;
  stratum: number;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeCount: number;
}

/** Position report entry for a single node */
export interface NodeReport {
  id: string;
  clusterId: string;
  relativeX: number;
  relativeY: number;
  absoluteX: number;
  absoluteY: number;
}

/** Aggregate statistics for the entire layout */
export interface LayoutSummary {
  totalClusters: number;
  totalNodes: number;
  boundingBox: {
    width: number;
    height: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  aspectRatio: number;
  strataCount: number;
}

/** Complete position report with cluster, node, and summary data */
export interface PositionReport {
  clusters: ClusterReport[];
  nodes: NodeReport[];
  summary: LayoutSummary;
}

/**
 * Generate a complete position report from layout results.
 *
 * @param result - The hierarchical layout result to report on
 * @param strataSpacing - Vertical spacing between strata (used to compute stratum index)
 * @returns Position report with clusters sorted by position, nodes, and summary
 */
export function generatePositionReport(
  result: HierarchicalLayoutResult,
  strataSpacing = 800,
): PositionReport {
  const clusterPositions = Array.from(result.clusterPositions.entries());
  const nodePositions = Array.from(result.nodePositions.entries());

  const clusters: ClusterReport[] = clusterPositions
    .map(([id, pos]) => ({
      id,
      stratum: Math.floor(pos.y / strataSpacing),
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      width: Math.round(pos.width),
      height: Math.round(pos.height),
      nodeCount: pos.nodeCount,
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const nodes: NodeReport[] = nodePositions.map(([id, pos]) => {
    const clusterId = pos.clusterId;
    const clusterPos = result.clusterPositions.get(clusterId);
    return {
      id,
      clusterId,
      relativeX: Math.round(pos.x),
      relativeY: Math.round(pos.y),
      absoluteX: Math.round(pos.x + (clusterPos?.x ?? 0)),
      absoluteY: Math.round(pos.y + (clusterPos?.y ?? 0)),
    };
  });

  const bbox = computeBoundingBox(clusterPositions.map(([, pos]) => pos));

  const strataSet = new Set(clusters.map((c) => c.stratum));

  const summary: LayoutSummary = {
    totalClusters: clusters.length,
    totalNodes: nodes.length,
    boundingBox: bbox,
    aspectRatio: bbox.width / Math.max(1, bbox.height),
    strataCount: strataSet.size,
  };

  return { clusters, nodes, summary };
}

/**
 * Computes the axis-aligned bounding box enclosing all cluster positions.
 * @param clusters - Array of cluster positions with center coordinates and dimensions
 * @returns Bounding box with min/max coordinates and total width/height
 */
function computeBoundingBox(clusters: ClusterPosition[]) {
  if (clusters.length === 0) {
    return { xMin: 0, xMax: 0, yMin: 0, yMax: 0, width: 0, height: 0 };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (const c of clusters) {
    const halfW = c.width / 2;
    const halfH = c.height / 2;
    xMin = Math.min(xMin, c.x - halfW);
    xMax = Math.max(xMax, c.x + halfW);
    yMin = Math.min(yMin, c.y - halfH);
    yMax = Math.max(yMax, c.y + halfH);
  }

  return {
    xMin: Math.round(xMin),
    xMax: Math.round(xMax),
    yMin: Math.round(yMin),
    yMax: Math.round(yMax),
    width: Math.round(xMax - xMin),
    height: Math.round(yMax - yMin),
  };
}

/**
 * Print a formatted cluster position table to the console.
 *
 * @param result - The hierarchical layout result
 * @param strataSpacing - Vertical spacing between strata
 */
export function printClusterTable(result: HierarchicalLayoutResult, strataSpacing = 800): void {
  const clusters = Array.from(result.clusterPositions.entries())
    .map(([_id, pos]) => ({
      ...pos,
      stratum: Math.floor(pos.y / strataSpacing),
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  console.log(`\n┌${'─'.repeat(90)}┐`);
  console.log(`│ CLUSTER POSITIONS${' '.repeat(72)}│`);
  console.log(`├${'─'.repeat(90)}┤`);
  console.log(`│ ${'ID'.padEnd(30)}│ Stratum │    X │    Y │ Width │Height │Nodes │`);
  console.log(`├${'─'.repeat(90)}┤`);

  for (const c of clusters) {
    console.log(
      `│ ${c.id.substring(0, 29).padEnd(30)}│${String(c.stratum).padStart(7)} │${c.x.toFixed(0).padStart(5)} │${c.y.toFixed(0).padStart(5)} │${c.width.toFixed(0).padStart(6)} │${c.height.toFixed(0).padStart(6)} │${String(c.nodeCount).padStart(5)} │`,
    );
  }

  console.log(`└${'─'.repeat(90)}┘`);
}

/**
 * Print nodes grouped by cluster to the console.
 *
 * @param result - The hierarchical layout result
 * @param maxNodesPerCluster - Maximum nodes to show per cluster before truncating
 */
export function printNodesByCluster(
  result: HierarchicalLayoutResult,
  maxNodesPerCluster = 10,
): void {
  console.log('\n═══ NODES BY CLUSTER ═══\n');

  for (const cluster of result.clusters) {
    const clusterPos = result.clusterPositions.get(cluster.id);
    console.log(`📦 ${cluster.id} (${cluster.nodes.length} nodes)`);

    const nodes = cluster.nodes.slice(0, maxNodesPerCluster);
    for (const node of nodes) {
      const nodePos = result.nodePositions.get(node.id);
      if (nodePos) {
        const absX = nodePos.x + (clusterPos?.x ?? 0);
        const absY = nodePos.y + (clusterPos?.y ?? 0);
        console.log(
          `   └─ ${node.id.substring(0, 40).padEnd(42)} rel(${nodePos.x.toFixed(0).padStart(4)}, ${nodePos.y.toFixed(0).padStart(4)}) abs(${absX.toFixed(0).padStart(5)}, ${absY.toFixed(0).padStart(5)})`,
        );
      }
    }

    if (cluster.nodes.length > maxNodesPerCluster) {
      console.log(`   └─ ... and ${cluster.nodes.length - maxNodesPerCluster} more nodes`);
    }

    console.log('');
  }
}

/**
 * Print an ASCII visualization of cluster strata to the console.
 *
 * @param result - The hierarchical layout result
 * @param strataSpacing - Vertical spacing between strata
 */
export function printStrataVisualization(
  result: HierarchicalLayoutResult,
  strataSpacing = 800,
): void {
  // Group clusters by stratum
  const strata = new Map<number, Array<{ id: string; x: number; width: number }>>();

  for (const [id, pos] of result.clusterPositions) {
    const stratum = Math.floor(pos.y / strataSpacing);
    if (!strata.has(stratum)) strata.set(stratum, []);
    strata.get(stratum)?.push({ id, x: pos.x, width: pos.width });
  }

  console.log('\n═══ STRATA VISUALIZATION ═══\n');

  const sortedStrata = [...strata.entries()].sort((a, b) => a[0] - b[0]);

  for (const [stratum, clusters] of sortedStrata) {
    const sorted = clusters.sort((a, b) => a.x - b.x);
    const labels = sorted.map((c) => `[${c.id.substring(0, 12)}]`).join(' ');
    console.log(`Stratum ${String(stratum).padStart(2)}: ${labels}`);
  }

  console.log('');
}

/**
 * Print a layout summary to the console.
 *
 * @param report - Position report containing the summary data
 */
export function printLayoutSummary(report: PositionReport): void {
  const { summary } = report;

  console.log('\n═══ LAYOUT SUMMARY ═══\n');
  console.log(`   Total Clusters: ${summary.totalClusters}`);
  console.log(`   Total Nodes:    ${summary.totalNodes}`);
  console.log(`   Bounding Box:   ${summary.boundingBox.width}w × ${summary.boundingBox.height}h`);
  console.log(`   X Range:        [${summary.boundingBox.xMin}, ${summary.boundingBox.xMax}]`);
  console.log(`   Y Range:        [${summary.boundingBox.yMin}, ${summary.boundingBox.yMax}]`);
  console.log(`   Aspect Ratio:   ${summary.aspectRatio.toFixed(2)}`);
  console.log(`   Strata Count:   ${summary.strataCount}`);
  console.log('');
}

/**
 * Export a position report to a JSON string.
 *
 * @param report - Position report to serialize
 * @returns Pretty-printed JSON string
 */
export function exportToJSON(report: PositionReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Export cluster positions to a CSV string.
 *
 * @param report - Position report containing cluster data
 * @returns CSV string with headers
 */
export function exportClustersToCSV(report: PositionReport): string {
  const headers = 'id,stratum,x,y,width,height,nodeCount';
  const rows = report.clusters.map(
    (c) => `${c.id},${c.stratum},${c.x},${c.y},${c.width},${c.height},${c.nodeCount}`,
  );
  return [headers, ...rows].join('\n');
}

/**
 * Export node positions to a CSV string.
 *
 * @param report - Position report containing node data
 * @returns CSV string with headers
 */
export function exportNodesToCSV(report: PositionReport): string {
  const headers = 'id,clusterId,relativeX,relativeY,absoluteX,absoluteY';
  const rows = report.nodes.map(
    (n) => `${n.id},${n.clusterId},${n.relativeX},${n.relativeY},${n.absoluteX},${n.absoluteY}`,
  );
  return [headers, ...rows].join('\n');
}

/**
 * Find clusters with the most cross-stratum edges (hub clusters).
 *
 * @param result - The hierarchical layout result
 * @param edges - All node-level graph edges
 * @param nodeToCluster - Mapping from node ID to cluster ID
 * @param strataSpacing - Vertical spacing between strata
 * @returns Hub clusters sorted by connected strata count (descending)
 */
export function findHubClusters(
  result: HierarchicalLayoutResult,
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
  strataSpacing = 800,
): Array<{ clusterId: string; crossStrataEdges: number; connectedStrata: number }> {
  const clusterCrossEdges = new Map<string, Set<number>>();

  for (const cluster of result.clusters) {
    clusterCrossEdges.set(cluster.id, new Set());
  }

  for (const edge of edges) {
    const sourceCluster = nodeToCluster.get(edge.source);
    const targetCluster = nodeToCluster.get(edge.target);

    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }

    const sourcePos = result.clusterPositions.get(sourceCluster);
    const targetPos = result.clusterPositions.get(targetCluster);

    if (!sourcePos || !targetPos) continue;

    const sourceStratum = Math.floor(sourcePos.y / strataSpacing);
    const targetStratum = Math.floor(targetPos.y / strataSpacing);

    if (sourceStratum !== targetStratum) {
      clusterCrossEdges.get(sourceCluster)?.add(targetStratum);
      clusterCrossEdges.get(targetCluster)?.add(sourceStratum);
    }
  }

  const results: Array<{ clusterId: string; crossStrataEdges: number; connectedStrata: number }> =
    [];

  for (const [clusterId, connectedStrata] of clusterCrossEdges) {
    if (connectedStrata.size > 0) {
      results.push({
        clusterId,
        crossStrataEdges: connectedStrata.size,
        connectedStrata: connectedStrata.size,
      });
    }
  }

  return results.sort((a, b) => b.connectedStrata - a.connectedStrata);
}

/**
 * Find isolated clusters (few or no cross-cluster connections).
 *
 * @param result - The hierarchical layout result
 * @param edges - All node-level graph edges
 * @param nodeToCluster - Mapping from node ID to cluster ID
 * @returns Clusters sorted by connection count (ascending, most isolated first)
 */
export function findIsolatedClusters(
  result: HierarchicalLayoutResult,
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
): Array<{ clusterId: string; connectionCount: number }> {
  const clusterConnections = new Map<string, Set<string>>();

  for (const cluster of result.clusters) {
    clusterConnections.set(cluster.id, new Set());
  }

  for (const edge of edges) {
    const sourceCluster = nodeToCluster.get(edge.source);
    const targetCluster = nodeToCluster.get(edge.target);

    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }

    clusterConnections.get(sourceCluster)?.add(targetCluster);
    clusterConnections.get(targetCluster)?.add(sourceCluster);
  }

  const results: Array<{ clusterId: string; connectionCount: number }> = [];

  for (const [clusterId, connections] of clusterConnections) {
    results.push({
      clusterId,
      connectionCount: connections.size,
    });
  }

  return results.sort((a, b) => a.connectionCount - b.connectionCount);
}
