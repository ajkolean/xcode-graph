/**
 * GraphTab Lit Component
 *
 * Main graph tab orchestrator - coordinates GraphVisualization and RightSidebar.
 * Uses Lit Signals for state management.
 *
 * @example
 * ```html
 * <xcode-graph-tab
 *   .displayNodes=${nodes}
 *   .displayEdges=${edges}
 *   .allNodes=${allNodes}
 * ></xcode-graph-tab>
 * ```
 */
import type { TransitiveResult } from '@graph/utils';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import '@graph/components/graph-canvas';
import '@graph/components/graph-overlays';
import '../components/right-sidebar';
declare const SignalWatcherLitElement: typeof LitElement;
/**
 * Main graph tab orchestrator that coordinates the graph canvas, overlays,
 * and right sidebar. Uses Lit Signals for reactive state management.
 *
 * @summary Graph tab layout orchestrator
 * @slot filter-view - Slot for injecting a custom filter view into the right sidebar
 */
export declare class GraphTab extends SignalWatcherLitElement {
    private canvasElement;
    displayNodes: GraphNode[];
    displayEdges: GraphEdge[];
    filteredNodes: GraphNode[];
    filteredEdges: GraphEdge[];
    allNodes: GraphNode[];
    allEdges: GraphEdge[];
    clusters: Cluster[] | undefined;
    transitiveDeps: TransitiveResult;
    transitiveDependents: TransitiveResult;
    static readonly styles: CSSResultGroup;
    private handleNodeSelect;
    private handleClusterSelect;
    private handleNodeHover;
    private handleZoomIn;
    private handleZoomOut;
    private handleZoomStep;
    private handleZoomReset;
    private handleToggleAnimation;
    private handleZoomChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-tab': GraphTab;
    }
}
export {};
