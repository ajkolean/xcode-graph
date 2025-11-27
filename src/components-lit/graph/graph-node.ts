/**
 * GraphNode Lit Component
 *
 * SVG node in the graph visualization with icon, label, and sonar pulse animations.
 * Supports selection, hover states, dimming, and zoom adjustments.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-node
 *     .node=${nodeData}
 *     x="100"
 *     y="100"
 *     size="24"
 *     color="#8B5CF6"
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

import { LitElement, svg } from 'lit';
import type { GraphNode as GraphNodeType } from '@/data/mockGraphData';
import { getNodeIconPath } from '@/utils/nodeIcons';
import { adjustColorForZoom, adjustOpacityForZoom } from '@/utils/zoomColorUtils';

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
      })
    );
  }

  private handleMouseLeave() {
    this.dispatchEvent(
      new CustomEvent('node-mouseleave', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMouseDown(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('node-mousedown', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleClick(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('node-click', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private getDisplayName(nodeName: string): string {
    const maxLabelLength = 20;
    return nodeName.length > maxLabelLength ? `${nodeName.substring(0, maxLabelLength)}...` : nodeName;
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
    const color = this.color ?? '#888';
    const zoom = this.zoom ?? 1.0;
    const isSelected = this.isSelected ?? false;
    const isHovered = this.isHovered ?? false;
    const isDimmed = this.isDimmed ?? false;

    const iconPath = getNodeIconPath(this.node.type, this.node.platform);
    const zoomAdjustedColor = adjustColorForZoom(color, zoom);
    const glowOpacity = adjustOpacityForZoom(0.3, zoom);
    const scale = isHovered || isSelected ? 1.05 : 1;
    const displayName = this.getDisplayName(this.node.name);
    const showTooltip = this.getShowTooltip(this.node.name, isHovered);

    return svg`
      <g
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @mousedown=${this.handleMouseDown}
        @click=${this.handleClick}
        style="cursor: pointer; transition: opacity 0.3s ease, transform 0.2s ease"
        opacity="${isDimmed ? 0.3 : 1}"
        transform="scale(${scale})"
        transform-origin="${x}px ${y}px"
      >
        ${
          isSelected
            ? svg`
                <!-- Sonar pulse rings -->
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
                    to="${size * 4}"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.3;0"
                    dur="3.5s"
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
                    to="${size * 4}"
                    dur="3.5s"
                    begin="0.875s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.3;0"
                    dur="3.5s"
                    begin="0.875s"
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
                    to="${size * 4}"
                    dur="3.5s"
                    begin="1.75s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.3;0"
                    dur="3.5s"
                    begin="1.75s"
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
                    to="${size * 4}"
                    dur="3.5s"
                    begin="2.625s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.3;0"
                    dur="3.5s"
                    begin="2.625s"
                    repeatCount="indefinite"
                  />
                </circle>
              `
            : ''
        }

        <!-- Outer glow ring -->
        ${
          isSelected || isHovered
            ? svg`
                <circle
                  cx="${x}"
                  cy="${y}"
                  r="${size + 8}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2"
                  opacity="${glowOpacity}"
                  filter="url(#glow-strong)"
                />
              `
            : ''
        }

        <!-- Icon shape -->
        <g
          transform="translate(${x}, ${y})"
          filter="${isSelected || isHovered ? 'url(#glow)' : ''}"
        >
          <path
            d="${iconPath}"
            fill="rgba(15, 15, 20, 0.95)"
            stroke="${zoomAdjustedColor}"
            stroke-width="${isSelected ? 2.5 : 2}"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="pointer-events: all"
          />
        </g>

        <!-- Label -->
        ${
          zoom >= 0.5
            ? svg`
                <g>
                  <text
                    x="${x}"
                    y="${y + size + 22}"
                    fill="${zoomAdjustedColor}"
                    text-anchor="middle"
                    style="
                      font-family: Inter, sans-serif;
                      font-size: 11px;
                      font-weight: ${isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
                      pointer-events: none;
                      filter: drop-shadow(0 0 8px rgba(15, 15, 20, 0.9)) drop-shadow(0 0 4px rgba(15, 15, 20, 1)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
                    "
                  >
                    ${displayName}
                  </text>

                  ${
                    showTooltip
                      ? svg`
                          <rect
                            x="${x - this.node.name.length * 3.5}"
                            y="${y - size - 35}"
                            width="${this.node.name.length * 7}"
                            height="22"
                            rx="4"
                            fill="rgba(15, 15, 20, 0.95)"
                            stroke="${zoomAdjustedColor}"
                            stroke-width="1"
                            filter="url(#glow)"
                          />
                          <text
                            x="${x}"
                            y="${y - size - 20}"
                            fill="${zoomAdjustedColor}"
                            text-anchor="middle"
                            style="
                              font-family: Inter, sans-serif;
                              font-size: 11px;
                              font-weight: var(--font-weight-normal);
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
