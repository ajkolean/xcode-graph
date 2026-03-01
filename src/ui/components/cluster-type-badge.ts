/**
 * ClusterTypeBadge Lit Component - Mission Control Theme
 *
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @example
 * ```html
 * <graph-cluster-type-badge
 *   cluster-type="package"
 *   cluster-color="#F59E0B"
 * ></graph-cluster-type-badge>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';

/**
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @summary Cluster type badge showing package or project
 */
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

  static override readonly styles: CSSResultGroup = css`
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

  override render(): TemplateResult {
    const color = this.clusterColor || '#F59E0B';

    return html`
      <div class="container">
        <graph-badge
          label=${this.badgeLabel}
          color=${color}
          variant="accent"
          size="sm"
          interactive
          glow
        ></graph-badge>
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
