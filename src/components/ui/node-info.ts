/**
 * NodeInfo Lit Component
 *
 * Displays key-value pairs about a node (platform, origin, type).
 *
 * @example
 * ```html
 * <graph-node-info .node=${nodeData}></graph-node-info>
 * ```
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphNode } from '@/schemas/graph.schema';
import { getNodeTypeLabel } from '@/utils/rendering/node-icons';

export class GraphNodeInfo extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      margin-top: auto;
    }

    .title {
      margin-bottom: var(--spacing-3);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .info-label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .info-value {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-foreground);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private get originLabel(): string {
    return this.node.origin === 'local' ? 'Local Project' : 'External Package';
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return html``;

    return html`
      <div class="title">Node Info</div>

      <div class="info-rows">
        <!-- Platform -->
        <div class="info-row">
          <span class="info-label">Platform:</span>
          <span class="info-value">${this.node.platform}</span>
        </div>

        <!-- Origin -->
        <div class="info-row">
          <span class="info-label">Origin:</span>
          <span class="info-value">${this.originLabel}</span>
        </div>

        <!-- Type -->
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span class="info-value">${getNodeTypeLabel(this.node.type)}</span>
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node-info': GraphNodeInfo;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node-info')) {
  customElements.define('graph-node-info', GraphNodeInfo);
}
