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

import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.schema';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  applyCollisionForces,
  applyLinkForces,
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
    // Nodes are frozen in relative positions - no forces applied
    // Only used if animation is enabled (currently disabled by default)
  }

  /**
   * Update node positions to follow their cluster's movement
   * Nodes stay in fixed positions relative to cluster center
   */
  private updateNodesWithClusters(
    nodePositions: Map<string, NodePosition>,
    clusterPositions: Map<string, ClusterPosition>,
    clusters: Cluster[],
  ): void {
    // For each cluster, move all its nodes by the cluster's velocity
    for (const cluster of clusters) {
      const clusterPos = clusterPositions.get(cluster.id);
      if (!clusterPos) continue;

      for (const node of cluster.nodes) {
        const nodePos = nodePositions.get(node.id);
        if (!nodePos) continue;

        // Nodes move with their cluster
        nodePos.x += clusterPos.vx;
        nodePos.y += clusterPos.vy;
      }
    }
  }

  /**
   * STRICTLY enforce cluster boundaries - nodes CANNOT escape
   */
  private enforceClusterBoundaries(
    nodePositions: Map<string, NodePosition>,
    clusterPositions: Map<string, ClusterPosition>,
  ): void {
    for (const [_nodeId, nodePos] of nodePositions) {
      const clusterPos = clusterPositions.get(nodePos.clusterId);
      if (!clusterPos) continue;

      // Hard boundary - cluster radius minus node radius
      const clusterRadius = clusterPos.width / 2;
      const nodeRadius = nodePos.radius ?? 6;
      const maxRadius = clusterRadius - nodeRadius - 2; // 2px safety margin

      // Distance from cluster center
      const dx = nodePos.x - clusterPos.x;
      const dy = nodePos.y - clusterPos.y;
      const dist = Math.hypot(dx, dy);

      // ALWAYS clamp if outside boundary
      if (dist > maxRadius) {
        const scale = dist > 0 ? maxRadius / dist : 0;
        nodePos.x = clusterPos.x + dx * scale;
        nodePos.y = clusterPos.y + dy * scale;
        // Kill velocity when hitting boundary
        nodePos.vx = 0;
        nodePos.vy = 0;
      }
    }
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
    applyLinkForces(edges, nodePositions, alpha, {
      targetDistance: this.linkTargetDistance,
      strength: this.linkAttractionStrength,
      sameClusterOnly: true,
    });
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

  hostConnected(): void {
    // Required by ReactiveControllerHost interface - no initialization needed
  }

  hostDisconnected(): void {
    // No cleanup needed (stateless)
  }
}
