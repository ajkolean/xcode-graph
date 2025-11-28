/**
 * NodeList Lit Component
 *
 * A unified list component for displaying nodes with section header.
 * Used for dependencies, dependents, and other node list displays.
 *
 * @example
 * ```html
 * <graph-node-list
 *   title="Dependencies"
 *   .nodes=${dependencies}
 *   suffix="direct"
 *   empty-message="No dependencies"
 *   zoom="1.0"
 * ></graph-node-list>
 * ```
 *
 * @fires node-select - Dispatched when node is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import type { GraphNode } from '@shared/schemas/graph.schema';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { NodeListEventsMixin } from './node-list-events';
import './list-item-row.js';
import './section-header.js';

export class GraphNodeList extends NodeListEventsMixin(LitElement) {
  // ========================================
  // Properties
  // ========================================

  /**
   * Section title (e.g., "Dependencies", "Dependents")
   */
  @property({ type: String })
  declare title: string;

  /**
   * Array of nodes to display
   */
  @property({ attribute: false })
  declare nodes: GraphNode[];

  /**
   * Suffix for count display (e.g., "direct")
   */
  @property({ type: String })
  declare suffix: string;

  /**
   * Message to show when list is empty
   */
  @property({ type: String, attribute: 'empty-message' })
  declare emptyMessage: string;

  /**
   * Zoom level for color adjustments
   */
  @property({ type: Number })
  declare zoom: number;

  constructor() {
    super();
    this.title = '';
    this.suffix = '';
    this.emptyMessage = 'No items';
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
  // Helpers
  // ========================================

  private getNodeSubtitle(node: GraphNode): string {
    const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    return node.origin === 'external' ? `External ${typeLabel}` : typeLabel;
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const count = this.nodes?.length || 0;

    return html`
      <graph-section-header
        title=${this.title}
        count=${count}
        suffix=${this.suffix}
      ></graph-section-header>

      ${
        count === 0
          ? html`<div class="empty">${this.emptyMessage}</div>`
          : html`
            <div class="list">
              ${this.nodes.map(
                (node) => html`
                  <graph-list-item-row
                    .node=${node}
                    subtitle=${this.getNodeSubtitle(node)}
                    .zoom=${this.zoom}
                    @row-select=${this.handleNodeSelect}
                    @row-hover=${this.handleNodeHover}
                    @row-hover-end=${this.handleHoverEnd}
                  ></graph-list-item-row>
                `,
              )}
            </div>
          `
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node-list': GraphNodeList;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node-list')) {
  customElements.define('graph-node-list', GraphNodeList);
}
