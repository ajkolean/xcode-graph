/**
 * ClusterTypeBadge Lit Component - Mission Control Theme
 *
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-type-badge
 *   cluster-type="package"
 *   cluster-color="#F59E0B"
 * ></xcode-graph-cluster-type-badge>
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

  private get badgeLabel(): string {
    return this.clusterType === 'package' ? 'Package' : 'Project';
  }

  /** Renders the component template */
  override render(): TemplateResult {
    const color = this.clusterColor || '#F59E0B';

    return html`
      <div class="container">
        <xcode-graph-badge
          label=${this.badgeLabel}
          color=${color}
          variant="accent"
          size="sm"
          interactive
          glow
        ></xcode-graph-badge>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-cluster-type-badge': GraphClusterTypeBadge;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-type-badge')) {
  customElements.define('xcode-graph-cluster-type-badge', GraphClusterTypeBadge);
}
