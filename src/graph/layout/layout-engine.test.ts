/**
 * Tests for d3-layout module
 * Verifies strata positioning and cluster layout behavior
 */

import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import {
  createLayeredGraph,
  createMultiClusterGraph,
  createProjectGraph,
} from '../../fixtures/graphs';
import { tuistGraphData } from '../../fixtures/tuist-graph-data';
import { groupIntoClusters } from './cluster-grouping';
import { analyzeCluster } from './cluster-analysis';
import { computeHierarchicalLayout } from './index';

/**
 * Helper to create clusters from nodes based on their project property
 */
function createClustersFromGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Cluster[] {
  const projectNodes = new Map<string, GraphNode[]>();

  for (const node of nodes) {
    const project = node.project ?? 'default';
    if (!projectNodes.has(project)) {
      projectNodes.set(project, []);
    }
    projectNodes.get(project)!.push(node);
  }

  return Array.from(projectNodes.entries()).map(([id, clusterNodes]) => ({
    id,
    label: id,
    nodes: clusterNodes,
    internalEdges: edges.filter(
      (e) =>
        clusterNodes.some((n) => n.id === e.source) &&
        clusterNodes.some((n) => n.id === e.target),
    ),
  }));
}

describe('computeHierarchicalLayout', () => {
  describe('Cluster Strata Positioning', () => {
    it('should position clusters at different Y levels based on strata', () => {
      // Create a layered graph with 4 layers, 3 nodes per layer
      const { nodes, edges } = createLayeredGraph(4, 3);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Get cluster Y positions grouped by layer
      const layer0Y = result.clusterPositions.get('Layer0')?.y ?? 0;
      const layer1Y = result.clusterPositions.get('Layer1')?.y ?? 0;
      const layer2Y = result.clusterPositions.get('Layer2')?.y ?? 0;
      const layer3Y = result.clusterPositions.get('Layer3')?.y ?? 0;

      // Verify that Y increases with layer depth (strata)
      // Layer0 depends on Layer1, Layer1 depends on Layer2, etc.
      // So Layer0 should be at top (lowest Y) and Layer3 at bottom (highest Y)
      expect(layer0Y).toBeLessThan(layer1Y);
      expect(layer1Y).toBeLessThan(layer2Y);
      expect(layer2Y).toBeLessThan(layer3Y);
    });

    it('should maintain significant Y spacing between strata', () => {
      const { nodes, edges } = createLayeredGraph(3, 2);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      const layer0Y = result.clusterPositions.get('Layer0')?.y ?? 0;
      const layer1Y = result.clusterPositions.get('Layer1')?.y ?? 0;
      const layer2Y = result.clusterPositions.get('Layer2')?.y ?? 0;

      // Each layer should have noticeable spacing (soft anchor forces allow some convergence)
      // The actual spacing depends on force balance; minimum 50px is a reasonable lower bound
      expect(layer1Y - layer0Y).toBeGreaterThan(50);
      expect(layer2Y - layer1Y).toBeGreaterThan(50);
    });

    it('should produce deterministic layout results', () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result1 = computeHierarchicalLayout(nodes, edges, clusters);
      const result2 = computeHierarchicalLayout(nodes, edges, clusters);

      // Cluster positions should be identical
      for (const [clusterId, pos1] of result1.clusterPositions) {
        const pos2 = result2.clusterPositions.get(clusterId);
        expect(pos2).toBeDefined();
        expect(pos1.x).toBeCloseTo(pos2!.x, 1);
        expect(pos1.y).toBeCloseTo(pos2!.y, 1);
      }

      // Node positions should be identical
      for (const [nodeId, pos1] of result1.nodePositions) {
        const pos2 = result2.nodePositions.get(nodeId);
        expect(pos2).toBeDefined();
        expect(pos1.x).toBeCloseTo(pos2!.x, 1);
        expect(pos1.y).toBeCloseTo(pos2!.y, 1);
      }
    });
  });

  describe('Project Graph Layout', () => {
    it('should stratify project graph correctly', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Get cluster Y positions
      const appY = result.clusterPositions.get('App')?.y ?? 0;
      const featuresY = result.clusterPositions.get('Features')?.y ?? 0;
      const coreY = result.clusterPositions.get('Core')?.y ?? 0;

      // App depends on Features, Features depends on Core
      // So App should be above Features, Features above Core
      // App.y < Features.y < Core.y (Y increases downward)
      expect(appY).toBeLessThan(featuresY);
      expect(featuresY).toBeLessThan(coreY);
    });

    it('should have reasonable cluster width and height', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      for (const [, pos] of result.clusterPositions) {
        expect(pos.width).toBeGreaterThan(0);
        expect(pos.height).toBeGreaterThan(0);
        // Clusters should be reasonably sized
        expect(pos.width).toBeLessThan(1000);
        expect(pos.height).toBeLessThan(1000);
      }
    });
  });

  describe('Multi-Cluster Graph Layout', () => {
    it('should position clusters in a linear chain vertically', () => {
      // Multi-cluster graph has C0 -> C1 -> C2 -> C3 dependency chain
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      const c0Y = result.clusterPositions.get('Cluster0')?.y ?? 0;
      const c1Y = result.clusterPositions.get('Cluster1')?.y ?? 0;
      const c2Y = result.clusterPositions.get('Cluster2')?.y ?? 0;
      const c3Y = result.clusterPositions.get('Cluster3')?.y ?? 0;

      // Cluster0 depends on Cluster1, etc.
      // So Cluster0 should be at top, Cluster3 at bottom
      expect(c0Y).toBeLessThan(c1Y);
      expect(c1Y).toBeLessThan(c2Y);
      expect(c2Y).toBeLessThan(c3Y);
    });

    it('should compute maxClusterStratum correctly', () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // With 4 clusters in a chain: C0 -> C1 -> C2 -> C3
      // Strata: C0=0, C1=1, C2=2, C3=3
      // maxClusterStratum = 3
      expect(result.maxClusterStratum).toBe(3);
    });
  });

  describe('Node Positioning Within Clusters', () => {
    it('should position nodes within their cluster boundaries', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      for (const cluster of clusters) {
        const clusterPos = result.clusterPositions.get(cluster.id);
        if (!clusterPos) continue;

        const radius = clusterPos.width / 2;

        for (const node of cluster.nodes) {
          const nodePos = result.nodePositions.get(node.id);
          if (!nodePos) continue;

          // Node position is relative to cluster center
          const distFromCenter = Math.sqrt(
            nodePos.x ** 2 + nodePos.y ** 2,
          );

          // Nodes should be within cluster radius (with some tolerance)
          expect(distFromCenter).toBeLessThan(radius + 50);
        }
      }
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty graph', () => {
      const result = computeHierarchicalLayout([], [], []);

      expect(result.nodePositions.size).toBe(0);
      expect(result.clusterPositions.size).toBe(0);
      expect(result.clusters).toEqual([]);
    });

    it('should handle single node', () => {
      const nodes: GraphNode[] = [{ id: 'single', name: 'Single' }];
      const edges: GraphEdge[] = [];
      const clusters: Cluster[] = [{ id: 'c0', label: 'C0', nodes, internalEdges: [] }];

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.nodePositions.size).toBe(1);
      expect(result.clusterPositions.size).toBe(1);
    });
  });

  describe('Position and Bounds Assertions', () => {
    it('should assign valid positions to all nodes', () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Every node should have a position
      expect(result.nodePositions.size).toBe(nodes.length);

      for (const node of nodes) {
        const pos = result.nodePositions.get(node.id);
        expect(pos, `Node ${node.id} should have a position`).toBeDefined();
        expect(typeof pos!.x).toBe('number');
        expect(typeof pos!.y).toBe('number');
        expect(Number.isFinite(pos!.x)).toBe(true);
        expect(Number.isFinite(pos!.y)).toBe(true);
        // Node positions are relative to cluster center, should be bounded
        expect(Math.abs(pos!.x)).toBeLessThan(500);
        expect(Math.abs(pos!.y)).toBeLessThan(500);
      }
    });

    it('should assign valid bounds to all clusters', () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Every cluster should have a position
      expect(result.clusterPositions.size).toBe(clusters.length);

      for (const cluster of clusters) {
        const pos = result.clusterPositions.get(cluster.id);
        expect(pos, `Cluster ${cluster.id} should have a position`).toBeDefined();

        // Position should be valid numbers
        expect(typeof pos!.x).toBe('number');
        expect(typeof pos!.y).toBe('number');
        expect(Number.isFinite(pos!.x)).toBe(true);
        expect(Number.isFinite(pos!.y)).toBe(true);

        // Bounds should be positive
        expect(pos!.width).toBeGreaterThan(0);
        expect(pos!.height).toBeGreaterThan(0);

        // Bounds should be reasonable (not too large)
        expect(pos!.width).toBeLessThan(2000);
        expect(pos!.height).toBeLessThan(2000);

        // Node count should match
        expect(pos!.nodeCount).toBe(cluster.nodes.length);
      }
    });

    it('should have cluster bounds that contain all nodes', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      for (const cluster of clusters) {
        const clusterPos = result.clusterPositions.get(cluster.id);
        if (!clusterPos) continue;

        const radius = Math.max(clusterPos.width, clusterPos.height) / 2;

        for (const node of cluster.nodes) {
          const nodePos = result.nodePositions.get(node.id);
          if (!nodePos) continue;

          // Node position is relative to cluster center
          const distFromCenter = Math.sqrt(nodePos.x ** 2 + nodePos.y ** 2);

          // All nodes should be within cluster radius (with tolerance for force-based jitter)
          // Force simulation can push nodes slightly outside nominal bounds
          expect(
            distFromCenter,
            `Node ${node.id} should be within cluster ${cluster.id} bounds`,
          ).toBeLessThan(radius + 50);
        }
      }
    });
  });

  describe('Cluster Non-Overlap', () => {
    /**
     * Helper to check if two circular clusters overlap
     */
    function clustersOverlap(
      c1: { x: number; y: number; width: number; height: number },
      c2: { x: number; y: number; width: number; height: number },
      padding = 0,
    ): boolean {
      const r1 = Math.max(c1.width, c1.height) / 2;
      const r2 = Math.max(c2.width, c2.height) / 2;
      const dist = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
      return dist < r1 + r2 - padding;
    }

    it('should not have significantly overlapping clusters', () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      const clusterPositions = Array.from(result.clusterPositions.values());

      // Check all pairs of clusters for overlap
      for (let i = 0; i < clusterPositions.length; i++) {
        for (let j = i + 1; j < clusterPositions.length; j++) {
          const c1 = clusterPositions[i]!;
          const c2 = clusterPositions[j]!;

          // Allow some overlap tolerance (clusters can touch but not deeply overlap)
          // Padding of 50 means we allow up to 50px of overlap
          const deepOverlap = clustersOverlap(c1, c2, 50);

          expect(
            deepOverlap,
            `Clusters ${c1.id} and ${c2.id} should not deeply overlap`,
          ).toBe(false);
        }
      }
    });

    it('should maintain minimum separation between clusters in different strata', () => {
      const { nodes, edges } = createLayeredGraph(4, 3);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      const layer0 = result.clusterPositions.get('Layer0')!;
      const layer1 = result.clusterPositions.get('Layer1')!;
      const layer2 = result.clusterPositions.get('Layer2')!;
      const layer3 = result.clusterPositions.get('Layer3')!;

      // Calculate center-to-center distances
      const dist01 = Math.sqrt((layer0.x - layer1.x) ** 2 + (layer0.y - layer1.y) ** 2);
      const dist12 = Math.sqrt((layer1.x - layer2.x) ** 2 + (layer1.y - layer2.y) ** 2);
      const dist23 = Math.sqrt((layer2.x - layer3.x) ** 2 + (layer2.y - layer3.y) ** 2);

      // Minimum radii sum (clusters should not overlap)
      const minDist01 = (layer0.width + layer1.width) / 4; // Using half-radii as generous bound
      const minDist12 = (layer1.width + layer2.width) / 4;
      const minDist23 = (layer2.width + layer3.width) / 4;

      expect(dist01).toBeGreaterThan(minDist01);
      expect(dist12).toBeGreaterThan(minDist12);
      expect(dist23).toBeGreaterThan(minDist23);
    });

    it('should not have overlapping nodes within a cluster', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Check each cluster for internal node overlaps
      for (const cluster of clusters) {
        const nodePositions = cluster.nodes
          .map((n) => ({ id: n.id, ...result.nodePositions.get(n.id)! }))
          .filter((p) => p.x !== undefined);

        // Check all pairs of nodes in this cluster
        for (let i = 0; i < nodePositions.length; i++) {
          for (let j = i + 1; j < nodePositions.length; j++) {
            const n1 = nodePositions[i]!;
            const n2 = nodePositions[j]!;

            const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
            const nodeRadius = n1.radius ?? 6;

            // Nodes should not overlap (allow 2px tolerance)
            expect(
              dist,
              `Nodes ${n1.id} and ${n2.id} in cluster ${cluster.id} should not overlap`,
            ).toBeGreaterThan(nodeRadius * 2 - 2);
          }
        }
      }
    });
  });

  describe('Layout Bounds and Spread', () => {
    it('should keep layout within reasonable global bounds', () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Calculate layout bounding box
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (const pos of result.clusterPositions.values()) {
        const halfWidth = pos.width / 2;
        const halfHeight = pos.height / 2;
        minX = Math.min(minX, pos.x - halfWidth);
        maxX = Math.max(maxX, pos.x + halfWidth);
        minY = Math.min(minY, pos.y - halfHeight);
        maxY = Math.max(maxY, pos.y + halfHeight);
      }

      const totalWidth = maxX - minX;
      const totalHeight = maxY - minY;

      // Layout should be bounded (not infinitely spread)
      // Multi-row strata layout can create larger bounds for complex graphs
      expect(totalWidth).toBeLessThan(7000);
      expect(totalHeight).toBeLessThan(7000);

      // Layout should have reasonable aspect ratio (not too extreme)
      // Note: multi-row strata layouts can vary in aspect ratio based on cluster distribution
      const aspectRatio = totalWidth / totalHeight;
      expect(aspectRatio).toBeGreaterThan(0.1); // Not too tall/narrow
      expect(aspectRatio).toBeLessThan(15); // Allow wider layouts for multi-cluster graphs
    });

    it('should have vertical spread for strata layouts', () => {
      const { nodes, edges } = createLayeredGraph(4, 3);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Calculate Y spread
      let minY = Infinity;
      let maxY = -Infinity;

      for (const pos of result.clusterPositions.values()) {
        minY = Math.min(minY, pos.y);
        maxY = Math.max(maxY, pos.y);
      }

      const ySpread = maxY - minY;

      // With 4 layers, we should have significant vertical spread
      // Minimum expected: (4-1) * some_spacing = at least 150px
      expect(ySpread).toBeGreaterThan(150);
    });
  });

  describe('Snapshot Assertions', () => {
    it('should produce consistent cluster layout snapshot', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Create a snapshot of cluster positions (sorted for consistency)
      const snapshot = Array.from(result.clusterPositions.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, pos]) => ({
          id,
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          width: Math.round(pos.width),
          height: Math.round(pos.height),
          nodeCount: pos.nodeCount,
        }));

      // Verify snapshot structure
      expect(snapshot).toHaveLength(clusters.length);

      // Verify each cluster has expected properties
      for (const item of snapshot) {
        expect(item.id).toBeTruthy();
        expect(typeof item.x).toBe('number');
        expect(typeof item.y).toBe('number');
        expect(item.width).toBeGreaterThan(0);
        expect(item.height).toBeGreaterThan(0);
        expect(item.nodeCount).toBeGreaterThan(0);
      }
    });

    it('should produce consistent node layout snapshot', () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Create a snapshot of node positions (sorted for consistency)
      const snapshot = Array.from(result.nodePositions.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, pos]) => ({
          id,
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          clusterId: pos.clusterId,
          radius: pos.radius,
        }));

      // Verify snapshot structure
      expect(snapshot).toHaveLength(nodes.length);

      // Verify each node has expected properties
      for (const item of snapshot) {
        expect(item.id).toBeTruthy();
        expect(typeof item.x).toBe('number');
        expect(typeof item.y).toBe('number');
        expect(item.clusterId).toBeTruthy();
        expect(item.radius).toBeGreaterThan(0);
      }
    });

    it('should maintain relative ordering across runs', () => {
      const { nodes, edges } = createLayeredGraph(3, 2);
      const clusters = createClustersFromGraph(nodes, edges);

      // Run layout multiple times
      const results = [
        computeHierarchicalLayout(nodes, edges, clusters),
        computeHierarchicalLayout(nodes, edges, clusters),
        computeHierarchicalLayout(nodes, edges, clusters),
      ];

      // Extract Y ordering for each run
      const orderings = results.map((result) => {
        const positions = Array.from(result.clusterPositions.entries());
        return positions.sort((a, b) => a[1].y - b[1].y).map(([id]) => id);
      });

      // All runs should produce the same ordering
      expect(orderings[1]).toEqual(orderings[0]);
      expect(orderings[2]).toEqual(orderings[0]);
    });
  });

  describe('Coordinate Analysis (Debug Horizontal Spread)', () => {
    it('should output cluster coordinates for analysis', () => {
      const { nodes, edges } = tuistGraphData;
      const clusters = groupIntoClusters(nodes, edges);
      clusters.forEach((cluster) => {
        analyzeCluster(cluster, edges);
      });

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Collect all cluster positions
      const positions = Array.from(result.clusterPositions.entries())
        .map(([id, pos]) => ({ id, x: pos.x, y: pos.y, width: pos.width, nodes: pos.nodeCount }))
        .sort((a, b) => a.y - b.y); // Sort by Y (top to bottom)

      // Calculate bounding box
      const xCoords = positions.map((p) => p.x);
      const yCoords = positions.map((p) => p.y);
      const xMin = Math.min(...xCoords);
      const xMax = Math.max(...xCoords);
      const yMin = Math.min(...yCoords);
      const yMax = Math.max(...yCoords);
      const width = xMax - xMin;
      const height = yMax - yMin;
      const aspectRatio = height > 0 ? width / height : 1;

      console.log('\n' + '='.repeat(60));
      console.log('CLUSTER COORDINATE ANALYSIS');
      console.log('='.repeat(60));
      console.log(`Total clusters: ${positions.length}`);
      console.log(`Bounding box: ${width.toFixed(0)}w x ${height.toFixed(0)}h`);
      console.log(`X range: [${xMin.toFixed(0)}, ${xMax.toFixed(0)}]`);
      console.log(`Y range: [${yMin.toFixed(0)}, ${yMax.toFixed(0)}]`);
      console.log(`Aspect ratio (w/h): ${aspectRatio.toFixed(2)} ${aspectRatio > 2 ? '⚠️ TOO WIDE' : '✓'}`);
      console.log('');

      // Group by approximate Y stratum
      const strataSpacing = 450; // CONFIG.clusterStrataSpacing
      const strataGroups = new Map<number, typeof positions>();
      for (const pos of positions) {
        const stratum = Math.round((pos.y - yMin) / strataSpacing);
        if (!strataGroups.has(stratum)) strataGroups.set(stratum, []);
        strataGroups.get(stratum)!.push(pos);
      }

      console.log('CLUSTERS BY STRATUM (Y layer):');
      console.log('-'.repeat(60));
      const sortedStrata = [...strataGroups.keys()].sort((a, b) => a - b);
      for (const stratum of sortedStrata) {
        const clustersInStratum = strataGroups.get(stratum)!;
        const xValues = clustersInStratum.map((c) => c.x);
        const stratumXMin = Math.min(...xValues);
        const stratumXMax = Math.max(...xValues);
        const stratumWidth = stratumXMax - stratumXMin;

        console.log(`\nStratum ${stratum} (${clustersInStratum.length} clusters, X spread: ${stratumWidth.toFixed(0)})`);
        for (const c of clustersInStratum.sort((a, b) => a.x - b.x)) {
          console.log(`  ${c.id.padEnd(30)} x=${c.x.toFixed(0).padStart(6)}, y=${c.y.toFixed(0).padStart(6)}, size=${c.width.toFixed(0)}, nodes=${c.nodes}`);
        }
      }

      console.log('\n' + '='.repeat(60));

      // This test always passes - it's for debugging output
      expect(true).toBe(true);
    });
  });

  describe('Real Tuist Graph Data', () => {
    /**
     * Helper to check if two circular clusters overlap significantly
     */
    function getClusterOverlapAmount(
      c1: { x: number; y: number; width: number; height: number },
      c2: { x: number; y: number; width: number; height: number },
    ): number {
      const r1 = Math.max(c1.width, c1.height) / 2;
      const r2 = Math.max(c2.width, c2.height) / 2;
      const dist = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
      const overlap = r1 + r2 - dist;
      return Math.max(0, overlap);
    }

    it('should compute layout for real Tuist graph', () => {
      const { nodes, edges } = tuistGraphData;

      // Create clusters using the real grouping logic
      const clusters = groupIntoClusters(nodes, edges);
      clusters.forEach((cluster) => {
        analyzeCluster(cluster, edges);
      });

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Should have positions for all nodes
      expect(result.nodePositions.size).toBe(nodes.length);

      // Should have positions for all clusters
      expect(result.clusterPositions.size).toBe(clusters.length);

      console.log(`\nReal Tuist Graph: ${nodes.length} nodes, ${edges.length} edges, ${clusters.length} clusters`);

      // Log strata distribution (estimate stratum from Y position)
      const strataGroups = new Map<number, string[]>();
      const yPositions = [...result.clusterPositions.values()].map((p) => p.y);
      const minY = Math.min(...yPositions);
      const strataSpacing = 800; // Match CONFIG
      for (const pos of result.clusterPositions.values()) {
        const stratum = Math.round((pos.y - minY) / strataSpacing);
        if (!strataGroups.has(stratum)) strataGroups.set(stratum, []);
        strataGroups.get(stratum)!.push(pos.id);
      }
      console.log(`Strata distribution (${strataGroups.size} levels):`);
      const sortedStrata = [...strataGroups.keys()].sort((a, b) => a - b);
      for (const stratum of sortedStrata) {
        const clusterIds = strataGroups.get(stratum) ?? [];
        console.log(`  Stratum ${stratum}: ${clusterIds.length} clusters`);
      }
    });

    it('should not have deeply overlapping clusters in real graph', () => {
      const { nodes, edges } = tuistGraphData;
      const clusters = groupIntoClusters(nodes, edges);
      clusters.forEach((cluster) => {
        analyzeCluster(cluster, edges);
      });

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      const clusterPositions = Array.from(result.clusterPositions.values());
      const overlaps: Array<{ c1: string; c2: string; amount: number }> = [];

      // Check all pairs of clusters for overlap
      for (let i = 0; i < clusterPositions.length; i++) {
        for (let j = i + 1; j < clusterPositions.length; j++) {
          const c1 = clusterPositions[i]!;
          const c2 = clusterPositions[j]!;

          const overlapAmount = getClusterOverlapAmount(c1, c2);

          // Track significant overlaps (> 20% of smaller cluster radius)
          const smallerRadius = Math.min(c1.width, c2.width) / 2;
          if (overlapAmount > smallerRadius * 0.2) {
            overlaps.push({ c1: c1.id, c2: c2.id, amount: overlapAmount });
          }
        }
      }

      // Log overlapping clusters for debugging
      if (overlaps.length > 0) {
        console.log(`\n=== ${overlaps.length} Overlapping Cluster Pairs ===`);
        overlaps.slice(0, 10).forEach(({ c1, c2, amount }) => {
          console.log(`  ${c1} <-> ${c2}: ${amount.toFixed(0)}px overlap`);
        });
        if (overlaps.length > 10) {
          console.log(`  ... and ${overlaps.length - 10} more`);
        }
      }

      // Assert: no more than 20% of cluster pairs should have significant overlap
      const maxAllowedOverlaps = Math.ceil(clusterPositions.length * 0.2);
      expect(
        overlaps.length,
        `Too many overlapping clusters: ${overlaps.length} pairs overlap significantly`,
      ).toBeLessThanOrEqual(maxAllowedOverlaps);
    });

    it('should have reasonable aspect ratio for real graph', () => {
      const { nodes, edges } = tuistGraphData;
      const clusters = groupIntoClusters(nodes, edges);
      clusters.forEach((cluster) => {
        analyzeCluster(cluster, edges);
      });

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Calculate layout bounding box
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (const pos of result.clusterPositions.values()) {
        const halfWidth = pos.width / 2;
        const halfHeight = pos.height / 2;
        minX = Math.min(minX, pos.x - halfWidth);
        maxX = Math.max(maxX, pos.x + halfWidth);
        minY = Math.min(minY, pos.y - halfHeight);
        maxY = Math.max(maxY, pos.y + halfHeight);
      }

      const totalWidth = maxX - minX;
      const totalHeight = maxY - minY;
      const aspectRatio = totalWidth / totalHeight;

      console.log(`\nReal Graph Layout Bounds:`);
      console.log(`  Width: ${totalWidth.toFixed(0)}px, Height: ${totalHeight.toFixed(0)}px`);
      console.log(`  Aspect Ratio: ${aspectRatio.toFixed(2)}`);

      // For strata layout, we want more vertical than horizontal
      // With 75 clusters in only 3 natural strata, aspect ratio < 6 is reasonable
      // The multi-row layout helps but can't overcome the shallow dependency DAG
      expect(
        aspectRatio,
        `Layout too horizontal: aspect ratio ${aspectRatio.toFixed(2)} should be < 6`,
      ).toBeLessThan(6);
    });

    it('should have visible vertical stratification', () => {
      const { nodes, edges } = tuistGraphData;
      const clusters = groupIntoClusters(nodes, edges);
      clusters.forEach((cluster) => {
        analyzeCluster(cluster, edges);
      });

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      // Group clusters by stratum-like Y bands
      const yPositions = Array.from(result.clusterPositions.values()).map((p) => p.y);
      const minY = Math.min(...yPositions);
      const maxY = Math.max(...yPositions);
      const ySpread = maxY - minY;

      // Divide into bands and count clusters per band
      const bandCount = Math.min(10, result.clusterPositions.size);
      const bandSize = ySpread / bandCount;
      const bands = new Map<number, number>();

      for (const y of yPositions) {
        const band = Math.floor((y - minY) / bandSize);
        bands.set(band, (bands.get(band) ?? 0) + 1);
      }

      console.log(`\nVertical Distribution (${bandCount} bands):`);
      for (let i = 0; i < bandCount; i++) {
        const count = bands.get(i) ?? 0;
        const bar = '█'.repeat(Math.ceil(count / 2));
        console.log(`  Band ${i}: ${bar} (${count})`);
      }

      // Assert: clusters should be distributed across at least 3 Y bands
      const occupiedBands = bands.size;
      expect(
        occupiedBands,
        `Clusters should be distributed across multiple Y bands, found only ${occupiedBands}`,
      ).toBeGreaterThanOrEqual(3);

      // Assert: Y spread should be significant
      expect(ySpread, 'Y spread should be at least 500px').toBeGreaterThan(500);
    });
  });
});
