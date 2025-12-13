/**
 * GraphEdges Lit Component
 *
 * Renders all edges in the graph with depth-based opacity and highlighting.
 * Handles both cross-cluster and intra-cluster edges.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-edges
 *     .edges=${edgesArray}
 *     .nodes=${nodesArray}
 *     .finalNodePositions=${positionsMap}
 *   ></graph-edges>
 * </svg>
 * ```
 */

import { type ClusterPosition, type NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge as GraphEdgeType, GraphNode } from '@shared/schemas/graph.schema';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { html, LitElement } from 'lit';
import './graph-edge';

export class GraphEdges extends LitElement {
  static override readonly properties = {
    edges: { attribute: false },
    nodes: { attribute: false },
    finalNodePositions: { attribute: false },
    clusterPositions: { attribute: false },
    selectedNode: { attribute: false },
    hoveredNode: { attribute: false },
    clusterId: { type: String, attribute: 'cluster-id' },
    hoveredClusterId: { type: String, attribute: 'hovered-cluster-id' },
    viewMode: { type: String, attribute: 'view-mode' },
    transitiveDeps: { attribute: false },
    transitiveDependents: { attribute: false },
    zoom: { type: Number },
  };

  // No Shadow DOM for SVG
  protected override createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  declare edges: GraphEdgeType[] | undefined;
  declare nodes: GraphNode[] | undefined;
  declare finalNodePositions: Map<string, NodePosition> | undefined;
  declare clusterPositions: Map<string, ClusterPosition> | undefined;
  declare selectedNode: GraphNode | null | undefined;
  declare hoveredNode: string | null | undefined;
  declare clusterId: string | undefined;
  declare hoveredClusterId: string | null | undefined;
  declare viewMode: ViewMode | undefined;
  declare transitiveDeps:
    | {
        nodes: Set<string>;
        edges: Set<string>;
        edgeDepths: Map<string, number>;
        maxDepth: number;
      }
    | undefined;
  declare transitiveDependents:
    | {
        nodes: Set<string>;
        edges: Set<string>;
        edgeDepths: Map<string, number>;
        maxDepth: number;
      }
    | undefined;
  declare zoom: number | undefined;

  // ========================================
  // Memoization
  // ========================================

  private nodeToEdgesCache = new Map<string, Set<string>>();

  private buildNodeToEdgesCache() {
    this.nodeToEdgesCache.clear();

    for (const edge of this.edges || []) {
      const edgeKey = `${edge.source}->${edge.target}`;

      if (!this.nodeToEdgesCache.has(edge.source)) {
        this.nodeToEdgesCache.set(edge.source, new Set());
      }
      this.nodeToEdgesCache.get(edge.source)!.add(edgeKey);

      if (!this.nodeToEdgesCache.has(edge.target)) {
        this.nodeToEdgesCache.set(edge.target, new Set());
      }
      this.nodeToEdgesCache.get(edge.target)!.add(edgeKey);
    }

    this.edgeCacheVersion++;
  }

  // ========================================
  // Helpers
  // ========================================

  private getEdgeOpacity(edge: GraphEdgeType, viewMode: ViewMode): number {
    const edgeKey = `${edge.source}->${edge.target}`;
    const inDepsChain = this.transitiveDeps?.edges.has(edgeKey);
    const inDependentsChain = this.transitiveDependents?.edges.has(edgeKey);

    if (viewMode === ViewMode.Focused && inDepsChain && this.transitiveDeps) {
      const depth = this.transitiveDeps.edgeDepths.get(edgeKey) || 0;
      const maxDepth = this.transitiveDeps.maxDepth || 1;
      return 1 - (depth / maxDepth) * 0.7;
    }

    if (
      (viewMode === ViewMode.Dependents || viewMode === ViewMode.Impact) &&
      inDependentsChain &&
      this.transitiveDependents
    ) {
      const depth = this.transitiveDependents.edgeDepths.get(edgeKey) || 0;
      const maxDepth = this.transitiveDependents.maxDepth || 1;
      return 1 - (depth / maxDepth) * 0.7;
    }

    if (viewMode === ViewMode.Both && (inDepsChain || inDependentsChain)) {
      if (inDepsChain && this.transitiveDeps) {
        const depth = this.transitiveDeps.edgeDepths.get(edgeKey) || 0;
        const maxDepth = this.transitiveDeps.maxDepth || 1;
        return 1 - (depth / maxDepth) * 0.7;
      }
      if (inDependentsChain && this.transitiveDependents) {
        const depth = this.transitiveDependents.edgeDepths.get(edgeKey) || 0;
        const maxDepth = this.transitiveDependents.maxDepth || 1;
        return 1 - (depth / maxDepth) * 0.7;
      }
    }

    return 1;
  }

  // ========================================
  // Lifecycle
  // ========================================

  override willUpdate(changedProps: PropertyValues<this>): void {
    // Rebuild cache when edges change
    if (changedProps.has('edges')) {
      this.buildNodeToEdgesCache();
    }
  }

  override shouldUpdate(changedProps: PropertyValues<this>): boolean {
    // Always update on first render or property changes
    if (changedProps.size === 0) return true;

    // Update if structure changed
    if (
      changedProps.has('edges') ||
      changedProps.has('nodes') ||
      changedProps.has('finalNodePositions') ||
      changedProps.has('clusterPositions') ||
      changedProps.has('clusterId')
    ) {
      return true;
    }

    // Update if visual properties changed
    if (
      changedProps.has('selectedNode') ||
      changedProps.has('hoveredClusterId') ||
      changedProps.has('viewMode') ||
      changedProps.has('transitiveDeps') ||
      changedProps.has('transitiveDependents') ||
      changedProps.has('zoom')
    ) {
      return true;
    }

    // For hoveredNode: only update if it affects any visible edges
    if (changedProps.has('hoveredNode')) {
      const oldHover = changedProps.get('hoveredNode');
      const newHover = this.hoveredNode;

      // If no hover, or hover unchanged, skip
      if (oldHover === newHover) return false;

      // Check if old or new hover affects any edges
      const oldAffected = oldHover ? this.nodeToEdgesCache.has(oldHover) : false;
      const newAffected = newHover ? this.nodeToEdgesCache.has(newHover) : false;

      // Only update if hover actually affects edges
      return oldAffected || newAffected;
    }

    return false;
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    if (!this.edges || !this.nodes) return html``;

    const viewMode = this.viewMode ?? ViewMode.Full;
    const zoom = this.zoom ?? 1;
    const hoveredClusterId = this.hoveredClusterId ?? null;

    // Pre-compute node map to avoid O(n) finds on every edge
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    return html`
      ${this.edges.map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return null;

        const sourceClusterId = sourceNode.project || 'External';
        const targetClusterId = targetNode.project || 'External';

        // Filter based on cluster context
        if (this.clusterId) {
          if (sourceClusterId !== this.clusterId || targetClusterId !== this.clusterId) return null;
        } else if (sourceClusterId === targetClusterId) {
          return null;
        }

        const sourcePos = this.finalNodePositions?.get(edge.source);
        const targetPos = this.finalNodePositions?.get(edge.target);
        const sourceCluster = this.clusterPositions?.get(sourceClusterId);
        const targetCluster = this.clusterPositions?.get(targetClusterId);

        if (!sourcePos || !targetPos || !sourceCluster || !targetCluster) return null;

        const x1 = sourceCluster.x + sourcePos.x;
        const y1 = sourceCluster.y + sourcePos.y;
        const x2 = targetCluster.x + targetPos.x;
        const y2 = targetCluster.y + targetPos.y;

        const isHighlighted =
          this.selectedNode &&
          (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id);
        const isFocused = this.hoveredNode === edge.source || this.hoveredNode === edge.target;

        const isConnectedToHoveredCluster =
          hoveredClusterId &&
          (sourceClusterId === hoveredClusterId || targetClusterId === hoveredClusterId);

        const shouldDim = hoveredClusterId && !isConnectedToHoveredCluster;
        const edgeColor = getNodeTypeColor(targetNode.type);
        const isCrossCluster = !this.clusterId;
        const shouldAnimate = isFocused || isHighlighted;

        const opacity = shouldDim
          ? this.getEdgeOpacity(edge, viewMode) * 0.25
          : this.getEdgeOpacity(edge, viewMode);

        return html`
          <graph-edge
            .x1=${x1}
            .y1=${y1}
            .x2=${x2}
            .y2=${y2}
            .color=${edgeColor}
            .isHighlighted=${isHighlighted || isFocused}
            .isDependent=${isCrossCluster}
            .opacity=${opacity}
            .zoom=${zoom}
            .animated=${shouldAnimate}
          ></graph-edge>
        `;
      })}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-edges': GraphEdges;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-edges')) {
  customElements.define('graph-edges', GraphEdges);
}
