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

import { icons } from '@shared/controllers/icon.adapter';
import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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

  @property({ type: Number, attribute: 'node-count' })
  declare nodeCount: number;

  @property({ type: Number, attribute: 'edge-count' })
  declare edgeCount: number;

  @property({ type: Boolean, attribute: 'enable-animation' })
  declare enableAnimation: boolean;

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
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-primary) 30%, transparent);
      border-radius: var(--radii-md);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
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
      background-color: color-mix(in srgb, var(--colors-primary) 10%, transparent);
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
  `;

  private handleZoomIn() {
    this.dispatchEvent(new CustomEvent('zoom-in', { bubbles: true, composed: true }));
  }

  private handleZoomOut() {
    this.dispatchEvent(new CustomEvent('zoom-out', { bubbles: true, composed: true }));
  }

  private handleZoomReset() {
    this.dispatchEvent(new CustomEvent('zoom-reset', { bubbles: true, composed: true }));
  }

  private handleToggleAnimation() {
    this.dispatchEvent(
      new CustomEvent('toggle-animation', {
        detail: { enabled: !this.enableAnimation },
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

  private renderOrbitIcon() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <circle cx="12" cy="12" r="10" opacity="0.3"></circle>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" opacity="0.3"></path>
      </svg>
    `;
  }

  override render() {
    return html`
      <div class="container" @wheel=${this.handleWheel} @mousedown=${this.handleMouseDown}>
        <span>${Math.round(this.zoom * 100)}%</span>
        <div class="divider"></div>

        <div class="zoom-buttons">
          <button class="zoom-button" @click=${this.handleZoomIn} title="Zoom in">
            ${unsafeHTML(icons.ZoomIn)}
          </button>
          <button class="zoom-button" @click=${this.handleZoomOut} title="Zoom out">
            ${unsafeHTML(icons.ZoomOut)}
          </button>
          <button class="zoom-button" @click=${this.handleZoomReset} title="Reset zoom">
            ${unsafeHTML(icons.Maximize2)}
          </button>
        </div>

        <div class="divider"></div>

        <!-- Animation button removed - will be replaced with 2D/3D toggle -->
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
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-primary) 20%, transparent);
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
    'graph-background': GraphBackground;
    'graph-controls': GraphControls;
    'graph-visualization-empty-state': GraphEmptyStateOverlay;
    'graph-instructions': GraphInstructions;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-background')) {
  customElements.define('graph-background', GraphBackground);
}

if (!customElements.get('graph-controls')) {
  customElements.define('graph-controls', GraphControls);
}

// Use a unique tag to avoid clashing with the sidebar empty state component
if (!customElements.get('graph-visualization-empty-state')) {
  customElements.define('graph-visualization-empty-state', GraphEmptyStateOverlay);
}

if (!customElements.get('graph-instructions')) {
  customElements.define('graph-instructions', GraphInstructions);
}
