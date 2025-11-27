/**
 * ClusterGroup Lit Component
 *
 * Renders a cluster with its card background, internal edges, and nodes.
 * Orchestrates ClusterCard, GraphEdges, and GraphNode components.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-cluster-group
 *     .cluster=${clusterData}
 *     .clusterPosition=${position}
 *     .nodes=${nodesArray}
 *     .edges=${edgesArray}
 *     .finalNodePositions=${positionsMap}
 *     zoom="1.0"
 *   ></graph-cluster-group>
 * </svg>
 * ```
 *
 * @fires node-mouseenter, node-mouseleave, node-mousedown, node-click
 * @fires cluster-mouseenter, cluster-mouseleave, cluster-click
 */

import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { GraphEdge, GraphNode as GraphNodeType } from '@/data/mockGraphData';
import type { ViewMode } from '@/types/app';
import type { Cluster } from '@/types/cluster';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import { getConnectedNodes, getNodeSize, getNodeTypeColor } from '@/components/graph/graphUtils';
import './cluster-card';
import './graph-edges';
import './graph-node';

export class GraphClusterGroup extends LitElement {
  // No Shadow DOM for SVG
  protected createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare cluster: Cluster;

  @property({ attribute: false })
  declare clusterPosition: ClusterPosition;

  @property({ attribute: false })
  declare nodes: GraphNodeType[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  declare finalNodePositions: Map<string, NodePosition>;

  @property({ attribute: false })
  declare selectedNode: GraphNodeType | null;

  @property({ attribute: false })
  declare hoveredNode: string | null;

  @property({ attribute: false })
  declare hoveredClusterId: string | null;

  @property({ type: String, attribute: 'search-query' })
  searchQuery: string = '';

  @property({ type: Number })
  zoom: number = 1.0;

  @property({ type: String, attribute: 'view-mode' })
  viewMode: ViewMode = 'full';

  @property({ attribute: false })
  declare transitiveDeps: any;

  @property({ attribute: false })
  declare transitiveDependents: any;

  @property({ type: Boolean, attribute: 'is-selected' })
  isSelected: boolean = false;

  @property({ attribute: false })
  declare previewFilter: any;

  @state()
  private declare isClusterHovered: boolean;

  // ========================================
  // Event Handlers
  // ========================================

  private handleClusterMouseEnter() {
    this.isClusterHovered = true;
    this.dispatchEvent(new CustomEvent('cluster-mouseenter', { bubbles: true, composed: true }));
  }

  private handleClusterMouseLeave() {
    this.isClusterHovered = false;
    this.dispatchEvent(new CustomEvent('cluster-mouseleave', { bubbles: true, composed: true }));
  }

  private handleClusterClick() {
    this.dispatchEvent(new CustomEvent('cluster-click', { bubbles: true, composed: true }));
  }

  private handleClusterKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClusterClick();
    }
  }

  // ========================================
  // Helpers
  // ========================================

  private get connectedNodes(): Set<string> {
    return this.selectedNode ? getConnectedNodes(this.selectedNode.id, this.edges) : new Set();
  }

  private get clusterNodes(): GraphNodeType[] {
    return this.cluster?.nodes || [];
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.cluster || !this.clusterPosition) return html``;

    const clusterPositionsMap = new Map([[this.cluster.id, this.clusterPosition]]);

    return html`
      <g
        role="button"
        aria-label="${this.cluster.name} cluster, ${this.cluster.nodes.length} targets"
        tabindex="0"
        @mouseenter=${this.handleClusterMouseEnter}
        @mouseleave=${this.handleClusterMouseLeave}
        @keydown=${this.handleClusterKeyDown}
      >
        <!-- Cluster card background -->
        <graph-cluster-card
          .cluster=${this.cluster}
          .x=${this.clusterPosition.x - this.clusterPosition.width / 2}
          .y=${this.clusterPosition.y - this.clusterPosition.height / 2}
          .width=${this.clusterPosition.width}
          .height=${this.clusterPosition.height}
          .isHighlighted=${this.isClusterHovered}
          .isSelected=${this.isSelected}
          .zoom=${this.zoom}
          .clickable=${true}
          @cluster-click=${this.handleClusterClick}
        ></graph-cluster-card>

        <!-- Internal edges -->
        <g class="internal-edges">
          <graph-edges
            .edges=${this.edges}
            .nodes=${this.nodes}
            .finalNodePositions=${this.finalNodePositions}
            .clusterPositions=${clusterPositionsMap}
            .selectedNode=${this.selectedNode}
            .hoveredNode=${this.hoveredNode}
            cluster-id=${this.cluster.id}
            .hoveredClusterId=${this.hoveredClusterId}
            view-mode=${this.viewMode}
            .transitiveDeps=${this.transitiveDeps}
            .transitiveDependents=${this.transitiveDependents}
            .zoom=${this.zoom}
          ></graph-edges>
        </g>

        <!-- Nodes -->
        <g class="nodes">
          ${this.clusterNodes.map((node) => {
            const pos = this.finalNodePositions.get(node.id);
            if (!pos) return null;

            const isSelectedNode = this.selectedNode?.id === node.id;
            const isHovered = this.hoveredNode === node.id;
            const isConnected = this.selectedNode && this.connectedNodes.has(node.id);
            const isSearchMatch =
              this.searchQuery && node.name.toLowerCase().includes(this.searchQuery.toLowerCase());

            const matchesPreview =
              !this.previewFilter ||
              (this.previewFilter.type === 'nodeType' && node.type === this.previewFilter.value) ||
              (this.previewFilter.type === 'platform' && node.platform === this.previewFilter.value) ||
              (this.previewFilter.type === 'origin' && node.origin === this.previewFilter.value) ||
              (this.previewFilter.type === 'project' && node.project === this.previewFilter.value) ||
              (this.previewFilter.type === 'package' &&
                node.type === 'package' &&
                node.name === this.previewFilter.value);

            const isDimmed =
              (this.searchQuery && !isSearchMatch) ||
              (this.selectedNode && !isSelectedNode && !isConnected) ||
              (this.previewFilter && !matchesPreview);

            const size = getNodeSize(node, this.edges);
            const color = getNodeTypeColor(node.type);
            const x = this.clusterPosition.x + pos.x;
            const y = this.clusterPosition.y + pos.y;

            return html`
              <graph-node
                .node=${node}
                .x=${x}
                .y=${y}
                .size=${size}
                .color=${color}
                .isSelected=${isSelectedNode}
                .isHovered=${isHovered}
                .isDimmed=${isDimmed}
                .zoom=${this.zoom}
                @node-mouseenter=${() =>
                  this.dispatchEvent(
                    new CustomEvent('node-mouseenter', {
                      detail: { nodeId: node.id },
                      bubbles: true,
                      composed: true,
                    })
                  )}
                @node-mouseleave=${() =>
                  this.dispatchEvent(new CustomEvent('node-mouseleave', { bubbles: true, composed: true }))}
                @node-mousedown=${(e: CustomEvent) =>
                  this.dispatchEvent(
                    new CustomEvent('node-mousedown', {
                      detail: { nodeId: node.id, originalEvent: e.detail.originalEvent },
                      bubbles: true,
                      composed: true,
                    })
                  )}
                @node-click=${(e: CustomEvent) =>
                  this.dispatchEvent(
                    new CustomEvent('node-click', {
                      detail: { node, originalEvent: e.detail.originalEvent },
                      bubbles: true,
                      composed: true,
                    })
                  )}
              ></graph-node>
            `;
          })}
        </g>
      </g>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-group': GraphClusterGroup;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster-group')) {
  customElements.define('graph-cluster-group', GraphClusterGroup);
}
