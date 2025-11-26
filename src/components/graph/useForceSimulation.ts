import { useEffect, useRef, useState } from 'react';
import type { ClusterPosition, NodePosition } from '../../types/simulation';

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

    clusterArray.forEach(([clusterId, clusterNodes], i) => {
      const existing = clusterPositions.get(clusterId);

      // Estimate cluster size based on node count
      const nodeCount = clusterNodes.length;
      const width = Math.max(250, Math.min(400, 150 + Math.sqrt(nodeCount) * 40));
      const height = Math.max(200, Math.min(350, 120 + Math.sqrt(nodeCount) * 35));

      if (existing) {
        // Keep existing position but update size
        existing.width = width;
        existing.height = height;
        existing.nodeCount = nodeCount;
        clusters.set(clusterId, existing);
      } else {
        // Initialize far apart in a circle
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
    });

    // Initialize node positions within clusters
    const positions = new Map<string, NodePosition>();
    nodesByCluster.forEach((clusterNodes, clusterId) => {
      clusterNodes.forEach((node, i) => {
        const existing = nodePositions.get(node.id);

        // Calculate node radius based on type
        let nodeRadius = 10;
        if (node.type === 'app') nodeRadius = 18;
        else if (node.type === 'framework') nodeRadius = 14;
        else if (node.type === 'library') nodeRadius = 12;
        else if (node.type === 'cli') nodeRadius = 14;
        else if (node.type === 'test-unit' || node.type === 'test-ui') nodeRadius = 8;
        else if (node.type === 'package') nodeRadius = 12;

        if (existing) {
          // Keep position but update radius
          existing.radius = nodeRadius;
          positions.set(node.id, existing);
        } else {
          // Initialize in small circle within cluster center
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
      });
    });

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
        const clusterArray = Array.from(clusters.values());

        // Cluster collision and repulsion force
        for (let i = 0; i < clusterArray.length; i++) {
          for (let j = i + 1; j < clusterArray.length; j++) {
            const a = clusterArray[i];
            const b = clusterArray[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) continue;

            // Calculate required separation based on actual cluster dimensions
            const aRadius = Math.sqrt(a.width * a.width + a.height * a.height) / 2;
            const bRadius = Math.sqrt(b.width * b.width + b.height * b.height) / 2;
            // Reduced separation since we now calculate sizes properly
            const minSeparation = aRadius + bRadius + 60; // Reduced from 120

            // Calculate overlap
            const overlap = minSeparation - distance;

            if (overlap > 0) {
              // Moderate repulsion when overlapping (reduced from 2.0)
              const force = overlap * 1.2 * clusterAlpha;
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;

              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            } else {
              // Weaker repulsion when close (reduced from 5000)
              const force = (3000 * clusterAlpha) / (distance * distance);
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;

              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            }
          }
        }

        // Cluster link force (based on cross-project dependencies)
        // Use bidirectional edge counts for optimal placement
        const processedPairs = new Set<string>();

        clusterEdges.forEach((count, key) => {
          // Only process bidirectional keys (format: "ClusterA<->ClusterB")
          if (!key.includes('<->')) return;

          const [clusterA, clusterB] = key.split('<->');
          const pairKey = [clusterA, clusterB].sort().join('<->');

          // Skip if already processed
          if (processedPairs.has(pairKey)) return;
          processedPairs.add(pairKey);

          const source = clusters.get(clusterA);
          const target = clusters.get(clusterB);
          if (!source || !target) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          // Scale attraction based on total bidirectional edge count
          // More edges = stronger attraction and shorter target distance
          const edgeWeight = Math.sqrt(count); // Diminishing returns for many edges
          const targetDist = Math.max(250, 400 - edgeWeight * 30); // Closer for more connections
          const strengthMultiplier = 1 + edgeWeight * 0.15; // Stronger pull for more connections

          const force = (distance - targetDist) * 0.25 * strengthMultiplier * clusterAlpha;

          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        });

        // Weaker center force for clusters
        clusterArray.forEach((cluster) => {
          cluster.vx -= cluster.x * 0.01 * clusterAlpha;
          cluster.vy -= cluster.y * 0.01 * clusterAlpha;
        });

        // Apply cluster velocities with damping
        clusterArray.forEach((cluster) => {
          cluster.x += cluster.vx;
          cluster.y += cluster.vy;
          cluster.vx *= 0.8;
          cluster.vy *= 0.8;
        });

        clusterAlpha *= CLUSTER_ALPHA_DECAY;
      }

      // === NODE FORCES (within clusters) ===
      if (nodeAlpha > 0.001) {
        nodesByCluster.forEach((clusterNodes, clusterId) => {
          const cluster = clusters.get(clusterId);
          if (!cluster) return;

          const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
          const nodeArray = clusterNodes.map((n) => positions.get(n.id)!).filter(Boolean);

          // Internal edges only
          const internalEdges = edges.filter((e) => {
            const source = nodes.find((n) => n.id === e.source);
            const target = nodes.find((n) => n.id === e.target);
            return source && target && clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target);
          });

          // Node link force
          internalEdges.forEach((edge) => {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);
            if (!source || !target) return;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = 60;
            const force = (distance - targetDist) * 0.2 * nodeAlpha;

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          });

          // Node collision force with size-aware repulsion
          for (let i = 0; i < nodeArray.length; i++) {
            for (let j = i + 1; j < nodeArray.length; j++) {
              const a = nodeArray[i];
              const b = nodeArray[j];

              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance === 0) continue;

              // Calculate minimum separation based on node sizes
              const minSeparation = a.radius + b.radius + 4; // 4px gap

              if (distance < minSeparation) {
                // Strong collision force when overlapping
                const overlap = minSeparation - distance;
                const force = overlap * 0.8 * nodeAlpha;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
              } else {
                // Gentle repulsion based on node sizes
                const effectiveCharge = a.radius * b.radius * 50;
                const distSq = distance * distance;
                const force = (-effectiveCharge * nodeAlpha) / distSq;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                a.vx += fx;
                a.vy += fy;
                b.vx -= fx;
                b.vy -= fy;
              }
            }
          }

          // Center nodes within cluster
          nodeArray.forEach((node) => {
            node.vx -= node.x * 0.05 * nodeAlpha;
            node.vy -= node.y * 0.05 * nodeAlpha;
          });

          // Apply node velocities and constrain to cluster bounds
          const padding = 40;
          const maxX = cluster.width / 2 - padding;
          const maxY = cluster.height / 2 - padding;

          nodeArray.forEach((node) => {
            if (!draggedNode || node.id !== draggedNode) {
              node.x += node.vx;
              node.y += node.vy;
              node.vx *= 0.85;
              node.vy *= 0.85;

              // Constrain to cluster bounds
              node.x = Math.max(-maxX, Math.min(maxX, node.x));
              node.y = Math.max(-maxY, Math.min(maxY, node.y));
            }
          });
        });

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
