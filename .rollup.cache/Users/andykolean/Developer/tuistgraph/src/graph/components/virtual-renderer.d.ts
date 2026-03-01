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
import type { NodePosition } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type PropertyValues, type TemplateResult } from 'lit';
export interface VirtualRenderConfig {
    viewportWidth: number;
    viewportHeight: number;
    panX: number;
    panY: number;
    zoom: number;
    bufferMargin?: number;
}
/**
 * Virtual renderer that only creates DOM elements for nodes visible in the viewport.
 * Dramatically improves performance with large graphs (10,000+ nodes).
 *
 * @summary Viewport-culled virtual node renderer
 */
export declare class GraphVirtualRenderer extends LitElement {
    nodes: GraphNode[];
    nodePositions: Map<string, NodePosition>;
    viewportWidth: number;
    viewportHeight: number;
    panX: number;
    panY: number;
    zoom: number;
    bufferMargin: number;
    private visibleNodeIds;
    private renderCount;
    static readonly styles: CSSResultGroup;
    constructor();
    willUpdate(changedProps: PropertyValues<this>): void;
    private updateVisibleNodes;
    /**
     * Get statistics about virtual rendering efficiency
     */
    getVirtualRenderingStats(): {
        totalNodes: number;
        visibleNodes: number;
        culledNodes: number;
        cullingRatio: number;
        percentageCulled: number;
        renderCount: number;
    };
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-virtual-renderer': GraphVirtualRenderer;
    }
}
