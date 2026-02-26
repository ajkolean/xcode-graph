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

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './stats-card';

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

  @property({ type: Number, attribute: 'transitive-dependencies-count' })
  declare transitiveDependenciesCount: number;

  @property({ type: Number, attribute: 'transitive-dependents-count' })
  declare transitiveDependentsCount: number;

  @property({ type: Boolean, attribute: 'is-high-fan-in' })
  declare isHighFanIn: boolean;

  @property({ type: Boolean, attribute: 'is-high-fan-out' })
  declare isHighFanOut: boolean;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--spacing-3) var(--spacing-md) var(--spacing-md);
      flex-shrink: 0;
    }

    .title {
      margin-bottom: var(--spacing-3);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-3);
    }
  `;

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    return html`
      <div class="title">Metrics</div>

      <div class="grid">
        <graph-stats-card
          label="Dependencies"
          value="${this.dependenciesCount}/${this.totalDependenciesCount}"
          compact
        ></graph-stats-card>

        <graph-stats-card
          label="Dependents"
          value="${this.dependentsCount}/${this.totalDependentsCount}"
          compact
        ></graph-stats-card>

        <graph-stats-card
          label="Transitive Deps"
          value="${this.transitiveDependenciesCount}"
          compact
        ></graph-stats-card>

        <graph-stats-card
          label="Transitive Dependents"
          value="${this.transitiveDependentsCount}"
          compact
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

// Register custom element with HMR support
if (!customElements.get('graph-metrics-section')) {
  customElements.define('graph-metrics-section', GraphMetricsSection);
}
