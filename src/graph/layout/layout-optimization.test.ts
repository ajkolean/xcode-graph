/**
 * Layout Optimization Test Suite
 *
 * Tests for analyzing and optimizing graph layout parameters.
 * Provides:
 * - Full position dumps for review
 * - Parameter sensitivity analysis
 * - Multi-parameter optimization
 * - Strata visualization
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  computeHierarchicalLayout,
  DEFAULT_CONFIG,
  type HierarchicalLayoutResult,
  type LayoutConfig,
} from './d3-layout';
import { groupIntoClusters } from './cluster-grouping';
import { analyzeCluster } from './cluster-analysis';
import type { GraphNode, GraphEdge } from '@shared/schemas/graph.schema';
import type { Cluster } from '@shared/schemas';
import { tuistGraphData } from '../../fixtures/tuist-graph-data';
import {
  generatePositionReport,
  printClusterTable,
  printNodesByCluster,
  printStrataVisualization,
  printLayoutSummary,
  exportToJSON,
  exportClustersToCSV,
  findHubClusters,
  findIsolatedClusters,
} from './layout-reporter';

// ============================================================================
// Test Helpers
// ============================================================================

interface SweepResult {
  paramValue: number;
  aspectRatio: number;
  overlapCount: number;
  avgEdgeLength: number;
  containmentRate: number;
  strataCount: number;
}

/**
 * Build node-to-cluster mapping
 */
function buildNodeToClusterMap(clusters: Cluster[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      map.set(node.id, cluster.id);
    }
  }
  return map;
}

/**
 * Compute quality metrics from layout result
 */
function computeMetrics(
  result: HierarchicalLayoutResult,
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
  strataSpacing = 800,
): {
  aspectRatio: number;
  overlapCount: number;
  avgEdgeLength: number;
  containmentRate: number;
  strataCount: number;
} {
  const clusterPositions = Array.from(result.clusterPositions.values());

  // Bounding box and aspect ratio
  let xMin = Infinity,
    xMax = -Infinity,
    yMin = Infinity,
    yMax = -Infinity;
  for (const c of clusterPositions) {
    const hw = c.width / 2;
    const hh = c.height / 2;
    xMin = Math.min(xMin, c.x - hw);
    xMax = Math.max(xMax, c.x + hw);
    yMin = Math.min(yMin, c.y - hh);
    yMax = Math.max(yMax, c.y + hh);
  }
  const width = xMax - xMin;
  const height = Math.max(1, yMax - yMin);
  const aspectRatio = width / height;

  // Overlap count
  let overlapCount = 0;
  for (let i = 0; i < clusterPositions.length; i++) {
    for (let j = i + 1; j < clusterPositions.length; j++) {
      const c1 = clusterPositions[i]!;
      const c2 = clusterPositions[j]!;
      const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
      const r1 = Math.max(c1.width, c1.height) / 2;
      const r2 = Math.max(c2.width, c2.height) / 2;
      if (dist < r1 + r2) {
        overlapCount++;
      }
    }
  }

  // Average cross-cluster edge length
  const edgeLengths: number[] = [];
  for (const edge of edges) {
    const sc = nodeToCluster.get(edge.source);
    const tc = nodeToCluster.get(edge.target);
    if (sc && tc && sc !== tc) {
      const sp = result.clusterPositions.get(sc);
      const tp = result.clusterPositions.get(tc);
      if (sp && tp) {
        edgeLengths.push(Math.hypot(sp.x - tp.x, sp.y - tp.y));
      }
    }
  }
  const avgEdgeLength =
    edgeLengths.length > 0 ? edgeLengths.reduce((a, b) => a + b, 0) / edgeLengths.length : 0;

  // Node containment rate
  let contained = 0;
  for (const cluster of result.clusters) {
    const clusterPos = result.clusterPositions.get(cluster.id);
    if (!clusterPos) continue;
    const radius = Math.max(clusterPos.width, clusterPos.height) / 2;
    for (const node of cluster.nodes) {
      const nodePos = result.nodePositions.get(node.id);
      if (nodePos) {
        const dist = Math.hypot(nodePos.x, nodePos.y);
        if (dist <= radius + 10) contained++;
      }
    }
  }
  const totalNodes = result.clusters.reduce((sum, c) => sum + c.nodes.length, 0);
  const containmentRate = totalNodes > 0 ? contained / totalNodes : 1;

  // Strata count
  const strataSet = new Set(clusterPositions.map((c) => Math.floor(c.y / strataSpacing)));

  return {
    aspectRatio,
    overlapCount,
    avgEdgeLength,
    containmentRate,
    strataCount: strataSet.size,
  };
}

/**
 * Run parameter sweep
 */
function runParameterSweep(
  paramName: keyof LayoutConfig,
  values: number[],
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  nodeToCluster: Map<string, string>,
): SweepResult[] {
  const results: SweepResult[] = [];

  for (const value of values) {
    const overrides = { [paramName]: value } as Partial<LayoutConfig>;
    const result = computeHierarchicalLayout(nodes, edges, clusters, {
      configOverrides: overrides,
    });

    const metrics = computeMetrics(result, edges, nodeToCluster);
    results.push({
      paramValue: value,
      ...metrics,
    });
  }

  return results;
}

/**
 * Print parameter sweep results
 */
function printSweepResults(paramName: string, results: SweepResult[]): void {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`PARAMETER SWEEP: ${paramName}`);
  console.log(`${'═'.repeat(70)}\n`);
  console.log(
    'Value'.padStart(10) +
      ' │ Aspect │ Overlaps │ Avg Edge │ Contain% │ Strata',
  );
  console.log('─'.repeat(70));

  for (const r of results) {
    console.log(
      `${String(r.paramValue).padStart(10)} │ ` +
        `${r.aspectRatio.toFixed(2).padStart(6)} │ ` +
        `${String(r.overlapCount).padStart(8)} │ ` +
        `${r.avgEdgeLength.toFixed(0).padStart(8)} │ ` +
        `${(r.containmentRate * 100).toFixed(1).padStart(7)}% │ ` +
        `${String(r.strataCount).padStart(6)}`,
    );
  }
  console.log('');
}

// ============================================================================
// Test Suite
// ============================================================================

describe('Layout Position Review', () => {
  let nodes: GraphNode[];
  let edges: GraphEdge[];
  let clusters: Cluster[];
  let result: HierarchicalLayoutResult;
  let nodeToCluster: Map<string, string>;

  beforeAll(() => {
    nodes = tuistGraphData.nodes;
    edges = tuistGraphData.edges;
    clusters = groupIntoClusters(nodes, edges);
    clusters.forEach((cluster) => analyzeCluster(cluster, edges));
    result = computeHierarchicalLayout(nodes, edges, clusters);
    nodeToCluster = buildNodeToClusterMap(clusters);
  });

  describe('Full Position Dump', () => {
    it('prints all cluster positions sorted by stratum', () => {
      printClusterTable(result, DEFAULT_CONFIG.clusterStrataSpacing);
      expect(result.clusterPositions.size).toBeGreaterThan(0);
    });

    it('prints nodes grouped by cluster (first 5 clusters)', () => {
      // Only print first 5 clusters with max 5 nodes each to keep output readable
      const limitedResult = {
        ...result,
        clusters: result.clusters.slice(0, 5),
      };
      printNodesByCluster(limitedResult, 5);
      expect(result.nodePositions.size).toBeGreaterThan(0);
    });

    it('prints strata visualization', () => {
      printStrataVisualization(result, DEFAULT_CONFIG.clusterStrataSpacing);
      expect(result.clusterPositions.size).toBeGreaterThan(0);
    });

    it('prints layout summary', () => {
      const report = generatePositionReport(result, DEFAULT_CONFIG.clusterStrataSpacing);
      printLayoutSummary(report);
      expect(report.summary.totalClusters).toBeGreaterThan(0);
    });

    it('exports positions to JSON', () => {
      const report = generatePositionReport(result, DEFAULT_CONFIG.clusterStrataSpacing);
      const json = exportToJSON(report);
      const parsed = JSON.parse(json);

      console.log('\n═══ JSON EXPORT SAMPLE ═══\n');
      console.log('First 3 clusters:');
      console.log(JSON.stringify(parsed.clusters.slice(0, 3), null, 2));
      console.log('\nSummary:');
      console.log(JSON.stringify(parsed.summary, null, 2));

      expect(parsed.clusters.length).toBeGreaterThan(0);
      expect(parsed.summary.totalClusters).toBe(result.clusterPositions.size);
    });

    it('exports clusters to CSV', () => {
      const report = generatePositionReport(result, DEFAULT_CONFIG.clusterStrataSpacing);
      const csv = exportClustersToCSV(report);

      console.log('\n═══ CSV EXPORT SAMPLE ═══\n');
      const lines = csv.split('\n');
      console.log(lines.slice(0, 6).join('\n'));
      console.log(`... and ${lines.length - 6} more rows`);

      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('Cluster Analysis', () => {
    it('identifies hub clusters (most cross-stratum connections)', () => {
      const hubs = findHubClusters(result, edges, nodeToCluster, DEFAULT_CONFIG.clusterStrataSpacing);

      console.log('\n═══ HUB CLUSTERS (Most Cross-Stratum Connections) ═══\n');
      const topHubs = hubs.slice(0, 10);
      for (const hub of topHubs) {
        console.log(`   ${hub.clusterId.padEnd(35)} → ${hub.connectedStrata} strata`);
      }

      expect(hubs.length).toBeGreaterThan(0);
    });

    it('identifies isolated clusters (fewest connections)', () => {
      const isolated = findIsolatedClusters(result, edges, nodeToCluster);

      console.log('\n═══ ISOLATED CLUSTERS (Fewest Cross-Cluster Connections) ═══\n');
      const mostIsolated = isolated.slice(0, 10);
      for (const cluster of mostIsolated) {
        console.log(
          `   ${cluster.clusterId.padEnd(35)} → ${cluster.connectionCount} connections`,
        );
      }

      expect(isolated.length).toBeGreaterThan(0);
    });
  });
});

describe('Parameter Sensitivity Analysis', { timeout: 120000 }, () => {
  let nodes: GraphNode[];
  let edges: GraphEdge[];
  let clusters: Cluster[];
  let nodeToCluster: Map<string, string>;

  beforeAll(() => {
    nodes = tuistGraphData.nodes;
    edges = tuistGraphData.edges;
    clusters = groupIntoClusters(nodes, edges);
    clusters.forEach((cluster) => analyzeCluster(cluster, edges));
    nodeToCluster = buildNodeToClusterMap(clusters);
  });

  it('measures impact of nodeCharge variations', () => {
    const values = [-20, -35, -50, -70, -100];
    const results = runParameterSweep('nodeCharge', values, nodes, edges, clusters, nodeToCluster);
    printSweepResults('nodeCharge', results);

    // Validate results structure
    expect(results.length).toBe(values.length);
    for (const r of results) {
      expect(r.aspectRatio).toBeGreaterThan(0);
    }
  });

  it('measures impact of clusterRepulsionStrength variations', () => {
    const values = [4000, 8000, 12000, 20000, 35000];
    const results = runParameterSweep(
      'clusterRepulsionStrength',
      values,
      nodes,
      edges,
      clusters,
      nodeToCluster,
    );
    printSweepResults('clusterRepulsionStrength', results);

    expect(results.length).toBe(values.length);
  });

  it('measures impact of clusterStrataSpacing variations', () => {
    const values = [400, 600, 800, 1000, 1200];
    const results = runParameterSweep(
      'clusterStrataSpacing',
      values,
      nodes,
      edges,
      clusters,
      nodeToCluster,
    );
    printSweepResults('clusterStrataSpacing', results);

    expect(results.length).toBe(values.length);
  });

  it('measures impact of clusterMaxRowWidth variations', () => {
    const values = [600, 900, 1200, 1500, 2000];
    const results = runParameterSweep(
      'clusterMaxRowWidth',
      values,
      nodes,
      edges,
      clusters,
      nodeToCluster,
    );
    printSweepResults('clusterMaxRowWidth', results);

    expect(results.length).toBe(values.length);
  });

  it('measures impact of clusterPadding variations', () => {
    const values = [60, 90, 120, 150, 200];
    const results = runParameterSweep(
      'clusterPadding',
      values,
      nodes,
      edges,
      clusters,
      nodeToCluster,
    );
    printSweepResults('clusterPadding', results);

    expect(results.length).toBe(values.length);
  });

  it('measures impact of iterations variations', () => {
    const values = [100, 200, 300, 400, 500];
    const results = runParameterSweep('iterations', values, nodes, edges, clusters, nodeToCluster);
    printSweepResults('iterations', results);

    expect(results.length).toBe(values.length);
  });
});

describe('Multi-Parameter Optimization', { timeout: 180000 }, () => {
  let nodes: GraphNode[];
  let edges: GraphEdge[];
  let clusters: Cluster[];
  let nodeToCluster: Map<string, string>;

  beforeAll(() => {
    nodes = tuistGraphData.nodes;
    edges = tuistGraphData.edges;
    clusters = groupIntoClusters(nodes, edges);
    clusters.forEach((cluster) => analyzeCluster(cluster, edges));
    nodeToCluster = buildNodeToClusterMap(clusters);
  });

  it('finds optimal parameters for target aspect ratio ~1.5', () => {
    // Grid search over key parameters
    const nodeChargeValues = [-25, -35, -50];
    const repulsionValues = [6000, 8000, 12000];

    interface SearchResult {
      nodeCharge: number;
      repulsion: number;
      aspectRatio: number;
      overlapCount: number;
      score: number;
    }

    const results: SearchResult[] = [];

    for (const nodeCharge of nodeChargeValues) {
      for (const repulsion of repulsionValues) {
        const result = computeHierarchicalLayout(nodes, edges, clusters, {
          configOverrides: {
            nodeCharge,
            clusterRepulsionStrength: repulsion,
          },
        });

        const metrics = computeMetrics(result, edges, nodeToCluster);

        // Score: prefer aspect ratio close to 1.5, penalize overlaps
        const aspectDiff = Math.abs(metrics.aspectRatio - 1.5);
        const score = -aspectDiff - metrics.overlapCount * 0.1;

        results.push({
          nodeCharge,
          repulsion,
          aspectRatio: metrics.aspectRatio,
          overlapCount: metrics.overlapCount,
          score,
        });
      }
    }

    // Sort by score (higher is better)
    results.sort((a, b) => b.score - a.score);

    console.log('\n' + '═'.repeat(70));
    console.log('OPTIMIZATION: Target Aspect Ratio ~1.5');
    console.log('═'.repeat(70) + '\n');
    console.log('Charge  │ Repulsion │ Aspect │ Overlaps │ Score');
    console.log('─'.repeat(55));

    for (const r of results.slice(0, 9)) {
      console.log(
        `${String(r.nodeCharge).padStart(6)} │ ` +
          `${String(r.repulsion).padStart(9)} │ ` +
          `${r.aspectRatio.toFixed(2).padStart(6)} │ ` +
          `${String(r.overlapCount).padStart(8)} │ ` +
          `${r.score.toFixed(2).padStart(6)}`,
      );
    }

    console.log('\n✓ Best: nodeCharge=' + results[0]!.nodeCharge +
      ', repulsion=' + results[0]!.repulsion +
      ' → aspect=' + results[0]!.aspectRatio.toFixed(2));

    expect(results.length).toBe(9);
    expect(results[0]!.aspectRatio).toBeGreaterThan(0);
  });

  it('finds optimal parameters for minimal overlap', () => {
    // Grid search for minimal overlap
    const paddingValues = [100, 120, 150];
    const repulsionValues = [8000, 12000, 16000];

    interface SearchResult {
      padding: number;
      repulsion: number;
      aspectRatio: number;
      overlapCount: number;
    }

    const results: SearchResult[] = [];

    for (const padding of paddingValues) {
      for (const repulsion of repulsionValues) {
        const result = computeHierarchicalLayout(nodes, edges, clusters, {
          configOverrides: {
            clusterPadding: padding,
            clusterRepulsionStrength: repulsion,
          },
        });

        const metrics = computeMetrics(result, edges, nodeToCluster);

        // Only consider results with aspect ratio < 3
        if (metrics.aspectRatio <= 3) {
          results.push({
            padding,
            repulsion,
            aspectRatio: metrics.aspectRatio,
            overlapCount: metrics.overlapCount,
          });
        }
      }
    }

    // Sort by overlap count (lower is better)
    results.sort((a, b) => a.overlapCount - b.overlapCount);

    console.log('\n' + '═'.repeat(70));
    console.log('OPTIMIZATION: Minimal Overlap (aspect <= 3)');
    console.log('═'.repeat(70) + '\n');
    console.log('Padding │ Repulsion │ Aspect │ Overlaps');
    console.log('─'.repeat(45));

    for (const r of results.slice(0, 9)) {
      console.log(
        `${String(r.padding).padStart(7)} │ ` +
          `${String(r.repulsion).padStart(9)} │ ` +
          `${r.aspectRatio.toFixed(2).padStart(6)} │ ` +
          `${String(r.overlapCount).padStart(8)}`,
      );
    }

    if (results.length > 0) {
      console.log('\n✓ Best: padding=' + results[0]!.padding +
        ', repulsion=' + results[0]!.repulsion +
        ' → overlaps=' + results[0]!.overlapCount);
    }

    expect(results.length).toBeGreaterThan(0);
  });
});

describe('Current Configuration Baseline', () => {
  it('reports metrics with current DEFAULT_CONFIG', () => {
    const nodes = tuistGraphData.nodes;
    const edges = tuistGraphData.edges;
    const clusters = groupIntoClusters(nodes, edges);
    clusters.forEach((cluster) => analyzeCluster(cluster, edges));

    const result = computeHierarchicalLayout(nodes, edges, clusters);
    const nodeToCluster = buildNodeToClusterMap(clusters);
    const metrics = computeMetrics(result, edges, nodeToCluster);

    console.log('\n' + '═'.repeat(60));
    console.log('CURRENT BASELINE (DEFAULT_CONFIG)');
    console.log('═'.repeat(60) + '\n');
    console.log(`   Clusters:         ${result.clusterPositions.size}`);
    console.log(`   Nodes:            ${result.nodePositions.size}`);
    console.log(`   Aspect Ratio:     ${metrics.aspectRatio.toFixed(2)}`);
    console.log(`   Overlap Count:    ${metrics.overlapCount}`);
    console.log(`   Avg Edge Length:  ${metrics.avgEdgeLength.toFixed(0)}px`);
    console.log(`   Containment Rate: ${(metrics.containmentRate * 100).toFixed(1)}%`);
    console.log(`   Strata Count:     ${metrics.strataCount}`);
    console.log('');

    console.log('Key CONFIG values:');
    console.log(`   nodeCharge:              ${DEFAULT_CONFIG.nodeCharge}`);
    console.log(`   clusterRepulsionStrength: ${DEFAULT_CONFIG.clusterRepulsionStrength}`);
    console.log(`   clusterStrataSpacing:    ${DEFAULT_CONFIG.clusterStrataSpacing}`);
    console.log(`   clusterMaxRowWidth:      ${DEFAULT_CONFIG.clusterMaxRowWidth}`);
    console.log(`   clusterPadding:          ${DEFAULT_CONFIG.clusterPadding}`);
    console.log(`   iterations:              ${DEFAULT_CONFIG.iterations}`);
    console.log('');

    expect(metrics.aspectRatio).toBeLessThan(5);
    expect(metrics.overlapCount).toBeLessThan(50);
  });
});
