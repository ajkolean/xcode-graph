/**
 * AnimatedLayoutController
 *
 * Full layout animation controller with gentle physics settling.
 * Converted from useAnimatedLayout React hook.
 *
 * Creates "space ballet" effect:
 * 1. Starts with deterministic positions
 * 2. Applies gentle forces for ~30 ticks
 * 3. Freezes into final static positions
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import { analyzeCluster } from '@/utils/clusterAnalysis';
import { groupIntoClusters } from '@/utils/clusterGrouping';
import { computeHierarchicalLayout } from '@/utils/hierarchicalLayout';

export interface AnimatedLayoutConfig {
  enableAnimation?: boolean;
  animationTicks?: number;
}

export class AnimatedLayoutController implements ReactiveController {
  private host: ReactiveControllerHost;

  // Configuration
  enableAnimation: boolean;
  animationTicks: number;

  // State
  nodePositions = new Map<string, NodePosition>();
  clusterPositions = new Map<string, ClusterPosition>();
  clusters: Cluster[] = [];
  isSettling = false;

  // Animation state
  private animationId: number | null = null;
  private tickCount = 0;

  constructor(host: ReactiveControllerHost, config: AnimatedLayoutConfig = {}) {
    this.host = host;
    this.enableAnimation = config.enableAnimation ?? true;
    this.animationTicks = config.animationTicks ?? 30;
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  computeLayout(nodes: GraphNode[], edges: GraphEdge[]) {
    if (nodes.length === 0) {
      this.nodePositions = new Map();
      this.clusterPositions = new Map();
      this.clusters = [];
      this.host.requestUpdate();
      return;
    }

    // Step 1: Compute deterministic layout
    const analyzedClusters = groupIntoClusters(nodes, edges);
    analyzedClusters.forEach((cluster) => {
      analyzeCluster(cluster, edges);
    });

    const { clusterPositions: initialClusterPos, nodePositions: initialNodePos, clusters: layoutClusters } =
      computeHierarchicalLayout(nodes, edges, analyzedClusters);

    // Add velocities for animation
    const animatedNodePos = new Map<string, NodePosition>();
    initialNodePos.forEach((pos, id) => {
      animatedNodePos.set(id, { ...pos, vx: 0, vy: 0 });
    });

    const animatedClusterPos = new Map<string, ClusterPosition>();
    initialClusterPos.forEach((pos, id) => {
      animatedClusterPos.set(id, { ...pos, vx: 0, vy: 0 });
    });

    this.clusters = layoutClusters;

    // If animation disabled, set final positions immediately
    if (!this.enableAnimation) {
      this.nodePositions = animatedNodePos;
      this.clusterPositions = animatedClusterPos;
      this.host.requestUpdate();
      return;
    }

    // Step 2: Start animation
    this.startAnimation(animatedNodePos, animatedClusterPos, edges);
  }

  private startAnimation(
    nodePos: Map<string, NodePosition>,
    clusterPos: Map<string, ClusterPosition>,
    edges: GraphEdge[],
  ) {
    this.stopAnimation();
    this.isSettling = true;
    this.tickCount = 0;

    const animate = () => {
      if (this.tickCount >= this.animationTicks) {
        // Animation complete
        this.isSettling = false;

        // Zero velocities
        nodePos.forEach((pos) => {
          pos.vx = 0;
          pos.vy = 0;
        });
        clusterPos.forEach((pos) => {
          pos.vx = 0;
          pos.vy = 0;
        });

        this.nodePositions = new Map(nodePos);
        this.clusterPositions = new Map(clusterPos);
        this.host.requestUpdate();
        return;
      }

      // Alpha decay
      const alpha = 1 - this.tickCount / this.animationTicks;

      // Apply forces
      this.applyGentleForces(nodePos, clusterPos, edges, alpha);

      // Update positions
      this.updatePositions(nodePos, clusterPos, alpha);

      this.tickCount++;
      this.nodePositions = new Map(nodePos);
      this.clusterPositions = new Map(clusterPos);
      this.host.requestUpdate();

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // ========================================
  // Physics
  // ========================================

  private applyGentleForces(
    nodePos: Map<string, NodePosition>,
    clusterPos: Map<string, ClusterPosition>,
    edges: GraphEdge[],
    alpha: number,
  ) {
    // Node collision within clusters
    for (const cluster of this.clusters) {
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
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

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
  }

  private applyClusterSpacing(clusters: ClusterPosition[], alpha: number) {
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const a = clusters[i];
        const b = clusters[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) continue;

        const aRadius = Math.sqrt(a.width * a.width + a.height * a.height) / 2;
        const bRadius = Math.sqrt(b.width * b.width + b.height * b.height) / 2;
        const minSeparation = aRadius + bRadius + 80;

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
      if (!pos.vx || !pos.vy) return;

      pos.x += pos.vx * alpha;
      pos.y += pos.vy * alpha;

      // Strong damping
      pos.vx *= 0.7;
      pos.vy *= 0.7;
    });

    // Update clusters
    clusterPos.forEach((pos) => {
      if (!pos.vx || !pos.vy) return;

      pos.x += pos.vx * alpha;
      pos.y += pos.vy * alpha;

      // Strong damping
      pos.vx *= 0.7;
      pos.vy *= 0.7;
    });
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {}

  hostDisconnected(): void {
    this.stopAnimation();
  }
}
