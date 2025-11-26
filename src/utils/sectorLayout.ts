/**
 * Sector-based radial layout for consistent cluster orientation
 * Based on Swift/Tuist architecture principles
 */

import { type AdjacencyList, buildAdjacency } from './graphAlgorithms';

export interface NodePolar {
  id: string;
  ring: number;
  angle: number; // radians
  radius: number;
  role: NodeRole;
  isTest: boolean;
  testSubject?: string; // For test nodes: what they test
}

export interface NodeCartesian {
  id: string;
  x: number;
  y: number;
  ring: number;
  role: NodeRole;
  isTest: boolean;
}

/**
 * Node role determines angular sector placement
 * Sectors ensure consistent visual signature across all clusters
 */
export type NodeRole =
  | 'anchor' // App, CLI - TOP sector (330°-30° = -30° to +30°)
  | 'framework' // Frameworks - RIGHT sector (30°-150°)
  | 'internal' // Utilities, libs - BOTTOM sector (150°-240°)
  | 'test'; // Tests - orbiting satellites (not on main rings)

export interface SectorLayoutOptions {
  baseRadius?: number;
  ringSpacing?: number;
  maxDepth?: number;
  testOrbitRadius?: number; // Distance from subject module
}

/**
 * Angular sector boundaries (in radians)
 * Consistent orientation: TOP = apps, RIGHT = frameworks, BOTTOM = libs, LEFT = tests
 */
const SECTORS = {
  anchor: { start: -Math.PI / 6, end: Math.PI / 6 }, // -30° to +30° (TOP)
  framework: { start: Math.PI / 6, end: (5 * Math.PI) / 6 }, // +30° to +150° (RIGHT)
  internal: { start: (5 * Math.PI) / 6, end: (4 * Math.PI) / 3 }, // +150° to +240° (BOTTOM)
};

/**
 * Classify node into a role based on type and structure
 */
function classifyNode(
  node: { id: string; type: string },
  _adj: AdjacencyList,
  anchorIds: Set<string>,
): NodeRole {
  if (node.type === 'test') return 'test';
  if (node.type === 'app' || node.type === 'cli') return 'anchor';
  if (anchorIds.has(node.id)) return 'anchor';
  if (node.type === 'framework') return 'framework';
  return 'internal'; // library, utility, etc.
}

/**
 * Find test subject using heuristics
 * Priority: metadata > name pattern > dependency graph
 */
function findTestSubject(
  testId: string,
  nodes: Array<{ id: string; type: string; name?: string }>,
  adj: AdjacencyList,
): string | undefined {
  const testNode = nodes.find((n) => n.id === testId);
  if (!testNode) return undefined;

  // Heuristic 1: Name pattern (FooTests → Foo)
  const name = testNode.name || testId;
  const match = name.match(/^(.+?)(Tests?|Spec|UnitTests?)$/i);
  if (match) {
    const baseName = match[1];
    const subject = nodes.find(
      (n) => (n.name || n.id).toLowerCase() === baseName.toLowerCase() && n.type !== 'test',
    );
    if (subject) return subject.id;
  }

  // Heuristic 2: First non-test dependency
  const deps = adj.forward.get(testId) || [];
  for (const dep of deps) {
    const depNode = nodes.find((n) => n.id === dep);
    if (depNode && depNode.type !== 'test') {
      return dep;
    }
  }

  return undefined;
}

// Helper: Initialize depth queue with anchors
function initDepthQueue(anchors: string[]): { depth: Record<string, number>; queue: string[] } {
  const depth: Record<string, number> = {};
  const queue: string[] = [];

  for (const a of anchors) {
    depth[a] = 0;
    queue.push(a);
  }

  return { depth, queue };
}

// Helper: BFS traversal for depth computation
function bfsTraverseDepths(
  depth: Record<string, number>,
  queue: string[],
  adj: AdjacencyList,
  maxDepth: number,
): void {
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depth[id];

    if (d >= maxDepth) continue;

    const deps = adj.forward.get(id) || [];
    for (const dep of deps) {
      if (depth[dep] === undefined || depth[dep] > d + 1) {
        depth[dep] = d + 1;
        queue.push(dep);
      }
    }
  }
}

// Helper: Assign maxDepth to unreached nodes
function assignUnreachedNodes(
  depth: Record<string, number>,
  adj: AdjacencyList,
  maxDepth: number,
): void {
  for (const id of adj.forward.keys()) {
    if (depth[id] === undefined) {
      depth[id] = maxDepth;
    }
  }
}

/**
 * Compute depth of each node from anchors via BFS
 */
function computeDepths(
  anchors: string[],
  adj: AdjacencyList,
  maxDepth: number,
): Record<string, number> {
  const { depth, queue } = initDepthQueue(anchors);
  bfsTraverseDepths(depth, queue, adj, maxDepth);
  assignUnreachedNodes(depth, adj, maxDepth);
  return depth;
}

interface RingRoleGroup {
  ring: number;
  role: NodeRole;
  nodes: Array<{ id: string; type: string; name?: string }>;
}

// Helper: Find anchor IDs
function findAnchorIds(nodes: Array<{ id: string; type: string }>): Set<string> {
  const anchorNodes = nodes.filter((n) => n.type === 'app' || n.type === 'cli');
  const anchorIds = new Set(anchorNodes.map((n) => n.id));

  if (anchorIds.size === 0) {
    const firstFramework = nodes.find((n) => n.type === 'framework');
    const fallback = firstFramework || nodes[0];
    if (fallback) anchorIds.add(fallback.id);
  }

  return anchorIds;
}

// Helper: Group nodes by ring and role
function groupNodesByRingRole(
  mainNodes: Array<{ id: string; type: string; name?: string }>,
  depth: Record<string, number>,
  adj: AdjacencyList,
  anchorIds: Set<string>,
  maxDepth: number,
): Map<string, RingRoleGroup> {
  const groups = new Map<string, RingRoleGroup>();

  for (const node of mainNodes) {
    const ring = depth[node.id] ?? maxDepth;
    const role = classifyNode(node, adj, anchorIds);
    const key = `${ring}-${role}`;

    if (!groups.has(key)) {
      groups.set(key, { ring, role, nodes: [] });
    }
    groups.get(key)!.nodes.push(node);
  }

  return groups;
}

// Helper: Place nodes in sectors
function placeNodesInSectors(
  groups: Map<string, RingRoleGroup>,
  baseRadius: number,
  ringSpacing: number,
): { polar: NodePolar[]; polarById: Map<string, NodePolar> } {
  const polar: NodePolar[] = [];
  const polarById = new Map<string, NodePolar>();

  for (const group of groups.values()) {
    const sector = SECTORS[group.role as keyof typeof SECTORS];
    if (!sector) continue;

    const radius = baseRadius + group.ring * ringSpacing;
    const sectorSpan = sector.end - sector.start;
    const count = group.nodes.length;

    for (let idx = 0; idx < group.nodes.length; idx++) {
      const node = group.nodes[idx];
      const t = count === 1 ? 0.5 : idx / (count - 1);
      const angle = sector.start + t * sectorSpan;

      const p: NodePolar = {
        id: node.id,
        ring: group.ring,
        angle,
        radius,
        role: group.role,
        isTest: false,
      };
      polar.push(p);
      polarById.set(node.id, p);
    }
  }

  return { polar, polarById };
}

// Helper: Create test satellite with subject
function createOrbitingTestSatellite(
  testNode: { id: string },
  subject: NodePolar,
  siblingIndex: number,
  siblingsCount: number,
  testOrbitRadius: number,
  subjectId: string,
): NodePolar {
  const orbitAngle = subject.angle + (siblingIndex * 2 * Math.PI) / Math.max(siblingsCount, 3);
  const orbitX = subject.radius * Math.cos(subject.angle) + testOrbitRadius * Math.cos(orbitAngle);
  const orbitY = subject.radius * Math.sin(subject.angle) + testOrbitRadius * Math.sin(orbitAngle);

  return {
    id: testNode.id,
    ring: -1,
    angle: Math.atan2(orbitY, orbitX),
    radius: Math.hypot(orbitX, orbitY),
    role: 'test',
    isTest: true,
    testSubject: subjectId,
  };
}

// Helper: Create orphan test satellite
function createOrphanTestSatellite(
  testNode: { id: string },
  baseRadius: number,
  maxDepth: number,
  ringSpacing: number,
): NodePolar {
  return {
    id: testNode.id,
    ring: -1,
    angle: Math.random() * 2 * Math.PI,
    radius: baseRadius + (maxDepth + 1) * ringSpacing,
    role: 'test',
    isTest: true,
  };
}

// Helper: Place test satellites
function placeTestSatellites(
  testNodes: Array<{ id: string; type: string; name?: string }>,
  nodes: Array<{ id: string; type: string; name?: string }>,
  adj: AdjacencyList,
  polarById: Map<string, NodePolar>,
  baseRadius: number,
  maxDepth: number,
  ringSpacing: number,
  testOrbitRadius: number,
): NodePolar[] {
  const testPolar: NodePolar[] = [];

  for (const testNode of testNodes) {
    const subjectId = findTestSubject(testNode.id, nodes, adj);

    if (subjectId && polarById.has(subjectId)) {
      const subject = polarById.get(subjectId)!;
      const siblingsCount = testNodes.filter(
        (t) => findTestSubject(t.id, nodes, adj) === subjectId,
      ).length;
      const siblingIndex = testNodes
        .filter((t) => findTestSubject(t.id, nodes, adj) === subjectId)
        .indexOf(testNode);

      testPolar.push(
        createOrbitingTestSatellite(testNode, subject, siblingIndex, siblingsCount, testOrbitRadius, subjectId),
      );
    } else {
      testPolar.push(createOrphanTestSatellite(testNode, baseRadius, maxDepth, ringSpacing));
    }
  }

  return testPolar;
}

// Helper: Convert polar to cartesian
function polarToCartesian(polar: NodePolar[], centerX: number, centerY: number): NodeCartesian[] {
  return polar.map((p) => ({
    id: p.id,
    ring: p.ring,
    x: centerX + p.radius * Math.cos(p.angle),
    y: centerY + p.radius * Math.sin(p.angle),
    role: p.role,
    isTest: p.isTest,
  }));
}

/**
 * Sector-based radial layout with test satellites
 */
export function sectorLayout(
  nodes: Array<{ id: string; type: string; name?: string }>,
  edges: Array<{ from: string; to: string }>,
  centerX: number,
  centerY: number,
  options: SectorLayoutOptions = {},
): NodeCartesian[] {
  const { baseRadius = 35, ringSpacing = 55, maxDepth = 2, testOrbitRadius = 32 } = options;

  if (nodes.length === 0) return [];

  const adj = buildAdjacency(nodes.map((n) => n.id), edges);
  const anchorIds = findAnchorIds(nodes);
  const depth = computeDepths(Array.from(anchorIds), adj, maxDepth);

  const mainNodes = nodes.filter((n) => n.type !== 'test');
  const testNodes = nodes.filter((n) => n.type === 'test');

  const groups = groupNodesByRingRole(mainNodes, depth, adj, anchorIds, maxDepth);
  const { polar, polarById } = placeNodesInSectors(groups, baseRadius, ringSpacing);
  const testPolar = placeTestSatellites(testNodes, nodes, adj, polarById, baseRadius, maxDepth, ringSpacing, testOrbitRadius);

  return polarToCartesian([...polar, ...testPolar], centerX, centerY);
}

/**
 * Compute Minimum Enclosing Circle radius for cluster bounds
 */
export function computeMEC(positions: NodeCartesian[], centerX: number, centerY: number): number {
  if (positions.length === 0) return 100;

  let maxDist = 0;
  for (const pos of positions) {
    const dist = Math.hypot(pos.x - centerX, pos.y - centerY);
    maxDist = Math.max(maxDist, dist);
  }

  // Add padding for node size and visual breathing room
  return maxDist + 40;
}
