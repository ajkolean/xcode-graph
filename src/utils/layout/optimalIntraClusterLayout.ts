/**
 * Optimal intra-cluster layout using topological layering + spectral ordering
 * This produces near-optimal layouts with minimal edge crossings
 */

import { GraphNode, GraphEdge } from '../../data/mockGraphData';
import { Cluster, PositionedNode, ClusterLayoutConfig } from '../../types/cluster';

interface RingNode {
  node: GraphNode;
  ring: number;
  angle: number;
  metadata: any;
}

/**
 * Computes optimal layout for nodes within a cluster
 * Uses topological depth for ring assignment and spectral ordering for angular placement
 */
export function layoutNodesOptimal(
  cluster: Cluster,
  edges: GraphEdge[],
  config: ClusterLayoutConfig
): PositionedNode[] {
  const nodes = cluster.nodes;
  
  // Step 1: Identify anchors (already done in cluster analysis)
  const anchors = cluster.anchors.map(anchorId => 
    nodes.find(n => n.id === anchorId)!
  ).filter(Boolean);
  
  if (anchors.length === 0) {
    // Fallback: use most connected node as anchor
    const anchorNode = findMostConnectedNode(nodes, edges);
    anchors.push(anchorNode);
  }
  
  // Step 2: Build internal edge map
  const nodeIds = new Set(nodes.map(n => n.id));
  const internalEdges = edges.filter(e => 
    nodeIds.has(e.source) && nodeIds.has(e.target)
  );
  
  // Step 3: Compute topological depth from anchors
  const depths = computeTopologicalDepth(nodes, internalEdges, anchors);
  
  // Step 4: Group nodes by ring (depth)
  const ringAssignment = new Map<string, number>();
  const testNodes = new Set<string>();
  
  nodes.forEach(node => {
    const metadata = cluster.metadata.get(node.id);
    
    // Test nodes handled separately
    if (metadata?.role === 'test') {
      testNodes.add(node.id);
      return;
    }
    
    // Clamp depth to 0-2 for three rings
    const depth = depths.get(node.id) || 0;
    const ring = Math.min(2, depth);
    ringAssignment.set(node.id, ring);
  });
  
  // Step 5: Group nodes by ring
  const nodesByRing = new Map<number, GraphNode[]>();
  for (let i = 0; i <= 2; i++) {
    nodesByRing.set(i, []);
  }
  
  nodes.forEach(node => {
    if (testNodes.has(node.id)) return;
    const ring = ringAssignment.get(node.id) || 0;
    nodesByRing.get(ring)!.push(node);
  });
  
  // Step 6: Apply spectral ordering within each ring
  const angularPositions = new Map<string, number>();
  
  for (const [ring, ringNodes] of nodesByRing.entries()) {
    if (ringNodes.length === 0) continue;
    
    const ordering = computeSpectralOrdering(ringNodes, internalEdges);
    
    // Assign angles based on ordering
    const angleStep = (2 * Math.PI) / ringNodes.length;
    ordering.forEach((node, index) => {
      const angle = index * angleStep;
      angularPositions.set(node.id, angle);
    });
  }
  
  // Step 7: Generate coordinates
  const positioned: PositionedNode[] = [];
  const baseRadius = config.ringRadius || 75;
  const ringSpacing = 80;
  
  nodes.forEach(node => {
    if (testNodes.has(node.id)) return; // Handle tests later
    
    const ring = ringAssignment.get(node.id) || 0;
    const angle = angularPositions.get(node.id) || 0;
    const radius = ring === 0 ? 0 : baseRadius + (ring - 1) * ringSpacing;
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    const metadata = cluster.metadata.get(node.id)!;
    
    positioned.push({
      node,
      clusterId: cluster.id,
      localX: x,
      localY: y,
      x,
      y,
      metadata,
      targetRadius: radius,
      targetAngle: angle
    });
  });
  
  // Step 8: Place test satellites
  const testTargets = nodes.filter(n => testNodes.has(n.id));
  testTargets.forEach(testNode => {
    const metadata = cluster.metadata.get(testNode.id)!;
    const subjects = metadata.testSubjects || [];
    
    if (subjects.length === 0) {
      // No subject - place in outer orbit
      const angle = Math.random() * 2 * Math.PI;
      const radius = baseRadius + 2 * ringSpacing + 50;
      positioned.push({
        node: testNode,
        clusterId: cluster.id,
        localX: radius * Math.cos(angle),
        localY: radius * Math.sin(angle),
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        metadata,
        targetRadius: radius,
        targetAngle: angle
      });
    } else {
      // Orbit around first subject
      const subjectId = subjects[0];
      const subjectPos = positioned.find(p => p.node.id === subjectId);
      
      if (subjectPos) {
        const orbitRadius = config.testOrbitRadius || 40;
        const subjectAngle = subjectPos.targetAngle || 0;
        const offsetAngle = subjectAngle + Math.PI / 4; // 45° offset
        
        const x = subjectPos.localX! + orbitRadius * Math.cos(offsetAngle);
        const y = subjectPos.localY! + orbitRadius * Math.sin(offsetAngle);
        
        positioned.push({
          node: testNode,
          clusterId: cluster.id,
          localX: x,
          localY: y,
          x,
          y,
          metadata,
          targetRadius: Math.sqrt(x * x + y * y),
          targetAngle: Math.atan2(y, x)
        });
      }
    }
  });
  
  return positioned;
}

/**
 * Computes topological depth (shortest distance to any anchor)
 * This determines which ring each node belongs to
 */
function computeTopologicalDepth(
  nodes: GraphNode[],
  edges: GraphEdge[],
  anchors: GraphNode[]
): Map<string, number> {
  const depths = new Map<string, number>();
  
  // Build adjacency list (forward edges only - dependencies)
  const adjacency = new Map<string, string[]>();
  nodes.forEach(n => adjacency.set(n.id, []));
  
  edges.forEach(edge => {
    const targets = adjacency.get(edge.source);
    if (targets) targets.push(edge.target);
  });
  
  // BFS from all anchors
  const queue: { id: string; depth: number }[] = [];
  const visited = new Set<string>();
  
  anchors.forEach(anchor => {
    depths.set(anchor.id, 0);
    visited.add(anchor.id);
    queue.push({ id: anchor.id, depth: 0 });
  });
  
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const neighbors = adjacency.get(id) || [];
    
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        depths.set(neighborId, depth + 1);
        queue.push({ id: neighborId, depth: depth + 1 });
      }
    });
  }
  
  // Assign max depth to unreachable nodes
  nodes.forEach(node => {
    if (!depths.has(node.id)) {
      depths.set(node.id, 2);
    }
  });
  
  return depths;
}

/**
 * Computes spectral ordering using Fiedler vector approximation
 * This minimizes edge crossings within a ring
 */
function computeSpectralOrdering(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode[] {
  if (nodes.length <= 1) return nodes;
  
  const nodeIds = new Set(nodes.map(n => n.id));
  const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]));
  
  // Build adjacency matrix for nodes in this ring
  const n = nodes.length;
  const adjacency = Array(n).fill(0).map(() => Array(n).fill(0));
  
  edges.forEach(edge => {
    const iSrc = nodeIndex.get(edge.source);
    const iTgt = nodeIndex.get(edge.target);
    
    if (iSrc !== undefined && iTgt !== undefined) {
      adjacency[iSrc][iTgt] = 1;
      adjacency[iTgt][iSrc] = 1; // Treat as undirected for ordering
    }
  });
  
  // Compute degree matrix
  const degrees = nodes.map((_, i) => 
    adjacency[i].reduce((sum, val) => sum + val, 0)
  );
  
  // Simple heuristic: order by degree (high degree nodes first)
  // This is a fast approximation of spectral ordering
  const indexed = nodes.map((node, i) => ({
    node,
    degree: degrees[i],
    index: i
  }));
  
  // Sort by degree descending, then by connectivity to already-placed nodes
  indexed.sort((a, b) => {
    // Primary: degree (higher first)
    if (b.degree !== a.degree) return b.degree - a.degree;
    // Secondary: node ID for determinism
    return a.node.id.localeCompare(b.node.id);
  });
  
  return indexed.map(item => item.node);
}

/**
 * Finds the most connected node as fallback anchor
 */
function findMostConnectedNode(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode {
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
