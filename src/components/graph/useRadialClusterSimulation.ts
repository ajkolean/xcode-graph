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

    analyzedClusters.forEach((cluster) => {
      const positioned = calculateRadialPositions(cluster, config);
      allPositioned.push(...positioned);

      // Calculate and store cluster bounds
      cluster.bounds = calculateClusterBounds(positioned, config);
    });

    // 3. Arrange clusters in bullseye pattern based on connectivity
    const clusterGridPositions = arrangeClustersBullseye(analyzedClusters, edges);

    // 4. Initialize cluster positions
    const initClusters = new Map<string, ClusterPosition>();
    analyzedClusters.forEach((cluster) => {
      const gridPos = clusterGridPositions.get(cluster.id) || { x: 0, y: 0 };
      const bounds = cluster.bounds || { width: 300, height: 300, x: 0, y: 0 };

      // Keep existing position if cluster already exists
      const existing = clusterPositions.get(cluster.id);

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
    });

    // 5. Initialize node positions
    const initPositions = new Map<string, NodePosition>();
    allPositioned.forEach((posNode) => {
      const existing = nodePositions.get(posNode.node.id);
      const metadata = posNode.metadata;

      // Determine node radius based on role/type
      let nodeRadius = config.normalNodeSize;
      if (metadata.isAnchor) {
        nodeRadius = config.anchorNodeSize;
      } else if (metadata.role === 'test') {
        nodeRadius = config.testNodeSize;
      }

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
    });

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

        // Cluster collision
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
            const minSeparation = aRadius + bRadius + config.clusterSpacing;

            const overlap = minSeparation - distance;
            if (overlap > 0) {
              const force = overlap * 1.0 * clusterAlpha;
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;

              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            }
          }
        }

        // Weak center force
        clusterArray.forEach((cluster) => {
          cluster.vx -= cluster.x * 0.008 * clusterAlpha;
          cluster.vy -= cluster.y * 0.008 * clusterAlpha;
        });

        // Apply velocities
        clusterArray.forEach((cluster) => {
          cluster.x += cluster.vx;
          cluster.y += cluster.vy;
          cluster.vx *= 0.82;
          cluster.vy *= 0.82;
        });

        clusterAlpha *= CLUSTER_ALPHA_DECAY;
      }

      // === NODE-LEVEL FORCES (radial constraints) ===
      if (nodeAlpha > 0.001) {
        analyzedClusters.forEach((cluster) => {
          const clusterPos = initClusters.get(cluster.id);
          if (!clusterPos) return;

          const clusterNodes = cluster.nodes.map((n) => initPositions.get(n.id)!).filter(Boolean);

          clusterNodes.forEach((node) => {
            // Skip if being dragged
            if (draggedNode && node.id === draggedNode) return;

            // 1. Anchor pinning force (strongest)
            if (node.isAnchor) {
              const centerX = 0;
              const centerY = 0;
              node.vx += (centerX - node.x) * config.forceStrength.anchor * nodeAlpha;
              node.vy += (centerY - node.y) * config.forceStrength.anchor * nodeAlpha;
            }

            // 2. Radial position force (for non-test, non-anchor nodes)
            else if (
              !node.isTest &&
              node.targetRadius !== undefined &&
              node.targetAngle !== undefined
            ) {
              const targetX = node.targetRadius * Math.cos(node.targetAngle);
              const targetY = node.targetRadius * Math.sin(node.targetAngle);

              node.vx += (targetX - node.x) * config.forceStrength.radial * nodeAlpha;
              node.vy += (targetY - node.y) * config.forceStrength.radial * nodeAlpha;
            }

            // 3. Test satellite tether (bind to subject)
            else if (node.isTest && node.testSubject) {
              const subjectPos = initPositions.get(node.testSubject);
              if (subjectPos) {
                const dx = node.x - subjectPos.x;
                const dy = node.y - subjectPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const targetDist = config.testOrbitRadius;

                const force =
                  (distance - targetDist) * config.forceStrength.testSatellite * nodeAlpha;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                node.vx -= fx;
                node.vy -= fy;
              }
            }
          });

          // Node collision
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
                const force = overlap * config.forceStrength.collision * nodeAlpha;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
              }
            }
          }

          // Apply velocities and strong boundary constraints
          const bounds = cluster.bounds!;
          const padding = config.clusterPadding;
          const maxX = bounds.width / 2 - padding;
          const maxY = bounds.height / 2 - padding;

          clusterNodes.forEach((node) => {
            if (draggedNode && node.id === draggedNode) return;

            node.x += node.vx;
            node.y += node.vy;
            node.vx *= 0.88;
            node.vy *= 0.88;

            // Strong boundary constraints - clamp position and add repelling force
            if (Math.abs(node.x) > maxX) {
              // Clamp to boundary
              node.x = Math.sign(node.x) * maxX;
              // Reverse velocity
              node.vx *= -0.5;
              // Add inward force
              const excess = Math.abs(node.x) - maxX;
              node.vx -= Math.sign(node.x) * excess * 0.1;
            }

            if (Math.abs(node.y) > maxY) {
              // Clamp to boundary
              node.y = Math.sign(node.y) * maxY;
              // Reverse velocity
              node.vy *= -0.5;
              // Add inward force
              const excess = Math.abs(node.y) - maxY;
              node.vy -= Math.sign(node.y) * excess * 0.1;
            }

            // Additional soft boundary force before hitting edge
            const softBoundaryPadding = 20;
            const softMaxX = maxX - softBoundaryPadding;
            const softMaxY = maxY - softBoundaryPadding;

            if (Math.abs(node.x) > softMaxX) {
              const excess = Math.abs(node.x) - softMaxX;
              const force = excess * config.forceStrength.boundary * nodeAlpha;
              node.vx -= Math.sign(node.x) * force;
            }

            if (Math.abs(node.y) > softMaxY) {
              const excess = Math.abs(node.y) - softMaxY;
              const force = excess * config.forceStrength.boundary * nodeAlpha;
              node.vy -= Math.sign(node.y) * force;
            }
          });
        });

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
