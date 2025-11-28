/**
 * ListItemRow Lit Component - Mission Control Theme
 *
 * Reusable row component for displaying nodes in lists.
 * Features sharp edges, accent borders, and monospace typography.
 *
 * @example
 * ```html
 * <graph-list-item-row
 *   .node=${nodeData}
 *   subtitle="Framework"
 *   zoom="1.0"
 *   is-selected
 * ></graph-list-item-row>
 * ```
 *
 * @fires row-select - Dispatched when row is clicked (detail: { node })
 * @fires row-hover - Dispatched on mouse enter (detail: { nodeId })
 * @fires row-hover-end - Dispatched on mouse leave
 */

import { css, html, LitElement, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';
import type { GraphNode } from '@/data/mockGraphData';
import { getNodeTypeColor } from '@/utils/rendering/node-colors';
import { getNodeIconPath } from '@/utils/rendering/node-icons';
import { adjustColorForZoom } from '@/utils/rendering/zoom-colors';

export class GraphListItemRow extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  @property({ type: String })
  declare subtitle: string;

  @property({ type: Number })
  declare zoom: number;

  @property({ type: Boolean, attribute: 'is-selected' })
  declare isSelected: boolean;

  // ========================================
  // Internal State
  // ========================================

  @state()
  private declare isHovered: boolean;

  constructor() {
    super();
    this.zoom = 1;
  }

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radii-sm);
      text-align: left;
      background: transparent;
      border: 1px solid transparent;
      border-left: 2px solid transparent;
      cursor: pointer;
      transition:
        background-color 0.15s var(--easings-out),
        border-color 0.15s var(--easings-out),
        transform 0.15s var(--easings-out);
    }

    button.selected {
      background-color: rgba(255, 255, 255, 0.06);
      border-left-color: var(--node-color, var(--colors-primary));
      border-color: var(--colors-border);
    }

    button.hovered:not(.selected) {
      background-color: rgba(255, 255, 255, 0.04);
      border-color: var(--colors-border);
    }

    button:not(.selected):not(.hovered) {
      background-color: rgba(255, 255, 255, 0.02);
    }

    button:active {
      transform: scale(0.99);
    }

    .icon-container {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-container svg {
      width: 20px;
      height: 20px;
    }

    .icon-container svg path {
      opacity: 0.95;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: var(--fonts-body);
      font-size: 12px;
      color: var(--colors-foreground);
      font-weight: var(--font-weights-medium);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    button.selected .name,
    button.hovered .name {
      color: var(--node-color, var(--colors-foreground));
    }

    .subtitle {
      font-family: var(--fonts-mono);
      font-size: 10px;
      color: var(--colors-muted-foreground);
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chevron {
      flex-shrink: 0;
      margin-left: -4px;
      color: var(--colors-muted-foreground);
      transition:
        opacity 0.15s var(--easings-out),
        transform 0.15s var(--easings-out);
    }

    .chevron.hovered {
      opacity: 0.8;
      transform: translateX(2px);
    }

    .chevron:not(.hovered) {
      opacity: 0.3;
    }

    .chevron svg {
      width: 16px;
      height: 16px;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleClick() {
    this.dispatchEvent(
      new CustomEvent('row-select', {
        detail: { node: this.node },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleMouseEnter() {
    this.isHovered = true;
    this.dispatchEvent(
      new CustomEvent('row-hover', {
        detail: { nodeId: this.node.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleMouseLeave() {
    this.isHovered = false;
    this.dispatchEvent(
      new CustomEvent('row-hover-end', {
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

    const nodeColor = adjustColorForZoom(getNodeTypeColor(this.node.type), this.zoom);
    const iconPath = getNodeIconPath(this.node.type, this.node.platform);

    return html`
      <button
        class="${this.isSelected ? 'selected' : ''} ${this.isHovered ? 'hovered' : ''}"
        style="--node-color: ${nodeColor}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <!-- Node Icon -->
        <div class="icon-container">
          ${svg`
            <svg
              width="20"
              height="20"
              viewBox="-18 -18 36 36"
              style="filter: drop-shadow(0 0 6px ${nodeColor}60)"
            >
              <path
                d="${iconPath}"
                fill="rgba(12, 15, 22, 0.95)"
                stroke="${nodeColor}"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="opacity: 0.95"
              />
            </svg>
          `}
        </div>

        <!-- Content -->
        <div class="content">
          <div class="name">${this.node.name}</div>
          ${this.subtitle ? html`<div class="subtitle">${this.subtitle}</div>` : ''}
        </div>

        <!-- Chevron -->
        <span class="chevron ${this.isHovered ? 'hovered' : ''}">
          ${unsafeHTML(icons.ChevronRight)}
        </span>
      </button>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-list-item-row': GraphListItemRow;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-list-item-row')) {
  customElements.define('graph-list-item-row', GraphListItemRow);
}
