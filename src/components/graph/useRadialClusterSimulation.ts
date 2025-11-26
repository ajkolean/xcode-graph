import { useEffect, useMemo, useRef, useState } from 'react';
import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import {
  type Cluster,
  type ClusterLayoutConfig,
  DEFAULT_CLUSTER_CONFIG,
  type PositionedNode,
} from '../../types/cluster';
import type { ClusterPosition, NodePosition } from '../../types/simulation';
import {
  arrangeClustersBullseye,
  calculateClusterBounds,
  calculateRadialPositions,
  groupIntoClusters,
} from '../../utils/clusterLayout';

interface UseRadialClusterSimulationOptions {
  nodes: GraphNode[];
  edges: GraphEdge[];
  draggedNode: string | null;
  config?: Partial<ClusterLayoutConfig>;
}

// Helper: Apply cluster collision forces
function applyClusterCollisionForces(
  clusterArray: ClusterPosition[],
  clusterSpacing: number,
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
      const minSeparation = aRadius + bRadius + clusterSpacing;

      const overlap = minSeparation - distance;
      if (overlap > 0) {
        const force = overlap * 1.0 * alpha;
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

// Helper: Apply cluster center and velocity forces
function applyClusterVelocities(clusterArray: ClusterPosition[], alpha: number): void {
  for (const cluster of clusterArray) {
    // Weak center force
    cluster.vx -= cluster.x * 0.008 * alpha;
    cluster.vy -= cluster.y * 0.008 * alpha;
    // Apply velocities
    cluster.x += cluster.vx;
    cluster.y += cluster.vy;
    cluster.vx *= 0.82;
    cluster.vy *= 0.82;
  }
}

// Helper: Apply node positioning force based on role
function applyNodePositioningForce(
  node: NodePosition,
  config: ClusterLayoutConfig,
  alpha: number,
  initPositions: Map<string, NodePosition>,
): void {
  // Anchor pinning force (strongest)
  if (node.isAnchor) {
    node.vx += (0 - node.x) * config.forceStrength.anchor * alpha;
    node.vy += (0 - node.y) * config.forceStrength.anchor * alpha;
    return;
  }

  // Radial position force (for non-test, non-anchor nodes)
  if (!node.isTest && node.targetRadius !== undefined && node.targetAngle !== undefined) {
    const targetX = node.targetRadius * Math.cos(node.targetAngle);
    const targetY = node.targetRadius * Math.sin(node.targetAngle);
    node.vx += (targetX - node.x) * config.forceStrength.radial * alpha;
    node.vy += (targetY - node.y) * config.forceStrength.radial * alpha;
    return;
  }

  // Test satellite tether (bind to subject)
  if (node.isTest && node.testSubject) {
    const subjectPos = initPositions.get(node.testSubject);
    if (subjectPos) {
      const dx = node.x - subjectPos.x;
      const dy = node.y - subjectPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = config.testOrbitRadius;
      const force = (distance - targetDist) * config.forceStrength.testSatellite * alpha;
      node.vx -= (dx / distance) * force;
      node.vy -= (dy / distance) * force;
    }
  }
}

// Helper: Apply node collision forces within a cluster
function applyNodeCollisionForces(
  clusterNodes: NodePosition[],
  collisionStrength: number,
  alpha: number,
): void {
  for (let i = 0; i < clusterNodes.length; i++) {
    for (let j = i + 1; j < clusterNodes.length; j++) {
      const a = clusterNodes[i];
      const b = clusterNodes[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) continue;

      // Account for vertical label space below nodes (~30px)
      const verticalLabelSpace = Math.abs(dy) < 5 ? 25 : 0;
      const minSeparation = a.radius + b.radius + 12 + verticalLabelSpace;

      if (distance < minSeparation) {
        const overlap = minSeparation - distance;
        const force = overlap * collisionStrength * alpha;
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

// Helper: Apply boundary constraints to a node
function applyBoundaryConstraints(
  node: NodePosition,
  maxX: number,
  maxY: number,
  boundaryStrength: number,
  alpha: number,
): void {
  node.x += node.vx;
  node.y += node.vy;
  node.vx *= 0.88;
  node.vy *= 0.88;

  applyHardBoundary(node, maxX, maxY);
  applySoftBoundary(node, maxX, maxY, boundaryStrength, alpha);
}

// Helper: Apply hard boundary clamping
function applyHardBoundary(node: NodePosition, maxX: number, maxY: number): void {
  if (Math.abs(node.x) > maxX) {
    node.x = Math.sign(node.x) * maxX;
    node.vx *= -0.5;
    const excess = Math.abs(node.x) - maxX;
    node.vx -= Math.sign(node.x) * excess * 0.1;
  }

  if (Math.abs(node.y) > maxY) {
    node.y = Math.sign(node.y) * maxY;
    node.vy *= -0.5;
    const excess = Math.abs(node.y) - maxY;
    node.vy -= Math.sign(node.y) * excess * 0.1;
  }
}

// Helper: Apply soft boundary forces
function applySoftBoundary(
  node: NodePosition,
  maxX: number,
  maxY: number,
  boundaryStrength: number,
  alpha: number,
): void {
  const softBoundaryPadding = 20;
  const softMaxX = maxX - softBoundaryPadding;
  const softMaxY = maxY - softBoundaryPadding;

  if (Math.abs(node.x) > softMaxX) {
    const excess = Math.abs(node.x) - softMaxX;
    node.vx -= Math.sign(node.x) * excess * boundaryStrength * alpha;
  }

  if (Math.abs(node.y) > softMaxY) {
    const excess = Math.abs(node.y) - softMaxY;
    node.vy -= Math.sign(node.y) * excess * boundaryStrength * alpha;
  }
}

// Helper: Initialize cluster positions
function initializeClusterPositions(
  analyzedClusters: Cluster[],
  clusterGridPositions: Map<string, { x: number; y: number }>,
  existingPositions: Map<string, ClusterPosition>,
): Map<string, ClusterPosition> {
  const initClusters = new Map<string, ClusterPosition>();

  for (const cluster of analyzedClusters) {
    const gridPos = clusterGridPositions.get(cluster.id) || { x: 0, y: 0 };
    const bounds = cluster.bounds || { width: 300, height: 300, x: 0, y: 0 };
    const existing = existingPositions.get(cluster.id);

    initClusters.set(cluster.id, {
      id: cluster.id,
      x: existing?.x ?? gridPos.x,
      y: existing?.y ?? gridPos.y,
      vx: existing?.vx ?? 0,
      vy: existing?.vy ?? 0,
      width: bounds.width,
      height: bounds.height,
      nodeCount: cluster.nodes.length,
    });
  }

  return initClusters;
}

// Helper: Calculate node radius based on role
function calculateNodeRadius(
  metadata: { isAnchor: boolean; role?: string },
  config: ClusterLayoutConfig,
): number {
  if (metadata.isAnchor) return config.anchorNodeSize;
  if (metadata.role === 'test') return config.testNodeSize;
  return config.normalNodeSize;
}

// Helper: Initialize node positions
function initializeNodePositions(
  allPositioned: PositionedNode[],
  existingPositions: Map<string, NodePosition>,
  config: ClusterLayoutConfig,
): Map<string, NodePosition> {
  const initPositions = new Map<string, NodePosition>();

  for (const posNode of allPositioned) {
    const existing = existingPositions.get(posNode.node.id);
    const metadata = posNode.metadata;
    const nodeRadius = calculateNodeRadius(metadata, config);

    initPositions.set(posNode.node.id, {
      id: posNode.node.id,
      x: existing?.x ?? posNode.localX!,
      y: existing?.y ?? posNode.localY!,
      vx: existing?.vx ?? 0,
      vy: existing?.vy ?? 0,
      clusterId: posNode.clusterId,
      radius: nodeRadius,
      targetRadius: posNode.targetRadius,
      targetAngle: posNode.targetAngle,
      isAnchor: metadata.isAnchor,
      isTest: metadata.role === 'test',
      testSubject: metadata.testSubjects?.[0],
    });
  }

  return initPositions;
}

export function useRadialClusterSimulation({
  nodes,
  edges,
  draggedNode,
  config: customConfig,
}: UseRadialClusterSimulationOptions) {
  const config = useMemo(
    () => ({ ...DEFAULT_CLUSTER_CONFIG, ...customConfig }),
    [customConfig],
  );

  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [clusterPositions, setClusterPositions] = useState<Map<string, ClusterPosition>>(new Map());
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (nodes.length === 0) return;

    // 1. Group nodes into clusters and analyze
    const analyzedClusters = groupIntoClusters(nodes, edges);
    setClusters(analyzedClusters);

    // 2. Calculate radial positions for each cluster
    const allPositioned: PositionedNode[] = [];
    for (const cluster of analyzedClusters) {
      const positioned = calculateRadialPositions(cluster, config);
      allPositioned.push(...positioned);
      cluster.bounds = calculateClusterBounds(positioned, config);
    }

    // 3. Arrange clusters in bullseye pattern based on connectivity
    const clusterGridPositions = arrangeClustersBullseye(analyzedClusters, edges);

    // 4. Initialize cluster positions
    const initClusters = initializeClusterPositions(
      analyzedClusters,
      clusterGridPositions,
      clusterPositions,
    );

    // 5. Initialize node positions
    const initPositions = initializeNodePositions(allPositioned, nodePositions, config);

    // Force simulation
    let clusterAlpha = 0.8;
    let nodeAlpha = 0.6;
    const CLUSTER_ALPHA_DECAY = 0.985;
    const NODE_ALPHA_DECAY = 0.98;
    let iterations = 0;
    const maxIterations = 500;

    const simulate = () => {
      if ((clusterAlpha < 0.005 && nodeAlpha < 0.005) || iterations > maxIterations) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      // === CLUSTER-LEVEL FORCES ===
      if (clusterAlpha > 0.005) {
        const clusterArray = Array.from(initClusters.values());
        applyClusterCollisionForces(clusterArray, config.clusterSpacing, clusterAlpha);
        applyClusterVelocities(clusterArray, clusterAlpha);
        clusterAlpha *= CLUSTER_ALPHA_DECAY;
      }

      // === NODE-LEVEL FORCES (radial constraints) ===
      if (nodeAlpha > 0.001) {
        for (const cluster of analyzedClusters) {
          const clusterPos = initClusters.get(cluster.id);
          if (!clusterPos) continue;

          const clusterNodes = cluster.nodes.map((n) => initPositions.get(n.id)!).filter(Boolean);

          // Apply positioning forces
          for (const node of clusterNodes) {
            if (draggedNode && node.id === draggedNode) continue;
            applyNodePositioningForce(node, config, nodeAlpha, initPositions);
          }

          // Apply collision forces
          applyNodeCollisionForces(clusterNodes, config.forceStrength.collision, nodeAlpha);

          // Apply boundary constraints
          const bounds = cluster.bounds!;
          const padding = config.clusterPadding;
          const maxX = bounds.width / 2 - padding;
          const maxY = bounds.height / 2 - padding;

          for (const node of clusterNodes) {
            if (draggedNode && node.id === draggedNode) continue;
            applyBoundaryConstraints(node, maxX, maxY, config.forceStrength.boundary, nodeAlpha);
          }
        }

        nodeAlpha *= NODE_ALPHA_DECAY;
      }

      iterations++;

      setClusterPositions(new Map(initClusters));
      setNodePositions(new Map(initPositions));
      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, draggedNode, clusterPositions.get, config, nodePositions.get]);

  return { nodePositions, clusterPositions, clusters, setNodePositions };
}
