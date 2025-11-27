/**
 * NodeHeader Lit Component
 *
 * Header for node details panel with icon, name, and type badges.
 *
 * @example
 * ```html
 * <graph-node-header
 *   .node=${nodeData}
 *   zoom="1.0"
 * ></graph-node-header>
 * ```
 *
 * @fires close - Dispatched when back/close button clicked
 * @fires cluster-click - Dispatched when cluster badge clicked (detail: { clusterId })
 */

import { LitElement, html, svg, css } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { GraphNode } from '@/data/mockGraphData';
import { generateColor } from '@/utils/colorGenerator';
import { getNodeTypeColor } from '@/utils/filterHelpers';
import { getNodeIconPath, getNodeTypeLabel } from '@/utils/nodeIcons';
import { adjustColorForZoom } from '@/utils/zoomColorUtils';
import { icons } from '@/controllers/icon.adapter';

export class GraphNodeHeader extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  @property({ type: Number })
  declare zoom: number;

  @property({ type: Boolean, attribute: 'show-cluster-link' })
  declare showClusterLink: boolean;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      flex-shrink: 0;
      border-bottom: 1px solid var(--color-border);
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
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
      margin-top: 12px;
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

    .info {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-h2);
      font-weight: var(--font-weight-semibold);
      color: var(--color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badges {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      cursor: default;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      line-height: 14px;
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.02em;
      border: 1px solid transparent;
    }

    .badge:hover {
      filter: brightness(1.1);
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleBack() {
    if (this.showClusterLink) {
      const clusterId = this.node.type === 'package' ? this.node.name : this.node.project;
      if (clusterId) {
        this.dispatchEvent(
          new CustomEvent('cluster-click', {
            detail: { clusterId },
            bubbles: true,
            composed: true,
          })
        );
        return;
      }
    }

    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return html``;

    const iconPath = getNodeIconPath(this.node.type, this.node.type === 'app' ? this.node.platform : undefined);
    const nodeTypeColor = getNodeTypeColor(this.node.type);
    const nodeDisplayColor = adjustColorForZoom(nodeTypeColor, this.zoom);

    let clusterColor: string;
    if (this.node.type === 'package') {
      clusterColor = generateColor(this.node.name, 'package');
    } else if (this.node.project) {
      clusterColor = generateColor(this.node.project, 'project');
    } else {
      clusterColor = nodeTypeColor;
    }
    const clusterDisplayColor = adjustColorForZoom(clusterColor, this.zoom);

    const showClusterBadge = this.node.project || this.node.type === 'package';

    return html`
      <div class="header-row">
        <button class="back-button" @click=${this.handleBack}>
          ${unsafeHTML(icons.ChevronLeft)}
        </button>

        <div class="content">
          <!-- Icon -->
          <div
            class="icon-box"
            style="
              background-color: ${nodeDisplayColor}15;
              box-shadow: 0 0 20px ${nodeDisplayColor}30, 0 0 40px ${nodeDisplayColor}15;
            "
          >
            ${svg`
              <svg width="24" height="24" viewBox="-18 -18 36 36">
                <path
                  d="${iconPath}"
                  fill="rgba(15, 15, 20, 0.95)"
                  stroke="${nodeDisplayColor}"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            `}
          </div>

          <!-- Info -->
          <div class="info">
            <h2 class="name">${this.node.name}</h2>
            ${showClusterBadge
              ? html`
                  <div class="subtitle">
                    ${this.node.type === 'package' ? this.node.name : this.node.project}
                  </div>
                `
              : ''}
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="badges">
        ${showClusterBadge
          ? html`
              <div
                class="badge"
                style="
                  background-color: ${clusterDisplayColor}20;
                  border-color: ${clusterDisplayColor}40;
                  color: ${clusterDisplayColor};
                "
              >
                ${this.node.type === 'package' ? 'Package' : 'Project'}
              </div>
            `
          : ''}

        <div
          class="badge"
          style="
            background-color: ${nodeDisplayColor}20;
            border-color: ${nodeDisplayColor}40;
            color: ${nodeDisplayColor};
          "
        >
          ${getNodeTypeLabel(this.node.type)}
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node-header': GraphNodeHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node-header')) {
  customElements.define('graph-node-header', GraphNodeHeader);
}
