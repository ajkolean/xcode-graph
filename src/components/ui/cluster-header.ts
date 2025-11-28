/**
 * ClusterHeader Lit Component
 *
 * Header for cluster details panel with back button, icon, and cluster info.
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

    .container {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--colors-border);
    }

    .back-button {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
      border-radius: var(--radii-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--colors-muted-foreground);
      cursor: pointer;
      transition: background-color var(--durations-normal);
    }

    .back-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .back-button svg {
      width: var(--sizes-icon-lg);
      height: var(--sizes-icon-lg);
    }

    .content {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      flex: 1;
      min-width: 0;
    }

    .icon-box {
      width: var(--spacing-12);
      height: var(--spacing-12);
      border-radius: var(--radii-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-box svg {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-h3);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .origin {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      line-height: var(--line-heights-normal);
      color: var(--colors-muted-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleBack() {
    this.dispatchEvent(
      new CustomEvent('back', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const isPackage = this.clusterType === 'package';
    const clusterIcon = isPackage ? icons.Package : icons.Folder;
    const color = this.clusterColor || '#8B5CF6';

    return html`
      <div class="container">
        <!-- Back Button -->
        <button class="back-button" @click=${this.handleBack}>
          ${unsafeHTML(icons.ChevronLeft)}
        </button>

        <div class="content">
          <!-- Cluster Icon -->
          <div
            class="icon-box"
            style="
              background-color: ${color}15;
              box-shadow: 0 0 20px ${color}30, 0 0 40px ${color}15;
            "
          >
            <span style="color: ${color}">${unsafeHTML(clusterIcon)}</span>
          </div>

          <!-- Cluster Info -->
          <div class="info">
            <h2 class="name">${this.clusterName}</h2>
            <div class="origin">${this.isExternal ? 'External' : 'Internal'}</div>
          </div>
        </div>
      </div>
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
