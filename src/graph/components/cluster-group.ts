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

import type { TransitiveResult } from '@graph/utils';
import { getConnectedNodes } from '@graph/utils/connections';
import type { Cluster, ClusterPosition, NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode as GraphNodeType } from '@shared/schemas/graph.schema';
import type { PreviewFilter } from '@shared/signals';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { html, LitElement, type PropertyValues } from 'lit';
import { trackLitPerformance } from '@/utils/lit-performance-tracker';
import './cluster-card';
import './graph-edges';
import './graph-node';

export class GraphClusterGroup extends LitElement {
  static override readonly properties = {
    cluster: { attribute: false },
    clusterPosition: { attribute: false },
    nodes: { attribute: false },
    edges: { attribute: false },
    finalNodePositions: { attribute: false },
    selectedNode: { attribute: false },
    hoveredNode: { attribute: false },
    hoveredClusterId: { attribute: false },
    searchQuery: { type: String, attribute: 'search-query' },
    zoom: { type: Number },
    viewMode: { type: String, attribute: 'view-mode' },
    transitiveDeps: { attribute: false },
    transitiveDependents: { attribute: false },
    isSelected: { type: Boolean, attribute: 'is-selected' },
    previewFilter: { attribute: false },
    isClusterHovered: { state: true },
  };

  // No Shadow DOM for SVG
  protected override createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  declare cluster: Cluster | undefined;
  declare clusterPosition: ClusterPosition | undefined;
  declare nodes: GraphNodeType[] | undefined;
  declare edges: GraphEdge[] | undefined;
  declare finalNodePositions: Map<string, NodePosition> | undefined;
  declare selectedNode: GraphNodeType | null | undefined;
  declare hoveredNode: string | null | undefined;
  declare hoveredClusterId: string | null | undefined;
  declare searchQuery: string | undefined;
  declare zoom: number | undefined;
  declare viewMode: ViewMode | undefined;
  declare transitiveDeps: TransitiveResult | undefined;
  declare transitiveDependents: TransitiveResult | undefined;
  declare isSelected: boolean | undefined;
  declare previewFilter: PreviewFilter | undefined;
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

  private hasSignificantZoomChange(changedProps: Map<PropertyKey, unknown>): boolean {
    if (!changedProps.has('zoom')) return false;
    const oldZoom = (changedProps.get('zoom') as number) ?? 1;
    const newZoom = this.zoom ?? 1;
    return Math.abs(newZoom - oldZoom) > 0.01;
  }

  private hasHoverStateChange(changedProps: Map<PropertyKey, unknown>): boolean {
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

  override shouldUpdate(changedProps: Map<PropertyKey, unknown>): boolean {
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
    return this.selectedNode ? getConnectedNodes(this.selectedNode.id, this.edges) : new Set();
  }

  private get clusterNodes(): GraphNodeType[] {
    return this.cluster?.nodes || [];
  }

  // ========================================
  // Render
  // ========================================

  override updated(changed: PropertyValues) {
    super.updated(changed);
    trackLitPerformance(this, changed);
  }

  override render() {
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
        <graph-cluster-card
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
        ></graph-cluster-card>

        <!-- Internal edges -->
        <g class="internal-edges">
          <graph-edges
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
          ></graph-edges>
        </g>

        <!-- Nodes -->
        <g class="nodes">
          ${this.clusterNodes.map((node) => {
            const pos = finalNodePositions.get(node.id);
            if (!pos) return null;

            const isSelectedNode = this.selectedNode?.id === node.id;
            const isHovered = this.hoveredNode === node.id;
            const isConnected = this.selectedNode && this.connectedNodes.has(node.id);
            const isSearchMatch =
              searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPreview =
              !this.previewFilter ||
              (this.previewFilter.type === 'nodeType' && node.type === this.previewFilter.value) ||
              (this.previewFilter.type === 'platform' &&
                node.platform === this.previewFilter.value) ||
              (this.previewFilter.type === 'origin' && node.origin === this.previewFilter.value) ||
              (this.previewFilter.type === 'project' &&
                node.project === this.previewFilter.value) ||
              (this.previewFilter.type === 'package' &&
                node.type === 'package' &&
                node.name === this.previewFilter.value);

            const isDimmed =
              (searchQuery && !isSearchMatch) ||
              (this.selectedNode && !isSelectedNode && !isConnected) ||
              (this.previewFilter && !matchesPreview);

            const size = getNodeSize(node, edges);
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
