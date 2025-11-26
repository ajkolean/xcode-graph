/**
 * Intra-cluster layout using unified ring algorithm
 * Plus test satellite placement
 */

import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import type { Cluster, ClusterLayoutConfig, PositionedNode } from '../../types/cluster';
import { type LayoutEdge, type LayoutNode, layoutItemsInRings } from './unifiedRingLayout';

/**
 * Layout nodes within a cluster using unified ring algorithm
 * Ring 0: anchors (center)
 * Ring 1: direct dependencies of anchors
 * Ring 2: everything else
 * Tests: satellites orbiting their subjects
 */
export function layoutNodesInClusterUnified(
  cluster: Cluster,
  edges: GraphEdge[],
  config: ClusterLayoutConfig,
): PositionedNode[] {
  const nodes = cluster.nodes;

  if (nodes.length === 0) return [];

  // Step 1: Separate test nodes from regular nodes
  const regularNodes: GraphNode[] = [];
  const testNodes: GraphNode[] = [];

  nodes.forEach((node) => {
    const metadata = cluster.metadata.get(node.id);
    if (metadata?.role === 'test') {
      testNodes.push(node);
    } else {
      regularNodes.push(node);
    }
  });

  if (regularNodes.length === 0) {
    // Only tests - place them in a circle
    return layoutTestsOnly(testNodes, cluster, config);
  }

  // Step 2: Build internal edge structures (exclude test edges)
  const nodeIds = new Set(regularNodes.map((n) => n.id));
  const internalEdges: LayoutEdge[] = edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({ source: e.source, target: e.target }));

  // Step 3: Identify anchors (already done in cluster analysis)
  const anchorIds = new Set(cluster.anchors);
  const anchors = regularNodes.filter((n) => anchorIds.has(n.id));

  // Step 4: Convert to LayoutNodes
  const layoutNodes: LayoutNode[] = regularNodes.map((n) => ({
    id: n.id,
    metadata: n,
  }));

  const layoutAnchors: LayoutNode[] = anchors.map((n) => ({
    id: n.id,
    metadata: n,
  }));

  // Step 5: Apply unified ring layout
  const positioned = layoutItemsInRings(layoutNodes, internalEdges, layoutAnchors, {
    baseRadius: config.ringRadius || 75,
    ringGap: config.layerSpacing || 80,
    anchorRadius: 30, // Small inner circle for multiple anchors
  });

  // Step 6: Convert to PositionedNodes
  const result: PositionedNode[] = positioned.map((item) => {
    const node = regularNodes.find((n) => n.id === item.id)!;
    const metadata = cluster.metadata.get(node.id)!;

    return {
      node,
      clusterId: cluster.id,
      localX: item.x,
      localY: item.y,
      x: item.x,
      y: item.y,
      metadata,
      targetRadius: item.radius,
      targetAngle: item.angle,
    };
  });

  // Step 7: Place test satellites around their subjects
  testNodes.forEach((testNode) => {
    const metadata = cluster.metadata.get(testNode.id);
    const subjects = metadata?.testSubjects || [];

    if (subjects.length === 0) {
      // No subject - place in outer orbit
      const angle = Math.random() * 2 * Math.PI;
      const radius = (config.ringRadius || 75) + 2 * (config.layerSpacing || 80) + 60;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      result.push({
        node: testNode,
        clusterId: cluster.id,
        localX: x,
        localY: y,
        x,
        y,
        metadata: metadata!,
        targetRadius: radius,
        targetAngle: angle,
      });
    } else {
      // Orbit around first subject
      const subjectId = subjects[0];
      const subjectPos = result.find((p) => p.node.id === subjectId);

      if (subjectPos) {
        const orbitRadius = config.testOrbitRadius || 40;
        const subjectAngle = subjectPos.targetAngle || 0;

        // Offset angle based on test type
        let offsetAngle = subjectAngle + Math.PI / 3; // 60° default
        if (testNode.type === 'test-ui') {
          offsetAngle = subjectAngle + Math.PI / 2; // 90° for UI tests
        }

        const x = subjectPos.localX! + orbitRadius * Math.cos(offsetAngle);
        const y = subjectPos.localY! + orbitRadius * Math.sin(offsetAngle);

        result.push({
          node: testNode,
          clusterId: cluster.id,
          localX: x,
          localY: y,
          x,
          y,
          metadata: metadata!,
          targetRadius: Math.sqrt(x * x + y * y),
          targetAngle: Math.atan2(y, x),
        });
      }
    }
  });

  return result;
}

/**
 * Fallback for clusters with only test nodes
 */
function layoutTestsOnly(
  testNodes: GraphNode[],
  cluster: Cluster,
  _config: ClusterLayoutConfig,
): PositionedNode[] {
  const radius = 50;
  const angleStep = (2 * Math.PI) / testNodes.length;

  return testNodes.map((node, i) => {
    const angle = i * angleStep;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const metadata = cluster.metadata.get(node.id)!;

    return {
      node,
      clusterId: cluster.id,
      localX: x,
      localY: y,
      x,
      y,
      metadata,
      targetRadius: radius,
      targetAngle: angle,
    };
  });
}
