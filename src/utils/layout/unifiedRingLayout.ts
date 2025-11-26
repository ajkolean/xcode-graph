/**
 * Unified ring-based layout algorithm
 * Works for both cluster-level and intra-cluster layouts
 * Uses topological depth + edge-count ordering
 */

export interface LayoutNode {
  id: string;
  metadata?: any;
}

export interface LayoutEdge {
  source: string;
  target: string;
}

export interface RingLayoutConfig {
  baseRadius: number;      // Base radius for first ring
  ringGap: number;         // Gap between rings
  anchorRadius: number;    // Radius for anchor ring (can be 0 for center)
}

export interface PositionedItem {
  id: string;
  x: number;
  y: number;
  ring: number;
  angle: number;
  radius: number;
}

/**
 * Universal ring-based layout
 * 
 * @param nodes - Items to layout (can be clusters or nodes)
 * @param edges - Dependencies between items
 * @param anchors - Anchor items (roots of the hierarchy)
 * @param config - Layout configuration
 * @returns Positioned items with (x, y) coordinates
 */
export function layoutItemsInRings(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  anchors: LayoutNode[],
  config: RingLayoutConfig
): PositionedItem[] {
  if (nodes.length === 0) return [];
  
  // If no anchors provided, find most connected node
  const actualAnchors = anchors.length > 0 
    ? anchors 
    : [findMostConnectedNode(nodes, edges)];
  
  // Build reverse adjacency (who depends on this node)
  const revAdj = buildReverseAdjacency(nodes, edges);
  
  // Compute ring assignment using BFS
  const rings = computeRingAssignment(nodes, actualAnchors, revAdj);
  
  // Group nodes by ring
  const nodesByRing = groupByRing(nodes, rings);
  
  // Position each ring
  return positionRings(nodesByRing, edges, rings, config);
}

/**
 * Build reverse adjacency list (who depends on this item)
 */
function buildReverseAdjacency(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): Map<string, Set<string>> {
  const nodeIds = new Set(nodes.map(n => n.id));
  const revAdj = new Map<string, Set<string>>();
  
  nodes.forEach(n => revAdj.set(n.id, new Set()));
  
  edges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      revAdj.get(edge.target)?.add(edge.source);
    }
  });
  
  return revAdj;
}

/**
 * Compute ring assignment using BFS from anchors
 * Ring 0: anchors
 * Ring 1: direct dependents
 * Ring 2: everything else (clamped)
 */
function computeRingAssignment(
  nodes: LayoutNode[],
  anchors: LayoutNode[],
  revAdj: Map<string, Set<string>>
): Map<string, number> {
  const rings = new Map<string, number>();
  
  // Initialize all to infinity
  nodes.forEach(n => rings.set(n.id, Infinity));
  
  // Anchors are ring 0
  anchors.forEach(a => rings.set(a.id, 0));
  
  // BFS from anchors
  const queue: { id: string; ring: number }[] = anchors.map(a => ({
    id: a.id,
    ring: 0
  }));
  
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const { id, ring } = queue.shift()!;
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    // Explore dependents (items that depend on this one)
    const dependents = revAdj.get(id) || new Set();
    dependents.forEach(depId => {
      const currentRing = rings.get(depId);
      const newRing = ring + 1;
      
      if (currentRing === undefined || newRing < currentRing) {
        rings.set(depId, newRing);
        queue.push({ id: depId, ring: newRing });
      }
    });
  }
  
  // Clamp to 0-2 and handle unreachable nodes
  nodes.forEach(node => {
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
 * Group nodes by their ring assignment
 */
function groupByRing(
  nodes: LayoutNode[],
  rings: Map<string, number>
): Map<number, LayoutNode[]> {
  const nodesByRing = new Map<number, LayoutNode[]>();
  
  for (let i = 0; i <= 2; i++) {
    nodesByRing.set(i, []);
  }
  
  nodes.forEach(node => {
    const ring = rings.get(node.id) || 2;
    nodesByRing.get(ring)?.push(node);
  });
  
  return nodesByRing;
}

/**
 * Position nodes in rings with edge-count-based angular ordering
 */
function positionRings(
  nodesByRing: Map<number, LayoutNode[]>,
  edges: LayoutEdge[],
  rings: Map<string, number>,
  config: RingLayoutConfig
): PositionedItem[] {
  const positioned: PositionedItem[] = [];
  
  // Ring 0: Anchors
  const anchorNodes = nodesByRing.get(0) || [];
  if (anchorNodes.length === 1) {
    // Single anchor at center
    positioned.push({
      id: anchorNodes[0].id,
      x: 0,
      y: 0,
      ring: 0,
      angle: 0,
      radius: 0
    });
  } else if (anchorNodes.length > 1) {
    // Multiple anchors in small inner circle
    const angleStep = (2 * Math.PI) / anchorNodes.length;
    anchorNodes.forEach((node, i) => {
      const angle = i * angleStep;
      const x = config.anchorRadius * Math.cos(angle);
      const y = config.anchorRadius * Math.sin(angle);
      positioned.push({
        id: node.id,
        x,
        y,
        ring: 0,
        angle,
        radius: config.anchorRadius
      });
    });
  }
  
  // Rings 1 & 2: Ordered by edge count to previous ring
  for (const ring of [1, 2]) {
    const ringNodes = nodesByRing.get(ring) || [];
    if (ringNodes.length === 0) continue;
    
    const radius = config.baseRadius + (ring - 1) * config.ringGap;
    
    // Order by edges to previous ring
    const prevRing = ring - 1;
    const prevNodeIds = new Set(
      (nodesByRing.get(prevRing) || []).map(n => n.id)
    );
    
    const scored = ringNodes.map(node => {
      const edgeCount = edges.filter(e => 
        e.source === node.id && prevNodeIds.has(e.target)
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
      
      positioned.push({
        id: entry.node.id,
        x,
        y,
        ring,
        angle,
        radius
      });
    });
  }
  
  return positioned;
}

/**
 * Find most connected node as fallback anchor
 */
function findMostConnectedNode(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): LayoutNode {
  const nodeIds = new Set(nodes.map(n => n.id));
  const connections = new Map<string, number>();
  
  nodes.forEach(n => connections.set(n.id, 0));
  
  edges.forEach(edge => {
    if (nodeIds.has(edge.source)) {
      connections.set(edge.source, (connections.get(edge.source) || 0) + 1);
    }
    if (nodeIds.has(edge.target)) {
      connections.set(edge.target, (connections.get(edge.target) || 0) + 1);
    }
  });
  
  let maxNode = nodes[0];
  let maxCount = 0;
  
  nodes.forEach(node => {
    const count = connections.get(node.id) || 0;
    if (count > maxCount) {
      maxCount = count;
      maxNode = node;
    }
  });
  
  return maxNode;
}

/**
 * Helper: Identify anchor nodes using coreScore
 * coreScore = fanIn * 2 + fanOut
 */
export function identifyAnchorsByCoreScore(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  topN: number = 1
): LayoutNode[] {
  const nodeIds = new Set(nodes.map(n => n.id));
  const fanIn = new Map<string, number>();
  const fanOut = new Map<string, number>();
  
  nodes.forEach(n => {
    fanIn.set(n.id, 0);
    fanOut.set(n.id, 0);
  });
  
  edges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      fanOut.set(edge.source, (fanOut.get(edge.source) || 0) + 1);
      fanIn.set(edge.target, (fanIn.get(edge.target) || 0) + 1);
    }
  });
  
  const scored = nodes.map(node => ({
    node,
    coreScore: (fanIn.get(node.id) || 0) * 2 + (fanOut.get(node.id) || 0)
  }));
  
  scored.sort((a, b) => b.coreScore - a.coreScore);
  
  return scored.slice(0, topN).map(s => s.node);
}
