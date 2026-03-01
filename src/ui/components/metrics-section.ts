/**
 * MetricsSection Lit Component
 *
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @example
 * ```html
 * <xcode-graph-metrics-section
 *   dependencies-count="5"
 *   total-dependencies-count="10"
 *   active-direct-deps
 * ></xcode-graph-metrics-section>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import './stats-card';

/**
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @summary Metrics grid with toggleable stats cards
 * @fires toggle-direct-deps - Dispatched when direct dependencies card is toggled
 * @fires toggle-transitive-deps - Dispatched when transitive dependencies card is toggled
 * @fires toggle-direct-dependents - Dispatched when direct dependents card is toggled
 * @fires toggle-transitive-dependents - Dispatched when transitive dependents card is toggled
 */
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
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      background: none;
      border: none;
      padding: 0;
      text-align: left;
    }

    .header:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
      border-radius: var(--radii-sm);
    }

    .header:hover .title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .title {
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

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
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
      <button class="header" aria-expanded=${this.isExpanded} @click=${this.toggleExpanded}>
        <span class="title">Metrics</span>
        <svg
          class=${classMap({ 'toggle-icon': true, expanded: this.isExpanded })}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      ${when(
        this.isExpanded,
        () => html`
          <div class="grid">
            <xcode-graph-stats-card
              label="Dependencies"
              value="${this.dependenciesCount}/${this.totalDependenciesCount}"
              compact
              toggleable
              ?active=${this.activeDirectDeps}
              @card-toggle=${() => this.handleCardToggle('toggle-direct-deps')}
            ></xcode-graph-stats-card>

            <xcode-graph-stats-card
              label="Dependents"
              value="${this.dependentsCount}/${this.totalDependentsCount}"
              compact
              toggleable
              ?active=${this.activeDirectDependents}
              @card-toggle=${() => this.handleCardToggle('toggle-direct-dependents')}
            ></xcode-graph-stats-card>

            <xcode-graph-stats-card
              label="Transitive Dependencies"
              value="${this.transitiveDependenciesCount}"
              compact
              toggleable
              ?active=${this.activeTransitiveDeps}
              @card-toggle=${() => this.handleCardToggle('toggle-transitive-deps')}
            ></xcode-graph-stats-card>

            <xcode-graph-stats-card
              label="Transitive Dependents"
              value="${this.transitiveDependentsCount}"
              compact
              toggleable
              ?active=${this.activeTransitiveDependents}
              @card-toggle=${() => this.handleCardToggle('toggle-transitive-dependents')}
            ></xcode-graph-stats-card>
          </div>
        `,
      )}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-metrics-section': GraphMetricsSection;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-metrics-section')) {
  customElements.define('xcode-graph-metrics-section', GraphMetricsSection);
}
