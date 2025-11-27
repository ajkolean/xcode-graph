/**
 * ClusterTypeBadge Lit Component
 *
 * Displays package/project badge with color-coded styling.
 * Uses dynamic CSS custom properties for theming.
 *
 * @example
 * ```html
 * <graph-cluster-type-badge
 *   cluster-type="package"
 *   cluster-color="#8B5CF6"
 * ></graph-cluster-type-badge>
 * ```
 */

import { LitElement, html, css } from 'lit';
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
      padding: 16px 16px 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .container {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--spacing-xs) 10px;
      border-radius: 9999px;
      cursor: default;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      line-height: 14px;
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.02em;

      /* Use CSS custom properties for dynamic theming */
      background-color: var(--badge-bg);
      border: 1px solid var(--badge-border);
      color: var(--badge-color);
    }

    .badge:hover {
      background-color: var(--badge-bg-hover);
      border-color: var(--badge-border-hover);
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
    const color = this.clusterColor || '#8B5CF6';

    return html`
      <div class="container">
        <div
          class="badge"
          style="
            --badge-bg: ${color}20;
            --badge-border: ${color}40;
            --badge-color: ${color};
            --badge-bg-hover: ${color}30;
            --badge-border-hover: ${color}60;
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
