/**
 * ClusterStats Lit Component
 *
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, and platform badges.
 *
 * @example
 * ```html
 * <graph-cluster-stats
 *   filtered-dependencies="5"
 *   total-dependencies="10"
 *   .platforms=${platformsSet}
 * ></graph-cluster-stats>
 * ```
 */

import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { getPlatformIconPath, PLATFORM_COLOR } from '@/utils/rendering/platform-icons';
import './stats-card';

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

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--colors-border);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-3);
    }

    .platforms-section {
      margin-top: var(--spacing-md);
    }

    .platforms-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-sm);
    }

    .platforms-grid {
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
      border: 1px solid transparent;
    }

    .platform-badge svg {
      width: var(--sizes-icon-xs);
      height: var(--sizes-icon-xs);
    }

    .platform-name {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
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

      ${
        platformCount > 0
          ? html`
            <div class="platforms-section">
              <div class="platforms-title">Platforms (${platformCount})</div>
              <div class="platforms-grid">
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
          : ''
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
