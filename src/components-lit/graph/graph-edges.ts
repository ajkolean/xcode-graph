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

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphEdge as GraphEdgeType, GraphNode } from '@/data/mockGraphData';
import type { ViewMode } from '@/types/app';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import { getNodeTypeColor } from '@/components/graph/graphUtils';
import './graph-edge';

export class GraphEdges extends LitElement {
  // No Shadow DOM for SVG
  protected createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare edges: GraphEdgeType[];

  @property({ attribute: false })
  declare nodes: GraphNode[];

  @property({ attribute: false })
  declare finalNodePositions: Map<string, NodePosition>;

  @property({ attribute: false })
  declare clusterPositions: Map<string, ClusterPosition>;

  @property({ attribute: false })
  declare selectedNode: GraphNode | null;

  @property({ attribute: false })
  declare hoveredNode: string | null;

  @property({ type: String, attribute: 'cluster-id' })
  clusterId: string | undefined;

  @property({ type: String, attribute: 'hovered-cluster-id' })
  hoveredClusterId: string | null = null;

  @property({ type: String, attribute: 'view-mode' })
  viewMode: ViewMode = 'full';

  @property({ attribute: false })
  declare transitiveDeps: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  } | undefined;

  @property({ attribute: false })
  declare transitiveDependents: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  } | undefined;

  @property({ type: Number })
  zoom: number = 1.0;

  // ========================================
  // Helpers
  // ========================================

  private getEdgeOpacity(edge: GraphEdgeType): number {
    const edgeKey = `${edge.source}->${edge.target}`;
    const inDepsChain = this.transitiveDeps?.edges.has(edgeKey);
    const inDependentsChain = this.transitiveDependents?.edges.has(edgeKey);

    if (this.viewMode === 'focused' && inDepsChain && this.transitiveDeps) {
      const depth = this.transitiveDeps.edgeDepths.get(edgeKey) || 0;
      const maxDepth = this.transitiveDeps.maxDepth || 1;
      return 1.0 - (depth / maxDepth) * 0.7;
    }

    if (this.viewMode === 'dependents' && inDependentsChain && this.transitiveDependents) {
      const depth = this.transitiveDependents.edgeDepths.get(edgeKey) || 0;
      const maxDepth = this.transitiveDependents.maxDepth || 1;
      return 1.0 - (depth / maxDepth) * 0.7;
    }

    if (this.viewMode === 'both' && (inDepsChain || inDependentsChain)) {
      if (inDepsChain && this.transitiveDeps) {
        const depth = this.transitiveDeps.edgeDepths.get(edgeKey) || 0;
        const maxDepth = this.transitiveDeps.maxDepth || 1;
        return 1.0 - (depth / maxDepth) * 0.7;
      }
      if (inDependentsChain && this.transitiveDependents) {
        const depth = this.transitiveDependents.edgeDepths.get(edgeKey) || 0;
        const maxDepth = this.transitiveDependents.maxDepth || 1;
        return 1.0 - (depth / maxDepth) * 0.7;
      }
    }

    return 1.0;
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.edges || !this.nodes) return html``;

    return html`
      ${this.edges.map((edge) => {
        const sourceNode = this.nodes.find((n) => n.id === edge.source);
        const targetNode = this.nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;

        const sourceClusterId = sourceNode.project || 'External';
        const targetClusterId = targetNode.project || 'External';

        // Filter based on cluster context
        if (this.clusterId) {
          if (sourceClusterId !== this.clusterId || targetClusterId !== this.clusterId) return null;
        } else {
          if (sourceClusterId === targetClusterId) return null;
        }

        const sourcePos = this.finalNodePositions.get(edge.source);
        const targetPos = this.finalNodePositions.get(edge.target);
        const sourceCluster = this.clusterPositions.get(sourceClusterId);
        const targetCluster = this.clusterPositions.get(targetClusterId);

        if (!sourcePos || !targetPos || !sourceCluster || !targetCluster) return null;

        const x1 = sourceCluster.x + sourcePos.x;
        const y1 = sourceCluster.y + sourcePos.y;
        const x2 = targetCluster.x + targetPos.x;
        const y2 = targetCluster.y + targetPos.y;

        const isHighlighted =
          this.selectedNode && (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id);
        const isFocused = this.hoveredNode === edge.source || this.hoveredNode === edge.target;

        const isConnectedToHoveredCluster =
          this.hoveredClusterId &&
          (sourceClusterId === this.hoveredClusterId || targetClusterId === this.hoveredClusterId);

        const shouldDim = this.hoveredClusterId && !isConnectedToHoveredCluster;
        const edgeColor = getNodeTypeColor(targetNode.type);
        const isCrossCluster = !this.clusterId;
        const shouldAnimate = isFocused || isHighlighted;

        const opacity = shouldDim ? this.getEdgeOpacity(edge) * 0.08 : this.getEdgeOpacity(edge);

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
            .zoom=${this.zoom}
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
