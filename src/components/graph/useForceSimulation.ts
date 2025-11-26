import { useEffect, useRef, useState } from 'react';
import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import type { ClusterPosition, NodePosition } from '../../types/simulation';

interface UseForceSimulationOptions {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodesByCluster: Map<string, GraphNode[]>;
  clusterEdges: Map<string, number>;
  draggedNode: string | null;
}

// Helper: Calculate node radius based on type
function getNodeRadius(nodeType: GraphNode['type']): number {
  switch (nodeType) {
    case 'app':
      return 18;
    case 'framework':
    case 'cli':
      return 14;
    case 'library':
    case 'package':
      return 12;
    case 'test-unit':
    case 'test-ui':
      return 8;
    default:
      return 10;
  }
}

// Helper: Apply cluster collision forces
function applyClusterCollisions(
  clusterArray: ClusterPosition[],
  alpha: number,
): void {
  for (let i = 0; i < clusterArray.length; i++) {
    for (let j = i + 1; j < clusterArray.length; j++) {
      const a = clusterArray[i];
      const b = clusterArray[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1) continue;

      const aRadius = Math.sqrt(a.width * a.width + a.height * a.height) / 2;
      const bRadius = Math.sqrt(b.width * b.width + b.height * b.height) / 2;
      const minSeparation = aRadius + bRadius + 60;
      const overlap = minSeparation - distance;

      if (overlap > 0) {
        const force = overlap * 1.2 * alpha;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      } else {
        const force = (3000 * alpha) / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
  }
}

// Helper: Apply cluster link forces based on cross-project dependencies
function applyClusterLinkForces(
  clusterEdges: Map<string, number>,
  clusters: Map<string, ClusterPosition>,
  alpha: number,
): void {
  const processedPairs = new Set<string>();

  for (const [key, count] of clusterEdges.entries()) {
    if (!key.includes('<->')) continue;

    const [clusterA, clusterB] = key.split('<->');
    const pairKey = [clusterA, clusterB].sort().join('<->');

    if (processedPairs.has(pairKey)) continue;
    processedPairs.add(pairKey);

    const source = clusters.get(clusterA);
    const target = clusters.get(clusterB);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const edgeWeight = Math.sqrt(count);
    const targetDist = Math.max(250, 400 - edgeWeight * 30);
    const strengthMultiplier = 1 + edgeWeight * 0.15;
    const force = (distance - targetDist) * 0.25 * strengthMultiplier * alpha;

    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }
}

// Helper: Apply node collision forces
function applyNodeCollisions(
  nodeArray: NodePosition[],
  alpha: number,
): void {
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const a = nodeArray[i];
      const b = nodeArray[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) continue;

      const minSeparation = a.radius + b.radius + 4;

      if (distance < minSeparation) {
        const overlap = minSeparation - distance;
        const force = overlap * 0.8 * alpha;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      } else {
        const effectiveCharge = a.radius * b.radius * 50;
        const distSq = distance * distance;
        const force = (-effectiveCharge * alpha) / distSq;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }
  }
}

// Helper: Apply node link forces for internal edges
function applyNodeLinkForces(
  internalEdges: GraphEdge[],
  positions: Map<string, NodePosition>,
  alpha: number,
): void {
  for (const edge of internalEdges) {
    const source = positions.get(edge.source);
    const target = positions.get(edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = 60;
    const force = (distance - targetDist) * 0.2 * alpha;

    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }
}

export function useForceSimulation({
  nodes,
  edges,
  nodesByCluster,
  clusterEdges,
  draggedNode,
}: UseForceSimulationOptions) {
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [clusterPositions, setClusterPositions] = useState<Map<string, ClusterPosition>>(new Map());
  const animationRef = useRef<number>();

  useEffect(() => {
    if (nodes.length === 0) return;

    // Initialize cluster positions
    const clusters = new Map<string, ClusterPosition>();
    const clusterArray = Array.from(nodesByCluster.entries());

    for (let i = 0; i < clusterArray.length; i++) {
      const [clusterId, clusterNodes] = clusterArray[i];
      const existing = clusterPositions.get(clusterId);
      const nodeCount = clusterNodes.length;
      const width = Math.max(250, Math.min(400, 150 + Math.sqrt(nodeCount) * 40));
      const height = Math.max(200, Math.min(350, 120 + Math.sqrt(nodeCount) * 35));

      if (existing) {
        existing.width = width;
        existing.height = height;
        existing.nodeCount = nodeCount;
        clusters.set(clusterId, existing);
      } else {
        const angle = (i / clusterArray.length) * Math.PI * 2;
        const radius = 600;
        clusters.set(clusterId, {
          id: clusterId,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          width,
          height,
          nodeCount,
        });
      }
    }

    // Initialize node positions within clusters
    const positions = new Map<string, NodePosition>();
    for (const [clusterId, clusterNodes] of nodesByCluster.entries()) {
      for (let i = 0; i < clusterNodes.length; i++) {
        const node = clusterNodes[i];
        const existing = nodePositions.get(node.id);
        const nodeRadius = getNodeRadius(node.type);

        if (existing) {
          existing.radius = nodeRadius;
          positions.set(node.id, existing);
        } else {
          const angle = (i / clusterNodes.length) * Math.PI * 2;
          const radius = 30;
          positions.set(node.id, {
            id: node.id,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
            clusterId,
            radius: nodeRadius,
          });
        }
      }
    }

    // Force simulation parameters
    const CLUSTER_ALPHA = 0.8;
    const CLUSTER_ALPHA_DECAY = 0.985;
    const NODE_ALPHA = 0.5;
    const NODE_ALPHA_DECAY = 0.98;

    let clusterAlpha = CLUSTER_ALPHA;
    let nodeAlpha = NODE_ALPHA;
    let iterations = 0;
    const maxIterations = 500;

    const simulate = () => {
      if ((clusterAlpha < 0.005 && nodeAlpha < 0.005) || iterations > maxIterations) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      // === CLUSTER FORCES ===
      if (clusterAlpha > 0.005) {
        const clusterArr = Array.from(clusters.values());

        // Cluster collision and repulsion force
        applyClusterCollisions(clusterArr, clusterAlpha);

        // Cluster link force (based on cross-project dependencies)
        applyClusterLinkForces(clusterEdges, clusters, clusterAlpha);

        // Center force and velocity application
        for (const cluster of clusterArr) {
          cluster.vx -= cluster.x * 0.01 * clusterAlpha;
          cluster.vy -= cluster.y * 0.01 * clusterAlpha;
          cluster.x += cluster.vx;
          cluster.y += cluster.vy;
          cluster.vx *= 0.8;
          cluster.vy *= 0.8;
        }

        clusterAlpha *= CLUSTER_ALPHA_DECAY;
      }

      // === NODE FORCES (within clusters) ===
      if (nodeAlpha > 0.001) {
        for (const [clusterId, clusterNodes] of nodesByCluster.entries()) {
          const cluster = clusters.get(clusterId);
          if (!cluster) continue;

          const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
          const nodeArray = clusterNodes.map((n) => positions.get(n.id)!).filter(Boolean);

          // Internal edges only
          const internalEdges = edges.filter(
            (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target),
          );

          // Apply forces
          applyNodeLinkForces(internalEdges, positions, nodeAlpha);
          applyNodeCollisions(nodeArray, nodeAlpha);

          // Center nodes within cluster and apply velocities
          const padding = 40;
          const maxX = cluster.width / 2 - padding;
          const maxY = cluster.height / 2 - padding;

          for (const node of nodeArray) {
            node.vx -= node.x * 0.05 * nodeAlpha;
            node.vy -= node.y * 0.05 * nodeAlpha;

            if (!draggedNode || node.id !== draggedNode) {
              node.x += node.vx;
              node.y += node.vy;
              node.vx *= 0.85;
              node.vy *= 0.85;
              node.x = Math.max(-maxX, Math.min(maxX, node.x));
              node.y = Math.max(-maxY, Math.min(maxY, node.y));
            }
          }
        }

        nodeAlpha *= NODE_ALPHA_DECAY;
      }

      iterations++;

      setClusterPositions(new Map(clusters));
      setNodePositions(new Map(positions));
      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    nodes,
    edges,
    nodesByCluster,
    clusterEdges,
    draggedNode,
    clusterPositions.get,
    nodePositions.get,
  ]);

  return { nodePositions, clusterPositions, setNodePositions };
}
