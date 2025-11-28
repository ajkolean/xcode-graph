/**
 * ClusterTypeBadge Lit Component - Mission Control Theme
 *
 * Displays package/project badge with sharp styling and monospace typography.
 * Uses dynamic CSS custom properties for theming.
 *
 * @example
 * ```html
 * <graph-cluster-type-badge
 *   cluster-type="package"
 *   cluster-color="#FFA03C"
 * ></graph-cluster-type-badge>
 * ```
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class GraphClusterTypeBadge extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The type of cluster (package or project)
   */
  @property({ type: String, attribute: 'cluster-type' })
  declare clusterType: 'package' | 'project';

  /**
   * The color to use for the badge (hex or CSS color)
   */
  @property({ type: String, attribute: 'cluster-color' })
  declare clusterColor: string;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-4) var(--spacing-4) var(--spacing-3);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .container {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-sm);
      cursor: default;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        box-shadow var(--durations-fast) var(--easings-out);

      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      line-height: 1;
      font-weight: var(--font-weights-semibold);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);

      /* Use CSS custom properties for dynamic theming */
      background-color: var(--badge-bg);
      border: var(--border-widths-thin) solid var(--badge-border);
      border-left: var(--border-widths-medium) solid var(--badge-color);
      color: var(--badge-color);
    }

    .badge:hover {
      background-color: var(--badge-bg-hover);
      border-color: var(--badge-border-hover);
      border-left-color: var(--badge-color);
      box-shadow: 0 0 12px var(--badge-glow);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private get badgeLabel(): string {
    return this.clusterType === 'package' ? 'Package' : 'Project';
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const color = this.clusterColor || '#FFA03C';

    return html`
      <div class="container">
        <div
          class="badge"
          style="
            --badge-bg: ${color}15;
            --badge-border: ${color}30;
            --badge-color: ${color};
            --badge-bg-hover: ${color}25;
            --badge-border-hover: ${color}50;
            --badge-glow: ${color}30;
          "
        >
          ${this.badgeLabel}
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-type-badge': GraphClusterTypeBadge;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster-type-badge')) {
  customElements.define('graph-cluster-type-badge', GraphClusterTypeBadge);
}
