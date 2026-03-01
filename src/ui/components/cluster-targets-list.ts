/**
 * ClusterTargetsList Lit Component
 *
 * List of cluster target nodes GROUPED BY TYPE using ListItemRow components.
 * Matches React version with full grouping and stats.
 *
 * @example
 * ```html
 * <graph-cluster-targets-list
 *   .nodesByType=${nodesByType}
 *   .edges=${edges}
 *   filtered-targets-count="5"
 *   total-targets-count="10"
 * ></graph-cluster-targets-list>
 * ```
 *
 * @fires node-select - Dispatched when target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { type CSSResultGroup, css, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { NodeListEventsBase } from './node-list-events';
import './list-item-row';

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

    .sections {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .type-section {
      display: flex;
      flex-direction: column;
    }

    .type-header {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-sm);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .node-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private getNodeStats(nodeId: string): { dependencies: number; dependents: number } {
    if (!this.edges) return { dependencies: 0, dependents: 0 };

    const dependencies = this.edges.filter((e) => e.source === nodeId).length;
    const dependents = this.edges.filter((e) => e.target === nodeId).length;
    return { dependencies, dependents };
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
          class="toggle-icon ${this.isExpanded ? 'expanded' : ''}"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      ${
        this.isExpanded
          ? html`
          <div class="content">
            <div class="sections">
              ${Object.entries(this.nodesByType).map(
                ([type, nodes]) => html`
                <div class="type-section">
                  <div class="type-header">
                    ${getNodeTypeLabel(type)} (${nodes.length})
                  </div>

                  <div class="node-list">
                    ${nodes.map((node) => {
                      const stats = this.getNodeStats(node.id);
                      const subtitle = this.formatNodeStatsSubtitle(stats);

                      return html`
                        <graph-list-item-row
                          .node=${node}
                          subtitle=${subtitle || ''}
                          .zoom=${this.zoom}
                          @row-select=${this.handleNodeSelect}
                          @row-hover=${this.handleNodeHover}
                          @row-hover-end=${this.handleHoverEnd}
                        ></graph-list-item-row>
                      `;
                    })}
                  </div>
                </div>
              `,
              )}
            </div>
          </div>
        `
          : nothing
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-targets-list': GraphClusterTargetsList;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster-targets-list')) {
  customElements.define('graph-cluster-targets-list', GraphClusterTargetsList);
}
