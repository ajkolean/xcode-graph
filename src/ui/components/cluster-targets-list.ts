/**
 * ClusterTargetsList Lit Component
 *
 * List of cluster target nodes GROUPED BY TYPE using ListItemRow components.
 * Matches React version with full grouping and stats.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-targets-list
 *   .nodesByType=${nodesByType}
 *   .edges=${edges}
 *   filtered-targets-count="5"
 *   total-targets-count="10"
 * ></xcode-graph-cluster-targets-list>
 * ```
 *
 * @fires node-select - Dispatched when target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { type CSSResultGroup, css, html, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import { NodeListEventsBase } from './node-list-events';
import './list-item-row';

type ClusterListItem =
  | { kind: 'header'; nodeType: string; count: number }
  | { kind: 'node'; node: GraphNode; stats: { dependencies: number; dependents: number } };

/**
 * List of cluster target nodes grouped by type using ListItemRow components.
 * Shows targets organized by node type with dependency/dependent counts.
 *
 * @summary Collapsible cluster targets list grouped by node type
 *
 * @fires node-select - Dispatched when a target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */
export class GraphClusterTargetsList extends NodeListEventsBase {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare clusterNodes: GraphNode[];

  @property({ attribute: false })
  declare nodesByType: Record<string, GraphNode[]>;

  @property({ type: Number, attribute: 'filtered-targets-count' })
  declare filteredTargetsCount: number;

  @property({ type: Number, attribute: 'total-targets-count' })
  declare totalTargetsCount: number;

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ type: Number })
  declare zoom: number;

  /**
   * Whether to start expanded (default: true)
   */
  @property({ type: Boolean })
  declare expanded: boolean;

  @state()
  private declare isExpanded: boolean;

  constructor() {
    super();
    this.expanded = true;
    this.isExpanded = true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.isExpanded = this.expanded;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--spacing-md);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .header:hover .main-title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .main-title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-muted-foreground);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
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
      margin-top: var(--spacing-md);
    }

    .target-list {
      display: block;
      max-height: 400px;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .type-header {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-sm);
      margin-top: var(--spacing-3);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .type-header:first-child {
      margin-top: 0;
    }

    xcode-graph-list-item-row {
      margin-bottom: var(--spacing-1);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private get flatItems(): ClusterListItem[] {
    if (!this.nodesByType) return [];

    // Pre-compute edge counts for O(1) lookups per node
    const dependencyCount = new Map<string, number>();
    const dependentCount = new Map<string, number>();
    if (this.edges) {
      for (const e of this.edges) {
        dependencyCount.set(e.source, (dependencyCount.get(e.source) ?? 0) + 1);
        dependentCount.set(e.target, (dependentCount.get(e.target) ?? 0) + 1);
      }
    }

    const items: ClusterListItem[] = [];
    for (const [type, nodes] of Object.entries(this.nodesByType)) {
      items.push({ kind: 'header', nodeType: type, count: nodes.length });
      for (const node of nodes) {
        items.push({
          kind: 'node',
          node,
          stats: {
            dependencies: dependencyCount.get(node.id) ?? 0,
            dependents: dependentCount.get(node.id) ?? 0,
          },
        });
      }
    }
    return items;
  }

  private formatNodeStatsSubtitle(stats: {
    dependencies: number;
    dependents: number;
  }): string | undefined {
    const parts: string[] = [];

    if (stats.dependencies > 0) {
      parts.push(`${stats.dependencies} dep${stats.dependencies === 1 ? '' : 's'}`);
    }
    if (stats.dependents > 0) {
      parts.push(`${stats.dependents} dependent${stats.dependents === 1 ? '' : 's'}`);
    }

    return parts.length > 0 ? parts.join(' · ') : undefined;
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    if (!this.nodesByType) return html``;

    return html`
      <div class="header" @click=${this.toggleExpanded}>
        <span class="main-title">
          Targets (${this.filteredTargetsCount || 0}/${this.totalTargetsCount || 0})
        </span>
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
            <div class="target-list">
              ${virtualize({
                items: this.flatItems,
                renderItem: (item: ClusterListItem) =>
                  item.kind === 'header'
                    ? html`<div class="type-header">${getNodeTypeLabel(item.nodeType)} (${item.count})</div>`
                    : html`
                        <xcode-graph-list-item-row
                          .node=${item.node}
                          subtitle=${this.formatNodeStatsSubtitle(item.stats) || ''}
                          .zoom=${this.zoom}
                          @row-select=${this.handleNodeSelect}
                          @row-hover=${this.handleNodeHover}
                          @row-hover-end=${this.handleHoverEnd}
                        ></xcode-graph-list-item-row>
                      `,
                keyFunction: (item: ClusterListItem) =>
                  item.kind === 'header' ? `header-${item.nodeType}` : item.node.id,
              })}
            </div>
          </div>
        `,
      )}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-cluster-targets-list': GraphClusterTargetsList;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-targets-list')) {
  customElements.define('xcode-graph-cluster-targets-list', GraphClusterTargetsList);
}
