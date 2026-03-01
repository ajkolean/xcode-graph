/**
 * GraphApp Lit Component - Embeddable Graph Visualization
 *
 * Root application component that orchestrates the entire graph visualization.
 * Accepts graph data via `.nodes` and `.edges` properties, making it a
 * self-contained web component that can be embedded in any host application.
 *
 * @module components/graph-app
 *
 * @example
 * ```html
 * <!-- Standalone (uses built-in demo data) -->
 * <xcode-graph></xcode-graph>
 *
 * <!-- Embedded with custom data -->
 * <xcode-graph .nodes=${myNodes} .edges=${myEdges}></xcode-graph>
 * ```
 */
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import '@ui/layout/graph-tab';
import '@ui/components/error-notification-container';
declare const SignalWatcherLitElement: typeof LitElement;
/**
 * Root application component that orchestrates the entire graph visualization.
 * Accepts graph data via `.nodes` and `.edges` properties, making it a
 * self-contained web component that can be embedded in any host application.
 *
 * @summary Embeddable graph visualization entry point
 */
export declare class GraphApp extends SignalWatcherLitElement {
    nodes: GraphNode[];
    edges: GraphEdge[];
    private graphDataService;
    private dataFingerprint;
    private filtersInitialized;
    private refreshGraphData;
    static readonly styles: CSSResultGroup;
    connectedCallback(): void;
    willUpdate(changed: PropertyValues<this>): void;
    private seedData;
    /**
     * Load raw Tuist graph JSON (the output of `tuist graph --format json`).
     * Transforms it into GraphData and sets nodes/edges automatically.
     * Shows user-facing warnings/errors via ErrorService if the transform has issues.
     */
    loadRawGraph(raw: unknown): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph': GraphApp;
    }
}
export {};
