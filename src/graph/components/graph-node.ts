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
 *   <xcode-graph-node
 *     .node=${nodeData}
 *     x="100"
 *     y="100"
 *     size="24"
 *     color="#F59E0B"
 *     is-selected
 *   ></xcode-graph-node>
 * </svg>
 * ```
 *
 * @fires node-mouseenter - Dispatched on mouse enter
 * @fires node-mouseleave - Dispatched on mouse leave
 * @fires node-mousedown - Dispatched on mouse down
 * @fires node-click - Dispatched on click
 */

import type { GraphNode as GraphNodeType } from '@shared/schemas/graph.types';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { LitElement, type PropertyDeclarations, svg, type TemplateResult } from 'lit';

/** Parameters for rendering node label */
interface LabelRenderOptions {
  position: { x: number; y: number };
  size: number;
  color: string;
  displayName: string;
  fullName: string;
  state: { isSelected: boolean; isHovered: boolean };
  showTooltip: boolean;
}

/**
 * SVG node in the graph visualization with icon, label, and sonar pulse animations.
 * Features dramatic hover states, enhanced glows, and amber/teal color scheme.
 *
 * @summary SVG graph node with icon and label
 * @fires node-mouseenter - Dispatched on mouse enter
 * @fires node-mouseleave - Dispatched on mouse leave
 * @fires node-mousedown - Dispatched on mouse down (detail: { originalEvent })
 * @fires node-click - Dispatched on click (detail: { originalEvent })
 */
export class GraphNode extends LitElement {
  static override readonly properties: PropertyDeclarations = {
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
  protected override createRenderRoot(): this {
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

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent('node-click', {
          detail: { originalEvent: e },
          bubbles: true,
          composed: true,
        }),
      );
    }
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
  // Render Helpers
  // ========================================

  private renderSonarPulses(x: number, y: number, size: number, color: string) {
    const pulseConfigs = [
      { strokeWidth: 2.5, begin: '0s', opacityValues: '0.6;0.3;0' },
      { strokeWidth: 2, begin: '0.75s', opacityValues: '0.5;0.25;0' },
      { strokeWidth: 1.5, begin: '1.5s', opacityValues: '0.4;0.2;0' },
      { strokeWidth: 1, begin: '2.25s', opacityValues: '0.3;0.15;0' },
    ];

    return svg`
      ${pulseConfigs.map(
        (config) => svg`
          <circle
            cx="${x}"
            cy="${y}"
            r="${size}"
            fill="none"
            stroke="${color}"
            stroke-width="${config.strokeWidth}"
            opacity="0"
          >
            <animate
              attributeName="r"
              from="${size}"
              to="${size * 4.5}"
              dur="3s"
              begin="${config.begin}"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="${config.opacityValues}"
              dur="3s"
              begin="${config.begin}"
              repeatCount="indefinite"
            />
          </circle>
        `,
      )}
    `;
  }

  private renderGlowRings(
    x: number,
    y: number,
    size: number,
    color: string,
    isSelected: boolean,
    glowOpacity: number,
  ) {
    return svg`
      <circle
        cx="${x}"
        cy="${y}"
        r="${size + 10}"
        fill="none"
        stroke="${color}"
        stroke-width="${isSelected ? 3 : 2}"
        opacity="${glowOpacity}"
        filter="url(#glow-strong)"
      />
      <circle
        cx="${x}"
        cy="${y}"
        r="${size + 4}"
        fill="none"
        stroke="${color}"
        stroke-width="1"
        opacity="${glowOpacity * 0.7}"
      />
    `;
  }

  private renderLabel(options: LabelRenderOptions) {
    const { position, size, color, displayName, fullName, state, showTooltip } = options;
    const { x, y } = position;
    const { isSelected, isHovered } = state;

    const showBackground = isHovered || isSelected;
    const textFill =
      isSelected || isHovered ? color : 'rgba(var(--colors-foreground-rgb), var(--opacity-90))';
    const getFontWeight = (): string => {
      if (isSelected) return '600';
      if (isHovered) return '500';
      return '400';
    };
    const fontWeight = getFontWeight();

    return svg`
      <g>
        ${
          showBackground
            ? svg`
                <rect
                  x="${x - displayName.length * 3.5 - 6}"
                  y="${y + size + 12}"
                  width="${displayName.length * 7 + 12}"
                  height="18"
                  rx="2"
                  fill="rgba(8, 10, 15, 0.9)"
                  stroke="${color}"
                  stroke-width="1"
                  opacity="0.8"
                />
              `
            : ''
        }

        <text
          x="${x}"
          y="${y + size + 24}"
          fill="${textFill}"
          text-anchor="middle"
          style="
            font-family: var(--fonts-mono);
            font-size: var(--font-sizes-sm);
            font-weight: ${fontWeight};
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
                  x="${x - fullName.length * 3.5 - 8}"
                  y="${y - size - 38}"
                  width="${fullName.length * 7 + 16}"
                  height="24"
                  rx="3"
                  fill="rgba(12, 15, 22, 0.95)"
                  stroke="${color}"
                  stroke-width="1"
                  filter="url(#glow)"
                />
                <text
                  x="${x}"
                  y="${y - size - 22}"
                  fill="${color}"
                  text-anchor="middle"
                  style="
                    font-family: var(--fonts-mono);
                    font-size: var(--font-sizes-sm);
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    pointer-events: none;
                  "
                >
                  ${fullName}
                </text>
              `
            : ''
        }
      </g>
    `;
  }

  private getNodeScale(isHovered: boolean, isSelected: boolean): number {
    if (isHovered) return 1.15;
    if (isSelected) return 1.08;
    return 1;
  }

  private getIconStrokeWidth(isSelected: boolean, isHovered: boolean): number {
    if (isSelected) return 2.5;
    if (isHovered) return 2.2;
    return 2;
  }

  private renderBackgroundCircle(x: number, y: number, size: number) {
    return svg`
      <circle
        cx="${x}"
        cy="${y}"
        r="${size + 2}"
        fill="rgba(8, 10, 15, 0.8)"
        stroke="none"
      />
    `;
  }

  private renderIconShape(
    x: number,
    y: number,
    iconPath: string,
    color: string,
    isSelected: boolean,
    isHovered: boolean,
    showGlow: boolean,
  ) {
    return svg`
      <g
        transform="translate(${x}, ${y})"
        filter="${showGlow ? 'url(#glow)' : ''}"
      >
        <path
          d="${iconPath}"
          fill="rgba(12, 15, 22, 0.95)"
          stroke="${color}"
          stroke-width="${this.getIconStrokeWidth(isSelected, isHovered)}"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="pointer-events: all"
        />
      </g>
    `;
  }

  private getRenderProps() {
    const x = this.x ?? 0;
    const y = this.y ?? 0;
    const size = this.size ?? 12;
    const color = this.color ?? '#F59E0B';
    const zoom = this.zoom ?? 1;
    const isSelected = this.isSelected ?? false;
    const isHovered = this.isHovered ?? false;
    const isDimmed = this.isDimmed ?? false;

    return { x, y, size, color, zoom, isSelected, isHovered, isDimmed };
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    if (!this.node) return svg``;

    const props = this.getRenderProps();
    const { x, y, size, zoom, isSelected, isHovered, isDimmed } = props;

    const iconPath = getNodeIconPath(this.node.type, this.node.platform);
    const zoomAdjustedColor = adjustColorForZoom(props.color, zoom);
    const glowOpacity = adjustOpacityForZoom(0.4, zoom);
    const scale = this.getNodeScale(isHovered, isSelected);
    const rotation = isHovered ? 2 : 0;
    const showGlow = isSelected || isHovered;

    const sonarPulses = isSelected ? this.renderSonarPulses(x, y, size, zoomAdjustedColor) : '';
    const glowRings = showGlow
      ? this.renderGlowRings(x, y, size, zoomAdjustedColor, isSelected, glowOpacity)
      : '';
    const background = this.renderBackgroundCircle(x, y, size);
    const icon = this.renderIconShape(
      x,
      y,
      iconPath,
      zoomAdjustedColor,
      isSelected,
      isHovered,
      showGlow,
    );
    const label =
      zoom >= 0.5
        ? this.renderLabel({
            position: { x, y },
            size,
            color: zoomAdjustedColor,
            displayName: this.getDisplayName(this.node.name),
            fullName: this.node.name,
            state: { isSelected, isHovered },
            showTooltip: this.getShowTooltip(this.node.name, isHovered),
          })
        : '';

    const nodeTypeLabel = this.node.type ? `${this.node.type} target` : 'target';

    return svg`
      <g
        role="img"
        aria-label="${this.node.name}, ${nodeTypeLabel}"
        tabindex="0"
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @mousedown=${this.handleMouseDown}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        style="cursor: pointer; transition: opacity var(--durations-slow) ease, transform var(--durations-normal) var(--easings-bounce)"
        opacity="${isDimmed ? 0.25 : 1}"
        transform="scale(${scale}) rotate(${rotation}, ${x}, ${y})"
        transform-origin="${x}px ${y}px"
      >
        ${sonarPulses}
        ${glowRings}
        ${background}
        ${icon}
        ${label}
      </g>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-node': GraphNode;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-node')) {
  customElements.define('xcode-graph-node', GraphNode);
}
