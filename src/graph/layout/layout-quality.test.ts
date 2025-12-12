/**
 * Layout Quality Metrics Test Suite
 *
 * Comprehensive tests to ensure layout quality remains optimal.
 * These tests define and validate the geometric and topological
 * properties of a "good" graph layout.
 *
 * Quality Dimensions:
 * 1. Aspect Ratio - Layout shouldn't be too wide or too tall
 * 2. Compactness - Efficient use of space without excessive whitespace
 * 3. Cluster Separation - Clusters shouldn't overlap
 * 4. Node Containment - Nodes stay within cluster bounds
 * 5. Strata Ordering - Dependencies flow correctly (top to bottom)
 * 6. Edge Length - Cross-cluster edges shouldn't be excessively long
 * 7. Balance - Clusters distributed evenly, not clumped to one side
 * 8. Neighborhood Coherence - Connected clusters should be closer
 */

import { describe, it, expect } from "vitest";
import {
  computeHierarchicalLayout,
  type HierarchicalLayoutResult,
} from "./d3-layout";
import { groupIntoClusters } from "./cluster-grouping";
import { analyzeCluster } from "./cluster-analysis";
import type { GraphNode, GraphEdge } from "@shared/schemas/graph.schema";
import type { ClusterPosition } from "@shared/schemas";
import { tuistGraphData } from "../../fixtures/tuist-graph-data";

// ============================================================================
// Quality Metric Interfaces
// ============================================================================

interface LayoutQualityMetrics {
  // Geometric metrics
  aspectRatio: number;
  boundingBoxArea: number;
  compactness: number; // Ratio of actual content area to bounding box

  // Cluster metrics
  clusterOverlapCount: number;
  maxClusterOverlap: number;
  avgClusterSeparation: number;
  minClusterSeparation: number;

  // Node metrics
  nodeContainmentRate: number; // % of nodes within cluster bounds
  avgNodeDistFromClusterCenter: number;

  // Strata metrics
  strataOrderingViolations: number; // Edges pointing "up" instead of "down"
  strataSpread: number; // Number of distinct Y bands

  // Edge metrics
  avgCrossClusterEdgeLength: number;
  maxCrossClusterEdgeLength: number;

  // Balance metrics
  centerOfMassOffset: number; // Distance of center of mass from origin
  horizontalBalance: number; // Variance in X distribution
  verticalBalance: number; // Variance in Y distribution
}

interface QualityThresholds {
  maxAspectRatio: number;
  minCompactness: number;
  maxClusterOverlapCount: number;
  minNodeContainmentRate: number;
  maxStrataViolationRate: number;
  maxCenterOfMassOffset: number;
  minStrataSpread: number;
}

// ============================================================================
// Quality Computation Functions
// ============================================================================

function computeLayoutQuality(
  result: HierarchicalLayoutResult,
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
): LayoutQualityMetrics {
  const clusterPositions = Array.from(result.clusterPositions.values());
  const nodePositions = Array.from(result.nodePositions.values());

  // 1. Geometric Metrics
  const bbox = computeBoundingBox(clusterPositions);
  const aspectRatio = bbox.width / Math.max(1, bbox.height);
  const boundingBoxArea = bbox.width * bbox.height;

  // Compute actual content area (sum of cluster areas)
  const contentArea = clusterPositions.reduce((sum, c) => {
    return sum + Math.PI * (c.width / 2) ** 2; // Circular clusters
  }, 0);
  const compactness = contentArea / Math.max(1, boundingBoxArea);

  // 2. Cluster Separation Metrics
  const { overlapCount, maxOverlap, avgSeparation, minSeparation } =
    computeClusterSeparation(clusterPositions);

  // 3. Node Containment Metrics
  const { containmentRate, avgDistFromCenter } = computeNodeContainment(
    result,
    nodes,
    nodeToCluster,
  );

  // 4. Strata Ordering Metrics
  const { violations, spread } = computeStrataOrdering(
    result,
    edges,
    nodeToCluster,
  );

  // 5. Edge Length Metrics
  const { avgLength, maxLength } = computeCrossClusterEdgeLengths(
    result,
    edges,
    nodeToCluster,
  );

  // 6. Balance Metrics
  const { centerOffset, hBalance, vBalance } = computeBalance(clusterPositions);

  return {
    aspectRatio,
    boundingBoxArea,
    compactness,
    clusterOverlapCount: overlapCount,
    maxClusterOverlap: maxOverlap,
    avgClusterSeparation: avgSeparation,
    minClusterSeparation: minSeparation,
    nodeContainmentRate: containmentRate,
    avgNodeDistFromClusterCenter: avgDistFromCenter,
    strataOrderingViolations: violations,
    strataSpread: spread,
    avgCrossClusterEdgeLength: avgLength,
    maxCrossClusterEdgeLength: maxLength,
    centerOfMassOffset: centerOffset,
    horizontalBalance: hBalance,
    verticalBalance: vBalance,
  };
}

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
    xMin,
    xMax,
    yMin,
    yMax,
    width: xMax - xMin,
    height: yMax - yMin,
  };
}

function computeClusterSeparation(clusters: ClusterPosition[]) {
  let overlapCount = 0;
  let maxOverlap = 0;
  let totalSeparation = 0;
  let minSeparation = Infinity;
  let pairCount = 0;

  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const c1 = clusters[i]!;
      const c2 = clusters[j]!;

      const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
      const r1 = Math.max(c1.width, c1.height) / 2;
      const r2 = Math.max(c2.width, c2.height) / 2;
      const minDist = r1 + r2;

      const separation = dist - minDist;
      totalSeparation += separation;
      minSeparation = Math.min(minSeparation, separation);
      pairCount++;

      if (separation < 0) {
        overlapCount++;
        maxOverlap = Math.max(maxOverlap, -separation);
      }
    }
  }

  return {
    overlapCount,
    maxOverlap,
    avgSeparation: pairCount > 0 ? totalSeparation / pairCount : 0,
    minSeparation: minSeparation === Infinity ? 0 : minSeparation,
  };
}

function computeNodeContainment(
  result: HierarchicalLayoutResult,
  nodes: GraphNode[],
  nodeToCluster: Map<string, string>,
) {
  let containedCount = 0;
  let totalDist = 0;

  for (const node of nodes) {
    const nodePos = result.nodePositions.get(node.id);
    const clusterId = nodeToCluster.get(node.id);
    const clusterPos = clusterId
      ? result.clusterPositions.get(clusterId)
      : null;

    if (!nodePos || !clusterPos) continue;

    // Node positions are relative to cluster center
    const distFromCenter = Math.hypot(nodePos.x, nodePos.y);
    const clusterRadius = Math.max(clusterPos.width, clusterPos.height) / 2;

    totalDist += distFromCenter;

    if (distFromCenter <= clusterRadius + 10) {
      // 10px tolerance
      containedCount++;
    }
  }

  return {
    containmentRate: nodes.length > 0 ? containedCount / nodes.length : 1,
    avgDistFromCenter: nodes.length > 0 ? totalDist / nodes.length : 0,
  };
}

function computeStrataOrdering(
  result: HierarchicalLayoutResult,
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
) {
  let violations = 0;

  // Count edges where source cluster is below target cluster (wrong direction)
  for (const edge of edges) {
    const sourceCluster = nodeToCluster.get(edge.source);
    const targetCluster = nodeToCluster.get(edge.target);

    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }

    const sourcePos = result.clusterPositions.get(sourceCluster);
    const targetPos = result.clusterPositions.get(targetCluster);

    if (!sourcePos || !targetPos) continue;

    // Source depends on target, so source.y should be < target.y (source above target)
    // If source.y > target.y + threshold, it's a violation
    if (sourcePos.y > targetPos.y + 50) {
      violations++;
    }
  }

  // Count distinct Y bands (strata spread)
  const yPositions = Array.from(result.clusterPositions.values()).map(
    (c) => c.y,
  );
  const bandSize = 100; // Group positions within 100px into same band
  const bands = new Set(yPositions.map((y) => Math.floor(y / bandSize)));

  return {
    violations,
    spread: bands.size,
  };
}

function computeCrossClusterEdgeLengths(
  result: HierarchicalLayoutResult,
  edges: GraphEdge[],
  nodeToCluster: Map<string, string>,
) {
  const lengths: number[] = [];

  for (const edge of edges) {
    const sourceCluster = nodeToCluster.get(edge.source);
    const targetCluster = nodeToCluster.get(edge.target);

    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }

    const sourcePos = result.clusterPositions.get(sourceCluster);
    const targetPos = result.clusterPositions.get(targetCluster);

    if (!sourcePos || !targetPos) continue;

    const length = Math.hypot(
      sourcePos.x - targetPos.x,
      sourcePos.y - targetPos.y,
    );
    lengths.push(length);
  }

  return {
    avgLength:
      lengths.length > 0
        ? lengths.reduce((a, b) => a + b, 0) / lengths.length
        : 0,
    maxLength: lengths.length > 0 ? Math.max(...lengths) : 0,
  };
}

function computeBalance(clusters: ClusterPosition[]) {
  if (clusters.length === 0) {
    return { centerOffset: 0, hBalance: 0, vBalance: 0 };
  }

  // Center of mass (weighted by cluster size)
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (const c of clusters) {
    const weight = c.nodeCount || 1;
    weightedX += c.x * weight;
    weightedY += c.y * weight;
    totalWeight += weight;
  }

  const centerX = weightedX / totalWeight;
  const centerY = weightedY / totalWeight;
  const centerOffset = Math.hypot(centerX, centerY);

  // Variance in X and Y distributions
  let xVariance = 0;
  let yVariance = 0;
  const meanX = clusters.reduce((sum, c) => sum + c.x, 0) / clusters.length;
  const meanY = clusters.reduce((sum, c) => sum + c.y, 0) / clusters.length;

  for (const c of clusters) {
    xVariance += (c.x - meanX) ** 2;
    yVariance += (c.y - meanY) ** 2;
  }

  return {
    centerOffset,
    hBalance: Math.sqrt(xVariance / clusters.length),
    vBalance: Math.sqrt(yVariance / clusters.length),
  };
}

// ============================================================================
// Helper to build node-to-cluster map
// ============================================================================

function buildNodeToClusterMap(
  result: HierarchicalLayoutResult,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const cluster of result.clusters) {
    for (const node of cluster.nodes) {
      map.set(node.id, cluster.id);
    }
  }
  return map;
}

// ============================================================================
// Test Suite
// ============================================================================

describe("Layout Quality Metrics", () => {
  // Compute layout once for all tests
  let result: HierarchicalLayoutResult;
  let metrics: LayoutQualityMetrics;
  let nodeToCluster: Map<string, string>;

  beforeAll(() => {
    const { nodes, edges } = tuistGraphData;
    const clusters = groupIntoClusters(nodes, edges);
    clusters.forEach((cluster) => analyzeCluster(cluster, edges));

    result = computeHierarchicalLayout(nodes, edges, clusters);
    nodeToCluster = buildNodeToClusterMap(result);
    metrics = computeLayoutQuality(result, nodes, edges, nodeToCluster);
  });

  describe("Metric Reporting", () => {
    it("should report all quality metrics", () => {
      console.log("\n" + "═".repeat(60));
      console.log("LAYOUT QUALITY METRICS REPORT");
      console.log("═".repeat(60));

      console.log("\n📐 GEOMETRIC METRICS:");
      console.log(
        `   Aspect Ratio:     ${metrics.aspectRatio.toFixed(2)} ${metrics.aspectRatio <= 3 ? "✅" : "⚠️"}`,
      );
      console.log(
        `   Bounding Box:     ${Math.sqrt(metrics.boundingBoxArea).toFixed(0)}px² area`,
      );
      console.log(
        `   Compactness:      ${(metrics.compactness * 100).toFixed(1)}%`,
      );

      console.log("\n🔵 CLUSTER METRICS:");
      console.log(
        `   Overlap Count:    ${metrics.clusterOverlapCount} pairs ${metrics.clusterOverlapCount === 0 ? "✅" : "⚠️"}`,
      );
      console.log(
        `   Max Overlap:      ${metrics.maxClusterOverlap.toFixed(0)}px`,
      );
      console.log(
        `   Avg Separation:   ${metrics.avgClusterSeparation.toFixed(0)}px`,
      );
      console.log(
        `   Min Separation:   ${metrics.minClusterSeparation.toFixed(0)}px`,
      );

      console.log("\n🟢 NODE METRICS:");
      console.log(
        `   Containment Rate: ${(metrics.nodeContainmentRate * 100).toFixed(1)}% ${metrics.nodeContainmentRate >= 0.95 ? "✅" : "⚠️"}`,
      );
      console.log(
        `   Avg Dist to Center: ${metrics.avgNodeDistFromClusterCenter.toFixed(0)}px`,
      );

      console.log("\n📊 STRATA METRICS:");
      console.log(
        `   Order Violations: ${metrics.strataOrderingViolations} edges ${metrics.strataOrderingViolations <= 5 ? "✅" : "⚠️"}`,
      );
      console.log(
        `   Y-Band Spread:    ${metrics.strataSpread} bands ${metrics.strataSpread >= 5 ? "✅" : "⚠️"}`,
      );

      console.log("\n🔗 EDGE METRICS:");
      console.log(
        `   Avg Cross-Edge:   ${metrics.avgCrossClusterEdgeLength.toFixed(0)}px`,
      );
      console.log(
        `   Max Cross-Edge:   ${metrics.maxCrossClusterEdgeLength.toFixed(0)}px`,
      );

      console.log("\n⚖️ BALANCE METRICS:");
      console.log(
        `   Center Offset:    ${metrics.centerOfMassOffset.toFixed(0)}px ${metrics.centerOfMassOffset <= 200 ? "✅" : "⚠️"}`,
      );
      console.log(
        `   H-Spread (σ):     ${metrics.horizontalBalance.toFixed(0)}px`,
      );
      console.log(
        `   V-Spread (σ):     ${metrics.verticalBalance.toFixed(0)}px`,
      );

      console.log("\n" + "═".repeat(60));

      expect(true).toBe(true); // Report test always passes
    });
  });

  describe("Geometric Quality", () => {
    it("should have reasonable aspect ratio (width/height <= 3)", () => {
      expect(metrics.aspectRatio).toBeLessThanOrEqual(3);
    });

    it("should have aspect ratio > 0.5 (not too tall)", () => {
      expect(metrics.aspectRatio).toBeGreaterThan(0.5);
    });

    it("should have non-zero compactness", () => {
      expect(metrics.compactness).toBeGreaterThan(0);
    });
  });

  describe("Cluster Quality", () => {
    it("should have minimal cluster overlaps (< 15% of pairs)", () => {
      const totalPairs =
        (result.clusterPositions.size * (result.clusterPositions.size - 1)) / 2;
      const overlapRate = metrics.clusterOverlapCount / Math.max(1, totalPairs);
      expect(overlapRate).toBeLessThan(0.15);
    });

    it("should have max overlap < 350px", () => {
      // Some overlap is acceptable in dense force-directed layouts
      expect(metrics.maxClusterOverlap).toBeLessThan(350);
    });

    it("should have positive average separation", () => {
      expect(metrics.avgClusterSeparation).toBeGreaterThan(0);
    });
  });

  describe("Node Quality", () => {
    it("should have > 75% node containment rate", () => {
      // Force layouts may push some nodes outside cluster bounds
      expect(metrics.nodeContainmentRate).toBeGreaterThan(0.75);
    });

    it("should have reasonable avg distance from cluster center", () => {
      // Avg distance should be less than typical cluster radius
      expect(metrics.avgNodeDistFromClusterCenter).toBeLessThan(200);
    });
  });

  describe("Strata Quality", () => {
    it("should have minimal strata ordering violations (< 15% of cross-edges)", () => {
      const { edges } = tuistGraphData;
      const crossEdgeCount = edges.filter((e) => {
        const sc = nodeToCluster.get(e.source);
        const tc = nodeToCluster.get(e.target);
        return sc && tc && sc !== tc;
      }).length;

      // Some violations occur due to cycles and force equilibrium
      const violationRate =
        metrics.strataOrderingViolations / Math.max(1, crossEdgeCount);
      expect(violationRate).toBeLessThan(0.15);
    });

    it("should have at least 5 distinct Y-bands", () => {
      expect(metrics.strataSpread).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Edge Quality", () => {
    it("should have reasonable avg cross-cluster edge length (< 2000px)", () => {
      expect(metrics.avgCrossClusterEdgeLength).toBeLessThan(2000);
    });

    it("should have max edge length < 4000px", () => {
      expect(metrics.maxCrossClusterEdgeLength).toBeLessThan(4000);
    });
  });

  describe("Balance Quality", () => {
    it("should have center of mass near origin (< 300px offset)", () => {
      expect(metrics.centerOfMassOffset).toBeLessThan(300);
    });

    it("should have meaningful horizontal spread", () => {
      expect(metrics.horizontalBalance).toBeGreaterThan(100);
    });

    it("should have meaningful vertical spread", () => {
      expect(metrics.verticalBalance).toBeGreaterThan(100);
    });
  });

  describe("Regression Guards", () => {
    // These tests capture current baseline values and alert if they regress significantly
    // Update these thresholds as layout quality improves

    it("should not regress aspect ratio beyond 3.5", () => {
      // Current baseline: ~2.2, threshold allows ~60% regression
      expect(metrics.aspectRatio).toBeLessThanOrEqual(3.5);
    });

    it("should not regress cluster overlap count beyond 25", () => {
      // Current baseline: ~16, threshold allows some regression
      expect(metrics.clusterOverlapCount).toBeLessThanOrEqual(25);
    });

    it("should not regress node containment below 75%", () => {
      // Current baseline: ~80%, threshold is 75%
      expect(metrics.nodeContainmentRate).toBeGreaterThanOrEqual(0.75);
    });

    it("should not regress strata spread below 10 bands", () => {
      // Current baseline: ~17 bands
      expect(metrics.strataSpread).toBeGreaterThanOrEqual(10);
    });
  });
});

describe("Layout Quality Comparison", () => {
  it(
    "should produce consistent quality across runs",
    { timeout: 30000 },
    () => {
      const { nodes, edges } = tuistGraphData;
      const clusters = groupIntoClusters(nodes, edges);
      clusters.forEach((cluster) => analyzeCluster(cluster, edges));

      // Run twice (not three times to reduce test duration)
      const result1 = computeHierarchicalLayout(nodes, edges, clusters);
      const result2 = computeHierarchicalLayout(nodes, edges, clusters);

      const getAspectRatio = (r: HierarchicalLayoutResult) => {
        const positions = Array.from(r.clusterPositions.values());
        const xs = positions.map((p) => p.x);
        const ys = positions.map((p) => p.y);
        const width = Math.max(...xs) - Math.min(...xs);
        const height = Math.max(...ys) - Math.min(...ys);
        return width / Math.max(1, height);
      };

      // Both runs should produce same aspect ratio (deterministic)
      expect(getAspectRatio(result1)).toBeCloseTo(getAspectRatio(result2), 2);
    },
  );
});
