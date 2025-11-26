/**
 * Animated hybrid layout: Architecture first, gentle physics polish
 *
 * Shows a "space ballet" settling animation:
 * 1. Start with deterministic positions (rings, clusters, tests)
 * 2. Animate gentle forces for ~30 ticks
 * 3. Freeze into final static positions
 *
 * This creates the organic "cosmic settling" effect while maintaining
 * structural integrity from the deterministic layout.
 */

import { useEffect, useRef, useState } from 'react';
import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';
import type { ClusterPosition, NodePosition } from '../../types/simulation';
import { analyzeCluster } from '../../utils/clusterAnalysis';
import { groupIntoClusters } from '../../utils/clusterGrouping';
import { computeHierarchicalLayout } from '../../utils/hierarchicalLayout';

interface AnimatedLayoutOptions {
  enableAnimation?: boolean;
  animationTicks?: number;
}

export function useAnimatedLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: AnimatedLayoutOptions = {},
) {
  const { enableAnimation = true, animationTicks = 30 } = options;

  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [clusterPositions, setClusterPositions] = useState<Map<string, ClusterPosition>>(new Map());
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isSettling, setIsSettling] = useState(false);

  const animationRef = useRef<number>();
  const tickCountRef = useRef(0);

  useEffect(() => {
    if (nodes.length === 0) {
      setNodePositions(new Map());
      setClusterPositions(new Map());
      setClusters([]);
      return;
    }

    // Step 1: Compute DETERMINISTIC layout (architecture first!)
    const analyzedClusters = groupIntoClusters(nodes, edges);
    analyzedClusters.forEach((cluster) => {
      analyzeCluster(cluster, edges);
    });

    const {
      clusterPositions: initialClusterPos,
      nodePositions: initialNodePos,
      clusters: layoutClusters,
    } = computeHierarchicalLayout(nodes, edges, analyzedClusters);

    // Add velocities for animation
    const animatedNodePos = new Map<string, NodePosition>();
    initialNodePos.forEach((pos, id) => {
      animatedNodePos.set(id, { ...pos, vx: 0, vy: 0 });
    });

    const animatedClusterPos = new Map<string, ClusterPosition>();
    initialClusterPos.forEach((pos, id) => {
      animatedClusterPos.set(id, { ...pos, vx: 0, vy: 0 });
    });

    setClusters(layoutClusters);

    // If animation disabled, just set final positions
    if (!enableAnimation) {
      setNodePositions(animatedNodePos);
      setClusterPositions(animatedClusterPos);
      return;
    }

    // Step 2: Animate gentle settling (physics second!)
    setIsSettling(true);
    tickCountRef.current = 0;

    const animate = () => {
      const tick = tickCountRef.current;

      if (tick >= animationTicks) {
        // Animation complete - freeze positions
        setIsSettling(false);

        // Zero out velocities
        animatedNodePos.forEach((pos) => {
          pos.vx = 0;
          pos.vy = 0;
        });
        animatedClusterPos.forEach((pos) => {
          pos.vx = 0;
          pos.vy = 0;
        });

        setNodePositions(new Map(animatedNodePos));
        setClusterPositions(new Map(animatedClusterPos));
        return;
      }

      // Alpha decay: 1.0 → 0.0 over animation ticks
      const alpha = 1 - tick / animationTicks;

      // Apply gentle forces
      applyGentleForces(animatedNodePos, animatedClusterPos, layoutClusters, edges, alpha);

      // Update positions
      updatePositions(animatedNodePos, animatedClusterPos, alpha);

      tickCountRef.current++;
      setNodePositions(new Map(animatedNodePos));
      setClusterPositions(new Map(animatedClusterPos));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, enableAnimation, animationTicks]);

  return {
    nodePositions,
    clusterPositions,
    clusters,
    isSettling,
  };
}

/**
 * Apply gentle forces for organic settling
 * Very light forces - just polish, don't rearrange
 */
function applyGentleForces(
  nodePositions: Map<string, NodePosition>,
  clusterPositions: Map<string, ClusterPosition>,
  clusters: Cluster[],
  edges: GraphEdge[],
  alpha: number,
) {
  // 1. Gentle node collision (prevent overlaps within clusters)
  clusters.forEach((cluster) => {
    const clusterNodes = cluster.nodes
      .map((n) => nodePositions.get(n.id))
      .filter((p): p is NodePosition => p !== undefined);

    for (let i = 0; i < clusterNodes.length; i++) {
      for (let j = i + 1; j < clusterNodes.length; j++) {
        const a = clusterNodes[i];
        const b = clusterNodes[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0 || distance > 100) continue;

        const minSeparation = (a.radius || 10) + (b.radius || 10) + 8;

        if (distance < minSeparation) {
          const overlap = minSeparation - distance;
          const force = overlap * 0.3 * alpha; // Gentle!
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          a.vx = (a.vx || 0) - fx;
          a.vy = (a.vy || 0) - fy;
          b.vx = (b.vx || 0) + fx;
          b.vy = (b.vy || 0) + fy;
        }
      }
    }
  });

  // 2. Very gentle cluster spacing (prevent overlap)
  const clusterArray = Array.from(clusterPositions.values());

  for (let i = 0; i < clusterArray.length; i++) {
    for (let j = i + 1; j < clusterArray.length; j++) {
      const a = clusterArray[i];
      const b = clusterArray[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const aRadius = Math.sqrt(a.width * a.width + a.height * a.height) / 2;
      const bRadius = Math.sqrt(b.width * b.width + b.height * b.height) / 2;
      const minSeparation = aRadius + bRadius + 80;

      if (distance < minSeparation) {
        const overlap = minSeparation - distance;
        const force = overlap * 0.4 * alpha; // Gentle!
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        a.vx = (a.vx || 0) - fx;
        a.vy = (a.vy || 0) - fy;
        b.vx = (b.vx || 0) + fx;
        b.vy = (b.vy || 0) + fy;
      }
    }
  }

  // 3. Mild link attraction (smooth edge paths)
  edges.forEach((edge) => {
    const source = nodePositions.get(edge.source);
    const target = nodePositions.get(edge.target);

    if (!source || !target) return;
    if (source.clusterId !== target.clusterId) return; // Only internal edges

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const targetDist = 70;
    const force = (distance - targetDist) * 0.05 * alpha; // Very gentle!

    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    source.vx = (source.vx || 0) + fx * 0.5;
    source.vy = (source.vy || 0) + fy * 0.5;
    target.vx = (target.vx || 0) - fx * 0.5;
    target.vy = (target.vy || 0) - fy * 0.5;
  });
}

/**
 * Update positions based on velocities
 */
function updatePositions(
  nodePositions: Map<string, NodePosition>,
  clusterPositions: Map<string, ClusterPosition>,
  alpha: number,
) {
  // Update nodes with damping
  nodePositions.forEach((pos) => {
    if (!pos.vx || !pos.vy) return;

    pos.x += pos.vx * alpha;
    pos.y += pos.vy * alpha;

    // Strong damping - we want quick settling
    pos.vx *= 0.7;
    pos.vy *= 0.7;
  });

  // Update clusters with damping
  clusterPositions.forEach((pos) => {
    if (!pos.vx || !pos.vy) return;

    pos.x += pos.vx * alpha;
    pos.y += pos.vy * alpha;

    // Strong damping
    pos.vx *= 0.7;
    pos.vy *= 0.7;
  });
}
