/**
 * ClusterHeader Lit Component
 *
 * Header for cluster details panel with back button, icon, and cluster info.
 * Uses graph-panel-header for consistent layout.
 *
 * @example
 * ```html
 * <graph-cluster-header
 *   cluster-name="MyPackage"
 *   cluster-type="package"
 *   cluster-color="#8B5CF6"
 *   is-external
 * ></graph-cluster-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';
import './panel-header.js';

export class GraphClusterHeader extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: String, attribute: 'cluster-name' })
  declare clusterName: string;

  @property({ type: String, attribute: 'cluster-type' })
  declare clusterType: 'package' | 'project';

  @property({ type: String, attribute: 'cluster-color' })
  declare clusterColor: string;

  @property({ type: Boolean, attribute: 'is-external' })
  declare isExternal: boolean;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
    }

    .cluster-icon {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
    }

    .cluster-icon svg {
      width: 100%;
      height: 100%;
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
    const isPackage = this.clusterType === 'package';
    const clusterIcon = isPackage ? icons.Package : icons.Folder;
    const color = this.clusterColor || '#8B5CF6';

    return html`
      <graph-panel-header
        title=${this.clusterName}
        subtitle=${this.isExternal ? 'External' : 'Internal'}
        color=${color}
        title-size="md"
        no-badges
      >
        <!-- Cluster Icon -->
        <span slot="icon" class="cluster-icon" style="color: ${color}">
          ${unsafeHTML(clusterIcon)}
        </span>
      </graph-panel-header>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-header': GraphClusterHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster-header')) {
  customElements.define('graph-cluster-header', GraphClusterHeader);
}
