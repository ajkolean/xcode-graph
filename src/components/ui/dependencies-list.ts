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

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphNode } from '@/schemas/graph.schema';
import './list-item-row';
import './section-header.js';

export class GraphDependenciesList extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare dependencies: GraphNode[];

  @property({ type: Number })
  declare zoom: number;

  constructor() {
    super();
    this.zoom = 1;
  }

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .empty {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      font-style: italic;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
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
      }),
    );
  }

  private handleNodeHover(e: CustomEvent<{ nodeId: string }>) {
    this.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: e.detail.nodeId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleHoverEnd() {
    this.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: null },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const count = this.dependencies?.length || 0;

    return html`
      <graph-section-header
        title="Dependencies"
        count=${count}
        suffix="direct"
      ></graph-section-header>

      ${
        count === 0
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
                    .zoom=${this.zoom}
                    @row-select=${this.handleNodeSelect}
                    @row-hover=${this.handleNodeHover}
                    @row-hover-end=${this.handleHoverEnd}
                  ></graph-list-item-row>
                `;
              })}
            </div>
          `
      }
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
