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
import { calculateViewportBounds, isCircleInViewport } from '@ui/utils/viewport';
import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  type PropertyValues,
  svg,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';

export interface VirtualRenderConfig {
  // Viewport dimensions
  viewportWidth: number;
  viewportHeight: number;

  // Transform
  panX: number;
  panY: number;
  zoom: number;

  // Buffer for smooth scrolling
  bufferMargin?: number;
}

/**
 * Virtual renderer that only creates DOM elements for nodes visible in the viewport.
 * Dramatically improves performance with large graphs (10,000+ nodes).
 *
 * @summary Viewport-culled virtual node renderer
 */
export class GraphVirtualRenderer extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare nodes: GraphNode[];

  @property({ attribute: false })
  declare nodePositions: Map<string, NodePosition>;

  @property({ type: Number })
  declare viewportWidth: number;

  @property({ type: Number })
  declare viewportHeight: number;

  @property({ type: Number })
  declare panX: number;

  @property({ type: Number })
  declare panY: number;

  @property({ type: Number })
  declare zoom: number;

  @property({ type: Number })
  declare bufferMargin: number;

  // ========================================
  // Internal State
  // ========================================

  @state()
  private declare visibleNodeIds: Set<string>;

  @state()
  private declare renderCount: number; // For debugging

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: contents;
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  constructor() {
    super();
    this.nodes = [];
    this.nodePositions = new Map();
    this.viewportWidth = 1000;
    this.viewportHeight = 800;
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.bufferMargin = 200;
    this.visibleNodeIds = new Set();
    this.renderCount = 0;
  }

  override willUpdate(changedProps: PropertyValues<this>): void {
    // Recalculate visible nodes when viewport or positions change
    if (
      changedProps.has('nodes') ||
      changedProps.has('nodePositions') ||
      changedProps.has('viewportWidth') ||
      changedProps.has('viewportHeight') ||
      changedProps.has('panX') ||
      changedProps.has('panY') ||
      changedProps.has('zoom')
    ) {
      this.updateVisibleNodes();
    }
  }

  // ========================================
  // Viewport Culling
  // ========================================

  private updateVisibleNodes() {
    const viewportBounds = calculateViewportBounds(
      this.viewportWidth,
      this.viewportHeight,
      this.panX,
      this.panY,
      this.zoom,
      this.bufferMargin,
    );

    const visible = new Set<string>();

    for (const node of this.nodes) {
      const pos = this.nodePositions.get(node.id);
      if (!pos) continue;

      const radius = pos.radius || 20;

      if (isCircleInViewport({ x: pos.x, y: pos.y }, radius, viewportBounds)) {
        visible.add(node.id);
      }
    }

    this.visibleNodeIds = visible;
    this.renderCount++;
  }

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
  } {
    return {
      totalNodes: this.nodes.length,
      visibleNodes: this.visibleNodeIds.size,
      culledNodes: this.nodes.length - this.visibleNodeIds.size,
      cullingRatio: this.nodes.length / (this.visibleNodeIds.size || 1),
      percentageCulled: ((this.nodes.length - this.visibleNodeIds.size) / this.nodes.length) * 100,
      renderCount: this.renderCount,
    };
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    // Only render visible nodes
    const visibleNodes = this.nodes.filter((node) => this.visibleNodeIds.has(node.id));

    return html`
      ${visibleNodes.map((node) => {
        const pos = this.nodePositions.get(node.id);
        if (!pos) return null;

        // Render node using graph-node component
        return svg`
          <graph-node
            .node=${node}
            .position=${pos}
            .zoom=${this.zoom}
          ></graph-node>
        `;
      })}
    `;
  }
}

// Register custom element
if (!customElements.get('graph-virtual-renderer')) {
  customElements.define('graph-virtual-renderer', GraphVirtualRenderer);
}

declare global {
  interface HTMLElementTagNameMap {
    'graph-virtual-renderer': GraphVirtualRenderer;
  }
}
