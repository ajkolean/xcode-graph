import { __decorate } from "tslib";
/**
 * GraphOverlays Lit Components
 *
 * Overlay components for graph visualization:
 * - GraphBackground: Grid pattern background
 * - GraphControls: Zoom controls and animation toggle
 * - GraphEmptyState: Empty state message
 * - GraphInstructions: Usage instructions
 *
 * @example
 * ```html
 * <xcode-graph-background></xcode-graph-background>
 * <xcode-graph-controls zoom="1.0"></xcode-graph-controls>
 * <xcode-graph-visualization-empty-state></xcode-graph-visualization-empty-state>
 * ```
 */
import { icons } from '@shared/controllers/icon.adapter';
import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// ========================================
// GraphBackground
// ========================================
/**
 * Grid pattern background overlay for the graph visualization area.
 *
 * @summary Grid pattern background overlay
 */
export class GraphBackground extends LitElement {
    static styles = css `
    :host {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: var(--opacity-4);
    }
  `;
    render() {
        return svg `
      <svg style="width: 100%; height: 100%;">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--primary)" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `;
    }
}
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="container">
        <span class="zoom-label"><?></span>
        <div class="divider"></div>

        <div class="zoom-buttons">
          <button title="Zoom in">
            <?>
          </button>
          <button title="Zoom out">
            <?>
          </button>
          <button class="zoom-button" title="Fit to view">
            <?>
          </button>
        </div>
      </div>
    `, parts: [{ type: 1, index: 0, name: "wheel", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mousedown", strings: ["", ""], ctor: E_1 }, { type: 2, index: 2 }, { type: 1, index: 5, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 6 }, { type: 1, index: 7, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 7, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 8 }, { type: 1, index: 9, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 10 }] };
// ========================================
// GraphControls
// ========================================
/**
 * Zoom controls and animation toggle overlay for the graph visualization.
 * Displays zoom percentage, zoom in/out buttons, and fit-to-view reset.
 *
 * @summary Zoom controls overlay
 * @fires zoom-step - Dispatched when a zoom step button is clicked (detail: number)
 * @fires zoom-reset - Dispatched when the fit-to-view button is clicked
 */
export class GraphControls extends LitElement {
    static styles = css `
    :host {
      display: block;
      position: absolute;
      top: var(--spacing-md);
      left: var(--spacing-md);
      z-index: 10;
    }

    .container {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-2) var(--spacing-3);
      background-color: rgba(var(--colors-card-rgb), var(--opacity-95));
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-primary) 30%, transparent);
      border-radius: var(--radii-md);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .zoom-label {
      font-family: var(--fonts-mono);
      font-variant-numeric: tabular-nums;
      min-width: 3ch;
      text-align: right;
    }

    .divider {
      width: var(--border-widths-thin);
      height: var(--spacing-4);
      background-color: color-mix(in srgb, var(--colors-primary) 30%, transparent);
    }

    .zoom-buttons {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .zoom-button {
      padding: var(--spacing-1);
      border-radius: var(--radii-md);
      transition: background-color var(--durations-normal);
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-primary) 20%, transparent);
      background: none;
      color: var(--colors-muted-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .zoom-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .zoom-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .zoom-button:active {
      transform: scale(0.92);
    }

    .zoom-button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .zoom-button.active {
      background-color: color-mix(in srgb, var(--colors-primary) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-primary) 50%, transparent);
      color: var(--colors-primary-text);
    }

    .zoom-button.disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;
    static ZOOM_STEPS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0];
    get zoomRatio() {
        return this.baseZoom > 0 ? this.zoom / this.baseZoom : this.zoom;
    }
    get atMinZoom() {
        const minStep = GraphControls.ZOOM_STEPS[0] ?? 0.25;
        return this.zoomRatio <= minStep + 0.01;
    }
    get atMaxZoom() {
        const maxStep = GraphControls.ZOOM_STEPS[GraphControls.ZOOM_STEPS.length - 1] ?? 4.0;
        return this.zoomRatio >= maxStep - 0.01;
    }
    handleZoomIn() {
        const current = this.zoomRatio;
        const nextStep = GraphControls.ZOOM_STEPS.find((s) => s > current + 0.01);
        if (nextStep !== undefined) {
            const newZoom = nextStep * (this.baseZoom > 0 ? this.baseZoom : 1);
            this.dispatchEvent(new CustomEvent('zoom-step', { detail: newZoom, bubbles: true, composed: true }));
        }
    }
    handleZoomOut() {
        const current = this.zoomRatio;
        const steps = GraphControls.ZOOM_STEPS;
        let prevStep;
        for (let i = steps.length - 1; i >= 0; i--) {
            const step = steps[i];
            if (step !== undefined && step < current - 0.01) {
                prevStep = steps[i];
                break;
            }
        }
        if (prevStep !== undefined) {
            const newZoom = prevStep * (this.baseZoom > 0 ? this.baseZoom : 1);
            this.dispatchEvent(new CustomEvent('zoom-step', { detail: newZoom, bubbles: true, composed: true }));
        }
    }
    handleZoomReset() {
        this.dispatchEvent(new CustomEvent('zoom-reset', { bubbles: true, composed: true }));
    }
    handleWheel(e) {
        // Stop wheel events from propagating to the canvas
        e.stopPropagation();
    }
    handleMouseDown(e) {
        // Stop mouse events from propagating to the canvas
        e.stopPropagation();
    }
    render() {
        const ratio = this.zoomRatio;
        const isFit = Math.abs(ratio - 1.0) < 0.02;
        const zoomLabel = isFit ? 'Fit' : `${Math.round(ratio * 100)}%`;
        return { ["_$litType$"]: lit_template_1, values: [this.handleWheel, this.handleMouseDown, zoomLabel, classMap({ 'zoom-button': true, disabled: this.atMaxZoom }), this.handleZoomIn, unsafeHTML(icons.ZoomIn), classMap({ 'zoom-button': true, disabled: this.atMinZoom }), this.handleZoomOut, unsafeHTML(icons.ZoomOut), this.handleZoomReset, unsafeHTML(icons.Focus)] };
    }
}
__decorate([
    property({ type: Number })
], GraphControls.prototype, "zoom", void 0);
__decorate([
    property({ type: Number, attribute: 'base-zoom' })
], GraphControls.prototype, "baseZoom", void 0);
__decorate([
    property({ type: Number, attribute: 'node-count' })
], GraphControls.prototype, "nodeCount", void 0);
__decorate([
    property({ type: Number, attribute: 'edge-count' })
], GraphControls.prototype, "edgeCount", void 0);
const lit_template_2 = { h: b_1 `
      <div class="container">
        <div class="content">
          <div class="message">No nodes to display</div>
          <div class="hint">Try adjusting your filters</div>
        </div>
      </div>
    `, parts: [] };
// ========================================
// GraphEmptyState
// ========================================
/**
 * Empty state message overlay shown when no nodes match the current filters.
 *
 * @summary Empty state message overlay
 */
export class GraphEmptyStateOverlay extends LitElement {
    static styles = css `
    :host {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content {
      text-align: center;
    }

    .message {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-base);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-2);
    }

    .hint {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-foreground);
      opacity: var(--opacity-40);
    }
  `;
    render() {
        return { ["_$litType$"]: lit_template_2, values: [] };
    }
}
const lit_template_3 = { h: b_1 `
      <div class="container">
        Drag nodes to reposition \u00B7 Click to inspect \u00B7 Scroll to zoom
      </div>
    `, parts: [] };
// ========================================
// GraphInstructions
// ========================================
/**
 * Usage instructions overlay showing drag, click, and scroll hints.
 *
 * @summary Usage instructions overlay
 */
export class GraphInstructions extends LitElement {
    static styles = css `
    :host {
      display: block;
      position: absolute;
      top: var(--spacing-md);
      left: var(--spacing-md);
    }

    .container {
      padding: var(--spacing-2) var(--spacing-3);
      background-color: rgba(var(--colors-card-rgb), var(--opacity-95));
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-primary) 20%, transparent);
      border-radius: var(--radii-md);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }
  `;
    render() {
        return { ["_$litType$"]: lit_template_3, values: [] };
    }
}
// Register custom element with HMR support
if (!customElements.get('xcode-graph-background')) {
    customElements.define('xcode-graph-background', GraphBackground);
}
if (!customElements.get('xcode-graph-controls')) {
    customElements.define('xcode-graph-controls', GraphControls);
}
// Use a unique tag to avoid clashing with the sidebar empty state component
if (!customElements.get('xcode-graph-visualization-empty-state')) {
    customElements.define('xcode-graph-visualization-empty-state', GraphEmptyStateOverlay);
}
if (!customElements.get('xcode-graph-instructions')) {
    customElements.define('xcode-graph-instructions', GraphInstructions);
}
//# sourceMappingURL=graph-overlays.js.map