/**
 * ClusterCard Lit Component
 *
 * SVG card background for cluster visualization.
 * Renders rounded rectangle with cluster name and target count.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-cluster-card
 *     .cluster=${clusterData}
 *     x="100"
 *     y="100"
 *     width="200"
 *     height="150"
 *   ></graph-cluster-card>
 * </svg>
 * ```
 *
 * @fires cluster-click - Dispatched when card is clicked
 */

import { LitElement, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Cluster } from '@/types/cluster';
import { generateColor } from '@/utils/colorGenerator';
import { adjustColorForZoom, adjustOpacityForZoom } from '@/utils/zoomColorUtils';

@customElement('graph-cluster-card')
export class GraphClusterCard extends LitElement {
  // No Shadow DOM for SVG
  protected createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare cluster: Cluster;

  @property({ type: Number })
  declare x: number;

  @property({ type: Number })
  declare y: number;

  @property({ type: Number })
  declare width: number;

  @property({ type: Number })
  declare height: number;

  @property({ type: Boolean, attribute: 'is-highlighted' })
  isHighlighted: boolean = false;

  @property({ type: Boolean, attribute: 'is-dimmed' })
  isDimmed: boolean = false;

  @property({ type: Boolean, attribute: 'is-selected' })
  isSelected: boolean = false;

  @property({ type: Number })
  zoom: number = 1.0;

  @property({ type: Boolean })
  clickable: boolean = false;

  // ========================================
  // Event Handlers
  // ========================================

  private handleClick() {
    if (this.clickable) {
      this.dispatchEvent(
        new CustomEvent('cluster-click', {
          detail: { cluster: this.cluster },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.handleClick();
    }
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.cluster) return svg``;

    const clusterColor = generateColor(this.cluster.name, this.cluster.type);
    const zoomAdjustedColor = adjustColorForZoom(clusterColor, this.zoom);
    const borderOpacity = adjustOpacityForZoom(0.5, this.zoom);

    const isActive = this.isHighlighted || this.isSelected;
    const cursorStyle = this.clickable ? 'pointer' : 'default';
    const strokeDasharray = this.cluster.type === 'project' ? '8 8' : '3 8';
    const fillAlpha = isActive ? '08' : '18';
    const textOpacity = isActive ? 1.0 : 0.6;
    const fontWeight = isActive ? 600 : 500;
    const textShadow = isActive
      ? `0 0 8px ${zoomAdjustedColor}40, 0 0 16px ${zoomAdjustedColor}20`
      : 'none';

    return svg`
      <g
        opacity="${this.isDimmed ? 0.3 : 1}"
        role="${this.clickable ? 'button' : ''}"
        tabindex="${this.clickable ? 0 : -1}"
        aria-label="${this.clickable ? `${this.cluster.name} cluster, ${this.cluster.nodes.length} targets` : ''}"
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <!-- Background fill -->
        <rect
          x="${this.x}"
          y="${this.y}"
          width="${this.width}"
          height="${this.height}"
          rx="8"
          ry="8"
          fill="${zoomAdjustedColor}${fillAlpha}"
          stroke="none"
          style="transition: fill 0.2s ease-in-out; cursor: ${cursorStyle}"
        />

        <!-- Border -->
        <rect
          x="${this.x}"
          y="${this.y}"
          width="${this.width}"
          height="${this.height}"
          rx="8"
          ry="8"
          fill="none"
          stroke="${zoomAdjustedColor}"
          stroke-width="3.5"
          stroke-opacity="${isActive ? 0.9 : borderOpacity}"
          stroke-dasharray="${strokeDasharray}"
          stroke-linecap="round"
          style="
            transition: stroke-opacity 0.2s ease-in-out;
            cursor: ${cursorStyle};
            ${this.isSelected ? 'animation: marchingAnts 0.8s linear infinite' : ''}
          "
        />

        <!-- Cluster label -->
        <text
          x="${this.x + 12}"
          y="${this.y + 20}"
          fill="${zoomAdjustedColor}"
          style="
            font-family: DM Sans, sans-serif;
            font-size: 12px;
            font-weight: ${fontWeight};
            pointer-events: none;
            opacity: ${textOpacity};
            text-shadow: ${textShadow};
            transition: opacity 0.2s, font-weight 0.2s, text-shadow 0.2s;
          "
        >
          ${this.cluster.name}
        </text>

        <!-- Target count -->
        <text
          x="${this.x + this.width - 12}"
          y="${this.y + 20}"
          text-anchor="end"
          fill="${zoomAdjustedColor}"
          style="
            font-family: Inter, sans-serif;
            font-size: 11px;
            font-weight: ${fontWeight};
            pointer-events: none;
            opacity: ${textOpacity};
            text-shadow: ${textShadow};
            transition: opacity 0.2s, font-weight 0.2s, text-shadow 0.2s;
          "
        >
          ${this.cluster.nodes.length} targets
        </text>
      </g>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-card': GraphClusterCard;
  }
}
