import { __decorate } from "tslib";
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
import { SignalWatcher } from '@lit-labs/signals';
import { ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
import { css, html, LitElement, } from 'lit';
import { property } from 'lit/decorators.js';
import { ErrorService } from '@/services/error-service';
import { GraphAnalysisService } from '@/services/graph-analysis-service';
import { GraphDataService } from '@/services/graph-data-service';
import { transformXcodeGraph } from '@/services/xcode-graph.service';
import '@ui/layout/graph-tab';
import '@ui/components/error-notification-container';
// Import signals and actions from graph module
import { edges as allEdges, nodes as allNodes, displayData, filteredData, setCircularDependencies, setGraphData, } from '@graph/signals/index';
// Import signals and actions from shared module
import { initializeFromData } from '@shared/signals/index';
const SignalWatcherLitElement = SignalWatcher(LitElement);
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { PropertyPart: P_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <xcode-graph-tab></xcode-graph-tab>

      <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
    `, parts: [{ type: 1, index: 0, name: "displayNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "displayEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "filteredNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "filteredEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "allNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "allEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "transitiveDeps", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "transitiveDependents", strings: ["", ""], ctor: P_1 }] };
/**
 * Root application component that orchestrates the entire graph visualization.
 * Accepts graph data via `.nodes` and `.edges` properties, making it a
 * self-contained web component that can be embedded in any host application.
 *
 * @summary Embeddable graph visualization entry point
 */
export class GraphApp extends SignalWatcherLitElement {
    // ========================================
    // Data Service
    // ========================================
    graphDataService = null;
    dataFingerprint = null;
    filtersInitialized = false;
    refreshGraphData(nodes, edges) {
        const fingerprint = `${nodes.length}-${edges.length}-${nodes.map((n) => n.id).join(',')}-${edges.map((e) => `${e.source}->${e.target}`).join(',')}`;
        if (fingerprint === this.dataFingerprint)
            return;
        this.dataFingerprint = fingerprint;
        this.graphDataService = new GraphDataService(nodes, edges);
        // Only seed filters once; otherwise we would overwrite user selections
        if (!this.filtersInitialized) {
            initializeFromData(this.graphDataService.getAllProjects(), this.graphDataService.getAllPackages());
            this.filtersInitialized = true;
        }
        const cycles = GraphAnalysisService.findCircularDependencies(this.graphDataService);
        setCircularDependencies(cycles);
        if (cycles.length > 0) {
            console.warn(`[GraphApp] Detected ${cycles.length} circular ${cycles.length === 1 ? 'dependency' : 'dependencies'}:`, cycles);
        }
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: flex;
      height: 100%;
      font-family: var(--fonts-body);
      overflow: hidden;
    }
  `;
    // ========================================
    // Lifecycle
    // ========================================
    connectedCallback() {
        super.connectedCallback();
        this.seedData();
    }
    willUpdate(changed) {
        if (changed.has('nodes') || changed.has('edges')) {
            this.seedData();
        }
    }
    seedData() {
        if (!this.nodes?.length)
            return;
        setGraphData(this.nodes, this.edges ?? []);
        this.refreshGraphData(this.nodes, this.edges ?? []);
    }
    /**
     * Load raw Tuist graph JSON (the output of `tuist graph --format json`).
     * Transforms it into GraphData and sets nodes/edges automatically.
     * Shows user-facing warnings/errors via ErrorService if the transform has issues.
     */
    loadRawGraph(raw) {
        try {
            const result = transformXcodeGraph(raw);
            if (result.warnings.length > 0) {
                const errorService = ErrorService.getInstance();
                errorService.handleWarning(`Graph loaded with ${result.warnings.length} compatibility warning(s)`, ErrorCategory.Data);
                for (const warning of result.warnings) {
                    console.warn('[GraphApp]', warning);
                }
            }
            if (result.data.nodes.length === 0) {
                const errorService = ErrorService.getInstance();
                errorService.handleError(new Error('Graph transform produced no nodes'), {
                    severity: ErrorSeverity.Error,
                    category: ErrorCategory.Data,
                    userMessage: 'Failed to load graph: no nodes found in the data',
                });
                return;
            }
            this.nodes = result.data.nodes;
            this.edges = result.data.edges;
        }
        catch (error) {
            const errorService = ErrorService.getInstance();
            errorService.handleError(error, {
                severity: ErrorSeverity.Critical,
                category: ErrorCategory.Data,
                userMessage: 'Failed to load graph data — the format may be incompatible',
                dismissible: false,
            });
        }
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const display = displayData.get();
        const filtered = filteredData.get();
        return { ["_$litType$"]: lit_template_1, values: [display.filteredNodes, display.filteredEdges, filtered.filteredNodes, filtered.filteredEdges, allNodes.get(), allEdges.get(), display.transitiveDeps, display.transitiveDependents] };
    }
}
__decorate([
    property({ attribute: false })
], GraphApp.prototype, "nodes", void 0);
__decorate([
    property({ attribute: false })
], GraphApp.prototype, "edges", void 0);
// Register custom element
if (!customElements.get('xcode-graph')) {
    customElements.define('xcode-graph', GraphApp);
}
//# sourceMappingURL=graph-app.js.map