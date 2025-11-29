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

import type { Cluster } from '@shared/schemas';
import { generateColor } from '@ui/utils/color-generator';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { LitElement, type PropertyDeclarations, type SVGTemplateResult, svg } from 'lit';

export class GraphClusterCard extends LitElement {
  static readonly override properties: PropertyDeclarations = {
    cluster: { attribute: false },
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    isHighlighted: { type: Boolean, attribute: 'is-highlighted' },
    isDimmed: { type: Boolean, attribute: 'is-dimmed' },
    isSelected: { type: Boolean, attribute: 'is-selected' },
    zoom: { type: Number },
    clickable: { type: Boolean },
  };

  // No Shadow DOM for SVG
  protected override createRenderRoot(): this {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  declare cluster: Cluster | undefined;
  declare x: number | undefined;
  declare y: number | undefined;
  declare width: number | undefined;
  declare height: number | undefined;
  declare isHighlighted: boolean | undefined;
  declare isDimmed: boolean | undefined;
  declare isSelected: boolean | undefined;
  declare zoom: number | undefined;
  declare clickable: boolean | undefined;

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
        }),
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

  override render(): SVGTemplateResult {
    if (!this.cluster) return svg``;

    const x = this.x ?? 0;
    const y = this.y ?? 0;
    const width = this.width ?? 0;
    const height = this.height ?? 0;
    const zoom = this.zoom ?? 1;
    const isHighlighted = this.isHighlighted ?? false;
    const isDimmed = this.isDimmed ?? false;
    const isSelected = this.isSelected ?? false;
    const clickable = this.clickable ?? false;

    const clusterColor = generateColor(this.cluster.name, this.cluster.type);
    const zoomAdjustedColor = adjustColorForZoom(clusterColor, zoom);
    const borderOpacity = adjustOpacityForZoom(0.5, zoom);

    const isActive = isHighlighted || isSelected;
    const cursorStyle = clickable ? 'pointer' : 'default';
    const strokeDasharray = this.cluster.type === 'project' ? '8 8' : '3 8';
    const fillAlpha = isActive ? '08' : '18';
    const textOpacity = isActive ? 1 : 0.6;
    const fontWeight = isActive ? 600 : 500;
    const textShadow = isActive
      ? `0 0 8px ${zoomAdjustedColor}40, 0 0 16px ${zoomAdjustedColor}20`
      : 'none';

    return svg`
      <g
        opacity="${isDimmed ? 0.3 : 1}"
        role="${clickable ? 'button' : ''}"
        tabindex="${clickable ? 0 : -1}"
        aria-label="${clickable ? `${this.cluster.name} cluster, ${this.cluster.nodes.length} targets` : ''}"
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <!-- Background fill -->
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="${height}"
          rx="8"
          ry="8"
          fill="${zoomAdjustedColor}${fillAlpha}"
          stroke="none"
          style="transition: fill var(--durations-normal) ease-in-out; cursor: ${cursorStyle}"
        />

        <!-- Border -->
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="${height}"
          rx="8"
          ry="8"
          fill="none"
          stroke="${zoomAdjustedColor}"
          stroke-width="3.5"
          stroke-opacity="${isActive ? 0.9 : borderOpacity}"
          stroke-dasharray="${strokeDasharray}"
          stroke-linecap="round"
          style="
            transition: stroke-opacity var(--durations-normal) ease-in-out;
            cursor: ${cursorStyle};
            ${isSelected ? 'animation: marchingAnts var(--durations-slower) linear infinite' : ''}
          "
        />

        <!-- Cluster label -->
        <text
          x="${x + 12}"
          y="${y + 20}"
          fill="${zoomAdjustedColor}"
          style="
            font-family: var(--fonts-body);
            font-size: var(--font-sizes-label);
            font-weight: ${fontWeight};
            pointer-events: none;
            opacity: ${textOpacity};
            text-shadow: ${textShadow};
            transition: opacity var(--durations-normal), font-weight var(--durations-normal), text-shadow var(--durations-normal);
          "
        >
          ${this.cluster.name}
        </text>

        <!-- Target count -->
        <text
          x="${x + width - 12}"
          y="${y + 20}"
          text-anchor="end"
          fill="${zoomAdjustedColor}"
          style="
            font-family: var(--fonts-body);
            font-size: var(--font-sizes-sm);
            font-weight: ${fontWeight};
            pointer-events: none;
            opacity: ${textOpacity};
            text-shadow: ${textShadow};
            transition: opacity var(--durations-normal), font-weight var(--durations-normal), text-shadow var(--durations-normal);
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

// Register custom element with HMR support
if (!customElements.get('graph-cluster-card')) {
  customElements.define('graph-cluster-card', GraphClusterCard);
}
