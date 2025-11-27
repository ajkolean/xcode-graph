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

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

@customElement('graph-cluster-header')
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
      gap: 12px;
      padding: 12px var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .back-button {
      width: 24px;
      height: 24px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--color-muted-foreground);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .back-button svg {
      width: 20px;
      height: 20px;
    }

    .content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-box svg {
      width: 24px;
      height: 24px;
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: 'DM Sans', sans-serif;
      font-size: var(--text-h3);
      font-weight: var(--font-weight-semibold);
      color: var(--color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .origin {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      line-height: 18px;
      color: var(--color-muted-foreground);
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
      })
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
