/**
 * ClusterTargetsList Lit Component
 *
 * List of cluster target nodes using ListItemRow components.
 *
 * @example
 * ```html
 * <graph-cluster-targets-list
 *   .clusterNodes=${nodes}
 * ></graph-cluster-targets-list>
 * ```
 *
 * @fires node-select - Dispatched when target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { GraphNode } from '@/data/mockGraphData';
import './list-item-row';

@customElement('graph-cluster-targets-list')
export class GraphClusterTargetsList extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare clusterNodes: GraphNode[];

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
    }

    .header {
      display: flex;
      align-items: center;
      justify-between;
      margin-bottom: 12px;
    }

    .title {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
    }

    .count {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: var(--color-foreground);
      opacity: 0.3;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleNodeSelect(e: CustomEvent<{ node: GraphNode }>) {
    this.dispatchEvent(
      new CustomEvent('node-select', {
        detail: { node: e.detail.node },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleNodeHover(e: CustomEvent<{ nodeId: string }>) {
    this.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: e.detail.nodeId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleHoverEnd() {
    this.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: null },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const count = this.clusterNodes?.length || 0;

    return html`
      <div class="header">
        <div class="title">Targets</div>
        <div class="count">${count} total</div>
      </div>

      <div class="list">
        ${this.clusterNodes?.map((node) => {
          const subtitle = node.type.charAt(0).toUpperCase() + node.type.slice(1);

          return html`
            <graph-list-item-row
              .node=${node}
              subtitle=${subtitle}
              @row-select=${this.handleNodeSelect}
              @row-hover=${this.handleNodeHover}
              @row-hover-end=${this.handleHoverEnd}
            ></graph-list-item-row>
          `;
        })}
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-targets-list': GraphClusterTargetsList;
  }
}
