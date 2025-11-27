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

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { GraphNode } from '@/data/mockGraphData';
import { getNodeTypeLabel } from '@/utils/nodeIcons';

@customElement('graph-node-info')
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
      margin-bottom: 12px;
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-muted-foreground);
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .info-label {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-muted-foreground);
    }

    .info-value {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-foreground);
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
