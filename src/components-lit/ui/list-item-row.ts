/**
 * ListItemRow Lit Component
 *
 * Reusable row component for displaying nodes in lists.
 * Used in cluster targets, dependencies, and dependents lists.
 * Supports hover states, selection, and node icons.
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

import { LitElement, html, svg, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { GraphNode } from '@/data/mockGraphData';
import { getNodeTypeColor } from '@/utils/graph/nodeColors';
import { getNodeIconPath } from '@/utils/nodeIcons';
import { adjustColorForZoom } from '@/utils/zoomColorUtils';
import { icons } from '@/controllers/icon.adapter';

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
      padding: 8px 10px;
      border-radius: var(--radius);
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s ease-out;
    }

    button.selected {
      background-color: rgba(255, 255, 255, 0.08);
    }

    button.hovered:not(.selected) {
      background-color: rgba(255, 255, 255, 0.06);
    }

    button:not(.selected):not(.hovered) {
      background-color: rgba(255, 255, 255, 0.03);
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

    .content {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-foreground);
      font-weight: var(--font-weight-medium);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: var(--color-muted-foreground);
      margin-top: 1px;
    }

    .chevron {
      flex-shrink: 0;
      margin-left: -4px;
      color: var(--color-muted-foreground);
      transition: opacity 0.2s;
    }

    .chevron.hovered {
      opacity: 0.7;
    }

    .chevron:not(.hovered) {
      opacity: 0.4;
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
      })
    );
  }

  private handleMouseEnter() {
    this.isHovered = true;
    this.dispatchEvent(
      new CustomEvent('row-hover', {
        detail: { nodeId: this.node.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMouseLeave() {
    this.isHovered = false;
    this.dispatchEvent(
      new CustomEvent('row-hover-end', {
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return html``;

    const nodeColor = adjustColorForZoom(getNodeTypeColor(this.node.type), this.zoom);
    const iconPath = getNodeIconPath(this.node.type, this.node.platform);

    const classes = {
      selected: this.isSelected,
      hovered: this.isHovered,
    };

    return html`
      <button
        class="${this.isSelected ? 'selected' : ''} ${this.isHovered ? 'hovered' : ''}"
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
              style="filter: drop-shadow(0 0 6px ${nodeColor}80)"
            >
              <path
                d="${iconPath}"
                fill="rgba(15, 15, 20, 0.95)"
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
