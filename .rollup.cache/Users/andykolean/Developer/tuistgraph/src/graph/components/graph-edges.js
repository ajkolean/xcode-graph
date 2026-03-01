import { __decorate } from "tslib";
/**
 * GraphEdges Lit Component
 *
 * Renders all edges in the graph with depth-based opacity and highlighting.
 * Handles both cross-cluster and intra-cluster edges.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-edges
 *     .edges=${edgesArray}
 *     .nodes=${nodesArray}
 *     .finalNodePositions=${positionsMap}
 *   ></xcode-graph-edges>
 * </svg>
 * ```
 */
import { ViewMode } from '@shared/schemas';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './graph-edge';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { PropertyPart: P_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <xcode-graph-edge></xcode-graph-edge>
    `, parts: [{ type: 1, index: 0, name: "x1", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "y1", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "x2", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "y2", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "isHighlighted", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "isDependent", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "opacity", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "animated", strings: ["", ""], ctor: P_1 }] };
const lit_template_2 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_3 = { h: b_1 `
      <?>
    `, parts: [{ type: 2, index: 0 }] };
/**
 * Renders all edges in the graph with depth-based opacity and highlighting.
 * Handles both cross-cluster and intra-cluster edges.
 *
 * @summary Collection renderer for all graph edges
 */
export class GraphEdges extends LitElement {
    // No Shadow DOM for SVG
    createRenderRoot() {
        return this;
    }
    nodeToEdgesCache = new Map();
    buildNodeToEdgesCache() {
        this.nodeToEdgesCache.clear();
        for (const edge of this.edges || []) {
            const edgeKey = `${edge.source}->${edge.target}`;
            if (!this.nodeToEdgesCache.has(edge.source)) {
                this.nodeToEdgesCache.set(edge.source, new Set());
            }
            this.nodeToEdgesCache.get(edge.source)?.add(edgeKey);
            if (!this.nodeToEdgesCache.has(edge.target)) {
                this.nodeToEdgesCache.set(edge.target, new Set());
            }
            this.nodeToEdgesCache.get(edge.target)?.add(edgeKey);
        }
    }
    // ========================================
    // Helpers
    // ========================================
    computeDepthOpacity(edgeKey, chain) {
        const depth = chain.edgeDepths.get(edgeKey) || 0;
        const maxDepth = chain.maxDepth || 1;
        return 1 - (depth / maxDepth) * 0.7;
    }
    getEdgeOpacity(edge, viewMode) {
        const edgeKey = `${edge.source}->${edge.target}`;
        const inDepsChain = this.transitiveDeps?.edges.has(edgeKey);
        const inDependentsChain = this.transitiveDependents?.edges.has(edgeKey);
        if (viewMode === ViewMode.Focused && inDepsChain && this.transitiveDeps) {
            return this.computeDepthOpacity(edgeKey, this.transitiveDeps);
        }
        if (viewMode === ViewMode.Dependents && inDependentsChain && this.transitiveDependents) {
            return this.computeDepthOpacity(edgeKey, this.transitiveDependents);
        }
        if (viewMode === ViewMode.Both) {
            if (inDepsChain && this.transitiveDeps) {
                return this.computeDepthOpacity(edgeKey, this.transitiveDeps);
            }
            if (inDependentsChain && this.transitiveDependents) {
                return this.computeDepthOpacity(edgeKey, this.transitiveDependents);
            }
        }
        return 1;
    }
    // ========================================
    // Lifecycle
    // ========================================
    willUpdate(changedProps) {
        // Rebuild cache when edges change
        if (changedProps.has('edges')) {
            this.buildNodeToEdgesCache();
        }
    }
    shouldUpdate(changedProps) {
        // Always update on first render or property changes
        if (changedProps.size === 0)
            return true;
        // Update if structure changed
        if (changedProps.has('edges') ||
            changedProps.has('nodes') ||
            changedProps.has('finalNodePositions') ||
            changedProps.has('clusterPositions') ||
            changedProps.has('clusterId')) {
            return true;
        }
        // Update if visual properties changed
        if (changedProps.has('selectedNode') ||
            changedProps.has('hoveredClusterId') ||
            changedProps.has('viewMode') ||
            changedProps.has('transitiveDeps') ||
            changedProps.has('transitiveDependents') ||
            changedProps.has('zoom')) {
            return true;
        }
        // For hoveredNode: only update if it affects any visible edges
        if (changedProps.has('hoveredNode')) {
            const oldHover = changedProps.get('hoveredNode');
            const newHover = this.hoveredNode;
            // If no hover, or hover unchanged, skip
            if (oldHover === newHover)
                return false;
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
    /**
     * Determines whether an edge should be visible based on cluster context.
     * Returns false if the edge should be filtered out.
     */
    isEdgeVisibleForCluster(sourceClusterId, targetClusterId) {
        if (this.clusterId) {
            return sourceClusterId === this.clusterId && targetClusterId === this.clusterId;
        }
        return sourceClusterId !== targetClusterId;
    }
    /**
     * Computes the final opacity for an edge, considering hover dimming.
     */
    computeEdgeFinalOpacity(edge, viewMode, sourceClusterId, targetClusterId, hoveredClusterId) {
        const baseOpacity = this.getEdgeOpacity(edge, viewMode);
        if (!hoveredClusterId)
            return baseOpacity;
        const isConnected = sourceClusterId === hoveredClusterId || targetClusterId === hoveredClusterId;
        return isConnected ? baseOpacity : baseOpacity * 0.25;
    }
    renderEdge(edge, nodeMap, viewMode, zoom, hoveredClusterId) {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode)
            return null;
        const sourceClusterId = sourceNode.project || 'External';
        const targetClusterId = targetNode.project || 'External';
        if (!this.isEdgeVisibleForCluster(sourceClusterId, targetClusterId))
            return null;
        const sourcePos = this.finalNodePositions?.get(edge.source);
        const targetPos = this.finalNodePositions?.get(edge.target);
        const sourceCluster = this.clusterPositions?.get(sourceClusterId);
        const targetCluster = this.clusterPositions?.get(targetClusterId);
        if (!sourcePos || !targetPos || !sourceCluster || !targetCluster)
            return null;
        const x1 = sourceCluster.x + sourcePos.x;
        const y1 = sourceCluster.y + sourcePos.y;
        const x2 = targetCluster.x + targetPos.x;
        const y2 = targetCluster.y + targetPos.y;
        const isHighlighted = this.selectedNode &&
            (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id);
        const isFocused = this.hoveredNode === edge.source || this.hoveredNode === edge.target;
        const opacity = this.computeEdgeFinalOpacity(edge, viewMode, sourceClusterId, targetClusterId, hoveredClusterId);
        return { ["_$litType$"]: lit_template_1, values: [x1, y1, x2, y2, getNodeTypeColor(targetNode.type), isHighlighted || isFocused, !this.clusterId, opacity, zoom, isFocused || isHighlighted] };
    }
    render() {
        if (!this.edges || !this.nodes)
            return { ["_$litType$"]: lit_template_2, values: [] };
        const viewMode = this.viewMode ?? ViewMode.Full;
        const zoom = this.zoom ?? 1;
        const hoveredClusterId = this.hoveredClusterId ?? null;
        // Pre-compute node map to avoid O(n) finds on every edge
        const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));
        return { ["_$litType$"]: lit_template_3, values: [this.edges.map((edge) => this.renderEdge(edge, nodeMap, viewMode, zoom, hoveredClusterId))] };
    }
}
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "edges", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "nodes", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "finalNodePositions", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "clusterPositions", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "selectedNode", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "hoveredNode", void 0);
__decorate([
    property({ type: String, attribute: 'cluster-id' })
], GraphEdges.prototype, "clusterId", void 0);
__decorate([
    property({ type: String, attribute: 'hovered-cluster-id' })
], GraphEdges.prototype, "hoveredClusterId", void 0);
__decorate([
    property({ type: String, attribute: 'view-mode' })
], GraphEdges.prototype, "viewMode", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "transitiveDeps", void 0);
__decorate([
    property({ attribute: false })
], GraphEdges.prototype, "transitiveDependents", void 0);
__decorate([
    property({ type: Number })
], GraphEdges.prototype, "zoom", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-edges')) {
    customElements.define('xcode-graph-edges', GraphEdges);
}
//# sourceMappingURL=graph-edges.js.map