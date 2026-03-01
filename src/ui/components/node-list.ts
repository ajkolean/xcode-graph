/**
 * NodeList Lit Component
 *
 * A unified list component for displaying nodes with section header.
 * Used for dependencies, dependents, and other node list displays.
 * Supports displaying dependency kind badges when edge information is provided.
 *
 * @example
 * ```html
 * <xcode-graph-node-list
 *   title="Dependencies"
 *   .items=${dependencies}
 *   suffix="direct"
 *   empty-message="No dependencies"
 *   zoom="1.0"
 * ></xcode-graph-node-list>
 * ```
 *
 * @fires node-select - Dispatched when node is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import type { NodeWithEdge } from '@graph/utils/node-utils';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { DependencyKind, type GraphNode, Origin } from '@shared/schemas/graph.types';
import { type CSSResultGroup, css, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import './badge.js';
import './list-item-row.js';
import { NodeListEventsBase } from './node-list-events';

/** Dependency kind colors and labels */
const DEPENDENCY_KIND_CONFIG: Record<string, { label: string; color: string }> = {
  [DependencyKind.Target]: { label: 'Target', color: 'var(--colors-success)' },
  [DependencyKind.Project]: { label: 'Project', color: 'var(--colors-info)' },
  [DependencyKind.Sdk]: { label: 'SDK', color: 'var(--colors-primary)' },
  [DependencyKind.XCFramework]: { label: 'XCF', color: 'var(--colors-warning)' },
};

/**
 * A unified list component for displaying nodes with a section header.
 * Used for dependencies, dependents, and other node list displays.
 * Supports displaying dependency kind badges when edge information is provided.
 *
 * @summary Collapsible node list with section header and kind badges
 * @fires node-select - Dispatched when a node row is clicked (detail: { node })
 * @fires node-hover - Dispatched on node row hover (detail: { nodeId })
 */
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

  @state()
  private declare isExpanded: boolean;

  constructor() {
    super();
    this.title = '';
    this.suffix = '';
    this.emptyMessage = 'No items';
    this.zoom = 1;
    this.showKind = true;
    this.isExpanded = true;
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

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .header:hover .header-title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .header-title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-muted-foreground);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .count {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      opacity: var(--opacity-50);
      margin-left: var(--spacing-2);
    }

    .toggle-icon {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      color: var(--colors-muted-foreground);
      opacity: var(--opacity-40);
      transition: transform var(--durations-fast) var(--easings-out), color var(--durations-normal), opacity var(--durations-normal);
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .content {
      margin-top: var(--spacing-2);
    }

    .empty {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      font-style: italic;
    }

    .list {
      display: block;
      max-height: 300px;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-1);
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

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

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
      color: 'var(--colors-muted-foreground)',
    };

    return html`
      <xcode-graph-badge
        class="kind-badge"
        label=${config.label}
        color=${config.color}
        variant="rounded"
        size="sm"
      ></xcode-graph-badge>
    `;
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    const items = this.itemList;
    const count = items.length;
    const countText = this.suffix ? `${count} ${this.suffix}` : `${count}`;

    return html`
      <div class="header" @click=${this.toggleExpanded}>
        <div>
          <span class="header-title">${this.title}</span>
          <span class="count">${countText}</span>
        </div>
        <svg
          class=${classMap({ 'toggle-icon': true, expanded: this.isExpanded })}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      ${when(
        this.isExpanded,
        () => html`
          <div class="content">
            ${
              count === 0
                ? html`<div class="empty">${this.emptyMessage}</div>`
                : html`
                  <div class="list">
                    ${virtualize({
                      items,
                      renderItem: (item: NodeWithEdge) => html`
                        <div class="item-row">
                          <div class="item-content">
                            <xcode-graph-list-item-row
                              .node=${item.node}
                              subtitle=${this.getNodeSubtitle(item.node)}
                              .zoom=${this.zoom}
                              @row-select=${this.handleNodeSelect}
                              @row-hover=${this.handleNodeHover}
                              @row-hover-end=${this.handleHoverEnd}
                            ></xcode-graph-list-item-row>
                          </div>
                          ${this.renderKindBadge(item)}
                        </div>
                      `,
                      keyFunction: (item: NodeWithEdge) => item.node.id,
                    })}
                  </div>
                `
            }
          </div>
        `,
      )}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-node-list': GraphNodeList;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-list')) {
  customElements.define('xcode-graph-node-list', GraphNodeList);
}
