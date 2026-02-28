/**
 * MetricsSection Lit Component
 *
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @example
 * ```html
 * <graph-metrics-section
 *   dependencies-count="5"
 *   total-dependencies-count="10"
 *   active-direct-deps
 * ></graph-metrics-section>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
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

  @property({ type: Boolean, attribute: 'active-direct-deps' })
  declare activeDirectDeps: boolean;

  @property({ type: Boolean, attribute: 'active-transitive-deps' })
  declare activeTransitiveDeps: boolean;

  @property({ type: Boolean, attribute: 'active-direct-dependents' })
  declare activeDirectDependents: boolean;

  @property({ type: Boolean, attribute: 'active-transitive-dependents' })
  declare activeTransitiveDependents: boolean;

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
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
      flex-shrink: 0;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .title {
      font-family: var(--fonts-heading);
      font-size: var(--font-sizes-base);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
    }

    .toggle-icon {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      color: var(--colors-muted-foreground);
      transition: transform var(--durations-fast) var(--easings-out);
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-3);
      margin-top: var(--spacing-3);
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private handleCardToggle(card: string) {
    this.dispatchEvent(
      new CustomEvent(card, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    return html`
      <div class="header" @click=${this.toggleExpanded}>
        <span class="title">Metrics</span>
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
          <div class="grid">
            <graph-stats-card
              label="Dependencies"
              value="${this.dependenciesCount}/${this.totalDependenciesCount}"
              compact
              toggleable
              ?active=${this.activeDirectDeps}
              @card-toggle=${() => this.handleCardToggle('toggle-direct-deps')}
            ></graph-stats-card>

            <graph-stats-card
              label="Dependents"
              value="${this.dependentsCount}/${this.totalDependentsCount}"
              compact
              toggleable
              ?active=${this.activeDirectDependents}
              @card-toggle=${() => this.handleCardToggle('toggle-direct-dependents')}
            ></graph-stats-card>

            <graph-stats-card
              label="Transitive Deps"
              value="${this.transitiveDependenciesCount}"
              compact
              toggleable
              ?active=${this.activeTransitiveDeps}
              @card-toggle=${() => this.handleCardToggle('toggle-transitive-deps')}
            ></graph-stats-card>

            <graph-stats-card
              label="Transitive Dependents"
              value="${this.transitiveDependentsCount}"
              compact
              toggleable
              ?active=${this.activeTransitiveDependents}
              @card-toggle=${() => this.handleCardToggle('toggle-transitive-dependents')}
            ></graph-stats-card>
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
    'graph-metrics-section': GraphMetricsSection;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-metrics-section')) {
  customElements.define('graph-metrics-section', GraphMetricsSection);
}
