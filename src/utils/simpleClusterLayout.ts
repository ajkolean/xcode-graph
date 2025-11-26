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

import { selectMassBasedAnchor } from './massCalculation';

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

interface AdjacencyList {
  forward: Map<string, string[]>;
  reverse: Map<string, string[]>;
}

/**
 * Build adjacency lists for edges
 */
function buildAdjacency(
  nodeIds: string[],
  edges: Array<{ from: string; to: string }>
): AdjacencyList {
  const forward = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();

  for (const id of nodeIds) {
    forward.set(id, []);
    reverse.set(id, []);
  }

  for (const edge of edges) {
    if (forward.has(edge.from)) {
      forward.get(edge.from)!.push(edge.to);
    }
    if (reverse.has(edge.to)) {
      reverse.get(edge.to)!.push(edge.from);
    }
  }

  return { forward, reverse };
}

/**
 * Find what a test targets using heuristics
 */
function findTestTarget(
  testId: string,
  testName: string,
  nodes: Array<{ id: string; name: string; type: string }>,
  adj: AdjacencyList
): string | undefined {
  // Heuristic 1: Name pattern matching
  // "FooTests" -> "Foo", "FooFeatureTests" -> "FooFeature", etc.
  const patterns = [
    /^(.+?)(Tests?)$/i,
    /^(.+?)(Test)$/i,
    /^(.+?)(UnitTests?)$/i,
    /^(.+?)(UITests?)$/i,
    /^(.+?)(IntegrationTests?)$/i,
    /^(.+?)(AcceptanceTests?)$/i,
    /^(.+?)(E2ETests?)$/i,
  ];

  for (const pattern of patterns) {
    const match = testName.match(pattern);
    if (match) {
      const baseName = match[1];
      // Look for exact or similar name
      const target = nodes.find(n => {
        if (n.type.startsWith('test')) return false;
        const nName = n.name.toLowerCase();
        const bName = baseName.toLowerCase();
        return nName === bName || nName.startsWith(bName) || bName.startsWith(nName);
      });
      if (target) return target.id;
    }
  }

  // Heuristic 2: First non-test dependency
  const deps = adj.forward.get(testId) || [];
  for (const dep of deps) {
    const depNode = nodes.find(n => n.id === dep);
    if (depNode && !depNode.type.startsWith('test')) {
      return dep;
    }
  }

  return undefined;
}

/**
 * Identify anchor nodes (starting points) using mass-based selection
 */
function selectAnchors(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>
): string[] {
  // Use mass-based anchor selection
  const anchor = selectMassBasedAnchor(nodes, edges);
  
  if (anchor) {
    return [anchor];
  }
  
  // Fallback: nodes with no incoming edges (roots)
  const adj = buildAdjacency(nodes.map(n => n.id), edges);
  const roots = nodes.filter(n => {
    const incoming = adj.reverse.get(n.id) || [];
    return incoming.length === 0 && !n.type.startsWith('test');
  });
  
  if (roots.length > 0) {
    return roots.map(r => r.id);
  }
  
  // Last fallback: first non-test node
  const firstNonTest = nodes.find(n => !n.type.startsWith('test'));
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
  maxDepth: number
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
  positionMap: Map<string, { angle: number; ring: number }>
): number {
  // Get neighbors (both directions)
  const allNeighbors = [
    ...(adj.forward.get(nodeId) || []),
    ...(adj.reverse.get(nodeId) || [])
  ];

  // Only consider neighbors in inner rings (already placed)
  const innerNeighbors = allNeighbors
    .map(nId => positionMap.get(nId))
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

/**
 * Simple radial cluster layout with tests adjacent to targets
 */
export function simpleClusterLayout(
  nodes: Array<{ id: string; name: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
  centerX: number,
  centerY: number,
  options: SimpleLayoutOptions = {}
): NodeCartesian[] {
  const {
    baseRadius = 40,
    ringSpacing = 65,
    maxDepth = 3,
    testOffset = 28
  } = options;

  if (nodes.length === 0) return [];

  const adj = buildAdjacency(
    nodes.map(n => n.id),
    edges
  );

  // Separate tests from main nodes
  const mainNodes = nodes.filter(n => !n.type.startsWith('test'));
  const testNodes = nodes.filter(n => n.type.startsWith('test'));

  // Find anchors and compute ring depths for main nodes
  const anchors = selectAnchors(mainNodes, edges);
  const ringDepth = computeRingDepth(
    mainNodes.map(n => n.id),
    anchors,
    adj,
    maxDepth
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
  const positionMap = new Map<string, { x: number; y: number; angle: number; ring: number }>();
  const sortedRings = Array.from(ringGroups.keys()).sort((a, b) => a - b);

  for (const ring of sortedRings) {
    const ringNodes = ringGroups.get(ring)!;
    const radius = baseRadius + ring * ringSpacing;

    if (ring === 0) {
      // Ring 0: Evenly distribute anchors
      const angleStep = (2 * Math.PI) / Math.max(ringNodes.length, 1);
      ringNodes.forEach((node, idx) => {
        const angle = idx * angleStep;
        positionMap.set(node.id, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          angle,
          ring
        });
      });
    } else {
      // Outer rings: Position based on connections to inner rings
      const scored = ringNodes.map(node => ({
        node,
        idealAngle: computeIdealAngle(node.id, ring, adj, positionMap)
      }));

      // Sort by ideal angle
      scored.sort((a, b) => a.idealAngle - b.idealAngle);

      // Distribute evenly around the ring
      const angleStep = (2 * Math.PI) / scored.length;
      scored.forEach((item, idx) => {
        const angle = idx * angleStep;
        positionMap.set(item.node.id, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          angle,
          ring
        });
      });
    }
  }

  // Position tests adjacent to their targets
  for (const testNode of testNodes) {
    const targetId = findTestTarget(testNode.id, testNode.name, mainNodes, adj);
    const targetPos = targetId ? positionMap.get(targetId) : undefined;

    if (targetPos) {
      // Place test slightly outside its target (same angle, larger radius)
      const testRadius = targetPos.ring * ringSpacing + baseRadius + testOffset;
      const angle = targetPos.angle;

      positionMap.set(testNode.id, {
        x: centerX + testRadius * Math.cos(angle),
        y: centerY + testRadius * Math.sin(angle),
        angle,
        ring: -1 // Special: test node
      });
    } else {
      // No target found - place in outer ring
      const outerRadius = baseRadius + (maxDepth + 1) * ringSpacing;
      const angle = Math.random() * 2 * Math.PI;

      positionMap.set(testNode.id, {
        x: centerX + outerRadius * Math.cos(angle),
        y: centerY + outerRadius * Math.sin(angle),
        angle,
        ring: -1
      });
    }
  }

  // Convert to result format
  return Array.from(positionMap.entries()).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
    ring: pos.ring,
    isTest: testNodes.some(t => t.id === id)
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
  masses?: Map<string, import('./massCalculation').NodeMass>
): number {
  if (positions.length === 0) return 100;

  // If masses provided, use elastic shell computation
  if (masses && masses.size > 0) {
    const { computeElasticShellRadius } = require('./elasticShell');
    
    // Convert positions to relative coordinates
    const nodesWithPos = positions.map(p => ({
      id: p.id,
      x: p.x - centerX,
      y: p.y - centerY,
      ring: p.ring
    }));

    return computeElasticShellRadius(nodesWithPos, masses);
  }

  // Fallback: simple MEC (maximum distance + padding)
  let maxDistance = 0;
  for (const pos of positions) {
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance + 20; // Reduced padding from 40 to 20
}