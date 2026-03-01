/**
 * NodeHeader Lit Component
 *
 * Header for node details panel with icon, name, and type badges.
 * Uses graph-panel-header for consistent layout.
 *
 * @example
 * ```html
 * <xcode-graph-node-header
 *   .node=${nodeData}
 *   zoom="1.0"
 * ></xcode-graph-node-header>
 * ```
 *
 * @fires close - Dispatched when back/close button clicked
 * @fires cluster-click - Dispatched when cluster badge clicked (detail: { clusterId })
 */

import { type GraphNode, NodeType } from '@shared/schemas/graph.types';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeIconPath, getNodeTypeLabel } from '@ui/utils/node-icons';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { type CSSResultGroup, css, html, LitElement, nothing, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';
import './panel-header.js';
import './tag-badge.js';

/**
 * Header for the node details panel with icon, name, type badges, and tags.
 * Uses graph-panel-header for consistent layout.
 *
 * @summary Node details header with icon, badges, and tags
 * @fires close - Dispatched when the back/close button is clicked
 * @fires cluster-click - Dispatched when a cluster badge is clicked (detail: { clusterId })
 */
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

  static override readonly styles: CSSResultGroup = css`
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
      const clusterId = this.node.type === NodeType.Package ? this.node.name : this.node.project;
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

  override render(): TemplateResult {
    if (!this.node) return html``;

    const iconPath = getNodeIconPath(
      this.node.type,
      this.node.type === NodeType.App ? this.node.platform : undefined,
    );
    const nodeTypeColor = getNodeTypeColor(this.node.type);
    const nodeDisplayColor = adjustColorForZoom(nodeTypeColor, this.zoom);

    let clusterColor: string;
    if (this.node.type === NodeType.Package) {
      clusterColor = generateColor(this.node.name, 'package');
    } else if (this.node.project) {
      clusterColor = generateColor(this.node.project, 'project');
    } else {
      clusterColor = nodeTypeColor;
    }
    const clusterDisplayColor = adjustColorForZoom(clusterColor, this.zoom);

    const showClusterBadge = this.node.project || this.node.type === NodeType.Package;
    const getSubtitle = (): string | undefined => {
      if (!showClusterBadge) return undefined;
      if (this.node.type === NodeType.Package) return this.node.name;
      return this.node.project;
    };
    const subtitle = getSubtitle();
    const clusterBadgeLabel = this.node.type === NodeType.Package ? 'Package' : 'Project';

    const hasTags = this.node.tags && this.node.tags.length > 0;

    return html`
      <xcode-graph-panel-header
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
              fill="rgba(var(--colors-background-rgb), var(--opacity-95))"
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
              <xcode-graph-badge
                slot="badges"
                label=${clusterBadgeLabel}
                color=${clusterDisplayColor}
              ></xcode-graph-badge>
            `
            : ''
        }
        <xcode-graph-badge
          slot="badges"
          label=${getNodeTypeLabel(this.node.type)}
          color=${nodeDisplayColor}
        ></xcode-graph-badge>
        ${
          this.node.isRemote
            ? html`
              <xcode-graph-badge
                slot="badges"
                label="Remote"
                color="var(--colors-warning)"
              ></xcode-graph-badge>
            `
            : ''
        }
        ${
          this.node.foreignBuild
            ? html`
              <xcode-graph-badge
                slot="badges"
                label="Foreign Build"
                color="var(--colors-warning)"
              ></xcode-graph-badge>
            `
            : ''
        }
      </xcode-graph-panel-header>

      <!-- Architecture Tags -->
      ${
        hasTags && this.node.tags
          ? html`
            <div class="tags-container">
              ${this.node.tags.map((tag) => html`<xcode-graph-tag-badge tag=${tag}></xcode-graph-tag-badge>`)}
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
    'xcode-graph-node-header': GraphNodeHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-header')) {
  customElements.define('xcode-graph-node-header', GraphNodeHeader);
}
