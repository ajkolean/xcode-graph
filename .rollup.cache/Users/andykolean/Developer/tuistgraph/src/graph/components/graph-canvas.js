var GraphCanvas_1;
import { __decorate } from "tslib";
import { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import { setAnimatedTarget, tickAnimationMap, } from '@graph/utils/canvas-animation';
import { resolveClusterPosition, resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import { resolveCanvasTheme } from '@graph/utils/canvas-theme';
import { getConnectedNodes } from '@graph/utils/connections';
import { ResizeController } from '@shared/controllers/resize.controller';
import { ViewMode } from '@shared/schemas';
import { setBaseZoom } from '@shared/signals/index';
import { ZOOM_CONFIG } from '@shared/utils/zoom-constants';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { computeNodeWeights, getNodeSize } from '@ui/utils/sizing';
import { calculateViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement, } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { renderClusters } from './canvas/canvas-cluster-renderer';
import { renderEdges } from './canvas/canvas-edge-renderer';
import { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, } from './canvas/canvas-interaction-handler';
import { renderNodes } from './canvas/canvas-node-renderer';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <canvas tabindex="0" role="application" aria-label="Dependency graph visualization"></canvas>
    `, parts: [{ type: 1, index: 0, name: "mousedown", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mousemove", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mouseup", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mouseleave", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "wheel", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "keydown", strings: ["", ""], ctor: E_1 }] };
/**
 * Canvas-based graph visualization component. Renders nodes, edges, and clusters
 * on an HTML canvas with pan, zoom, and interactive selection support.
 *
 * @summary Canvas-based interactive graph visualization
 * @fires node-select - Dispatched when a node is selected or deselected (detail: { node })
 * @fires node-hover - Dispatched when a node is hovered (detail: { nodeId })
 * @fires cluster-select - Dispatched when a cluster is selected or deselected (detail: { clusterId })
 * @fires cluster-hover - Dispatched when a cluster is hovered (detail: { clusterId })
 * @fires zoom-change - Dispatched when the zoom level changes (detail: number)
 * @fires zoom-in - Dispatched when zoom in is requested via keyboard
 * @fires zoom-out - Dispatched when zoom out is requested via keyboard
 * @fires zoom-reset - Dispatched when zoom reset is requested via keyboard
 */
let GraphCanvas = class GraphCanvas extends LitElement {
    static { GraphCanvas_1 = this; }
    ctx;
    layout = new GraphLayoutController(this, {
        enableAnimation: false,
        animationTicks: 30,
    });
    resize = new ResizeController(this, () => this.resizeCanvas());
    // Interaction state (shared with interaction handler)
    interactionState = {
        pan: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        zoom: 1,
        isDragging: false,
        draggedNodeId: null,
        draggedClusterId: null,
        lastMousePos: { x: 0, y: 0 },
        clickedEmptySpace: false,
        hasMoved: false,
        hoveredNode: null,
        hoveredCluster: null,
    };
    manualNodePositions = new Map();
    manualClusterPositions = new Map();
    pathCache = new Map();
    edgePathCache = new Map();
    nodeWeights = new Map();
    nodeMap = new Map();
    connectedNodesCache = null;
    routedEdgeMapCache = null;
    lastRoutedEdgesRef = undefined;
    theme;
    // Animation & Render State
    animationFrameId = null;
    time = 0;
    lastFrameTime = 0;
    didInitialFit = false;
    isAnimating = false;
    // Smooth opacity transitions for selection/deselection
    nodeAlphaMap = new Map();
    // Fade-out animation for removed nodes
    fadingOutNodes = new Map();
    static FADE_OUT_DURATION = 250;
    constructor() {
        super();
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        this.selectedCluster = null;
        this.hoveredNode = null;
        this.searchQuery = '';
        this.viewMode = ViewMode.Full;
        this.zoom = 1;
        this.enableAnimation = false;
        this.showDirectDeps = false;
        this.showTransitiveDeps = false;
        this.showDirectDependents = false;
        this.showTransitiveDependents = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
      cursor: grab;
    }

    canvas:active {
      cursor: grabbing;
    }
  `;
    // ========================================
    // Lifecycle
    // ========================================
    firstUpdated() {
        this.theme = resolveCanvasTheme(this);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d', { alpha: true }) ?? undefined;
            this.resizeCanvas();
            this.centerGraph();
            this.isAnimating = true;
            this.requestRender();
        }
        else {
            console.error('Canvas element not found in firstUpdated');
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopRenderLoop();
    }
    trackRemovedNodesForFadeOut(changedProps) {
        const prevNodes = changedProps.get('nodes');
        if (!prevNodes || prevNodes.length === 0)
            return;
        const currentIds = new Set(this.nodes.map((n) => n.id));
        const now = performance.now();
        for (const node of prevNodes) {
            if (!currentIds.has(node.id) && !this.fadingOutNodes.has(node.id)) {
                this.fadingOutNodes.set(node.id, { node, startTime: now });
            }
        }
        if (this.fadingOutNodes.size > 0) {
            this.isAnimating = true;
        }
    }
    willUpdate(changedProps) {
        if (changedProps.has('nodes') || changedProps.has('edges')) {
            this.trackRemovedNodesForFadeOut(changedProps);
            const isFilterChange = this.layout.nodePositions.size > 0 &&
                this.nodes.every((n) => this.layout.nodePositions.has(n.id));
            if (!isFilterChange) {
                this.layout.enableAnimation = this.enableAnimation;
                this.layout.computeLayout(this.nodes, this.edges).catch((err) => {
                    console.error('Layout computation failed', err);
                });
                this.manualNodePositions.clear();
                this.manualClusterPositions.clear();
                this.updatePathCache();
                this.didInitialFit = false;
            }
            this.nodeWeights = computeNodeWeights(this.nodes, this.edges);
            this.rebuildNodeMap();
            this.connectedNodesCache = null;
            this.routedEdgeMapCache = null;
        }
        if (changedProps.has('selectedNode') || changedProps.has('selectedCluster')) {
            this.connectedNodesCache = null;
            this.updateNodeAlphaTargets();
        }
        if (changedProps.has('enableAnimation')) {
            this.layout.enableAnimation = this.enableAnimation;
            if (!this.enableAnimation) {
                this.layout.stopAnimation();
            }
            else if (this.nodes.length > 0) {
                this.layout.computeLayout(this.nodes, this.edges).catch(console.error);
            }
        }
        if (changedProps.has('selectedNode') ||
            changedProps.has('selectedCluster') ||
            changedProps.has('viewMode')) {
            this.updateAnimatingState();
        }
        this.requestRender();
    }
    updated(changedProps) {
        super.updated(changedProps);
        if (!this.didInitialFit && this.layout.clusterPositions.size > 0) {
            this.fitToViewport();
            this.didInitialFit = true;
        }
    }
    updatePathCache() {
        this.pathCache.clear();
        this.edgePathCache.clear();
    }
    rebuildNodeMap() {
        this.nodeMap.clear();
        for (const node of this.nodes) {
            this.nodeMap.set(node.id, node);
        }
    }
    updateNodeAlphaTargets() {
        const connected = this.selectedNode
            ? getConnectedNodes(this.selectedNode.id, this.edges)
            : null;
        for (const node of this.nodes) {
            const isSelected = this.selectedNode?.id === node.id;
            const isConnected = connected?.has(node.id) ?? false;
            const clusterId = node.project || 'External';
            const isClusterSelected = this.selectedCluster === clusterId;
            const shouldDim = (!!this.selectedNode && !isSelected && !isConnected) ||
                (!!this.selectedCluster && !isClusterSelected);
            setAnimatedTarget(this.nodeAlphaMap, node.id, shouldDim ? 0.3 : 1.0);
        }
        // Ensure animation loop runs to process the transitions
        if (this.nodeAlphaMap.size > 0) {
            this.isAnimating = true;
            this.requestRender();
        }
    }
    getConnectedNodesSet() {
        if (!this.selectedNode)
            return new Set();
        if (this.connectedNodesCache && this.connectedNodesCache.nodeId === this.selectedNode.id) {
            return this.connectedNodesCache.result;
        }
        const result = getConnectedNodes(this.selectedNode.id, this.edges);
        this.connectedNodesCache = { nodeId: this.selectedNode.id, result };
        return result;
    }
    getRoutedEdgeMap() {
        const currentRouted = this.layout.routedEdges;
        if (this.routedEdgeMapCache && this.lastRoutedEdgesRef === currentRouted) {
            return this.routedEdgeMapCache;
        }
        const map = new Map();
        if (currentRouted) {
            for (const re of currentRouted) {
                map.set(`${re.sourceNodeId}->${re.targetNodeId}`, re);
            }
        }
        this.routedEdgeMapCache = map;
        this.lastRoutedEdgesRef = currentRouted;
        return map;
    }
    getPathForNode = (node) => {
        const key = `${node.type}-${node.platform}`;
        if (!this.pathCache.has(key)) {
            const pathString = getNodeIconPath(node.type, node.platform);
            this.pathCache.set(key, new Path2D(pathString));
        }
        return this.pathCache.get(key);
    };
    centerGraph() {
        const rect = this.getBoundingClientRect();
        this.interactionState.pan = { x: rect.width / 2, y: rect.height / 2 };
    }
    fitToViewport() {
        if (!this.layout.clusterPositions.size)
            return;
        const rect = this.getBoundingClientRect();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        this.layout.clusterPositions.forEach((pos) => {
            const halfW = pos.width / 2;
            const halfH = pos.height / 2;
            minX = Math.min(minX, pos.x - halfW);
            maxX = Math.max(maxX, pos.x + halfW);
            minY = Math.min(minY, pos.y - halfH);
            maxY = Math.max(maxY, pos.y + halfH);
        });
        if (!Number.isFinite(minX) ||
            !Number.isFinite(maxX) ||
            !Number.isFinite(minY) ||
            !Number.isFinite(maxY))
            return;
        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        const padding = 40;
        const scaleX = (rect.width - padding * 2) / graphWidth;
        const scaleY = (rect.height - padding * 2) / graphHeight;
        const fitZoom = Math.max(ZOOM_CONFIG.MIN_ZOOM, Math.min(1.5, Math.min(scaleX, scaleY)));
        this.zoom = fitZoom;
        this.interactionState.zoom = fitZoom;
        setBaseZoom(fitZoom);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        this.interactionState.pan = {
            x: rect.width / 2 - centerX * fitZoom,
            y: rect.height / 2 - centerY * fitZoom,
        };
        this.dispatchEvent(new CustomEvent('zoom-change', { detail: this.zoom, bubbles: true, composed: true }));
    }
    // ========================================
    // Interaction Context
    // ========================================
    getInteractionContext() {
        return {
            state: this.interactionState,
            layout: this.layout,
            nodes: this.nodes,
            edges: this.edges,
            selectedNode: this.selectedNode,
            nodeWeights: this.nodeWeights,
            manualNodePositions: this.manualNodePositions,
            manualClusterPositions: this.manualClusterPositions,
            getMousePos: this.getMousePos,
            screenToWorld: this.screenToWorld,
            dispatchCanvasEvent: this.dispatchCanvasEvent,
            dispatchZoomChange: (zoom) => {
                this.zoom = zoom;
                this.dispatchEvent(new CustomEvent('zoom-change', { detail: zoom, bubbles: true, composed: true }));
            },
        };
    }
    // ========================================
    // Event Handlers
    // ========================================
    resizeCanvas() {
        if (!this.canvas || !this.ctx)
            return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.requestRender();
    }
    dispatchCanvasEvent = (name, detail) => {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    };
    handleCanvasMouseDown = (e) => {
        this.interactionState.zoom = this.zoom;
        handleMouseDown(e, this.getInteractionContext());
        this.requestRender();
    };
    handleCanvasMouseMove = (e) => {
        this.interactionState.zoom = this.zoom;
        handleMouseMove(e, this.getInteractionContext());
        this.hoveredNode = this.interactionState.hoveredNode;
        if (this.canvas) {
            if (this.interactionState.isDragging) {
                this.canvas.style.cursor = 'grabbing';
            }
            else if (this.interactionState.hoveredNode || this.interactionState.hoveredCluster) {
                this.canvas.style.cursor = 'pointer';
            }
            else {
                this.canvas.style.cursor = 'grab';
            }
        }
        this.requestRender();
    };
    handleCanvasMouseUp = (e) => {
        handleMouseUp(e, this.getInteractionContext());
        this.hoveredNode = this.interactionState.hoveredNode;
        this.requestRender();
    };
    handleCanvasWheel = (e) => {
        this.interactionState.zoom = this.zoom;
        handleWheel(e, this.getInteractionContext());
        this.zoom = this.interactionState.zoom;
        this.requestRender();
    };
    handleCanvasKeyDown = (e) => {
        const PAN_STEP = 50;
        const ctx = this.getInteractionContext();
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.interactionState.pan.y += PAN_STEP;
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.interactionState.pan.y -= PAN_STEP;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.interactionState.pan.x += PAN_STEP;
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.interactionState.pan.x -= PAN_STEP;
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('zoom-in', { bubbles: true, composed: true }));
                return;
            case '-':
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('zoom-out', { bubbles: true, composed: true }));
                return;
            case '0':
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('zoom-reset', { bubbles: true, composed: true }));
                return;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (this.interactionState.hoveredNode) {
                    const node = this.nodes.find((n) => n.id === this.interactionState.hoveredNode);
                    if (node) {
                        const newSelection = this.selectedNode?.id === node.id ? null : node;
                        ctx.dispatchCanvasEvent('node-select', { node: newSelection });
                    }
                }
                return;
            case 'Escape':
                e.preventDefault();
                ctx.dispatchCanvasEvent('node-select', { node: null });
                ctx.dispatchCanvasEvent('cluster-select', { clusterId: null });
                return;
            default:
                return;
        }
        this.requestRender();
    };
    // ========================================
    // Rendering
    // ========================================
    requestRender() {
        if (this.animationFrameId === null) {
            this.animationFrameId = requestAnimationFrame(this.renderLoop);
        }
    }
    renderLoop = (timestamp) => {
        this.animationFrameId = null;
        const dt = this.lastFrameTime > 0 ? timestamp - this.lastFrameTime : 16;
        this.lastFrameTime = timestamp;
        this.time = timestamp;
        // Tick opacity transition animations
        const alphaAnimating = tickAnimationMap(this.nodeAlphaMap, dt);
        if (alphaAnimating && !this.isAnimating) {
            this.isAnimating = true;
        }
        this.renderCanvas();
        if (this.isAnimating) {
            // Re-check: if only alpha was animating and it settled, stop
            if (!alphaAnimating) {
                this.updateAnimatingState();
            }
            if (this.isAnimating) {
                this.animationFrameId = requestAnimationFrame(this.renderLoop);
            }
        }
    };
    stopRenderLoop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    updateAnimatingState() {
        const hasSelectedNode = !!this.selectedNode;
        const hasSelectedCluster = !!this.selectedCluster;
        const hasCycleNodes = (this.layout.cycleNodes?.size ?? 0) > 0;
        const hasFadingNodes = this.fadingOutNodes.size > 0;
        const hasAlphaAnimations = this.nodeAlphaMap.size > 0;
        this.isAnimating =
            hasSelectedNode ||
                hasSelectedCluster ||
                hasCycleNodes ||
                hasFadingNodes ||
                hasAlphaAnimations;
    }
    renderCanvas() {
        if (!this.ctx || !this.canvas || !this.theme)
            return;
        const pan = this.interactionState.pan;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, width, height);
        // Flat background fill
        this.ctx.fillStyle = this.theme.canvasBg;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.save();
        this.ctx.translate(pan.x, pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        const viewport = calculateViewportBounds(width, height, pan.x, pan.y, this.zoom);
        renderClusters({
            ctx: this.ctx,
            layout: this.layout,
            zoom: this.zoom,
            time: this.time,
            theme: this.theme,
            selectedCluster: this.selectedCluster,
            hoveredCluster: this.interactionState.hoveredCluster,
            manualClusterPositions: this.manualClusterPositions,
        }, viewport);
        renderEdges({
            ctx: this.ctx,
            layout: this.layout,
            nodes: this.nodes,
            edges: this.edges,
            zoom: this.zoom,
            time: this.time,
            theme: this.theme,
            selectedNode: this.selectedNode,
            selectedCluster: this.selectedCluster,
            hoveredCluster: this.interactionState.hoveredCluster,
            viewMode: this.viewMode,
            transitiveDeps: this.transitiveDeps,
            transitiveDependents: this.transitiveDependents,
            manualNodePositions: this.manualNodePositions,
            manualClusterPositions: this.manualClusterPositions,
            nodeMap: this.nodeMap,
            routedEdgeMap: this.getRoutedEdgeMap(),
            edgePathCache: this.edgePathCache,
            showDirectDeps: this.showDirectDeps,
            showTransitiveDeps: this.showTransitiveDeps,
            showDirectDependents: this.showDirectDependents,
            showTransitiveDependents: this.showTransitiveDependents,
        }, viewport);
        const weights = Array.from(this.nodeWeights.values()).sort((a, b) => a - b);
        const hubWeightThreshold = weights[Math.floor(weights.length * 0.9)] ?? 0;
        renderNodes({
            ctx: this.ctx,
            layout: this.layout,
            nodes: this.nodes,
            edges: this.edges,
            zoom: this.zoom,
            time: this.time,
            theme: this.theme,
            selectedNode: this.selectedNode,
            selectedCluster: this.selectedCluster,
            hoveredNode: this.hoveredNode,
            hoveredCluster: this.interactionState.hoveredCluster,
            searchQuery: this.searchQuery,
            viewMode: this.viewMode,
            transitiveDeps: this.transitiveDeps,
            transitiveDependents: this.transitiveDependents,
            previewFilter: this.previewFilter,
            nodeWeights: this.nodeWeights,
            manualNodePositions: this.manualNodePositions,
            manualClusterPositions: this.manualClusterPositions,
            getPathForNode: this.getPathForNode,
            connectedNodes: this.getConnectedNodesSet(),
            hubWeightThreshold,
            nodeAlphaMap: this.nodeAlphaMap,
            showDirectDeps: this.showDirectDeps,
            showTransitiveDeps: this.showTransitiveDeps,
            showDirectDependents: this.showDirectDependents,
            showTransitiveDependents: this.showTransitiveDependents,
        }, viewport);
        // Render fading-out nodes
        this.renderFadingNodes();
        this.ctx.restore();
        this.renderTooltip();
        this.renderClusterTooltip();
    }
    renderFadingNodes() {
        if (this.fadingOutNodes.size === 0)
            return;
        const now = performance.now();
        const toRemove = [];
        for (const [nodeId, { node, startTime }] of this.fadingOutNodes) {
            const elapsed = now - startTime;
            if (elapsed >= GraphCanvas_1.FADE_OUT_DURATION) {
                toRemove.push(nodeId);
                continue;
            }
            const alpha = 1 - elapsed / GraphCanvas_1.FADE_OUT_DURATION;
            const clusterId = node.project || 'External';
            const pos = resolveNodeWorldPosition(nodeId, clusterId, this.layout, this.manualNodePositions, this.manualClusterPositions);
            if (!pos) {
                toRemove.push(nodeId);
                continue;
            }
            const { x, y } = pos;
            const size = getNodeSize(node, this.edges, this.nodeWeights.get(nodeId));
            // Draw fading node icon
            this.ctx.globalAlpha = alpha * 0.5;
            const color = adjustColorForZoom(getNodeTypeColorFromTheme(node.type, this.theme), this.zoom);
            const scale = (size / 12) * 1.0;
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.scale(scale, scale);
            const path = this.getPathForNode(node);
            this.ctx.fillStyle = this.theme.tooltipBg;
            this.ctx.fill(path);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2 / scale;
            this.ctx.stroke(path);
            this.ctx.restore();
        }
        for (const id of toRemove) {
            this.fadingOutNodes.delete(id);
        }
        if (this.fadingOutNodes.size === 0) {
            this.updateAnimatingState();
        }
        this.ctx.globalAlpha = 1.0;
    }
    renderTooltip() {
        if (!this.hoveredNode)
            return;
        const node = this.nodes.find((n) => n.id === this.hoveredNode);
        if (!node)
            return;
        // At low zoom, always show tooltip (labels are likely hidden).
        // At higher zoom, only show if label would be truncated.
        if (this.zoom >= 0.5 && node.name.length <= 20)
            return;
        const worldPos = resolveNodeWorldPosition(node.id, node.project || 'External', this.layout, this.manualNodePositions, this.manualClusterPositions);
        if (!worldPos)
            return;
        const size = getNodeSize(node, this.edges, this.nodeWeights.get(node.id));
        const pan = this.interactionState.pan;
        const screenX = worldPos.x * this.zoom + pan.x;
        const screenY = worldPos.y * this.zoom + pan.y;
        const text = node.name;
        this.ctx.font = '12px var(--fonts-body, sans-serif)';
        const padding = 8;
        const metrics = this.ctx.measureText(text);
        const tooltipWidth = metrics.width + padding * 2;
        const tooltipHeight = 24;
        const x = screenX - tooltipWidth / 2;
        const y = screenY - size * this.zoom - 35;
        this.ctx.save();
        this.ctx.fillStyle = this.theme.tooltipBg;
        this.ctx.strokeStyle = adjustColorForZoom(getNodeTypeColorFromTheme(node.type, this.theme), this.zoom);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, tooltipWidth, tooltipHeight, 4);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, screenX, y + tooltipHeight / 2);
        this.ctx.restore();
    }
    renderClusterTooltip() {
        const clusterId = this.interactionState.hoveredCluster;
        if (!clusterId || this.hoveredNode)
            return;
        const cluster = this.layout.clusters.find((c) => c.id === clusterId);
        if (!cluster)
            return;
        const layoutPos = this.layout.clusterPositions.get(clusterId);
        if (!layoutPos)
            return;
        const clusterWorldPos = resolveClusterPosition(clusterId, layoutPos, this.manualClusterPositions);
        const radius = Math.max(layoutPos.width, layoutPos.height) / 2;
        const pan = this.interactionState.pan;
        const screenX = clusterWorldPos.x * this.zoom + pan.x;
        const screenY = clusterWorldPos.y * this.zoom + pan.y;
        const name = cluster.name;
        const subtitle = `${cluster.nodes.length} targets`;
        const padding = 10;
        this.ctx.save();
        this.ctx.font = '600 13px var(--fonts-body, sans-serif)';
        const nameWidth = this.ctx.measureText(name).width;
        this.ctx.font = '400 11px var(--fonts-body, sans-serif)';
        const subtitleWidth = this.ctx.measureText(subtitle).width;
        const tooltipWidth = Math.max(nameWidth, subtitleWidth) + padding * 2;
        const tooltipHeight = 40;
        const x = screenX - tooltipWidth / 2;
        const y = screenY - radius * this.zoom - 20 - tooltipHeight;
        const clusterColor = generateColor(cluster.name, cluster.type);
        this.ctx.fillStyle = this.theme.tooltipBg;
        this.ctx.strokeStyle = adjustColorForZoom(clusterColor, this.zoom);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, tooltipWidth, tooltipHeight, 4);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.font = '600 13px var(--fonts-body, sans-serif)';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(name, screenX, y + 14);
        this.ctx.globalAlpha = 0.7;
        this.ctx.font = '400 11px var(--fonts-body, sans-serif)';
        this.ctx.fillText(subtitle, screenX, y + 28);
        this.ctx.restore();
    }
    // ========================================
    // Utils
    // ========================================
    getMousePos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };
    screenToWorld = (screenX, screenY) => {
        const pan = this.interactionState.pan;
        return {
            x: (screenX - pan.x) / this.zoom,
            y: (screenY - pan.y) / this.zoom,
        };
    };
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.handleCanvasMouseDown, this.handleCanvasMouseMove, this.handleCanvasMouseUp, this.handleCanvasMouseUp, this.handleCanvasWheel, this.handleCanvasKeyDown] };
    }
};
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "nodes", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "edges", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "selectedNode", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "selectedCluster", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "hoveredNode", void 0);
__decorate([
    property({ type: String, attribute: 'search-query' })
], GraphCanvas.prototype, "searchQuery", void 0);
__decorate([
    property({ type: String, attribute: 'view-mode' })
], GraphCanvas.prototype, "viewMode", void 0);
__decorate([
    property({ type: Number })
], GraphCanvas.prototype, "zoom", void 0);
__decorate([
    property({ type: Boolean, attribute: 'enable-animation' })
], GraphCanvas.prototype, "enableAnimation", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "transitiveDeps", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "transitiveDependents", void 0);
__decorate([
    property({ attribute: false })
], GraphCanvas.prototype, "previewFilter", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-direct-deps' })
], GraphCanvas.prototype, "showDirectDeps", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-transitive-deps' })
], GraphCanvas.prototype, "showTransitiveDeps", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-direct-dependents' })
], GraphCanvas.prototype, "showDirectDependents", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-transitive-dependents' })
], GraphCanvas.prototype, "showTransitiveDependents", void 0);
__decorate([
    query('canvas')
], GraphCanvas.prototype, "canvas", void 0);
GraphCanvas = GraphCanvas_1 = __decorate([
    customElement('xcode-graph-canvas')
], GraphCanvas);
export { GraphCanvas };
//# sourceMappingURL=graph-canvas.js.map