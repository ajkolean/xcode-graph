/**
 * NodeHeader Lit Component
 *
 * Header for node details panel with icon, name, and type badges.
 * Uses graph-panel-header for consistent layout.
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

import type { GraphNode } from '@shared/schemas/graph.schema';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeIconPath, getNodeTypeLabel } from '@ui/utils/node-icons';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';
import './panel-header.js';
import './tag-badge.js';

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

  static override readonly styles = css`
    :host {
      display: block;
    }

    graph-panel-header {
      --panel-header-padding: var(--spacing-md);
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
      margin-top: var(--spacing-2);
      padding: 0 var(--spacing-md);
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

  override render() {
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
    const getSubtitle = (): string | undefined => {
      if (!showClusterBadge) return undefined;
      if (this.node.type === 'package') return this.node.name;
      return this.node.project;
    };
    const subtitle = getSubtitle();
    const clusterBadgeLabel = this.node.type === 'package' ? 'Package' : 'Project';

    const hasTags = this.node.tags && this.node.tags.length > 0;

    return html`
      <graph-panel-header
        title=${this.node.name}
        subtitle=${subtitle || ''}
        color=${nodeDisplayColor}
        title-size="lg"
        @back=${this.handleBack}
      >
        <!-- Node Icon -->
        <svg slot="icon" width="24" height="24" viewBox="-18 -18 36 36">
          ${svg`
            <path
              d="${iconPath}"
              fill="rgba(15, 15, 20, 0.95)"
              stroke="${nodeDisplayColor}"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          `}
        </svg>

        <!-- Badges -->
        ${
          showClusterBadge
            ? html`
              <graph-badge
                slot="badges"
                label=${clusterBadgeLabel}
                color=${clusterDisplayColor}
              ></graph-badge>
            `
            : ''
        }
        <graph-badge
          slot="badges"
          label=${getNodeTypeLabel(this.node.type)}
          color=${nodeDisplayColor}
        ></graph-badge>
        ${
          this.node.isRemote
            ? html`
              <graph-badge
                slot="badges"
                label="Remote"
                color="#F59E0B"
              ></graph-badge>
            `
            : ''
        }
      </graph-panel-header>

      <!-- Architecture Tags -->
      ${
        hasTags
          ? html`
            <div class="tags-container">
              ${this.node.tags!.map((tag) => html`<graph-tag-badge tag=${tag}></graph-tag-badge>`)}
            </div>
          `
          : nothing
      }
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
