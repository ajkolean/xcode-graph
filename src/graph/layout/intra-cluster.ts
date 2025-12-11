/**
 * Intra-cluster layout: Force-directed positioning
 *
 * Positions nodes within a cluster using a localized force-directed simulation.
 * This provides a more organic and adaptable layout than rigid rings,
 * accurately reflecting dependency structures and clustering related targets.
 */

import { randomNumber } from '../../shared/utils/random';
import { type AdjacencyList, buildAdjacency } from './algorithms';
import { computeElasticShellRadius } from './elastic-shell';
import { LAYOUT_CONSTANTS } from './layout-constants';
import { selectMassBasedAnchor } from './mass';

export interface NodeCartesian {
  id: string;
  x: number;
  y: number;
  ring: number; // Retained for compatibility, though less meaningful in force layout
  isTest: boolean;
}

export interface SimpleLayoutOptions {
  baseRadius?: number;
  ringSpacing?: number;
  maxDepth?: number;
  testOffset?: number;
}

// ========================================
// Heuristics
// ========================================

const TEST_NAME_PATTERNS = [
  /^(.+?)(Tests?)$/i,
  /^(.+?)(Test)$/i,
  /^(.+?)(UnitTests?)$/i,
  /^(.+?)(UITests?)$/i,
  /^(.+?)(IntegrationTests?)$/i,
  /^(.+?)(AcceptanceTests?)$/i,
  /^(.+?)(E2ETests?)$/i,
];

function findTargetByNamePattern(
  testName: string,
  nodes: Array<{ id: string; name: string; type: string }>,
): string | undefined {
  for (const pattern of TEST_NAME_PATTERNS) {
    const match = pattern.exec(testName);
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

function findTargetByDependency(
  testId: string,
  nodes: Array<{ id: string; name: string; type: string }>,
  adj: AdjacencyList,
): string | undefined {
  const deps = adj.forward.get(testId) || [];
  for (const dep of deps) {
    const depNode = nodes.find((n) => n.id === dep);
    if (depNode && !depNode.type.startsWith('test')) return dep;
  }
  return undefined;
}

function findTestTarget(
  testId: string,
  testName: string,
  nodes: Array<{ id: string; name: string; type: string }>,
  adj: AdjacencyList,
): string | undefined {
  return findTargetByNamePattern(testName, nodes) || findTargetByDependency(testId, nodes, adj);
}

// ========================================
// Force Simulation
// ========================================

interface SimulationNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTest: boolean;
  targetId?: string; // For tests
  mass: number;
}

/**
 * Run a deterministic force-directed simulation for the cluster
 */
function runForceSimulation(
  nodes: Array<{ id: string; name: string; type: string }>,
  adj: AdjacencyList,
  anchors: string[],
  centerX: number,
  centerY: number,
  options: SimpleLayoutOptions,
): NodeCartesian[] {
  const nodeCount = nodes.length;
  if (nodeCount === 0) return [];

  // 1. Initialize Nodes
  // Place anchors at center, others randomly in a small circle
  const simNodes: Map<string, SimulationNode> = new Map();
  
  for (const node of nodes) {
    const isAnchor = anchors.includes(node.id);
    const isTest = node.type.startsWith('test');
    
    // Deterministic random start
    const angle = randomNumber(0, Math.PI * 2);
    const radius = isAnchor ? 0 : randomNumber(10, 50);

    simNodes.set(node.id, {
      id: node.id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
      isTest,
      mass: isAnchor ? 5 : (isTest ? 1 : 2),
      targetId: isTest ? findTestTarget(node.id, node.name, nodes, adj) : undefined,
    });
  }

  // 2. Constants & Scaling
  // Scale parameters based on cluster size to prevent overcrowding
  const scale = Math.sqrt(nodeCount); 
  const sizeFactor = Math.max(1, scale / 2); // 1.0 for small, grows for large

  const ITERATIONS = 300;
  const DT = 0.5; // Time step
  
  // Dynamic forces
  // Stronger repulsion for dense clusters
  const REPULSION = 4000 * sizeFactor; 
  // Weaker center gravity for large clusters to allow expansion
  const CENTER_GRAVITY = 0.02 / sizeFactor; 
  
  const ATTRACTION = 0.05;
  const TEST_ATTRACTION = 0.3;
  const DAMPING = 0.8;
  
  // Longer edges for larger clusters to reduce clutter
  const IDEAL_EDGE_LEN = 60 + (nodeCount > 20 ? 30 : 0); 
  const MIN_DIST = 40 + (nodeCount > 50 ? 10 : 0); // Collision radius

  const nodeList = Array.from(simNodes.values());

  // 3. Simulation Loop
  for (let i = 0; i < ITERATIONS; i++) {
    // Apply forces
    for (const node of nodeList) {
      let fx = 0;
      let fy = 0;

      // A. Center Gravity (Pull anchors strongly, others weakly)
      const isAnchor = anchors.includes(node.id);
      const gravity = isAnchor ? 0.1 : CENTER_GRAVITY;
      fx += (centerX - node.x) * gravity;
      fy += (centerY - node.y) * gravity;

      // B. Repulsion (All nodes repel)
      for (const other of nodeList) {
        if (node.id === other.id) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 0.1;
        
        if (dist < 300 * sizeFactor) { // Optimization cutoff scaled by size
           const force = REPULSION / (distSq + 1);
           fx += (dx / dist) * force;
           fy += (dy / dist) * force;
        }
        
        // Hard collision (prevent overlap)
        if (dist < MIN_DIST) {
            const push = (MIN_DIST - dist) * 0.5;
            fx += (dx / dist) * push * 5; // Strong push
            fy += (dy / dist) * push * 5;
        }
      }

      // C. Edges (Springs)
      const deps = adj.forward.get(node.id) || [];
      for (const depId of deps) {
        const target = simNodes.get(depId);
        if (target) {
           const dx = target.x - node.x;
           const dy = target.y - node.y;
           const dist = Math.hypot(dx, dy);
           const springForce = (dist - IDEAL_EDGE_LEN) * ATTRACTION;
           fx += (dx / dist) * springForce;
           fy += (dy / dist) * springForce;
        }
      }
      
      // D. Test Constraint (Pull to target)
      if (node.isTest && node.targetId) {
          const target = simNodes.get(node.targetId);
          if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const dist = Math.hypot(dx, dy);
              // Tests want to be very close (e.g. 30px)
              const testSpring = (dist - 35) * TEST_ATTRACTION;
              fx += (dx / dist) * testSpring;
              fy += (dy / dist) * testSpring;
          }
      }

      // Update Velocity
      node.vx = (node.vx + fx * DT) * DAMPING;
      node.vy = (node.vy + fy * DT) * DAMPING;
    }

    // Apply Velocity
    for (const node of nodeList) {
        // Anchors stay closer to center (optional constraint)
        if (anchors.includes(node.id) && i > ITERATIONS * 0.8) {
             node.vx *= 0.1;
             node.vy *= 0.1;
        }
        node.x += node.vx * DT;
        node.y += node.vy * DT;
    }
  }

  // 4. Convert to NodeCartesian
  return nodeList.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      isTest: n.isTest,
      ring: Math.floor(Math.hypot(n.x - centerX, n.y - centerY) / 100) // Approx ring for compat
  }));
}

// ========================================
// Public API
// ========================================

export function simpleClusterLayout(
  nodes: Array<{ id: string; name: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
  centerX: number,
  centerY: number,
  options: SimpleLayoutOptions = {},
): NodeCartesian[] {
  if (nodes.length === 0) return [];

  // Build graph topology
  const adj = buildAdjacency(
    nodes.map((n) => n.id),
    edges,
  );

  // Identify central nodes
  const anchors = selectAnchors(nodes, edges);

  // Run simulation
  return runForceSimulation(nodes, adj, anchors, centerX, centerY, options);
}

/**
 * Identify anchor nodes (starting points) using mass-based selection
 */
function selectAnchors(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
): string[] {
  const anchor = selectMassBasedAnchor(nodes, edges);
  if (anchor) return [anchor];

  const adj = buildAdjacency(
    nodes.map((n) => n.id),
    edges,
  );
  const roots = nodes.filter((n) => {
    const incoming = adj.reverse.get(n.id) || [];
    return incoming.length === 0 && !n.type.startsWith('test');
  });

  if (roots.length > 0) return roots.map((r) => r.id);

  const firstNonTest = nodes.find((n) => !n.type.startsWith('test'));
  return firstNonTest ? [firstNonTest.id] : [];
}

/**
 * Compute minimum enclosing circle radius
 */
export function computeMEC(
  positions: NodeCartesian[],
  centerX: number,
  centerY: number,
  masses?: Map<string, import('./mass').NodeMass>,
): number {
  if (positions.length === 0) return 100;

  if (masses && masses.size > 0) {
    const nodesWithPos = positions.map((p) => ({
      id: p.id,
      x: p.x - centerX,
      y: p.y - centerY,
      ring: p.ring,
    }));
    return computeElasticShellRadius(nodesWithPos, masses);
  }

  let maxDistance = 0;
  for (const pos of positions) {
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const distance = Math.hypot(dx, dy);
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance + LAYOUT_CONSTANTS.CLUSTER_PADDING;
}
