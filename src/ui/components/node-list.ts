/**
 * NodeList Lit Component
 *
 * A unified list component for displaying nodes with section header.
 * Used for dependencies, dependents, and other node list displays.
 * Supports displaying dependency kind badges when edge information is provided.
 *
 * @example
 * ```html
 * <graph-node-list
 *   title="Dependencies"
 *   .items=${dependencies}
 *   suffix="direct"
 *   empty-message="No dependencies"
 *   zoom="1.0"
 * ></graph-node-list>
 * ```
 *
 * @fires node-select - Dispatched when node is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import type { NodeWithEdge } from '@graph/utils/node-utils';
import { DependencyKind, type GraphNode, Origin } from '@shared/schemas/graph.schema';
import { type CSSResultGroup, css, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';
import './list-item-row.js';
import { NodeListEventsBase } from './node-list-events';
import './section-header.js';

/** Dependency kind colors and labels */
const DEPENDENCY_KIND_CONFIG: Record<string, { label: string; color: string }> = {
  [DependencyKind.Target]: { label: 'Target', color: '#10B981' },
  [DependencyKind.Project]: { label: 'Project', color: '#3B82F6' },
  [DependencyKind.Sdk]: { label: 'SDK', color: '#8B5CF6' },
  [DependencyKind.XCFramework]: { label: 'XCF', color: '#F59E0B' },
};

export class GraphNodeList extends NodeListEventsBase {
  // ========================================
  // Properties
  // ========================================

  /**
   * Section title (e.g., "Dependencies", "Dependents")
   */
  @property({ type: String })
  declare title: string;

  /**
   * Array of nodes with edge info to display
   */
  @property({ attribute: false })
  declare items: NodeWithEdge[];

  /**
   * @deprecated Use items instead. Legacy support for plain node arrays.
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

  /**
   * Whether to show dependency kind badges
   */
  @property({ type: Boolean, attribute: 'show-kind' })
  declare showKind: boolean;

  constructor() {
    super();
    this.title = '';
    this.suffix = '';
    this.emptyMessage = 'No items';
    this.zoom = 1;
    this.showKind = true;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
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

    .item-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .kind-badge {
      flex-shrink: 0;
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private get itemList(): NodeWithEdge[] {
    // Support both new items prop and legacy nodes prop
    if (this.items && this.items.length > 0) {
      return this.items;
    }
    // Legacy: wrap plain nodes in NodeWithEdge format
    if (this.nodes && this.nodes.length > 0) {
      return this.nodes.map((node) => ({
        node,
        edge: { source: '', target: node.id },
      }));
    }
    return [];
  }

  private getNodeSubtitle(node: GraphNode): string {
    const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    return node.origin === Origin.External ? `External ${typeLabel}` : typeLabel;
  }

  private renderKindBadge(item: NodeWithEdge) {
    if (!this.showKind || !item.edge.kind) return nothing;

    const config = DEPENDENCY_KIND_CONFIG[item.edge.kind] || {
      label: item.edge.kind,
      color: '#6B7280',
    };

    return html`
      <graph-badge
        class="kind-badge"
        label=${config.label}
        color=${config.color}
        variant="rounded"
        size="sm"
      ></graph-badge>
    `;
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    const items = this.itemList;
    const count = items.length;

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
              ${items.map(
                (item) => html`
                  <div class="item-row">
                    <div class="item-content">
                      <graph-list-item-row
                        .node=${item.node}
                        subtitle=${this.getNodeSubtitle(item.node)}
                        .zoom=${this.zoom}
                        @row-select=${this.handleNodeSelect}
                        @row-hover=${this.handleNodeHover}
                        @row-hover-end=${this.handleHoverEnd}
                      ></graph-list-item-row>
                    </div>
                    ${this.renderKindBadge(item)}
                  </div>
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
