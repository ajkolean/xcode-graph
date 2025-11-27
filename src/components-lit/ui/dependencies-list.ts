/**
 * DependenciesList Lit Component
 *
 * List of node dependencies using ListItemRow components.
 *
 * @example
 * ```html
 * <graph-dependencies-list
 *   .dependencies=${deps}
 * ></graph-dependencies-list>
 * ```
 *
 * @fires node-select - Dispatched when dependency is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphNode } from '@/data/mockGraphData';
import './list-item-row';

export class GraphDependenciesList extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare dependencies: GraphNode[];

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .empty {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      font-style: italic;
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
    const count = this.dependencies?.length || 0;

    return html`
      <div class="header">
        <div class="title">Dependencies</div>
        <div class="count">${count} direct</div>
      </div>

      ${count === 0
        ? html`<div class="empty">No dependencies</div>`
        : html`
            <div class="list">
              ${this.dependencies.map((dep) => {
                const subtitle =
                  dep.origin === 'external'
                    ? `External ${dep.type.charAt(0).toUpperCase() + dep.type.slice(1)}`
                    : dep.type.charAt(0).toUpperCase() + dep.type.slice(1);

                return html`
                  <graph-list-item-row
                    .node=${dep}
                    subtitle=${subtitle}
                    @row-select=${this.handleNodeSelect}
                    @row-hover=${this.handleNodeHover}
                    @row-hover-end=${this.handleHoverEnd}
                  ></graph-list-item-row>
                `;
              })}
            </div>
          `}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-dependencies-list': GraphDependenciesList;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-dependencies-list')) {
  customElements.define('graph-dependencies-list', GraphDependenciesList);
}
