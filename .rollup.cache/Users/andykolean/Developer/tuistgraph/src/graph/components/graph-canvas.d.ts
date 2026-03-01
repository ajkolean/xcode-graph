import type { TransitiveResult } from '@graph/utils';
import { ResizeController } from '@shared/controllers/resize.controller';
import { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { type CSSResultGroup, LitElement, type PropertyValues, type TemplateResult } from 'lit';
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
export declare class GraphCanvas extends LitElement {
    nodes: GraphNode[];
    edges: GraphEdge[];
    selectedNode: GraphNode | null;
    selectedCluster: string | null;
    hoveredNode: string | null;
    searchQuery: string;
    viewMode: ViewMode;
    zoom: number;
    enableAnimation: boolean;
    transitiveDeps: TransitiveResult | undefined;
    transitiveDependents: TransitiveResult | undefined;
    previewFilter: PreviewFilter | undefined;
    showDirectDeps: boolean;
    showTransitiveDeps: boolean;
    showDirectDependents: boolean;
    showTransitiveDependents: boolean;
    private canvas;
    private ctx;
    private readonly layout;
    readonly resize: ResizeController;
    private interactionState;
    private manualNodePositions;
    private manualClusterPositions;
    private pathCache;
    private edgePathCache;
    private nodeWeights;
    private nodeMap;
    private connectedNodesCache;
    private routedEdgeMapCache;
    private lastRoutedEdgesRef;
    private theme;
    private animationFrameId;
    private time;
    private lastFrameTime;
    private didInitialFit;
    private isAnimating;
    private nodeAlphaMap;
    private fadingOutNodes;
    private static readonly FADE_OUT_DURATION;
    constructor();
    static styles: CSSResultGroup;
    firstUpdated(): void;
    disconnectedCallback(): void;
    private trackRemovedNodesForFadeOut;
    willUpdate(changedProps: PropertyValues<this>): void;
    updated(changedProps: PropertyValues<this>): void;
    private updatePathCache;
    private rebuildNodeMap;
    private updateNodeAlphaTargets;
    private getConnectedNodesSet;
    private getRoutedEdgeMap;
    private getPathForNode;
    private centerGraph;
    fitToViewport(): void;
    private getInteractionContext;
    private resizeCanvas;
    private dispatchCanvasEvent;
    private handleCanvasMouseDown;
    private handleCanvasMouseMove;
    private handleCanvasMouseUp;
    private handleCanvasWheel;
    private handleCanvasKeyDown;
    private requestRender;
    private renderLoop;
    private stopRenderLoop;
    private updateAnimatingState;
    private renderCanvas;
    private renderFadingNodes;
    private renderTooltip;
    private renderClusterTooltip;
    private getMousePos;
    private screenToWorld;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-canvas': GraphCanvas;
    }
}
