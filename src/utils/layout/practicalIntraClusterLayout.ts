/**
 * Practical intra-cluster layout v1: rings + simple ordering
 * No spectral methods - just edge-count-based sorting
 */

import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import type { Cluster, ClusterLayoutConfig, PositionedNode } from '../../types/cluster';

/**
 * Layout nodes within a cluster using ring-based placement
 * Ring 0: anchors (center)
 * Ring 1: direct dependencies of anchors
 * Ring 2: everything else
 * Tests: satellites orbiting their subjects
 */
export function layoutNodesInClusterPractical(
  cluster: Cluster,
  edges: GraphEdge[],
  config: ClusterLayoutConfig,
): PositionedNode[] {
  const nodes = cluster.nodes;

  if (nodes.length === 0) return [];

  // Step 1: Identify anchors (already done in cluster analysis)
  const anchors = cluster.anchors
    .map((anchorId) => nodes.find((n) => n.id === anchorId))
    .filter(Boolean) as GraphNode[];

  if (anchors.length === 0) {
    // Fallback: most connected node
    const anchor = findMostConnectedNode(nodes, edges);
    anchors.push(anchor);
  }

  // Step 2: Build internal edge structures
  const nodeIds = new Set(nodes.map((n) => n.id));
  const internalEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  // Build reverse adjacency (who depends on this node)
  const revAdj = new Map<string, Set<string>>();
  nodes.forEach((n) => revAdj.set(n.id, new Set()));

  internalEdges.forEach((edge) => {
    revAdj.get(edge.target)?.add(edge.source);
  });

  // Step 3: Compute ring assignment (0, 1, or 2)
  const rings = computeRings(nodes, anchors, revAdj, cluster);

  // Step 4: Group nodes by ring (exclude tests for now)
  const nodesByRing = new Map<number, GraphNode[]>();
  const testNodes: GraphNode[] = [];

  for (let i = 0; i <= 2; i++) {
    nodesByRing.set(i, []);
  }

  nodes.forEach((node) => {
    const metadata = cluster.metadata.get(node.id);
    if (metadata?.role === 'test') {
      testNodes.push(node);
      return;
    }

    const ring = rings.get(node.id) || 2;
    nodesByRing.get(ring)?.push(node);
  });

  // Step 5: Position nodes on rings with simple angular ordering
  const positioned: PositionedNode[] = [];

  const baseRadius = 75;
  const ringGap = 80;

  // Ring 0: Anchors at center (small inner circle or point)
  const anchorNodes = nodesByRing.get(0) || [];
  if (anchorNodes.length === 1) {
    // Single anchor: dead center
    const node = anchorNodes[0];
    positioned.push(createPositionedNode(node, cluster, 0, 0, 0, 0));
  } else if (anchorNodes.length > 1) {
    // Multiple anchors: small inner circle
    const anchorRadius = 30;
    const angleStep = (2 * Math.PI) / anchorNodes.length;

    anchorNodes.forEach((node, i) => {
      const angle = i * angleStep;
      const x = anchorRadius * Math.cos(angle);
      const y = anchorRadius * Math.sin(angle);
      positioned.push(createPositionedNode(node, cluster, x, y, anchorRadius, angle));
    });
  }

  // Ring 1 & 2: Spread evenly with edge-based ordering
  for (const ring of [1, 2]) {
    const ringNodes = nodesByRing.get(ring) || [];
    if (ringNodes.length === 0) continue;

    const radius = baseRadius + (ring - 1) * ringGap;

    // Simple ordering: sort by number of edges to previous ring
    const prevRing = ring - 1;
    const prevNodeIds = new Set((nodesByRing.get(prevRing) || []).map((n) => n.id));

    const scored = ringNodes.map((node) => {
      // Count edges feeding the previous ring
      const edgeCount = internalEdges.filter(
        (e) => e.source === node.id && prevNodeIds.has(e.target),
      ).length;

      return { node, edgeCount };
    });

    // Sort by edge count descending, then alphabetically
    scored.sort((a, b) => {
      if (b.edgeCount !== a.edgeCount) {
        return b.edgeCount - a.edgeCount;
      }
      return a.node.id.localeCompare(b.node.id);
    });

    // Place around circle
    const angleStep = (2 * Math.PI) / scored.length;
    scored.forEach((entry, i) => {
      const angle = i * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      positioned.push(createPositionedNode(entry.node, cluster, x, y, radius, angle));
    });
  }

  // Step 6: Place test satellites
  testNodes.forEach((testNode) => {
    const metadata = cluster.metadata.get(testNode.id);
    const subjects = metadata?.testSubjects || [];

    if (subjects.length === 0) {
      // No subject - place in outer orbit
      const angle = Math.random() * 2 * Math.PI;
      const radius = baseRadius + 2 * ringGap + 60;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      positioned.push(createPositionedNode(testNode, cluster, x, y, radius, angle));
    } else {
      // Orbit around first subject
      const subjectId = subjects[0];
      const subjectPos = positioned.find((p) => p.node.id === subjectId);

      if (subjectPos) {
        const orbitRadius = config.testOrbitRadius || 40;
        const subjectAngle = subjectPos.targetAngle || 0;

        // Offset angle based on test type for visual variety
        let offsetAngle = subjectAngle + Math.PI / 3; // 60° default

        // Check test type from the node itself
        if (testNode.type === 'test-ui') {
          offsetAngle = subjectAngle + Math.PI / 2; // 90° for UI tests
        }

        const x = subjectPos.localX! + orbitRadius * Math.cos(offsetAngle);
        const y = subjectPos.localY! + orbitRadius * Math.sin(offsetAngle);

        positioned.push(
          createPositionedNode(testNode, cluster, x, y, Math.sqrt(x * x + y * y), Math.atan2(y, x)),
        );
      }
    }
  });

  return positioned;
}

/**
 * Compute ring assignment (0, 1, or 2) using BFS from anchors
 * Ring 0: anchors
 * Ring 1: directly depend on anchors
 * Ring 2: everything else
 */
function computeRings(
  nodes: GraphNode[],
  anchors: GraphNode[],
  revAdj: Map<string, Set<string>>,
  cluster: Cluster,
): Map<string, number> {
  const rings = new Map<string, number>();

  // Initialize all nodes to infinity
  nodes.forEach((n) => rings.set(n.id, Infinity));

  // Anchors are ring 0
  anchors.forEach((a) => rings.set(a.id, 0));

  // BFS from anchors (following reverse edges = who depends on anchors)
  const queue: { id: string; ring: number }[] = anchors.map((a) => ({
    id: a.id,
    ring: 0,
  }));

  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, ring } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);

    // Explore dependents
    const dependents = revAdj.get(id) || new Set();
    dependents.forEach((depId) => {
      const currentRing = rings.get(depId);
      const newRing = ring + 1;

      if (currentRing === undefined || newRing < currentRing) {
        rings.set(depId, newRing);
        queue.push({ id: depId, ring: newRing });
      }
    });
  }

  // Clamp to 0-2 and handle unreachable nodes
  nodes.forEach((node) => {
    const metadata = cluster.metadata.get(node.id);
    if (metadata?.role === 'test') {
      rings.set(node.id, -1); // Special marker for tests
      return;
    }

    const ring = rings.get(node.id);
    if (ring === undefined || ring === Infinity) {
      rings.set(node.id, 2); // Unreachable = outer ring
    } else {
      rings.set(node.id, Math.min(2, ring)); // Clamp to max ring 2
    }
  });

  return rings;
}

/**
 * Helper to create a PositionedNode
 */
function createPositionedNode(
  node: GraphNode,
  cluster: Cluster,
  x: number,
  y: number,
  radius: number,
  angle: number,
): PositionedNode {
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
}

/**
 * Finds the most connected node as fallback anchor
 */
function findMostConnectedNode(nodes: GraphNode[], edges: GraphEdge[]): GraphNode {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const connections = new Map<string, number>();

  nodes.forEach((n) => connections.set(n.id, 0));

  edges.forEach((edge) => {
    if (nodeIds.has(edge.source)) {
      connections.set(edge.source, (connections.get(edge.source) || 0) + 1);
    }
    if (nodeIds.has(edge.target)) {
      connections.set(edge.target, (connections.get(edge.target) || 0) + 1);
    }
  });

  let maxNode = nodes[0];
  let maxCount = 0;

  nodes.forEach((node) => {
    const count = connections.get(node.id) || 0;
    if (count > maxCount) {
      maxCount = count;
      maxNode = node;
    }
  });

  return maxNode;
}
