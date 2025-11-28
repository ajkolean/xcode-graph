/**
 * Physics Controller - Force calculations for graph layout
 *
 * Handles all physics force calculations for graph layout settling.
 * Separated from layout and animation for single responsibility compliance.
 *
 * **Responsibilities:**
 * - Node collision detection and resolution within clusters
 * - Cluster spacing forces between groups
 * - Link/edge attraction forces (spring-like)
 * - Force configuration and tuning
 *
 * **Force Types:**
 * - Collision: Prevents node overlap using radius-based detection
 * - Spacing: Keeps clusters separated with minimum distance
 * - Attraction: Pulls linked nodes toward target distance (Hooke's law)
 *
 * @module controllers/physics
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphEdge } from '../schemas/graph.schema';
import type { Cluster } from '../types/cluster';
import type { ClusterPosition, NodePosition } from '../types/simulation';
import {
  applyCollisionForces,
  type CollisionEntity,
  CollisionPresets,
  calculateBoundingRadius,
} from '../utils/physics/collision';

// ==================== Type Definitions ====================

/**
 * Physics simulation configuration
 */
export interface PhysicsConfig {
  nodeCollisionStrength?: number;
  clusterCollisionStrength?: number;
  linkAttractionStrength?: number;
  linkTargetDistance?: number;
}

// ==================== Controller Class ====================

/**
 * Reactive controller for physics force calculations
 *
 * Applies collision, spacing, and attraction forces during animation.
 * Forces are scaled by alpha for gradual settling behavior.
 */
export class PhysicsController implements ReactiveController {
  private host: ReactiveControllerHost;

  // Configuration
  private nodeCollisionStrength: number;
  private clusterCollisionStrength: number;
  private linkAttractionStrength: number;
  private linkTargetDistance: number;

  constructor(host: ReactiveControllerHost, config: PhysicsConfig = {}) {
    this.host = host;
    this.nodeCollisionStrength = config.nodeCollisionStrength ?? 0.3;
    this.clusterCollisionStrength = config.clusterCollisionStrength ?? 0.4;
    this.linkAttractionStrength = config.linkAttractionStrength ?? 0.05;
    this.linkTargetDistance = config.linkTargetDistance ?? 70;
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Apply all physics forces for one simulation tick
   */
  applyForces(
    nodePositions: Map<string, NodePosition>,
    clusterPositions: Map<string, ClusterPosition>,
    edges: GraphEdge[],
    clusters: Cluster[],
    alpha: number,
  ): void {
    // 1. Node collision within clusters
    this.applyNodeCollisions(nodePositions, clusters, alpha);

    // 2. Cluster spacing
    this.applyClusterSpacing(clusterPositions, alpha);

    // 3. Link attraction
    this.applyLinkAttractionForces(nodePositions, edges, alpha);
  }

  // ========================================
  // Force Calculations
  // ========================================

  /**
   * Apply collision forces between nodes within their clusters
   */
  private applyNodeCollisions(
    nodePositions: Map<string, NodePosition>,
    clusters: Cluster[],
    alpha: number,
  ): void {
    // Process each cluster independently
    for (const cluster of clusters) {
      const clusterNodes = cluster.nodes
        .map((n) => nodePositions.get(n.id))
        .filter((p): p is NodePosition => p !== undefined);

      // Use shared collision logic
      applyCollisionForces(clusterNodes, alpha, {
        ...CollisionPresets.NODE_COLLISION,
        forceStrength: this.nodeCollisionStrength,
      });
    }
  }

  /**
   * Apply spacing forces between clusters
   */
  private applyClusterSpacing(clusterPositions: Map<string, ClusterPosition>, alpha: number): void {
    // Convert clusters to collision entities with calculated radius
    interface ClusterEntity extends ClusterPosition, CollisionEntity {
      radius: number;
    }

    const clusterEntities: ClusterEntity[] = Array.from(clusterPositions.values()).map((pos) => ({
      ...pos,
      radius: calculateBoundingRadius(pos.width, pos.height),
    }));

    // Use shared collision logic
    applyCollisionForces(clusterEntities, alpha, {
      ...CollisionPresets.CLUSTER_SPACING,
      forceStrength: this.clusterCollisionStrength,
    });
  }

  /**
   * Apply attractive forces along edges (spring-like)
   */
  private applyLinkAttractionForces(
    nodePositions: Map<string, NodePosition>,
    edges: GraphEdge[],
    alpha: number,
  ): void {
    for (const edge of edges) {
      const source = nodePositions.get(edge.source);
      const target = nodePositions.get(edge.target);

      if (!source || !target) continue;

      // Only apply within same cluster
      if (source.clusterId !== target.clusterId) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      // Spring force (Hooke's law)
      const displacement = distance - this.linkTargetDistance;
      const force = displacement * this.linkAttractionStrength * alpha;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      // Apply force to both ends (equal and opposite)
      source.vx = (source.vx || 0) + fx * 0.5;
      source.vy = (source.vy || 0) + fy * 0.5;
      target.vx = (target.vx || 0) - fx * 0.5;
      target.vy = (target.vy || 0) - fy * 0.5;
    }
  }

  // ========================================
  // Configuration
  // ========================================

  setNodeCollisionStrength(strength: number): void {
    this.nodeCollisionStrength = Math.max(0, Math.min(1, strength));
  }

  setClusterCollisionStrength(strength: number): void {
    this.clusterCollisionStrength = Math.max(0, Math.min(1, strength));
  }

  setLinkAttractionStrength(strength: number): void {
    this.linkAttractionStrength = Math.max(0, Math.min(1, strength));
  }

  setLinkTargetDistance(distance: number): void {
    this.linkTargetDistance = Math.max(10, distance);
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {}

  hostDisconnected(): void {
    // No cleanup needed (stateless)
  }
}