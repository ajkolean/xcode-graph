/**
 * Graph Interaction Full Controller - Complete pan, zoom, and drag
 *
 * Complete graph interaction controller with pan, zoom, and node dragging.
 * Converted from useGraphInteraction React hook.
 *
 * **Features:**
 * - Canvas panning via background drag
 * - Node dragging with manual positioning
 * - Zoom via wheel (external callback)
 * - Movement tracking (distinguish click from drag)
 *
 * @module controllers/graph-interaction-full
 */
// ==================== Controller Class ====================
/**
 * Reactive controller for complete graph interactions
 *
 * Supports canvas pan, zoom, and individual node dragging.
 * Tracks manual node positions for user-overridden layouts.
 */
export class GraphInteractionFullController {
    host;
    // Configuration (updated externally)
    zoom;
    finalNodePositions;
    clusterPositions;
    // State
    pan = { x: 400, y: 300 };
    isDragging = false;
    dragStart = { x: 0, y: 0 };
    draggedNode = null;
    manualNodePositions = new Map();
    hasMoved = false;
    // SVG reference (set after render)
    svgElement = null;
    handleWindowMouseUp = () => this.handleMouseUp();
    constructor(host, config) {
        this.host = host;
        this.zoom = config.zoom;
        this.finalNodePositions = config.finalNodePositions;
        this.clusterPositions = config.clusterPositions;
        host.addController(this);
    }
    // ========================================
    // Public API
    // ========================================
    setSvgElement(element) {
        this.svgElement = element;
    }
    hasSvgElement() {
        return this.svgElement !== null;
    }
    updateConfig(config) {
        if (config.zoom !== undefined)
            this.zoom = config.zoom;
        if (config.finalNodePositions)
            this.finalNodePositions = config.finalNodePositions;
        if (config.clusterPositions)
            this.clusterPositions = config.clusterPositions;
    }
    // ========================================
    // Canvas Pan Handlers
    // ========================================
    handleMouseDown = (e) => {
        const target = e.target;
        if (target.tagName === 'svg') {
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
            this.hasMoved = false;
            this.host.requestUpdate();
        }
    };
    handleMouseMove = (e) => {
        if (this.isDragging && !this.draggedNode) {
            // Pan mode
            this.hasMoved = true;
            this.pan = {
                x: e.clientX - this.dragStart.x,
                y: e.clientY - this.dragStart.y,
            };
            this.host.requestUpdate();
        }
        else if (this.draggedNode) {
            // Node drag mode
            this.hasMoved = true;
            const svg = this.svgElement;
            if (!svg)
                return;
            const rect = svg.getBoundingClientRect();
            const node = this.finalNodePositions.get(this.draggedNode);
            if (!node)
                return;
            const cluster = this.clusterPositions.get(node.clusterId);
            if (!cluster)
                return;
            const x = (e.clientX - rect.left - this.pan.x) / this.zoom - cluster.x;
            const y = (e.clientY - rect.top - this.pan.y) / this.zoom - cluster.y;
            const nodePos = this.manualNodePositions.get(this.draggedNode);
            if (nodePos) {
                nodePos.x = x;
                nodePos.y = y;
            }
            else {
                this.manualNodePositions.set(this.draggedNode, { x, y });
            }
            this.host.requestUpdate();
        }
    };
    handleMouseUp = () => {
        this.isDragging = false;
        this.draggedNode = null;
        // Reset hasMoved after a short delay to allow click handler to check it first
        setTimeout(() => {
            this.hasMoved = false;
            this.host.requestUpdate();
        }, 0);
        this.host.requestUpdate();
    };
    // ========================================
    // Node Drag Handlers
    // ========================================
    handleNodeMouseDown(nodeId, e) {
        e.stopPropagation();
        this.draggedNode = nodeId;
        this.hasMoved = false;
        this.host.requestUpdate();
    }
    // ========================================
    // Lifecycle
    // ========================================
    hostConnected() {
        window.addEventListener('mouseup', this.handleWindowMouseUp, { capture: true });
    }
    hostDisconnected() {
        try {
            this.isDragging = false;
            this.draggedNode = null;
            window.removeEventListener('mouseup', this.handleWindowMouseUp, { capture: true });
        }
        catch (error) {
            console.error('[GraphInteractionFullController] Error during cleanup:', error);
            // Ensure state is reset even if error occurs
            this.isDragging = false;
            this.draggedNode = null;
        }
    }
}
//# sourceMappingURL=graph-interaction-full.controller.js.map