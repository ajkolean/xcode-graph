/**
 * MetricsSection Lit Component
 *
 * Displays node metrics using StatsCard components in a grid.
 *
 * @example
 * ```html
 * <graph-metrics-section
 *   dependencies-count="5"
 *   total-dependencies-count="10"
 * ></graph-metrics-section>
 * ```
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './stats-card';

@customElement('graph-metrics-section')
export class GraphMetricsSection extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: Number, attribute: 'dependencies-count' })
  declare dependenciesCount: number;

  @property({ type: Number, attribute: 'dependents-count' })
  declare dependentsCount: number;

  @property({ type: Number, attribute: 'total-dependencies-count' })
  declare totalDependenciesCount: number;

  @property({ type: Number, attribute: 'total-dependents-count' })
  declare totalDependentsCount: number;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md) var(--spacing-md) var(--spacing-md);
      flex-shrink: 0;
    }

    .title {
      margin-bottom: 12px;
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="title">Metrics</div>

      <div class="grid">
        <graph-stats-card
          label="Dependencies Out"
          value="${this.dependenciesCount}/${this.totalDependenciesCount}"
        ></graph-stats-card>

        <graph-stats-card
          label="Dependencies In"
          value="${this.dependentsCount}/${this.totalDependentsCount}"
        ></graph-stats-card>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-metrics-section': GraphMetricsSection;
  }
}
