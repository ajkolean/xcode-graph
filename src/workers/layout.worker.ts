/**
 * Layout Computation Web Worker
 *
 * Offloads heavy layout calculations to a separate thread.
 * Prevents UI blocking during complex graph layout computation.
 *
 * Uses Comlink for type-safe communication with main thread.
 */

import { expose } from 'comlink';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { Cluster } from '../types/cluster';
import type { ClusterPosition, NodePosition } from '../types/simulation';
import { analyzeCluster } from '../utils/clusterAnalysis';
import { groupIntoClusters } from '../utils/clusterGrouping';
import { computeHierarchicalLayout } from '../utils/hierarchicalLayout';
import { SpatialHash } from '../utils/spatial-hash';
import type { LayoutInput, LayoutOutput, LayoutProgress, LayoutWorkerAPI } from './layout-api';

class LayoutWorker implements LayoutWorkerAPI {
  private animationId: number | null = null;
  private isAnimating = false;
  private currentTick = 0;
  private totalTicks = 30;

  /**
   * Compute initial deterministic layout
   */
  async computeInitialLayout(input: LayoutInput): Promise<LayoutOutput> {
    const { nodes, edges } = input;

    if (nodes.length === 0) {
      return {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
        isAnimating: false,
        tickCount: 0,
        totalTicks: 0,
      };
    }

    // Step 1: Group into clusters
    const analyzedClusters = groupIntoClusters(nodes, edges);
    analyzedClusters.forEach((cluster) => {
      analyzeCluster(cluster, edges);
    });

    // Step 2: Compute deterministic layout
    const { clusterPositions, nodePositions, clusters } = computeHierarchicalLayout(
      nodes,
      edges,
      analyzedClusters,
    );

    // Add velocities (but don't animate)
    const animatedNodePos = new Map<string, NodePosition>();
    nodePositions.forEach((pos, id) => {
      animatedNodePos.set(id, { ...pos, vx: 0, vy: 0 });
    });

    const animatedClusterPos = new Map<string, ClusterPosition>();
    clusterPositions.forEach((pos, id) => {
      animatedClusterPos.set(id, { ...pos, vx: 0, vy: 0 });
    });

    return {
      nodePositions: animatedNodePos,
      clusterPositions: animatedClusterPos,
      clusters,
      isAnimating: false,
      tickCount: 0,
      totalTicks: 0,
    };
  }

  /**
   * Compute animated layout with physics
   */
  async computeAnimatedLayout(
    input: LayoutInput,
    onProgress: (progress: LayoutProgress) => void,
  ): Promise<LayoutOutput> {
    const { nodes, edges, enableAnimation = true, animationTicks = 30 } = input;

    // Get initial layout
    const initial = await this.computeInitialLayout(input);

    if (!enableAnimation || nodes.length === 0) {
      return initial;
    }

    // Start animation
    this.isAnimating = true;
    this.currentTick = 0;
    this.totalTicks = animationTicks;

    const { nodePositions, clusterPositions, clusters } = initial;

    // Animate using requestAnimationFrame simulation
    return new Promise((resolve) => {
      const animate = () => {
        if (this.currentTick >= this.totalTicks || !this.isAnimating) {
          // Animation complete
          this.isAnimating = false;

          // Zero velocities
          nodePositions.forEach((pos) => {
            pos.vx = 0;
            pos.vy = 0;
          });
          clusterPositions.forEach((pos) => {
            pos.vx = 0;
            pos.vy = 0;
          });

          onProgress({
            type: 'complete',
            tickCount: this.currentTick,
            totalTicks: this.totalTicks,
            nodePositions,
            clusterPositions,
          });

          resolve({
            nodePositions,
            clusterPositions,
            clusters,
            isAnimating: false,
            tickCount: this.currentTick,
            totalTicks: this.totalTicks,
          });
          return;
        }

        // Alpha decay
        const alpha = 1 - this.currentTick / this.totalTicks;

        // Apply forces
        this.applyGentleForces(nodePositions, clusterPositions, edges, clusters, alpha);

        // Update positions
        this.updatePositions(nodePositions, clusterPositions, alpha);

        this.currentTick++;

        // Send progress update
        onProgress({
          type: 'progress',
          tickCount: this.currentTick,
          totalTicks: this.totalTicks,
          nodePositions: new Map(nodePositions),
          clusterPositions: new Map(clusterPositions),
        });

        // Continue animation
        setTimeout(animate, 16); // ~60fps
      };

      animate();
    });
  }

  /**
   * Cancel ongoing animation
   */
  async cancelAnimation(): Promise<void> {
    this.isAnimating = false;
    this.currentTick = 0;
  }

  /**
   * Get worker status
   */
  async getStatus() {
    return {
      isAnimating: this.isAnimating,
      currentTick: this.currentTick,
      totalTicks: this.totalTicks,
    };
  }

  // ========================================
  // Physics Simulation (same as controller)
  // ========================================

  private applyGentleForces(
    nodePos: Map<string, NodePosition>,
    clusterPos: Map<string, ClusterPosition>,
    edges: GraphEdge[],
    clusters: Cluster[],
    alpha: number,
  ) {
    // Node collision within clusters
    for (const cluster of clusters) {
      const clusterNodes = cluster.nodes
        .map((n) => nodePos.get(n.id))
        .filter((p): p is NodePosition => p !== undefined);
      this.applyNodeCollision(clusterNodes, alpha);
    }

    // Cluster spacing
    this.applyClusterSpacing(Array.from(clusterPos.values()), alpha);

    // Link attraction
    this.applyLinkForces(edges, nodePos, alpha);
  }

  private applyNodeCollision(nodes: NodePosition[], alpha: number) {
    if (nodes.length === 0) return;

    // Use spatial hash for O(n log n) collision detection
    const cellSize = Math.max(...nodes.map((n) => (n.radius || 10) * 2 + 8)) || 50;
    const spatialHash = new SpatialHash<NodePosition>({ cellSize });
    spatialHash.insertMany(nodes);

    const pairs = spatialHash.getPotentialCollisions();

    for (const [a, b] of pairs) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0 || distance > 100) continue;

      const minSeparation = (a.radius || 10) + (b.radius || 10) + 8;

      if (distance < minSeparation) {
        const overlap = minSeparation - distance;
        const force = overlap * 0.3 * alpha;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        a.vx = (a.vx || 0) - fx;
        a.vy = (a.vy || 0) - fy;
        b.vx = (b.vx || 0) + fx;
        b.vy = (b.vy || 0) + fy;
      }
    }
  }

  private applyClusterSpacing(clusters: ClusterPosition[], alpha: number) {
    if (clusters.length === 0) return;

    interface ClusterEntity extends ClusterPosition {
      id: string;
      radius: number;
    }

    const clusterEntities: ClusterEntity[] = clusters.map((c) => ({
      ...c,
      radius: Math.sqrt(c.width * c.width + c.height * c.height) / 2,
    }));

    const cellSize = Math.max(...clusterEntities.map((c) => c.radius * 2 + 80)) || 200;
    const spatialHash = new SpatialHash<ClusterEntity>({ cellSize });
    spatialHash.insertMany(clusterEntities);

    const pairs = spatialHash.getPotentialCollisions();

    for (const [a, b] of pairs) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const minSeparation = a.radius + b.radius + 80;

      if (distance < minSeparation) {
        const overlap = minSeparation - distance;
        const force = overlap * 0.4 * alpha;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        a.vx = (a.vx || 0) - fx;
        a.vy = (a.vy || 0) - fy;
        b.vx = (b.vx || 0) + fx;
        b.vy = (b.vy || 0) + fy;
      }
    }
  }

  private applyLinkForces(edges: GraphEdge[], nodePos: Map<string, NodePosition>, alpha: number) {
    for (const edge of edges) {
      const source = nodePos.get(edge.source);
      const target = nodePos.get(edge.target);

      if (!source || !target) continue;
      if (source.clusterId !== target.clusterId) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const targetDist = 70;
      const force = (distance - targetDist) * 0.05 * alpha;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      source.vx = (source.vx || 0) + fx * 0.5;
      source.vy = (source.vy || 0) + fy * 0.5;
      target.vx = (target.vx || 0) - fx * 0.5;
      target.vy = (target.vy || 0) - fy * 0.5;
    }
  }

  private updatePositions(
    nodePos: Map<string, NodePosition>,
    clusterPos: Map<string, ClusterPosition>,
    alpha: number,
  ) {
    // Update nodes
    nodePos.forEach((pos) => {
      if (!pos.vx && !pos.vy) return;

      pos.x += pos.vx * alpha;
      pos.y += pos.vy * alpha;

      // Strong damping
      pos.vx *= 0.7;
      pos.vy *= 0.7;
    });

    // Update clusters
    clusterPos.forEach((pos) => {
      if (!pos.vx && !pos.vy) return;

      pos.x += pos.vx * alpha;
      pos.y += pos.vy * alpha;

      // Strong damping
      pos.vx *= 0.7;
      pos.vy *= 0.7;
    });
  }
}

// Create and expose worker instance
const worker = new LayoutWorker();
expose(worker);
