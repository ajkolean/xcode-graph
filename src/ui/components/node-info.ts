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

import type { GraphNode } from '@shared/schemas/graph.schema';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './info-row.js';

export class GraphNodeInfo extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
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

  override render() {
    if (!this.node) return html``;

    return html`
      <div class="title">Node Info</div>

      <div class="info-rows">
        <graph-info-row label="Platform" value=${this.node.platform}></graph-info-row>
        <graph-info-row label="Origin" value=${this.originLabel}></graph-info-row>
        <graph-info-row label="Type" value=${getNodeTypeLabel(this.node.type)}></graph-info-row>
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
