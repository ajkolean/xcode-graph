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
 * <graph-background></graph-background>
 * <graph-controls zoom="1.0"></graph-controls>
 * <graph-visualization-empty-state></graph-visualization-empty-state>
 * ```
 */

import { icons } from "@shared/controllers/icon.adapter";
import { css, html, LitElement, svg } from "lit";
import { property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

// ========================================
// GraphBackground
// ========================================

export class GraphBackground extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: var(--opacity-4);
    }
  `;

  override render() {
    return svg`
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

// ========================================
// GraphControls
// ========================================

export class GraphControls extends LitElement {
  @property({ type: Number })
  declare zoom: number;

  @property({ type: Number, attribute: "base-zoom" })
  declare baseZoom: number;

  @property({ type: Number, attribute: "node-count" })
  declare nodeCount: number;

  @property({ type: Number, attribute: "edge-count" })
  declare edgeCount: number;

  @property({ type: Boolean, attribute: "enable-animation" })
  declare enableAnimation: boolean;

  @property({ type: String, attribute: "layout-dimension" })
  declare layoutDimension: "2d" | "3d";

  static override readonly styles = css`
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
      border: var(--border-widths-thin) solid
        color-mix(in srgb, var(--colors-primary) 30%, transparent);
      border-radius: var(--radii-md);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .divider {
      width: var(--border-widths-thin);
      height: var(--spacing-4);
      background-color: color-mix(
        in srgb,
        var(--colors-primary) 30%,
        transparent
      );
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
      border: var(--border-widths-thin) solid
        color-mix(in srgb, var(--colors-primary) 20%, transparent);
      background: none;
      color: var(--colors-muted-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .zoom-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .zoom-button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .animation-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-md);
      transition: all var(--durations-normal);
      border: var(--border-widths-thin) solid transparent;
      background: none;
      cursor: pointer;
    }

    .animation-button.active {
      border-color: color-mix(in srgb, var(--colors-primary) 50%, transparent);
      background-color: color-mix(
        in srgb,
        var(--colors-primary) 10%,
        transparent
      );
      color: var(--colors-primary);
    }

    .animation-button:not(.active) {
      border-color: color-mix(in srgb, var(--colors-primary) 20%, transparent);
      color: var(--colors-muted-foreground);
    }

    .animation-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .orbit-icon {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .orbit-icon svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
    }

    .dimension-toggle {
      display: flex;
      align-items: center;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-md);
      transition: all var(--durations-normal);
      border: var(--border-widths-thin) solid
        color-mix(in srgb, var(--colors-primary) 20%, transparent);
      background: none;
      cursor: pointer;
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      min-width: 32px;
      justify-content: center;
    }

    .dimension-toggle:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .dimension-toggle.active-3d {
      border-color: color-mix(in srgb, var(--colors-primary) 50%, transparent);
      background-color: color-mix(
        in srgb,
        var(--colors-primary) 10%,
        transparent
      );
      color: var(--colors-primary);
    }
  `;

  private handleZoomIn() {
    this.dispatchEvent(
      new CustomEvent("zoom-in", { bubbles: true, composed: true }),
    );
  }

  private handleZoomOut() {
    this.dispatchEvent(
      new CustomEvent("zoom-out", { bubbles: true, composed: true }),
    );
  }

  private handleZoomReset() {
    this.dispatchEvent(
      new CustomEvent("zoom-reset", { bubbles: true, composed: true }),
    );
  }

  private handleToggleDimension() {
    this.dispatchEvent(
      new CustomEvent("toggle-dimension", {
        detail: { dimension: this.layoutDimension === "2d" ? "3d" : "2d" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleWheel(e: WheelEvent) {
    // Stop wheel events from propagating to the canvas
    e.stopPropagation();
  }

  private handleMouseDown(e: MouseEvent) {
    // Stop mouse events from propagating to the canvas
    e.stopPropagation();
  }

  override render() {
    const percentage =
      this.baseZoom > 0
        ? Math.round((this.zoom / this.baseZoom) * 100)
        : Math.round(this.zoom * 100);

    return html`
      <div
        class="container"
        @wheel=${this.handleWheel}
        @mousedown=${this.handleMouseDown}
      >
        <span>${percentage}%</span>
        <div class="divider"></div>

        <div class="zoom-buttons">
          <button
            class="zoom-button"
            @click=${this.handleZoomIn}
            title="Zoom in"
          >
            ${unsafeHTML(icons.ZoomIn)}
          </button>
          <button
            class="zoom-button"
            @click=${this.handleZoomOut}
            title="Zoom out"
          >
            ${unsafeHTML(icons.ZoomOut)}
          </button>
          <button
            class="zoom-button"
            @click=${this.handleZoomReset}
            title="Reset zoom"
          >
            ${unsafeHTML(icons.Maximize2)}
          </button>
        </div>

        <div class="divider"></div>

        <button
          class="dimension-toggle ${this.layoutDimension === "3d"
            ? "active-3d"
            : ""}"
          @click=${this.handleToggleDimension}
          title="${this.layoutDimension === "2d"
            ? "Switch to 3D layout"
            : "Switch to 2D layout"}"
        >
          ${this.layoutDimension === "2d" ? "2D" : "3D"}
        </button>
      </div>
    `;
  }
}

// ========================================
// GraphEmptyState
// ========================================

export class GraphEmptyStateOverlay extends LitElement {
  static override readonly styles = css`
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

  override render() {
    return html`
      <div class="container">
        <div class="content">
          <div class="message">No nodes to display</div>
          <div class="hint">Try adjusting your filters</div>
        </div>
      </div>
    `;
  }
}

// ========================================
// GraphInstructions
// ========================================

export class GraphInstructions extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
      position: absolute;
      top: var(--spacing-md);
      left: var(--spacing-md);
    }

    .container {
      padding: var(--spacing-2) var(--spacing-3);
      background-color: rgba(var(--colors-card-rgb), var(--opacity-95));
      border: var(--border-widths-thin) solid
        color-mix(in srgb, var(--colors-primary) 20%, transparent);
      border-radius: var(--radii-md);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }
  `;

  override render() {
    return html`
      <div class="container">
        Drag nodes to reposition · Click to inspect · Scroll to zoom
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    "graph-background": GraphBackground;
    "graph-controls": GraphControls;
    "graph-visualization-empty-state": GraphEmptyStateOverlay;
    "graph-instructions": GraphInstructions;
  }
}

// Register custom element with HMR support
if (!customElements.get("graph-background")) {
  customElements.define("graph-background", GraphBackground);
}

if (!customElements.get("graph-controls")) {
  customElements.define("graph-controls", GraphControls);
}

// Use a unique tag to avoid clashing with the sidebar empty state component
if (!customElements.get("graph-visualization-empty-state")) {
  customElements.define(
    "graph-visualization-empty-state",
    GraphEmptyStateOverlay,
  );
}

if (!customElements.get("graph-instructions")) {
  customElements.define("graph-instructions", GraphInstructions);
}
