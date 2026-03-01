/**
 * ClusterStats Lit Component
 *
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-stats
 *   filtered-dependencies="5"
 *   total-dependencies="10"
 *   .platforms=${platformsSet}
 *   .targetBreakdown=${{ framework: 3, library: 2, test: 1 }}
 * ></xcode-graph-cluster-stats>
 * ```
 */

import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { getPlatformColor, getPlatformIconPath } from '@ui/utils/platform-icons';
import { type CSSResultGroup, css, html, LitElement, nothing, svg, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import './badge.js';
import './stats-card';

/**
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @summary Collapsible cluster metrics with stats cards and breakdowns
 *
 * @fires toggle-direct-deps - Dispatched when dependencies card is toggled
 * @fires toggle-direct-dependents - Dispatched when dependents card is toggled
 */
export class GraphClusterStats extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: Number, attribute: 'filtered-dependencies' })
  declare filteredDependencies: number;

  @property({ type: Number, attribute: 'total-dependencies' })
  declare totalDependencies: number;

  @property({ type: Number, attribute: 'filtered-dependents' })
  declare filteredDependents: number;

  @property({ type: Number, attribute: 'total-dependents' })
  declare totalDependents: number;

  @property({ type: Boolean, attribute: 'active-direct-deps' })
  declare activeDirectDeps: boolean;

  @property({ type: Boolean, attribute: 'active-direct-dependents' })
  declare activeDirectDependents: boolean;

  @property({ attribute: false })
  declare platforms: Set<string>;

  /**
   * Target breakdown by node type (e.g., { framework: 3, library: 2 })
   */
  @property({ attribute: false })
  declare targetBreakdown: Record<string, number>;

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

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2);
    }

    .section {
      margin-top: var(--spacing-3);
    }

    .section-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-1);
    }

    .badges-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-2);
    }

    .platform-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-md);
      border: var(--border-widths-thin) solid transparent;
    }

    .platform-badge svg {
      width: var(--sizes-icon-xs);
      height: var(--sizes-icon-xs);
    }

    .platform-name {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
    }

    .type-count {
      opacity: var(--opacity-80);
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

  private renderTargetBreakdown() {
    if (!this.targetBreakdown || Object.keys(this.targetBreakdown).length === 0) {
      return nothing;
    }

    const entries = Object.entries(this.targetBreakdown)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    if (entries.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-title">Target Breakdown</div>
        <div class="badges-grid">
          ${entries.map(([type, count]) => {
            const color = getNodeTypeColor(type);
            const label = getNodeTypeLabel(type);
            return html`
              <span
                class="type-badge"
                style="
                  color: ${color};
                  background-color: color-mix(in srgb, ${color} 15%, transparent);
                  border: var(--border-widths-thin) solid color-mix(in srgb, ${color} 30%, transparent);
                "
              >
                <span>${label}</span>
                <span class="type-count">${count}</span>
              </span>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderExpandedContent(): TemplateResult {
    const platformCount = this.platforms?.size || 0;

    return html`
      <div class="content">
        <div class="stats-grid">
          <xcode-graph-stats-card
            label="Dependencies"
            value="${this.filteredDependencies}/${this.totalDependencies}"
            compact
            toggleable
            ?active=${this.activeDirectDeps}
            @card-toggle=${() => this.handleCardToggle('toggle-direct-deps')}
          ></xcode-graph-stats-card>

          <xcode-graph-stats-card
            label="Dependents"
            value="${this.filteredDependents}/${this.totalDependents}"
            compact
            toggleable
            ?active=${this.activeDirectDependents}
            @card-toggle=${() => this.handleCardToggle('toggle-direct-dependents')}
          ></xcode-graph-stats-card>
        </div>

        ${this.renderTargetBreakdown()}

        ${
          platformCount > 0
            ? html`
              <div class="section">
                <div class="section-title">Platforms (${platformCount})</div>
                <div class="badges-grid">
                  ${Array.from(this.platforms).map((platform) => {
                    const color = getPlatformColor(platform);
                    const iconPath = getPlatformIconPath(platform);

                    return html`
                      <div
                        class="platform-badge"
                        style="
                          background-color: color-mix(in srgb, ${color} 15%, transparent);
                          border-color: color-mix(in srgb, ${color} 30%, transparent);
                        "
                      >
                        ${
                          iconPath
                            ? svg`
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="${color}">
                                <path d="${iconPath}" />
                              </svg>
                            `
                            : ''
                        }
                        <span class="platform-name" style="color: ${color}">
                          ${platform}
                        </span>
                      </div>
                    `;
                  })}
                </div>
              </div>
            `
            : nothing
        }
      </div>
    `;
  }

  override render(): TemplateResult {
    return html`
      <button class="header" aria-expanded=${this.isExpanded} @click=${this.toggleExpanded}>
        <span class="header-title">Metrics</span>
        <svg
          class="toggle-icon ${this.isExpanded ? 'expanded' : ''}"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      ${this.isExpanded ? this.renderExpandedContent() : nothing}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-cluster-stats': GraphClusterStats;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-stats')) {
  customElements.define('xcode-graph-cluster-stats', GraphClusterStats);
}
