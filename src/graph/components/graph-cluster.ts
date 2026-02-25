/**
 * GraphCluster Lit Component
 *
 * SVG cluster container with background, border, and glow effects.
 * Renders as a rounded rectangle with label, target count, and children.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-cluster
 *     cluster-id="MyProject"
 *     x="100"
 *     y="100"
 *     width="200"
 *     height="150"
 *     color="#8B5CF6"
 *     node-count="5"
 *     origin="local"
 *   >
 *     <!-- child nodes and edges -->
 *   </graph-cluster>
 * </svg>
 * ```
 *
 * @fires cluster-mouseenter - Dispatched on mouse enter
 * @fires cluster-mouseleave - Dispatched on mouse leave
 * @fires cluster-click - Dispatched on click
 */

import { LitElement, type PropertyDeclarations, svg, type TemplateResult } from 'lit';

export class GraphCluster extends LitElement {
  static override readonly properties: PropertyDeclarations = {
    clusterId: { type: String, attribute: 'cluster-id' },
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    color: { type: String },
    nodeCount: { type: Number, attribute: 'node-count' },
    origin: { type: String },
    isHovered: { type: Boolean, attribute: 'is-hovered' },
  };

  // No Shadow DOM for SVG elements
  protected override createRenderRoot(): this {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  declare clusterId: string | undefined;
  declare x: number | undefined;
  declare y: number | undefined;
  declare width: number | undefined;
  declare height: number | undefined;
  declare color: string | undefined;
  declare nodeCount: number | undefined;
  declare origin: 'local' | 'external' | undefined;
  declare isHovered: boolean | undefined;

  // ========================================
  // Event Handlers
  // ========================================

  private handleMouseEnter() {
    this.dispatchEvent(
      new CustomEvent('cluster-mouseenter', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleMouseLeave() {
    this.dispatchEvent(
      new CustomEvent('cluster-mouseleave', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleClick() {
    this.dispatchEvent(
      new CustomEvent('cluster-click', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  // ========================================
  // Render
  // ========================================

  private resolveClusterProps() {
    return {
      clusterId: this.clusterId ?? '',
      x: this.x ?? 0,
      y: this.y ?? 0,
      width: this.width ?? 0,
      height: this.height ?? 0,
      color: this.color ?? '#888',
      nodeCount: this.nodeCount ?? 0,
      origin: (this.origin ?? 'local') as 'local' | 'external',
      isHovered: this.isHovered ?? false,
    };
  }

  override render(): TemplateResult {
    const { clusterId, x, y, width, height, color, nodeCount, origin, isHovered } =
      this.resolveClusterProps();

    // Unique IDs for gradients
    const bgGradientId = `cluster-bg-${clusterId}`;
    const innerShadowId = `cluster-inner-shadow-${clusterId}`;

    return svg`
      <g
        role="group"
        aria-label="${clusterId} cluster, ${nodeCount} targets, ${origin === 'external' ? 'external' : 'local'}"
        tabindex="0"
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        style="transition: all var(--durations-slow) ease; cursor: pointer"
      >
        <!-- Hover glow with smooth transition -->
        ${
          isHovered
            ? svg`
              <rect
                x="${x - width / 2 - 3}"
                y="${y - height / 2 - 3}"
                width="${width + 6}"
                height="${height + 6}"
                fill="none"
                stroke="${color}"
                stroke-width="3"
                rx="14"
                opacity="0.6"
                filter="url(#glow-strong)"
                style="transition: opacity var(--durations-slow) ease, stroke-width var(--durations-slow) ease"
              />
            `
            : ''
        }

        <!-- Gradient definitions -->
        <defs>
          <radialGradient id="${bgGradientId}" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.08" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.03" />
          </radialGradient>
          <linearGradient id="${innerShadowId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(0, 0, 0, 0.2)" />
            <stop offset="50%" stop-color="rgba(0, 0, 0, 0)" />
            <stop offset="100%" stop-color="rgba(0, 0, 0, 0.1)" />
          </linearGradient>
        </defs>

        <!-- Background with gradient -->
        <rect
          x="${x - width / 2}"
          y="${y - height / 2}"
          width="${width}"
          height="${height}"
          fill="url(#${bgGradientId})"
          stroke="none"
          rx="12"
          opacity="${isHovered ? 0.9 : 0.7}"
          style="transition: opacity var(--durations-slow) ease"
        />

        <!-- Inner shadow for depth -->
        <rect
          x="${x - width / 2}"
          y="${y - height / 2}"
          width="${width}"
          height="${height}"
          fill="url(#${innerShadowId})"
          stroke="none"
          rx="12"
          opacity="0.3"
          pointer-events="none"
        />

        <!-- Cluster border - softer and more subtle -->
        <rect
          x="${x - width / 2}"
          y="${y - height / 2}"
          width="${width}"
          height="${height}"
          fill="none"
          stroke="${color}"
          stroke-width="${isHovered ? 2.5 : 2}"
          stroke-dasharray="6,6"
          rx="12"
          opacity="${isHovered ? 0.85 : 0.5}"
          style="transition: all var(--durations-slow) ease"
        />

        <!-- Cluster label -->
        <text
          x="${x}"
          y="${y - height / 2 - 8}"
          fill="${color}"
          text-anchor="middle"
          style="
            font-family: var(--fonts-body);
            font-size: var(--font-sizes-base);
            font-weight: var(--font-weights-medium);
            filter: ${isHovered ? 'url(#glow)' : 'none'};
            transition: filter var(--durations-slow) ease;
          "
        >
          ${clusterId}
        </text>
        <text
          x="${x}"
          y="${y - height / 2 + 7}"
          fill="${color}"
          text-anchor="middle"
          opacity="${isHovered ? 0.8 : 0.5}"
          style="
            font-family: var(--fonts-body);
            font-size: var(--font-sizes-xs);
            transition: opacity var(--durations-slow) ease;
          "
        >
          ${origin === 'external' ? 'EXTERNAL' : 'LOCAL'} · ${nodeCount} targets
        </text>

        <!-- Content (edges and nodes) - slotted -->
        <slot></slot>
      </g>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster': GraphCluster;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster')) {
  customElements.define('graph-cluster', GraphCluster);
}
