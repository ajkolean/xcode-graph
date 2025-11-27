/**
 * Toolbar Lit Component
 *
 * Graph toolbar with zoom controls and stats.
 * Displays zoom in/out/reset buttons and node/edge counts.
 *
 * @example
 * ```html
 * <graph-toolbar
 *   zoom="1.0"
 *   node-count="42"
 *   edge-count="128"
 * ></graph-toolbar>
 * ```
 *
 * @fires zoom-in - Dispatched when zoom in button clicked
 * @fires zoom-out - Dispatched when zoom out button clicked
 * @fires zoom-reset - Dispatched when zoom reset button clicked
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

export class GraphToolbar extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: Number })
  declare zoom: number;

  @property({ type: Number, attribute: 'node-count' })
  declare nodeCount: number;

  @property({ type: Number, attribute: 'edge-count' })
  declare edgeCount: number;

  constructor() {
    super();
    this.zoom = 1.0;
    this.nodeCount = 0;
    this.edgeCount = 0;
  }

  // ========================================
  // Styles
  // ========================================

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .control-button {
      width: 32px;
      height: 32px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-muted-foreground);
      cursor: pointer;
      transition: all 0.2s;
    }

    .control-button:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--color-border);
      color: var(--color-foreground);
    }

    .control-button:active {
      background: rgba(255, 255, 255, 0.08);
    }

    .control-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .control-button svg {
      width: 16px;
      height: 16px;
    }

    .zoom-value {
      min-width: 48px;
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      font-variant-numeric: tabular-nums;
    }

    .divider {
      width: 1px;
      height: 20px;
      background: var(--color-border);
      margin: 0 8px;
    }

    .stats {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
    }

    .stat-value {
      color: var(--color-foreground);
      font-weight: var(--font-weight-medium);
      font-variant-numeric: tabular-nums;
    }

    .stat-icon {
      opacity: 0.6;
    }

    .stat-icon svg {
      width: 14px;
      height: 14px;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleZoomIn() {
    this.dispatchEvent(
      new CustomEvent('zoom-in', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleZoomOut() {
    this.dispatchEvent(
      new CustomEvent('zoom-out', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleZoomReset() {
    this.dispatchEvent(
      new CustomEvent('zoom-reset', {
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    const zoomPercent = Math.round(this.zoom * 100);
    const canZoomIn = this.zoom < 2.0;
    const canZoomOut = this.zoom > 0.25;

    return html`
      <div class="controls">
        <button
          class="control-button"
          @click=${this.handleZoomOut}
          ?disabled=${!canZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          ${unsafeHTML(icons.Minus)}
        </button>

        <span class="zoom-value">${zoomPercent}%</span>

        <button
          class="control-button"
          @click=${this.handleZoomIn}
          ?disabled=${!canZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          ${unsafeHTML(icons.Plus)}
        </button>

        <button
          class="control-button"
          @click=${this.handleZoomReset}
          title="Reset zoom"
          aria-label="Reset zoom to 100%"
        >
          ${unsafeHTML(icons.Maximize2)}
        </button>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat-icon">${unsafeHTML(icons.Circle)}</span>
          <span class="stat-value">${this.nodeCount}</span>
          <span>nodes</span>
        </div>

        <div class="stat">
          <span class="stat-icon">${unsafeHTML(icons.ArrowRight)}</span>
          <span class="stat-value">${this.edgeCount}</span>
          <span>edges</span>
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-toolbar': GraphToolbar;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-toolbar')) {
  customElements.define('graph-toolbar', GraphToolbar);
}
