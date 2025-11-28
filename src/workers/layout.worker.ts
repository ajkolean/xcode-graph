/**
 * Layout Computation Web Worker
 *
 * Offloads heavy layout calculations to a separate thread.
 * Prevents UI blocking during complex graph layout computation.
 *
 * Uses Comlink for type-safe communication with main thread.
 */

import { expose } from 'comlink';
import type { GraphEdge, GraphNode } from '@/schemas/graph.schema';
import type { Cluster } from '@/schemas';
import type { ClusterPosition, NodePosition } from '@/schemas';
import { analyzeCluster } from '@/layout/cluster-analysis';
import { groupIntoClusters } from '@/layout/cluster-grouping';
import { computeHierarchicalLayout } from '@/layout/hierarchical';
import {
  applyCollisionForces,
  applyLinkForces,
  calculateBoundingRadius,
  CollisionPresets,
  LinkForcePresets,
  updatePositionMap,
} from '@/utils/physics/collision';
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
        this.updatePositionsFromVelocities(nodePositions, clusterPositions, alpha);

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
    this.applyWorkerLinkForces(edges, nodePos, alpha);
  }

  private applyNodeCollision(nodes: NodePosition[], alpha: number) {
    if (nodes.length === 0) return;

    // Ensure all nodes have a radius for collision detection
    const nodesWithRadius = nodes.map((n) => ({
      ...n,
      radius: n.radius || 10,
    }));

    applyCollisionForces(nodesWithRadius, alpha, CollisionPresets.NODE_COLLISION);

    // Copy velocities back to original nodes
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].vx = nodesWithRadius[i].vx;
      nodes[i].vy = nodesWithRadius[i].vy;
    }
  }

  private applyClusterSpacing(clusters: ClusterPosition[], alpha: number) {
    if (clusters.length === 0) return;

    // Create collision entities with computed bounding radius
    const clusterEntities = clusters.map((c) => ({
      ...c,
      radius: calculateBoundingRadius(c.width, c.height),
    }));

    applyCollisionForces(clusterEntities, alpha, CollisionPresets.CLUSTER_SPACING);

    // Copy velocities back to original clusters
    for (let i = 0; i < clusters.length; i++) {
      clusters[i].vx = clusterEntities[i].vx;
      clusters[i].vy = clusterEntities[i].vy;
    }
  }

  private applyWorkerLinkForces(
    edges: GraphEdge[],
    nodePos: Map<string, NodePosition>,
    alpha: number,
  ) {
    applyLinkForces(edges, nodePos, alpha, LinkForcePresets.DEFAULT);
  }

  private updatePositionsFromVelocities(
    nodePos: Map<string, NodePosition>,
    clusterPos: Map<string, ClusterPosition>,
    alpha: number,
  ) {
    // NodePosition and ClusterPosition need radius for updatePositionMap
    // Use the shared utility with default damping (0.7)
    updatePositionMap(nodePos as Map<string, NodePosition & { radius: number }>, alpha);
    updatePositionMap(clusterPos as Map<string, ClusterPosition & { radius: number }>, alpha);
  }
}

// Create and expose worker instance
const worker = new LayoutWorker();
expose(worker);
