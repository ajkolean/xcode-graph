/**
 * ClusterStats Lit Component
 *
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @example
 * ```html
 * <graph-cluster-stats
 *   filtered-dependencies="5"
 *   total-dependencies="10"
 *   .platforms=${platformsSet}
 *   .targetBreakdown=${{ framework: 3, library: 2, test: 1 }}
 * ></graph-cluster-stats>
 * ```
 */

import { NodeType } from '@shared/schemas/graph.schema';
import { getPlatformIconPath, PLATFORM_COLOR } from '@ui/utils/platform-icons';
import { css, html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';
import './stats-card';

/** Node type colors and short labels for badges */
const NODE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  [NodeType.App]: { label: 'App', color: '#10B981' },
  [NodeType.Framework]: { label: 'Framework', color: '#3B82F6' },
  [NodeType.Library]: { label: 'Library', color: '#8B5CF6' },
  [NodeType.TestUnit]: { label: 'Unit Test', color: '#F59E0B' },
  [NodeType.TestUi]: { label: 'UI Test', color: '#EC4899' },
  [NodeType.Cli]: { label: 'CLI', color: '#6366F1' },
  [NodeType.Package]: { label: 'Package', color: '#14B8A6' },
};

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

  @property({ attribute: false })
  declare platforms: Set<string>;

  /**
   * Target breakdown by node type (e.g., { framework: 3, library: 2 })
   */
  @property({ attribute: false })
  declare targetBreakdown: Record<string, number>;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-3);
    }

    .section {
      margin-top: var(--spacing-md);
    }

    .section-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-sm);
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
      opacity: 0.8;
    }
  `;

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
            const config = NODE_TYPE_CONFIG[type] || { label: type, color: '#6B7280' };
            return html`
              <span
                class="type-badge"
                style="
                  color: ${config.color};
                  background-color: ${config.color}15;
                  border: var(--border-widths-thin) solid ${config.color}30;
                "
              >
                <span>${config.label}</span>
                <span class="type-count">${count}</span>
              </span>
            `;
          })}
        </div>
      </div>
    `;
  }

  override render() {
    const platformCount = this.platforms?.size || 0;

    return html`
      <div class="stats-grid">
        <graph-stats-card
          label="Dependencies"
          value="${this.filteredDependencies}/${this.totalDependencies}"
        ></graph-stats-card>

        <graph-stats-card
          label="Dependents"
          value="${this.filteredDependents}/${this.totalDependents}"
        ></graph-stats-card>
      </div>

      <!-- Target Breakdown by Type -->
      ${this.renderTargetBreakdown()}

      <!-- Platforms Section -->
      ${
        platformCount > 0
          ? html`
            <div class="section">
              <div class="section-title">Platforms (${platformCount})</div>
              <div class="badges-grid">
                ${Array.from(this.platforms).map((platform) => {
                  const color =
                    PLATFORM_COLOR[platform as keyof typeof PLATFORM_COLOR] || '#6F2CFF';
                  const iconPath = getPlatformIconPath(platform);

                  return html`
                    <div
                      class="platform-badge"
                      style="
                        background-color: ${color}15;
                        border-color: ${color}30;
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
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-stats': GraphClusterStats;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster-stats')) {
  customElements.define('graph-cluster-stats', GraphClusterStats);
}
