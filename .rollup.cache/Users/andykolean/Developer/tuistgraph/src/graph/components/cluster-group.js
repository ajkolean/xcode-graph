import { __decorate } from "tslib";
import { getConnectedNodes } from '@graph/utils/connections';
import { NodeType, } from '@shared/schemas/graph.types';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import './cluster-card';
import './graph-edges';
import './graph-node';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_2 = { h: b_1 `
      <g role="button" tabindex="0">
        <!-- Cluster card background -->
        <xcode-graph-cluster-card></xcode-graph-cluster-card>

        <!-- Internal edges -->
        <g class="internal-edges">
          <xcode-graph-edges></xcode-graph-edges>
        </g>

        <!-- Nodes -->
        <g class="nodes">
          <?>
        </g>
      </g>
    `, parts: [{ type: 1, index: 0, name: "aria-label", strings: ["", " cluster, ", " targets"], ctor: A_1 }, { type: 1, index: 0, name: "mouseenter", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mouseleave", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "keydown", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "cluster", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "x", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "y", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "width", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "height", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "isHighlighted", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "isSelected", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "clickable", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "cluster-click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "edges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "nodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "finalNodePositions", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "clusterPositions", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "selectedNode", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "hoveredNode", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "cluster-id", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "hoveredClusterId", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "view-mode", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "transitiveDeps", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "transitiveDependents", strings: ["", ""], ctor: P_1 }, { type: 1, index: 5, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 2, index: 8 }] };
const lit_template_3 = { h: b_1 `
              <xcode-graph-node></xcode-graph-node>
            `, parts: [{ type: 1, index: 0, name: "node", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "x", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "y", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "size", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "isSelected", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "isHovered", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "isDimmed", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "node-mouseenter", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-mouseleave", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-mousedown", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-click", strings: ["", ""], ctor: E_1 }] };
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
    createRenderRoot() {
        return this;
    }
    // Hover throttling
    hoverUpdatePending = false;
    pendingHoverState = false;
    /**
     * Throttled hover update using requestAnimationFrame
     */
    scheduleHoverUpdate(hovered) {
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
    handleClusterMouseEnter() {
        this.scheduleHoverUpdate(true);
        this.dispatchEvent(new CustomEvent('cluster-mouseenter', { bubbles: true, composed: true }));
    }
    handleClusterMouseLeave() {
        this.scheduleHoverUpdate(false);
        this.dispatchEvent(new CustomEvent('cluster-mouseleave', { bubbles: true, composed: true }));
    }
    handleClusterClick() {
        this.dispatchEvent(new CustomEvent('cluster-click', { bubbles: true, composed: true }));
    }
    handleClusterKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClusterClick();
        }
    }
    // ========================================
    // Lifecycle
    // ========================================
    hasSignificantZoomChange(changedProps) {
        if (!changedProps.has('zoom'))
            return false;
        const oldZoom = changedProps.get('zoom') ?? 1;
        const newZoom = this.zoom ?? 1;
        return Math.abs(newZoom - oldZoom) > 0.01;
    }
    hasHoverStateChange(changedProps) {
        if (changedProps.has('hoveredNode')) {
            const oldHover = changedProps.get('hoveredNode');
            if (oldHover !== this.hoveredNode)
                return true;
        }
        if (changedProps.has('hoveredClusterId')) {
            const oldHover = changedProps.get('hoveredClusterId');
            if (oldHover !== this.hoveredClusterId)
                return true;
        }
        if (changedProps.has('isClusterHovered')) {
            const oldHover = changedProps.get('isClusterHovered');
            if (oldHover !== this.isClusterHovered)
                return true;
        }
        return false;
    }
    shouldUpdate(changedProps) {
        if (!changedProps.size)
            return true;
        return (changedProps.has('cluster') ||
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
            this.hasHoverStateChange(changedProps));
    }
    // ========================================
    // Helpers
    // ========================================
    get connectedNodes() {
        return this.selectedNode
            ? getConnectedNodes(this.selectedNode.id, this.edges ?? [])
            : new Set();
    }
    get clusterNodes() {
        return this.cluster?.nodes || [];
    }
    // ========================================
    // Render Helpers
    // ========================================
    isNodeDimmed(node, isSelectedNode, isConnected, searchQuery) {
        const isSearchDimmed = !!searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isSelectionDimmed = !!this.selectedNode && !isSelectedNode && !isConnected;
        const isPreviewDimmed = !!this.previewFilter && !this.matchesPreview(node);
        return isSearchDimmed || isSelectionDimmed || isPreviewDimmed;
    }
    matchesPreview(node) {
        if (!this.previewFilter)
            return true;
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
    render() {
        if (!this.cluster || !this.clusterPosition)
            return { ["_$litType$"]: lit_template_1, values: [] };
        const clusterPositionsMap = new Map([[this.cluster.id, this.clusterPosition]]);
        const zoom = this.zoom ?? 1;
        const viewMode = this.viewMode ?? 'full';
        const searchQuery = this.searchQuery ?? '';
        const isSelected = this.isSelected ?? false;
        const finalNodePositions = this.finalNodePositions ?? new Map();
        const edges = this.edges ?? [];
        return { ["_$litType$"]: lit_template_2, values: [this.cluster.name, this.cluster.nodes.length, this.handleClusterMouseEnter, this.handleClusterMouseLeave, this.handleClusterKeyDown, this.cluster, this.clusterPosition.x - this.clusterPosition.width / 2, this.clusterPosition.y - this.clusterPosition.height / 2, this.clusterPosition.width, this.clusterPosition.height, this.isClusterHovered, isSelected, zoom, true, this.handleClusterClick, edges, this.nodes, finalNodePositions, clusterPositionsMap, this.selectedNode, this.hoveredNode, this.cluster.id, this.hoveredClusterId, viewMode, this.transitiveDeps, this.transitiveDependents, zoom, this.clusterNodes.map((node) => {
                    const pos = finalNodePositions.get(node.id);
                    if (!pos)
                        return null;
                    const isSelectedNode = this.selectedNode?.id === node.id;
                    const isConnected = this.selectedNode && this.connectedNodes.has(node.id);
                    return { ["_$litType$"]: lit_template_3, values: [node, (this.clusterPosition?.x ?? 0) + pos.x, (this.clusterPosition?.y ?? 0) + pos.y, getNodeSize(node, edges), getNodeTypeColor(node.type), isSelectedNode, this.hoveredNode === node.id, this.isNodeDimmed(node, isSelectedNode, isConnected, searchQuery), zoom, () => this.dispatchEvent(new CustomEvent('node-mouseenter', {
                                detail: { nodeId: node.id },
                                bubbles: true,
                                composed: true,
                            })), () => this.dispatchEvent(new CustomEvent('node-mouseleave', { bubbles: true, composed: true })), (e) => this.dispatchEvent(new CustomEvent('node-mousedown', {
                                detail: { nodeId: node.id, originalEvent: e.detail.originalEvent },
                                bubbles: true,
                                composed: true,
                            })), (e) => this.dispatchEvent(new CustomEvent('node-click', {
                                detail: { node, originalEvent: e.detail.originalEvent },
                                bubbles: true,
                                composed: true,
                            }))] };
                })] };
    }
}
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "cluster", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "clusterPosition", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "nodes", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "edges", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "finalNodePositions", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "selectedNode", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "hoveredNode", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "hoveredClusterId", void 0);
__decorate([
    property({ type: String, attribute: 'search-query' })
], GraphClusterGroup.prototype, "searchQuery", void 0);
__decorate([
    property({ type: Number })
], GraphClusterGroup.prototype, "zoom", void 0);
__decorate([
    property({ type: String, attribute: 'view-mode' })
], GraphClusterGroup.prototype, "viewMode", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "transitiveDeps", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "transitiveDependents", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-selected' })
], GraphClusterGroup.prototype, "isSelected", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterGroup.prototype, "previewFilter", void 0);
__decorate([
    state()
], GraphClusterGroup.prototype, "isClusterHovered", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-group')) {
    customElements.define('xcode-graph-cluster-group', GraphClusterGroup);
}
//# sourceMappingURL=cluster-group.js.map