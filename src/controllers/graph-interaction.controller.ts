/**
 * GraphInteractionController
 *
 * Manages pan and zoom interactions for graph visualization.
 * Converted from useGraphPanZoom React hook to Lit reactive controller.
 *
 * @example
 * ```typescript
 * private interaction = new GraphInteractionController(this, {
 *   zoom: 1.0,
 *   onZoomChange: (zoom) => this.handleZoomChange(zoom),
 * });
 *
 * render() {
 *   return html`
 *     <svg
 *       @mousedown=${this.interaction.handleMouseDown}
 *       @mousemove=${this.interaction.handleMouseMove}
 *       @mouseup=${this.interaction.handleMouseUp}
 *       @wheel=${this.interaction.handleWheel}
 *     >
 *       <g transform="translate(${this.interaction.pan.x}, ${this.interaction.pan.y})">
 *         <!-- content -->
 *       </g>
 *     </svg>
 *   `;
 * }
 * ```
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface GraphInteractionConfig {
  zoom: number;
  onZoomChange?: (zoom: number) => void;
}

export class GraphInteractionController implements ReactiveController {
  private host: ReactiveControllerHost;
  private config: GraphInteractionConfig;

  // State
  pan = { x: 0, y: 0 };
  isDragging = false;

  private dragStart: { x: number; y: number } | null = null;
  private lastPan = { x: 0, y: 0 };

  constructor(host: ReactiveControllerHost, config: GraphInteractionConfig) {
    this.host = host;
    this.config = config;
    host.addController(this);
  }

  // ========================================
  // Event Handlers
  // ========================================

  handleMouseDown = (e: MouseEvent) => {
    // Only start dragging on canvas background (not on nodes)
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg' || target.tagName === 'rect') {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.lastPan = { ...this.pan };
      this.host.requestUpdate();
    }
  };

  handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.dragStart) return;

    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    this.pan = {
      x: this.lastPan.x + dx,
      y: this.lastPan.y + dy,
    };
    this.host.requestUpdate();
  };

  handleMouseUp = () => {
    this.isDragging = false;
    this.dragStart = null;
    this.host.requestUpdate();
  };

  handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(2, Math.max(0.2, this.config.zoom + delta));

    if (this.config.onZoomChange) {
      this.config.onZoomChange(newZoom);
    }
  };

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {
    // No setup needed - event handlers attached via template
  }

  hostDisconnected(): void {
    // Cleanup any lingering state
    this.isDragging = false;
    this.dragStart = null;
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Update configuration (e.g., when zoom changes externally)
   */
  updateConfig(config: Partial<GraphInteractionConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset pan to origin
   */
  resetPan() {
    this.pan = { x: 0, y: 0 };
    this.host.requestUpdate();
  }
}
