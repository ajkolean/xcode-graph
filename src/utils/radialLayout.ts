/**
 * Radial intra-cluster layout with depth-based rings and role-based sectors
 * Implements sector-based positioning for consistent cluster orientation
 */

import { type AdjacencyList, buildAdjacency } from './graphAlgorithms';

export interface NodePolar {
  id: string;
  ring: number;
  angle: number; // radians
  radius: number;
  role: NodeRole;
}

export interface NodeCartesian {
  id: string;
  x: number;
  y: number;
  ring: number;
  role: NodeRole;
}

/**
 * Node role determines angular sector placement
 */
export type NodeRole =
  | 'anchor' // App, CLI - TOP sector (330°-30°)
  | 'framework' // Frameworks - RIGHT sector (30°-150°)
  | 'internal' // Utilities, libs - BOTTOM sector (150°-240°)
  | 'test'; // Tests - orbiting satellites (not on rings)

export interface RadialLayoutOptions {
  baseRadius?: number;
  ringSpacing?: number;
  maxDepth?: number;
  anchorTypes?: string[]; // node types to use as anchors
  testOrbitRadius?: number; // radius for test satellites
}

/**
 * Select anchor nodes (central important nodes)
 */
export function selectAnchors(
  nodes: Array<{ id: string; type: string }>,
  hasExternalDependents: Set<string>,
  anchorTypes: string[] = ['app', 'cli'],
): string[] {
  const anchors = nodes.filter(
    (n) => anchorTypes.includes(n.type) || hasExternalDependents.has(n.id),
  );

  return anchors.length > 0 ? anchors.map((a) => a.id) : [nodes[0]?.id].filter(Boolean);
}

/**
 * Compute depth of each node from anchors via BFS
 * Depth = distance following dependency edges FROM anchors
 */
export function computeDepths(
  anchors: string[],
  adj: AdjacencyList,
  maxDepth = 2,
): Record<string, number> {
  const depth: Record<string, number> = {};
  const queue: string[] = [];

  // Start from anchors
  for (const a of anchors) {
    depth[a] = 0;
    queue.push(a);
  }

  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depth[id];

    if (d >= maxDepth) continue;

    // Traverse outward to dependencies
    const deps = adj.forward.get(id) || [];
    for (const dep of deps) {
      if (depth[dep] === undefined || depth[dep] > d + 1) {
        depth[dep] = d + 1;
        queue.push(dep);
      }
    }
  }

  // Everything not reached gets maxDepth
  for (const id of adj.forward.keys()) {
    if (depth[id] === undefined) {
      depth[id] = maxDepth;
    }
  }

  return depth;
}

/**
 * Compute desired angle for a node based on geometric barycenter of neighbors
 */
function computeDesiredAngle(
  nodeId: string,
  currentRing: number,
  depth: Record<string, number>,
  adj: AdjacencyList,
  polarById: Map<string, NodePolar>,
): number {
  // Find neighbors in inner rings (lower depth)
  const neighbors = [...(adj.forward.get(nodeId) || []), ...(adj.reverse.get(nodeId) || [])].filter(
    (n) => (depth[n] ?? 99) < currentRing,
  );

  if (neighbors.length === 0) return 0;

  // Compute average direction (geometric barycenter)
  let sx = 0;
  let sy = 0;
  for (const n of neighbors) {
    const p = polarById.get(n);
    if (!p) continue;
    sx += Math.cos(p.angle);
    sy += Math.sin(p.angle);
  }

  if (sx === 0 && sy === 0) return 0;
  return Math.atan2(sy, sx);
}

/**
 * Perform radial layout within a cluster
 */
export function radialLayout(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
  centerX: number,
  centerY: number,
  options: RadialLayoutOptions = {},
): NodeCartesian[] {
  const {
    baseRadius = 40,
    ringSpacing = 60,
    maxDepth = 2,
    anchorTypes = ['app', 'cli'],
    testOrbitRadius = 100,
  } = options;

  if (nodes.length === 0) return [];

  const adj = buildAdjacency(
    nodes.map((n) => n.id),
    edges,
  );

  // Determine which nodes are anchors
  const anchorIds = selectAnchors(nodes, new Set(), anchorTypes);
  const depth = computeDepths(anchorIds, adj, maxDepth);

  // Group nodes by ring
  const ringToNodes = new Map<number, typeof nodes>();
  for (const n of nodes) {
    const d = depth[n.id] ?? maxDepth;
    if (!ringToNodes.has(d)) ringToNodes.set(d, []);
    ringToNodes.get(d)!.push(n);
  }

  const polar: NodePolar[] = [];
  const polarById = new Map<string, NodePolar>();

  // Ring 0: anchors evenly spaced around center
  const ring0 = ringToNodes.get(0) || [];
  if (ring0.length > 0) {
    ring0.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / ring0.length;
      const p: NodePolar = {
        id: n.id,
        ring: 0,
        angle,
        radius: baseRadius,
        role: 'anchor',
      };
      polar.push(p);
      polarById.set(n.id, p);
    });
  }

  // Rings 1, 2, ... using geometric barycentric ordering
  for (let ring = 1; ring <= maxDepth; ring++) {
    const ringNodes = ringToNodes.get(ring) || [];
    if (ringNodes.length === 0) continue;

    // Compute desired angle for each node based on inner neighbors
    const scored = ringNodes.map((n) => ({
      node: n,
      angle: computeDesiredAngle(n.id, ring, depth, adj, polarById),
    }));

    // Sort by desired angle
    scored.sort((a, b) => a.angle - b.angle);

    // Distribute evenly around the ring
    const radius = baseRadius + ring * ringSpacing;
    const angleStep = (2 * Math.PI) / scored.length;

    scored.forEach((s, idx) => {
      const angle = scored.length === 1 ? 0 : angleStep * idx;
      const p: NodePolar = {
        id: s.node.id,
        ring,
        angle,
        radius,
        role: 'internal',
      };
      polar.push(p);
      polarById.set(s.node.id, p);
    });
  }

  // Add test nodes in orbit
  const testNodes = nodes.filter((n) => n.type === 'test');
  for (const n of testNodes) {
    const angle = Math.random() * 2 * Math.PI;
    const p: NodePolar = {
      id: n.id,
      ring: 0,
      angle,
      radius: testOrbitRadius,
      role: 'test',
    };
    polar.push(p);
    polarById.set(n.id, p);
  }

  // Convert polar to cartesian
  const result: NodeCartesian[] = polar.map((p) => ({
    id: p.id,
    ring: p.ring,
    x: centerX + p.radius * Math.cos(p.angle),
    y: centerY + p.radius * Math.sin(p.angle),
    role: p.role,
  }));

  return result;
}

// Helper: Normalize angle to [-π, π]
function normalizeAngle(angle: number): number {
  let result = angle;
  while (result > Math.PI) result -= 2 * Math.PI;
  while (result < -Math.PI) result += 2 * Math.PI;
  return result;
}

// Helper: Apply pairwise angular repulsion
function applyAngularRepulsion(
  angles: Array<{ node: NodeCartesian; angle: number }>,
  minSpacing: number,
): void {
  for (let i = 0; i < angles.length; i++) {
    for (let j = i + 1; j < angles.length; j++) {
      const diff = normalizeAngle(angles[i].angle - angles[j].angle);
      const ad = Math.abs(diff);

      if (ad < minSpacing && ad > 1e-6) {
        const push = (minSpacing - ad) * 0.3;
        const sign = diff > 0 ? 1 : -1;
        angles[i].angle += push * sign;
        angles[j].angle -= push * sign;
      }
    }
  }
}

// Helper: Update node positions from angles
function updatePositionsFromAngles(
  angles: Array<{ node: NodeCartesian; angle: number }>,
  centerX: number,
  centerY: number,
): void {
  for (const a of angles) {
    const r = Math.hypot(a.node.x - centerX, a.node.y - centerY);
    a.node.x = centerX + r * Math.cos(a.angle);
    a.node.y = centerY + r * Math.sin(a.angle);
  }
}

// Helper: Relax a single ring of nodes
function relaxRing(
  ringNodes: NodeCartesian[],
  centerX: number,
  centerY: number,
  minSpacing: number,
): void {
  if (ringNodes.length <= 1) return;

  const angles = ringNodes.map((n) => ({
    node: n,
    angle: Math.atan2(n.y - centerY, n.x - centerX),
  }));

  applyAngularRepulsion(angles, minSpacing);
  updatePositionsFromAngles(angles, centerX, centerY);
}

/**
 * Relax nodes on their rings to reduce angular overlap
 * Nodes stay on their ring (radius fixed), only angle changes
 */
export function relaxOnRings(
  nodes: NodeCartesian[],
  centerX: number,
  centerY: number,
  iterations = 10,
): NodeCartesian[] {
  const result = nodes.map((n) => ({ ...n }));

  // Group by ring
  const byRing = new Map<number, NodeCartesian[]>();
  for (const n of result) {
    if (!byRing.has(n.ring)) byRing.set(n.ring, []);
    byRing.get(n.ring)!.push(n);
  }

  const minSpacing = (12 * Math.PI) / 180; // 12 degrees minimum

  for (let iter = 0; iter < iterations; iter++) {
    for (const ringNodes of byRing.values()) {
      relaxRing(ringNodes, centerX, centerY, minSpacing);
    }
  }

  return result;
}
