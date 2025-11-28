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

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import { getNodeTypeLabel } from '@/utils/rendering/node-icons';
import './list-item-row';

export class GraphClusterTargetsList extends LitElement {
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

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    .main-title {
      font-family: 'DM Sans', sans-serif;
      font-size: var(--text-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-foreground);
      margin-bottom: var(--spacing-md);
    }

    .sections {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .type-section {
      display: flex;
      flex-direction: column;
    }

    .type-header {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      font-weight: var(--font-weight-medium);
      color: var(--color-muted-foreground);
      margin-bottom: var(--spacing-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .node-list {
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
  // Helpers
  // ========================================

  private getNodeStats(nodeId: string): { dependencies: number; dependents: number } {
    if (!this.edges) return { dependencies: 0, dependents: 0 };

    const dependencies = this.edges.filter((e) => e.target === nodeId).length;
    const dependents = this.edges.filter((e) => e.source === nodeId).length;
    return { dependencies, dependents };
  }

  private formatNodeStatsSubtitle(stats: {
    dependencies: number;
    dependents: number;
  }): string | undefined {
    const parts: string[] = [];

    if (stats.dependencies > 0) {
      parts.push(`${stats.dependencies} dep${stats.dependencies !== 1 ? 's' : ''}`);
    }
    if (stats.dependents > 0) {
      parts.push(`${stats.dependents} dependent${stats.dependents !== 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' · ') : undefined;
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.nodesByType) return html``;

    return html`
      <h3 class="main-title">
        Targets (${this.filteredTargetsCount || 0}/${this.totalTargetsCount || 0})
      </h3>

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
