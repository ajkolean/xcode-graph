/**
 * Simple cluster layout with ring-based positioning
 * Updated to use mass-based anchor selection
 *
 * The "sun" of each solar system is determined by gravitational mass:
 * - Fan-in (how many depend on it)
 * - Fan-out (how many dependencies)
 * - Depth in hierarchy
 * - Centrality in graph structure
 */

import { type AdjacencyList, buildAdjacency } from './algorithms';
import { computeElasticShellRadius } from './elastic-shell';
import { selectMassBasedAnchor } from './mass';

export interface NodeCartesian {
  id: string;
  x: number;
  y: number;
  ring: number;
  isTest: boolean;
}

export interface SimpleLayoutOptions {
  baseRadius?: number;
  ringSpacing?: number;
  maxDepth?: number;
  testOffset?: number; // Radial offset for tests from their target
}

// Test name patterns for matching tests to their targets
const TEST_NAME_PATTERNS = [
  /^(.+?)(Tests?)$/i,
  /^(.+?)(Test)$/i,
  /^(.+?)(UnitTests?)$/i,
  /^(.+?)(UITests?)$/i,
  /^(.+?)(IntegrationTests?)$/i,
  /^(.+?)(AcceptanceTests?)$/i,
  /^(.+?)(E2ETests?)$/i,
];

/**
 * Try to match test name to a target node using name patterns
 */
function findTargetByNamePattern(
  testName: string,
  nodes: Array<{ id: string; name: string; type: string }>,
): string | undefined {
  for (const pattern of TEST_NAME_PATTERNS) {
    const match = testName.match(pattern);
    if (!match) continue;

    const baseName = match[1];
    if (!baseName) continue;

    const target = nodes.find((n) => {
      if (n.type.startsWith('test')) return false;
      const nName = n.name.toLowerCase();
      const bName = baseName.toLowerCase();
      return nName === bName || nName.startsWith(bName) || bName.startsWith(nName);
    });

    if (target) return target.id;
  }
  return undefined;
}

/**
 * Find target by first non-test dependency
 */
function findTargetByDependency(
  testId: string,
  nodes: Array<{ id: string; name: string; type: string }>,
  adj: AdjacencyList,
): string | undefined {
  const deps = adj.forward.get(testId) || [];
  for (const dep of deps) {
    const depNode = nodes.find((n) => n.id === dep);
    if (depNode && !depNode.type.startsWith('test')) {
      return dep;
    }
  }
  return undefined;
}

/**
 * Find what a test targets using heuristics
 */
function findTestTarget(
  testId: string,
  testName: string,
  nodes: Array<{ id: string; name: string; type: string }>,
  adj: AdjacencyList,
): string | undefined {
  // Try name pattern matching first
  const byName = findTargetByNamePattern(testName, nodes);
  if (byName) return byName;

  // Fall back to dependency analysis
  return findTargetByDependency(testId, nodes, adj);
}

/**
 * Identify anchor nodes (starting points) using mass-based selection
 */
function selectAnchors(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
): string[] {
  // Use mass-based anchor selection
  const anchor = selectMassBasedAnchor(nodes, edges);

  if (anchor) {
    return [anchor];
  }

  // Fallback: nodes with no incoming edges (roots)
  const adj = buildAdjacency(
    nodes.map((n) => n.id),
    edges,
  );
  const roots = nodes.filter((n) => {
    const incoming = adj.reverse.get(n.id) || [];
    return incoming.length === 0 && !n.type.startsWith('test');
  });

  if (roots.length > 0) {
    return roots.map((r) => r.id);
  }

  // Last fallback: first non-test node
  const firstNonTest = nodes.find((n) => !n.type.startsWith('test'));
  return firstNonTest ? [firstNonTest.id] : [];
}

/**
 * Compute ring depth for each node via BFS from anchors
 * Following dependency edges (app -> framework -> lib)
 */
function computeRingDepth(
  nodeIds: string[],
  anchors: string[],
  adj: AdjacencyList,
  maxDepth: number,
): Map<string, number> {
  const depth = new Map<string, number>();
  const queue: string[] = [];

  // Start from anchors at ring 0
  for (const anchor of anchors) {
    depth.set(anchor, 0);
    queue.push(anchor);
  }

  // BFS
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depth.get(id)!;

    if (d >= maxDepth) continue;

    // Follow dependencies outward
    const deps = adj.forward.get(id) || [];
    for (const dep of deps) {
      const currentDepth = depth.get(dep);
      if (currentDepth === undefined || currentDepth > d + 1) {
        depth.set(dep, d + 1);
        queue.push(dep);
      }
    }
  }

  // Unreached nodes go to outer ring
  for (const id of nodeIds) {
    if (!depth.has(id)) {
      depth.set(id, maxDepth);
    }
  }

  return depth;
}

/**
 * Calculate ideal angle for a node based on its connections
 */
function computeIdealAngle(
  nodeId: string,
  ring: number,
  adj: AdjacencyList,
  positionMap: Map<string, { angle: number; ring: number }>,
): number {
  // Get neighbors (both directions)
  const allNeighbors = [...(adj.forward.get(nodeId) || []), ...(adj.reverse.get(nodeId) || [])];

  // Only consider neighbors in inner rings (already placed)
  const innerNeighbors = allNeighbors
    .map((nId) => positionMap.get(nId))
    .filter((pos): pos is { angle: number; ring: number } => pos !== undefined && pos.ring < ring);

  if (innerNeighbors.length === 0) {
    return 0; // No guidance, will be positioned later
  }

  // Compute average angle (geometric mean)
  let sumX = 0;
  let sumY = 0;
  for (const pos of innerNeighbors) {
    sumX += Math.cos(pos.angle);
    sumY += Math.sin(pos.angle);
  }

  return Math.atan2(sumY, sumX);
}

type PositionInfo = { x: number; y: number; angle: number; ring: number };

/**
 * Options for positioning test nodes
 */
interface PositionTestNodesOptions {
  testNodes: Array<{ id: string; name: string; type: string }>;
  mainNodes: Array<{ id: string; name: string; type: string }>;
  adj: AdjacencyList;
  positionMap: Map<string, PositionInfo>;
  centerX: number;
  centerY: number;
  baseRadius: number;
  ringSpacing: number;
  testOffset: number;
  maxDepth: number;
}

/**
 * Position nodes in ring 0 (anchors)
 */
function positionRingZero(
  ringNodes: Array<{ id: string; name: string; type: string }>,
  centerX: number,
  centerY: number,
  radius: number,
  positionMap: Map<string, PositionInfo>,
): void {
  const angleStep = (2 * Math.PI) / Math.max(ringNodes.length, 1);
  for (let idx = 0; idx < ringNodes.length; idx++) {
    const node = ringNodes[idx]!;
    const angle = idx * angleStep;
    positionMap.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
      ring: 0,
    });
  }
}

/**
 * Position nodes in outer rings based on connections
 */
function positionOuterRing(
  ringNodes: Array<{ id: string; name: string; type: string }>,
  ring: number,
  centerX: number,
  centerY: number,
  radius: number,
  adj: AdjacencyList,
  positionMap: Map<string, PositionInfo>,
): void {
  const scored = ringNodes.map((node) => ({
    node,
    idealAngle: computeIdealAngle(node.id, ring, adj, positionMap),
  }));

  scored.sort((a, b) => a.idealAngle - b.idealAngle);

  const angleStep = (2 * Math.PI) / scored.length;
  for (let idx = 0; idx < scored.length; idx++) {
    const item = scored[idx]!;
    const angle = idx * angleStep;
    positionMap.set(item.node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
      ring,
    });
  }
}

/**
 * Position test nodes adjacent to their targets
 */
function positionTestNodes(options: PositionTestNodesOptions): void {
  const {
    testNodes,
    mainNodes,
    adj,
    positionMap,
    centerX,
    centerY,
    baseRadius,
    ringSpacing,
    testOffset,
    maxDepth,
  } = options;

  for (const testNode of testNodes) {
    const targetId = findTestTarget(testNode.id, testNode.name, mainNodes, adj);
    const targetPos = targetId ? positionMap.get(targetId) : undefined;

    if (targetPos) {
      const testRadius = targetPos.ring * ringSpacing + baseRadius + testOffset;
      positionMap.set(testNode.id, {
        x: centerX + testRadius * Math.cos(targetPos.angle),
        y: centerY + testRadius * Math.sin(targetPos.angle),
        angle: targetPos.angle,
        ring: -1,
      });
    } else {
      const outerRadius = baseRadius + (maxDepth + 1) * ringSpacing;
      const angle = Math.random() * 2 * Math.PI;
      positionMap.set(testNode.id, {
        x: centerX + outerRadius * Math.cos(angle),
        y: centerY + outerRadius * Math.sin(angle),
        angle,
        ring: -1,
      });
    }
  }
}

/**
 * Simple radial cluster layout with tests adjacent to targets
 */
export function simpleClusterLayout(
  nodes: Array<{ id: string; name: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
  centerX: number,
  centerY: number,
  options: SimpleLayoutOptions = {},
): NodeCartesian[] {
  const { baseRadius = 40, ringSpacing = 65, maxDepth = 3, testOffset = 28 } = options;

  if (nodes.length === 0) return [];

  const adj = buildAdjacency(
    nodes.map((n) => n.id),
    edges,
  );

  // Separate tests from main nodes
  const mainNodes = nodes.filter((n) => !n.type.startsWith('test'));
  const testNodes = nodes.filter((n) => n.type.startsWith('test'));

  // Find anchors and compute ring depths for main nodes
  const anchors = selectAnchors(mainNodes, edges);
  const ringDepth = computeRingDepth(
    mainNodes.map((n) => n.id),
    anchors,
    adj,
    maxDepth,
  );

  // Group main nodes by ring
  const ringGroups = new Map<number, typeof mainNodes>();
  for (const node of mainNodes) {
    const ring = ringDepth.get(node.id) ?? maxDepth;
    if (!ringGroups.has(ring)) {
      ringGroups.set(ring, []);
    }
    ringGroups.get(ring)!.push(node);
  }

  // Position main nodes ring by ring
  const positionMap = new Map<string, PositionInfo>();
  const sortedRings = Array.from(ringGroups.keys()).sort((a, b) => a - b);

  for (const ring of sortedRings) {
    const ringNodes = ringGroups.get(ring)!;
    const radius = baseRadius + ring * ringSpacing;

    if (ring === 0) {
      positionRingZero(ringNodes, centerX, centerY, radius, positionMap);
    } else {
      positionOuterRing(ringNodes, ring, centerX, centerY, radius, adj, positionMap);
    }
  }

  // Position tests adjacent to their targets
  positionTestNodes({
    testNodes,
    mainNodes,
    adj,
    positionMap,
    centerX,
    centerY,
    baseRadius,
    ringSpacing,
    testOffset,
    maxDepth,
  });

  // Convert to result format
  return Array.from(positionMap.entries()).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
    ring: pos.ring,
    isTest: testNodes.some((t) => t.id === id),
  }));
}

/**
 * Compute minimum enclosing circle radius using elastic shell
 * The shell is a flexible membrane that balances:
 * - Inward compression (wants to stay small)
 * - Outward pressure from nodes (based on mass)
 */
export function computeMEC(
  positions: NodeCartesian[],
  centerX: number,
  centerY: number,
  masses?: Map<string, import('./mass').NodeMass>,
): number {
  if (positions.length === 0) return 100;

  // If masses provided, use elastic shell computation
  if (masses && masses.size > 0) {
    // Convert positions to relative coordinates
    const nodesWithPos = positions.map((p) => ({
      id: p.id,
      x: p.x - centerX,
      y: p.y - centerY,
      ring: p.ring,
    }));

    return computeElasticShellRadius(nodesWithPos, masses);
  }

  // Fallback: simple MEC (maximum distance + padding)
  let maxDistance = 0;
  for (const pos of positions) {
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const distance = Math.hypot(dx, dy);
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance + 20; // Reduced padding from 40 to 20
}
