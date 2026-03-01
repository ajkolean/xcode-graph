/**
 * ClusterGroup Lit Component
 *
 * Renders a cluster with its card background, internal edges, and nodes.
 * Orchestrates ClusterCard, GraphEdges, and GraphNode components.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-cluster-group
 *     .cluster=${clusterData}
 *     .clusterPosition=${position}
 *     .nodes=${nodesArray}
 *     .edges=${edgesArray}
 *     .finalNodePositions=${positionsMap}
 *     zoom="1.0"
 *   ></xcode-graph-cluster-group>
 * </svg>
 * ```
 *
 * @fires node-mouseenter, node-mouseleave, node-mousedown, node-click
 * @fires cluster-mouseenter, cluster-mouseleave, cluster-click
 */

import type { TransitiveResult } from '@graph/utils';
import { getConnectedNodes } from '@graph/utils/connections';
import type { Cluster, ClusterPosition, NodePosition, ViewMode } from '@shared/schemas';
import {
  type GraphEdge,
  type GraphNode as GraphNodeType,
  NodeType,
} from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import './cluster-card';
import './graph-edges';
import './graph-node';

/**
 * Renders a cluster with its card background, internal edges, and nodes.
 * Orchestrates ClusterCard, GraphEdges, and GraphNode components.
 *
 * @summary Cluster group orchestrating card, edges, and nodes
 * @fires cluster-mouseenter - Dispatched when the cluster is hovered
 * @fires cluster-mouseleave - Dispatched when the cluster hover ends
 * @fires cluster-click - Dispatched when the cluster is clicked
 * @fires node-mouseenter - Dispatched when a child node is hovered (detail: { nodeId })
 * @fires node-mouseleave - Dispatched when a child node hover ends
 * @fires node-mousedown - Dispatched on child node mouse down (detail: { nodeId, originalEvent })
 * @fires node-click - Dispatched on child node click (detail: { node, originalEvent })
 */
export class GraphClusterGroup extends LitElement {
  // No Shadow DOM for SVG
  protected override createRenderRoot(): this {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare cluster: Cluster | undefined;

  @property({ attribute: false })
  declare clusterPosition: ClusterPosition | undefined;

  @property({ attribute: false })
  declare nodes: GraphNodeType[] | undefined;

  @property({ attribute: false })
  declare edges: GraphEdge[] | undefined;

  @property({ attribute: false })
  declare finalNodePositions: Map<string, NodePosition> | undefined;

  @property({ attribute: false })
  declare selectedNode: GraphNodeType | null | undefined;

  @property({ attribute: false })
  declare hoveredNode: string | null | undefined;

  @property({ attribute: false })
  declare hoveredClusterId: string | null | undefined;

  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string | undefined;

  @property({ type: Number })
  declare zoom: number | undefined;

  @property({ type: String, attribute: 'view-mode' })
  declare viewMode: ViewMode | undefined;

  @property({ attribute: false })
  declare transitiveDeps: TransitiveResult | undefined;

  @property({ attribute: false })
  declare transitiveDependents: TransitiveResult | undefined;

  @property({ type: Boolean, attribute: 'is-selected' })
  declare isSelected: boolean | undefined;

  @property({ attribute: false })
  declare previewFilter: PreviewFilter | undefined;

  @state()
  private declare isClusterHovered: boolean | undefined;

  // Hover throttling
  private hoverUpdatePending = false;
  private pendingHoverState = false;

  /**
   * Throttled hover update using requestAnimationFrame
   */
  private scheduleHoverUpdate(hovered: boolean): void {
    this.pendingHoverState = hovered;

    if (!this.hoverUpdatePending) {
      this.hoverUpdatePending = true;
      requestAnimationFrame(() => {
        this.isClusterHovered = this.pendingHoverState;
        this.hoverUpdatePending = false;
      });
    }
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleClusterMouseEnter() {
    this.scheduleHoverUpdate(true);
    this.dispatchEvent(new CustomEvent('cluster-mouseenter', { bubbles: true, composed: true }));
  }

  private handleClusterMouseLeave() {
    this.scheduleHoverUpdate(false);
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
  // Lifecycle
  // ========================================

  private hasSignificantZoomChange(changedProps: PropertyValues): boolean {
    if (!changedProps.has('zoom')) return false;
    const oldZoom = (changedProps.get('zoom') as number) ?? 1;
    const newZoom = this.zoom ?? 1;
    return Math.abs(newZoom - oldZoom) > 0.01;
  }

  private hasHoverStateChange(changedProps: PropertyValues): boolean {
    if (changedProps.has('hoveredNode')) {
      const oldHover = changedProps.get('hoveredNode');
      if (oldHover !== this.hoveredNode) return true;
    }
    if (changedProps.has('hoveredClusterId')) {
      const oldHover = changedProps.get('hoveredClusterId');
      if (oldHover !== this.hoveredClusterId) return true;
    }
    if (changedProps.has('isClusterHovered')) {
      const oldHover = changedProps.get('isClusterHovered');
      if (oldHover !== this.isClusterHovered) return true;
    }
    return false;
  }

  override shouldUpdate(changedProps: PropertyValues): boolean {
    if (!changedProps.size) return true;

    return (
      changedProps.has('cluster') ||
      changedProps.has('clusterPosition') ||
      changedProps.has('nodes') ||
      changedProps.has('edges') ||
      changedProps.has('finalNodePositions') ||
      changedProps.has('selectedNode') ||
      changedProps.has('isSelected') ||
      changedProps.has('viewMode') ||
      changedProps.has('transitiveDeps') ||
      changedProps.has('transitiveDependents') ||
      changedProps.has('previewFilter') ||
      changedProps.has('searchQuery') ||
      this.hasSignificantZoomChange(changedProps) ||
      this.hasHoverStateChange(changedProps)
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private get connectedNodes(): Set<string> {
    return this.selectedNode
      ? getConnectedNodes(this.selectedNode.id, this.edges ?? [])
      : new Set();
  }

  private get clusterNodes(): GraphNodeType[] {
    return this.cluster?.nodes || [];
  }

  // ========================================
  // Render Helpers
  // ========================================

  private isNodeDimmed(
    node: GraphNodeType,
    isSelectedNode: boolean,
    isConnected: boolean | GraphNodeType | null | undefined,
    searchQuery: string,
  ): boolean {
    const isSearchDimmed =
      !!searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isSelectionDimmed = !!this.selectedNode && !isSelectedNode && !isConnected;
    const isPreviewDimmed = !!this.previewFilter && !this.matchesPreview(node);
    return isSearchDimmed || isSelectionDimmed || isPreviewDimmed;
  }

  private matchesPreview(node: GraphNodeType): boolean {
    if (!this.previewFilter) return true;
    switch (this.previewFilter.type) {
      case 'nodeType':
        return node.type === this.previewFilter.value;
      case 'platform':
        return node.platform === this.previewFilter.value;
      case 'origin':
        return node.origin === this.previewFilter.value;
      case 'project':
        return node.project === this.previewFilter.value;
      case 'package':
        return node.type === NodeType.Package && node.name === this.previewFilter.value;
      default:
        return true;
    }
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    if (!this.cluster || !this.clusterPosition) return html``;

    const clusterPositionsMap = new Map([[this.cluster.id, this.clusterPosition]]);
    const zoom = this.zoom ?? 1;
    const viewMode = this.viewMode ?? 'full';
    const searchQuery = this.searchQuery ?? '';
    const isSelected = this.isSelected ?? false;
    const finalNodePositions = this.finalNodePositions ?? new Map<string, NodePosition>();
    const edges = this.edges ?? [];

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
        <xcode-graph-cluster-card
          .cluster=${this.cluster}
          .x=${this.clusterPosition.x - this.clusterPosition.width / 2}
          .y=${this.clusterPosition.y - this.clusterPosition.height / 2}
          .width=${this.clusterPosition.width}
          .height=${this.clusterPosition.height}
          .isHighlighted=${this.isClusterHovered}
          .isSelected=${isSelected}
          .zoom=${zoom}
          .clickable=${true}
          @cluster-click=${this.handleClusterClick}
        ></xcode-graph-cluster-card>

        <!-- Internal edges -->
        <g class="internal-edges">
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${this.nodes}
            .finalNodePositions=${finalNodePositions}
            .clusterPositions=${clusterPositionsMap}
            .selectedNode=${this.selectedNode}
            .hoveredNode=${this.hoveredNode}
            cluster-id=${this.cluster.id}
            .hoveredClusterId=${this.hoveredClusterId}
            view-mode=${viewMode}
            .transitiveDeps=${this.transitiveDeps}
            .transitiveDependents=${this.transitiveDependents}
            .zoom=${zoom}
          ></xcode-graph-edges>
        </g>

        <!-- Nodes -->
        <g class="nodes">
          ${this.clusterNodes.map((node) => {
            const pos = finalNodePositions.get(node.id);
            if (!pos) return null;

            const isSelectedNode = this.selectedNode?.id === node.id;
            const isConnected = this.selectedNode && this.connectedNodes.has(node.id);

            return html`
              <xcode-graph-node
                .node=${node}
                .x=${(this.clusterPosition?.x ?? 0) + pos.x}
                .y=${(this.clusterPosition?.y ?? 0) + pos.y}
                .size=${getNodeSize(node, edges)}
                .color=${getNodeTypeColor(node.type)}
                .isSelected=${isSelectedNode}
                .isHovered=${this.hoveredNode === node.id}
                .isDimmed=${this.isNodeDimmed(node, isSelectedNode, isConnected, searchQuery)}
                .zoom=${zoom}
                @node-mouseenter=${() =>
                  this.dispatchEvent(
                    new CustomEvent('node-mouseenter', {
                      detail: { nodeId: node.id },
                      bubbles: true,
                      composed: true,
                    }),
                  )}
                @node-mouseleave=${() =>
                  this.dispatchEvent(
                    new CustomEvent('node-mouseleave', { bubbles: true, composed: true }),
                  )}
                @node-mousedown=${(e: CustomEvent) =>
                  this.dispatchEvent(
                    new CustomEvent('node-mousedown', {
                      detail: { nodeId: node.id, originalEvent: e.detail.originalEvent },
                      bubbles: true,
                      composed: true,
                    }),
                  )}
                @node-click=${(e: CustomEvent) =>
                  this.dispatchEvent(
                    new CustomEvent('node-click', {
                      detail: { node, originalEvent: e.detail.originalEvent },
                      bubbles: true,
                      composed: true,
                    }),
                  )}
              ></xcode-graph-node>
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
    'xcode-graph-cluster-group': GraphClusterGroup;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-group')) {
  customElements.define('xcode-graph-cluster-group', GraphClusterGroup);
}
