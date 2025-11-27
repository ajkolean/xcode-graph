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

import { LitElement, html, svg, css } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

// ========================================
// GraphBackground
// ========================================

export class GraphBackground extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.04;
    }
  `;

  render() {
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

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: var(--spacing-md);
      left: var(--spacing-md);
    }

    .container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background-color: rgba(15, 15, 20, 0.95);
      border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
      border-radius: var(--radius);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-muted-foreground);
    }

    .divider {
      width: 1px;
      height: 16px;
      background-color: color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .zoom-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .zoom-button {
      padding: 6px;
      border-radius: var(--radius);
      transition: background-color 0.2s;
      border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
      background: none;
      color: var(--color-muted-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .zoom-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .zoom-button svg {
      width: 14px;
      height: 14px;
    }

    .animation-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: var(--radius);
      transition: all 0.2s;
      border: 1px solid transparent;
      background: none;
      cursor: pointer;
    }

    .animation-button.active {
      border-color: color-mix(in srgb, var(--primary) 50%, transparent);
      background-color: color-mix(in srgb, var(--primary) 10%, transparent);
      color: var(--primary);
    }

    .animation-button:not(.active) {
      border-color: color-mix(in srgb, var(--primary) 20%, transparent);
      color: var(--color-muted-foreground);
    }

    .animation-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .orbit-icon {
      width: 14px;
      height: 14px;
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
      })
    );
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

  render() {
    return html`
      <div class="container">
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

        <button
          class="animation-button ${this.enableAnimation ? 'active' : ''}"
          @click=${this.handleToggleAnimation}
          title="Toggle space ballet animation"
        >
          <span class="orbit-icon">${this.renderOrbitIcon()}</span>
          <span style="font-size: var(--text-label)">
            ${this.enableAnimation ? 'Animated' : 'Static'}
          </span>
        </button>
      </div>
    `;
  }
}

// ========================================
// GraphEmptyState
// ========================================

export class GraphEmptyStateOverlay extends LitElement {
  static styles = css`
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
      font-family: 'Inter', sans-serif;
      font-size: var(--text-base);
      color: var(--color-muted-foreground);
      margin-bottom: 8px;
    }

    .hint {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-foreground);
      opacity: 0.4;
    }
  `;

  render() {
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
  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: var(--spacing-md);
      left: var(--spacing-md);
    }

    .container {
      padding: 8px 12px;
      background-color: rgba(15, 15, 20, 0.95);
      border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
      border-radius: var(--radius);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-muted-foreground);
    }
  `;

  render() {
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
