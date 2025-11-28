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

import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphNode } from '@/schemas/graph.schema';
import { generateColor } from '@/utils/rendering/color-generator';
import { getNodeTypeColor } from '@/utils/rendering/node-colors';
import { getNodeIconPath, getNodeTypeLabel } from '@/utils/rendering/node-icons';
import { adjustColorForZoom } from '@/utils/rendering/zoom-colors';
import './badge.js';
import './panel-header.js';

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
    }

    graph-panel-header {
      --panel-header-padding: var(--spacing-md);
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
    const subtitle = showClusterBadge
      ? this.node.type === 'package'
        ? this.node.name
        : this.node.project
      : undefined;

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
                label=${this.node.type === 'package' ? 'Package' : 'Project'}
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
      </graph-panel-header>
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
