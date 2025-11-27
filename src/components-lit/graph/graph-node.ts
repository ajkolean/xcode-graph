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
import { property } from 'lit/decorators.js';
import type { GraphNode as GraphNodeType } from '@/data/mockGraphData';
import { getNodeIconPath } from '@/utils/nodeIcons';
import { adjustColorForZoom, adjustOpacityForZoom } from '@/utils/zoomColorUtils';

export class GraphNode extends LitElement {
  // No Shadow DOM for SVG elements
  protected createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNodeType;

  @property({ type: Number })
  declare x: number;

  @property({ type: Number })
  declare y: number;

  @property({ type: Number })
  declare size: number;

  @property({ type: String })
  declare color: string;

  @property({ type: Boolean, attribute: 'is-selected' })
  isSelected: boolean = false;

  @property({ type: Boolean, attribute: 'is-hovered' })
  isHovered: boolean = false;

  @property({ type: Boolean, attribute: 'is-dimmed' })
  isDimmed: boolean = false;

  @property({ type: Number })
  zoom: number = 1.0;

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

  private get displayName(): string {
    const maxLabelLength = 20;
    return this.node.name.length > maxLabelLength
      ? `${this.node.name.substring(0, maxLabelLength)}...`
      : this.node.name;
  }

  private get showTooltip(): boolean {
    return this.isHovered && this.node.name.length > 20;
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return svg``;

    const iconPath = getNodeIconPath(this.node.type, this.node.platform);
    const zoomAdjustedColor = adjustColorForZoom(this.color, this.zoom);
    const glowOpacity = adjustOpacityForZoom(0.3, this.zoom);
    const scale = this.isHovered || this.isSelected ? 1.05 : 1;

    return svg`
      <g
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @mousedown=${this.handleMouseDown}
        @click=${this.handleClick}
        style="cursor: pointer; transition: opacity 0.3s ease, transform 0.2s ease"
        opacity="${this.isDimmed ? 0.3 : 1}"
        transform="scale(${scale})"
        transform-origin="${this.x}px ${this.y}px"
      >
        ${
          this.isSelected
            ? svg`
                <!-- Sonar pulse rings -->
                <circle
                  cx="${this.x}"
                  cy="${this.y}"
                  r="${this.size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${this.size}"
                    to="${this.size * 4}"
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
                  cx="${this.x}"
                  cy="${this.y}"
                  r="${this.size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${this.size}"
                    to="${this.size * 4}"
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
                  cx="${this.x}"
                  cy="${this.y}"
                  r="${this.size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${this.size}"
                    to="${this.size * 4}"
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
                  cx="${this.x}"
                  cy="${this.y}"
                  r="${this.size}"
                  fill="none"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from="${this.size}"
                    to="${this.size * 4}"
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
          this.isSelected || this.isHovered
            ? svg`
                <circle
                  cx="${this.x}"
                  cy="${this.y}"
                  r="${this.size + 8}"
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
          transform="translate(${this.x}, ${this.y})"
          filter="${this.isSelected || this.isHovered ? 'url(#glow)' : ''}"
        >
          <path
            d="${iconPath}"
            fill="rgba(15, 15, 20, 0.95)"
            stroke="${zoomAdjustedColor}"
            stroke-width="${this.isSelected ? 2.5 : 2}"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="pointer-events: all"
          />
        </g>

        <!-- Label -->
        ${
          this.zoom >= 0.5
            ? svg`
                <g>
                  <text
                    x="${this.x}"
                    y="${this.y + this.size + 22}"
                    fill="${zoomAdjustedColor}"
                    text-anchor="middle"
                    style="
                      font-family: Inter, sans-serif;
                      font-size: 11px;
                      font-weight: ${this.isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
                      pointer-events: none;
                      filter: drop-shadow(0 0 8px rgba(15, 15, 20, 0.9)) drop-shadow(0 0 4px rgba(15, 15, 20, 1)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
                    "
                  >
                    ${this.displayName}
                  </text>

                  ${
                    this.showTooltip
                      ? svg`
                          <rect
                            x="${this.x - this.node.name.length * 3.5}"
                            y="${this.y - this.size - 35}"
                            width="${this.node.name.length * 7}"
                            height="22"
                            rx="4"
                            fill="rgba(15, 15, 20, 0.95)"
                            stroke="${zoomAdjustedColor}"
                            stroke-width="1"
                            filter="url(#glow)"
                          />
                          <text
                            x="${this.x}"
                            y="${this.y - this.size - 20}"
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
