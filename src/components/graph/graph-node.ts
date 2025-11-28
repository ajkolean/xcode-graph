/**
 * GraphNode Lit Component - Mission Control Theme
 *
 * SVG node in the graph visualization with icon, label, and sonar pulse animations.
 * Features dramatic hover states, enhanced glows, and amber/teal color scheme.
 *
 * @module components/graph/graph-node
 *
 * @example
 * ```html
 * <svg>
 *   <graph-node
 *     .node=${nodeData}
 *     x="100"
 *     y="100"
 *     size="24"
 *     color="#FFA03C"
 *     is-selected
 *   ></graph-node>
 * </svg>
 * ```
 *
 * @fires node-mouseenter - Dispatched on mouse enter
 * @fires node-mouseleave - Dispatched on mouse leave
 * @fires node-mousedown - Dispatched on mouse down
 * @fires node-click - Dispatched on click
 */

import type { GraphNode as GraphNodeType } from '@/data/mockGraphData';
import { adjustColorForZoom, adjustOpacityForZoom } from '@/utils/rendering/zoom-colors';
import { getNodeIconPath } from '@/utils/rendering/node-icons';
import { LitElement, svg } from 'lit';

export class GraphNode extends LitElement {
  static properties = {
    node: { attribute: false },
    x: { type: Number },
    y: { type: Number },
    size: { type: Number },
    color: { type: String },
    isSelected: { type: Boolean, attribute: 'is-selected' },
    isHovered: { type: Boolean, attribute: 'is-hovered' },
    isDimmed: { type: Boolean, attribute: 'is-dimmed' },
    zoom: { type: Number },
  };

  // No Shadow DOM for SVG elements
  protected createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  declare node: GraphNodeType | undefined;
  declare x: number | undefined;
  declare y: number | undefined;
  declare size: number | undefined;
  declare color: string | undefined;
  declare isSelected: boolean | undefined;
  declare isHovered: boolean | undefined;
  declare isDimmed: boolean | undefined;
  declare zoom: number | undefined;

  // ========================================
  // Event Handlers
  // ========================================

  private handleMouseEnter() {
    this.dispatchEvent(
      new CustomEvent('node-mouseenter', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleMouseLeave() {
    this.dispatchEvent(
      new CustomEvent('node-mouseleave', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleMouseDown(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('node-mousedown', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleClick(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('node-click', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private getDisplayName(nodeName: string): string {
    const maxLabelLength = 20;
    return nodeName.length > maxLabelLength
      ? `${nodeName.substring(0, maxLabelLength)}...`
      : nodeName;
  }

  private getShowTooltip(nodeName: string, isHovered: boolean): boolean {
    return isHovered && nodeName.length > 20;
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return svg``;

    const x = this.x ?? 0;
    const y = this.y ?? 0;
    const size = this.size ?? 12;
    const color = this.color ?? '#FFA03C';
    const zoom = this.zoom ?? 1.0;
    const isSelected = this.isSelected ?? false;
    const isHovered = this.isHovered ?? false;
    const isDimmed = this.isDimmed ?? false;

    const iconPath = getNodeIconPath(this.node.type, this.node.platform);
    const zoomAdjustedColor = adjustColorForZoom(color, zoom);
    const glowOpacity = adjustOpacityForZoom(0.4, zoom);

    // More dramatic scale on hover
    const scale = isHovered ? 1.15 : isSelected ? 1.08 : 1;

    // Subtle rotation for dynamism
    const rotation = isHovered ? 2 : 0;

    const displayName = this.getDisplayName(this.node.name);
    const showTooltip = this.getShowTooltip(this.node.name, isHovered);

    return svg`
      <g
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @mousedown=${this.handleMouseDown}
        @click=${this.handleClick}
        style="cursor: pointer; transition: opacity var(--durations-slow) ease, transform var(--durations-normal) var(--easings-bounce)"
        opacity="${isDimmed ? 0.25 : 1}"
        transform="scale(${scale}) rotate(${rotation}, ${x}, ${y})"
        transform-origin="${x}px ${y}px"
      >
        ${
          isSelected
            ? svg`
                <!-- Enhanced sonar pulse rings -->
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2.5"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${size}"
                    to="${size * 4.5}"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.3;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${size}"
                    to="${size * 4.5}"
                    dur="3s"
                    begin="0.75s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.25;0"
                    dur="3s"
                    begin="0.75s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="1.5"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${size}"
                    to="${size * 4.5}"
                    dur="3s"
                    begin="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;0.2;0"
                    dur="3s"
                    begin="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="1"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${size}"
                    to="${size * 4.5}"
                    dur="3s"
                    begin="2.25s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.15;0"
                    dur="3s"
                    begin="2.25s"
                    repeatCount="indefinite"
                  />
                </circle>
              `
            : ''
        }

        <!-- Outer glow ring - enhanced -->
        ${
          isSelected || isHovered
            ? svg`
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size + 10}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="${isSelected ? 3 : 2}"
                  opacity="${glowOpacity}"
                  filter="url(#glow-strong)"
                />
                <!-- Inner glow -->
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size + 4}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="1"
                  opacity="${glowOpacity * 0.7}"
                />
              `
            : ''
        }

        <!-- Background circle for depth -->
        <circle
          cx="${x}"
          cy="${y}"
          r="${size + 2}"
          fill="rgba(8, 10, 15, 0.8)"
          stroke="none"
        />

        <!-- Icon shape -->
        <g
          transform="translate(${x}, ${y})"
          filter="${isSelected || isHovered ? 'url(#glow)' : ''}"
        >
          <path
            d="${iconPath}"
            fill="rgba(12, 15, 22, 0.95)"
            stroke="${zoomAdjustedColor}"
            stroke-width="${isSelected ? 2.5 : isHovered ? 2.2 : 2}"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="pointer-events: all"
          />
        </g>

        <!-- Label with enhanced typography -->
        ${
          zoom >= 0.5
            ? svg`
                <g>
                  <!-- Label background for readability -->
                  ${
                    isHovered || isSelected
                      ? svg`
                          <rect
                            x="${x - displayName.length * 3.5 - 6}"
                            y="${y + size + 12}"
                            width="${displayName.length * 7 + 12}"
                            height="18"
                            rx="2"
                            fill="rgba(8, 10, 15, 0.9)"
                            stroke="${zoomAdjustedColor}"
                            stroke-width="1"
                            opacity="0.8"
                          />
                        `
                      : ''
                  }

                  <text
                    x="${x}"
                    y="${y + size + 24}"
                    fill="${isSelected || isHovered ? zoomAdjustedColor : 'rgba(var(--colors-foreground-rgb), var(--opacity-90))'}"
                    text-anchor="middle"
                    style="
                      font-family: var(--fonts-mono);
                      font-size: var(--font-sizes-sm);
                      font-weight: ${isSelected ? '600' : isHovered ? '500' : '400'};
                      letter-spacing: 0.02em;
                      pointer-events: none;
                      filter: drop-shadow(0 0 8px rgba(var(--colors-background-rgb), var(--opacity-95))) drop-shadow(0 0 4px rgba(var(--colors-background-rgb), var(--opacity-100))) drop-shadow(0 1px 2px rgba(0, 0, 0, var(--opacity-80)));
                    "
                  >
                    ${displayName}
                  </text>

                  ${
                    showTooltip
                      ? svg`
                          <rect
                            x="${x - this.node.name.length * 3.5 - 8}"
                            y="${y - size - 38}"
                            width="${this.node.name.length * 7 + 16}"
                            height="24"
                            rx="3"
                            fill="rgba(12, 15, 22, 0.95)"
                            stroke="${zoomAdjustedColor}"
                            stroke-width="1"
                            filter="url(#glow)"
                          />
                          <text
                            x="${x}"
                            y="${y - size - 22}"
                            fill="${zoomAdjustedColor}"
                            text-anchor="middle"
                            style="
                              font-family: var(--fonts-mono);
                              font-size: var(--font-sizes-sm);
                              font-weight: 500;
                              letter-spacing: 0.02em;
                              pointer-events: none;
                            "
                          >
                            ${this.node.name}
                          </text>
                        `
                      : ''
                  }
                </g>
              `
            : ''
        }
      </g>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node': GraphNode;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node')) {
  customElements.define('graph-node', GraphNode);
}
