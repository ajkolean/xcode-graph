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

import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';
import type { GraphNode } from '@/data/mockGraphData';
import { generateColor } from '@/utils/rendering/color-generator';
import { getNodeTypeColor } from '@/utils/rendering/node-colors';
import { getNodeIconPath, getNodeTypeLabel } from '@/utils/rendering/node-icons';
import { adjustColorForZoom } from '@/utils/rendering/zoom-colors';

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

  constructor() {
    super();
    this.showClusterLink = true;
  }

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      flex-shrink: 0;
      border-bottom: 1px solid var(--colors-border);
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-3);
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
      margin-top: var(--spacing-3);
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

    .info {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-h2);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .subtitle {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badges {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-full);
      cursor: default;
      transition: all var(--durations-normal);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      line-height: var(--line-heights-tight);
      font-weight: var(--font-weights-medium);
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
          }),
        );
        return;
      }
    }

    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return html``;

    const iconPath = getNodeIconPath(
      this.node.type,
      this.node.type === 'app' ? this.node.platform : undefined,
    );
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
            ${
              showClusterBadge
                ? html`
                  <div class="subtitle">
                    ${this.node.type === 'package' ? this.node.name : this.node.project}
                  </div>
                `
                : ''
            }
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="badges">
        ${
          showClusterBadge
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
            : ''
        }

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
