/**
 * ListItemRow Lit Component - Mission Control Theme
 *
 * Reusable row component for displaying nodes in lists.
 * Features sharp edges, accent borders, and monospace typography.
 *
 * @example
 * ```html
 * <xcode-graph-list-item-row
 *   .node=${nodeData}
 *   subtitle="Framework"
 *   zoom="1.0"
 *   is-selected
 * ></xcode-graph-list-item-row>
 * ```
 *
 * @fires row-select - Dispatched when row is clicked (detail: { node })
 * @fires row-hover - Dispatched on mouse enter (detail: { nodeId })
 * @fires row-hover-end - Dispatched on mouse leave
 */

import { icons } from '@shared/controllers/icon.adapter';
import type { GraphNode } from '@shared/schemas/graph.types';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeIconPath } from '@ui/utils/node-icons';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { type CSSResultGroup, css, html, LitElement, svg, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

/**
 * Reusable row component for displaying nodes in lists.
 * Features sharp edges, accent borders, and monospace typography.
 *
 * @summary Node list row with icon, name, and chevron
 * @fires row-select - Dispatched when the row is clicked (detail: { node })
 * @fires row-hover - Dispatched on mouse enter (detail: { nodeId })
 * @fires row-hover-end - Dispatched on mouse leave
 */
export class GraphListItemRow extends LitElement {
  @property({ attribute: false })
  declare node: GraphNode;

  @property({ type: String })
  declare subtitle: string;

  @property({ type: Number })
  declare zoom: number;

  @property({ type: Boolean, attribute: 'is-selected' })
  declare isSelected: boolean;

  @state()
  private declare isHovered: boolean;

  constructor() {
    super();
    this.zoom = 1;
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--radii-sm);
      text-align: left;
      background: transparent;
      border: var(--border-widths-thin) solid transparent;
      border-left: var(--border-widths-medium) solid transparent;
      cursor: pointer;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        transform var(--durations-fast) var(--easings-out);
    }

    button.selected {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      border-left-color: var(--node-color, var(--colors-primary));
      border-color: var(--colors-border);
    }

    button.hovered:not(.selected) {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-4));
      border-color: var(--colors-border);
    }

    button:not(.selected):not(.hovered) {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-2));
    }

    button:active {
      transform: scale(0.99);
    }

    button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .icon-container {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-container svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
    }

    .icon-container svg path {
      opacity: var(--opacity-95);
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
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
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .chevron {
      flex-shrink: 0;
      margin-left: calc(-1 * var(--spacing-1));
      color: var(--colors-muted-foreground);
      transition:
        opacity var(--durations-fast) var(--easings-out),
        transform var(--durations-fast) var(--easings-out);
    }

    .chevron.hovered {
      opacity: var(--opacity-80);
      transform: translateX(2px);
    }

    .chevron:not(.hovered) {
      opacity: var(--opacity-30);
    }

    .chevron svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }
  `;

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

  override render(): TemplateResult {
    if (!this.node) return html``;

    const nodeColor = adjustColorForZoom(getNodeTypeColor(this.node.type), this.zoom);
    const iconPath = getNodeIconPath(this.node.type, this.node.platform);

    return html`
      <button
        class=${classMap({ selected: this.isSelected, hovered: this.isHovered })}
        style=${styleMap({ '--node-color': nodeColor })}
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
                fill="rgba(var(--colors-background-rgb), var(--opacity-95))"
                stroke="${nodeColor}"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          `}
        </div>

        <!-- Content -->
        <div class="content">
          <div class="name">${this.node.name}</div>
          ${when(this.subtitle, () => html`<div class="subtitle">${this.subtitle}</div>`)}
        </div>

        <!-- Chevron -->
        <span class=${classMap({ chevron: true, hovered: this.isHovered })}>
          ${unsafeHTML(icons.ChevronRight)}
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-list-item-row': GraphListItemRow;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-list-item-row')) {
  customElements.define('xcode-graph-list-item-row', GraphListItemRow);
}
