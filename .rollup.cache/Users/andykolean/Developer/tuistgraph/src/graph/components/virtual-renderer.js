/**
 * Virtual Rendering for Graph Nodes
 *
 * Only creates DOM elements for nodes visible in viewport.
 * Dramatically improves performance with large graphs (10,000+ nodes).
 *
 * Strategy:
 * - Track viewport bounds based on pan/zoom
 * - Filter nodes to only those in viewport
 * - Reuse node elements when scrolling/panning
 * - Update positions using transforms (fast)
 */
import { __decorate } from "tslib";
import { calculateViewportBounds, isCircleInViewport } from '@ui/utils/viewport';
import { css, html, LitElement, svg, } from 'lit';
import { property, state } from 'lit/decorators.js';
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <?>
    `, parts: [{ type: 2, index: 0 }] };
/**
 * Virtual renderer that only creates DOM elements for nodes visible in the viewport.
 * Dramatically improves performance with large graphs (10,000+ nodes).
 *
 * @summary Viewport-culled virtual node renderer
 */
export class GraphVirtualRenderer extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: contents;
    }
  `;
    // ========================================
    // Lifecycle
    // ========================================
    constructor() {
        super();
        this.nodes = [];
        this.nodePositions = new Map();
        this.viewportWidth = 1000;
        this.viewportHeight = 800;
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        this.bufferMargin = 200;
        this.visibleNodeIds = new Set();
        this.renderCount = 0;
    }
    willUpdate(changedProps) {
        // Recalculate visible nodes when viewport or positions change
        if (changedProps.has('nodes') ||
            changedProps.has('nodePositions') ||
            changedProps.has('viewportWidth') ||
            changedProps.has('viewportHeight') ||
            changedProps.has('panX') ||
            changedProps.has('panY') ||
            changedProps.has('zoom')) {
            this.updateVisibleNodes();
        }
    }
    // ========================================
    // Viewport Culling
    // ========================================
    updateVisibleNodes() {
        const viewportBounds = calculateViewportBounds(this.viewportWidth, this.viewportHeight, this.panX, this.panY, this.zoom, this.bufferMargin);
        const visible = new Set();
        for (const node of this.nodes) {
            const pos = this.nodePositions.get(node.id);
            if (!pos)
                continue;
            const radius = pos.radius || 20;
            if (isCircleInViewport({ x: pos.x, y: pos.y }, radius, viewportBounds)) {
                visible.add(node.id);
            }
        }
        this.visibleNodeIds = visible;
        this.renderCount++;
    }
    /**
     * Get statistics about virtual rendering efficiency
     */
    getVirtualRenderingStats() {
        return {
            totalNodes: this.nodes.length,
            visibleNodes: this.visibleNodeIds.size,
            culledNodes: this.nodes.length - this.visibleNodeIds.size,
            cullingRatio: this.nodes.length / (this.visibleNodeIds.size || 1),
            percentageCulled: ((this.nodes.length - this.visibleNodeIds.size) / this.nodes.length) * 100,
            renderCount: this.renderCount,
        };
    }
    // ========================================
    // Render
    // ========================================
    render() {
        // Only render visible nodes
        const visibleNodes = this.nodes.filter((node) => this.visibleNodeIds.has(node.id));
        return { ["_$litType$"]: lit_template_1, values: [visibleNodes.map((node) => {
                    const pos = this.nodePositions.get(node.id);
                    if (!pos)
                        return null;
                    // Render node using graph-node component
                    return svg `
          <xcode-graph-node
            .node=${node}
            .position=${pos}
            .zoom=${this.zoom}
          ></xcode-graph-node>
        `;
                })] };
    }
}
__decorate([
    property({ attribute: false })
], GraphVirtualRenderer.prototype, "nodes", void 0);
__decorate([
    property({ attribute: false })
], GraphVirtualRenderer.prototype, "nodePositions", void 0);
__decorate([
    property({ type: Number })
], GraphVirtualRenderer.prototype, "viewportWidth", void 0);
__decorate([
    property({ type: Number })
], GraphVirtualRenderer.prototype, "viewportHeight", void 0);
__decorate([
    property({ type: Number })
], GraphVirtualRenderer.prototype, "panX", void 0);
__decorate([
    property({ type: Number })
], GraphVirtualRenderer.prototype, "panY", void 0);
__decorate([
    property({ type: Number })
], GraphVirtualRenderer.prototype, "zoom", void 0);
__decorate([
    property({ type: Number })
], GraphVirtualRenderer.prototype, "bufferMargin", void 0);
__decorate([
    state()
], GraphVirtualRenderer.prototype, "visibleNodeIds", void 0);
__decorate([
    state()
], GraphVirtualRenderer.prototype, "renderCount", void 0);
// Register custom element
if (!customElements.get('xcode-graph-virtual-renderer')) {
    customElements.define('xcode-graph-virtual-renderer', GraphVirtualRenderer);
}
//# sourceMappingURL=virtual-renderer.js.map