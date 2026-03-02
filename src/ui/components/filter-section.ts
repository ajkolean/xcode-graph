/**
 * FilterSection Lit Component
 *
 * Collapsible filter section with checkbox items.
 * Used for nodeType, platform, project, and package filters.
 *
 * @example
 * ```html
 * <xcode-graph-filter-section
 *   id="nodeTypes"
 *   title="Product Types"
 *   icon-name="product-types"
 *   .items=${items}
 *   .selectedItems=${selectedSet}
 *   is-expanded
 * ></xcode-graph-filter-section>
 * ```
 *
 * @fires section-toggle - Dispatched when header is clicked
 * @fires item-toggle - Dispatched when item checkbox toggled (detail: { key, checked })
 * @fires preview-change - Dispatched on hover (detail: { type, value } or null)
 */

import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { NodeType, Platform } from '@shared/schemas/graph.types';
import { icons } from '@shared/utils/icon-adapter';
import { getNodeIconPath, getNodeTypeLabel } from '@ui/utils/node-icons';
import { getPlatformIconPath } from '@ui/utils/platform-icons';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { type CSSResultGroup, css, html, LitElement, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

export type FilterType = 'nodeType' | 'platform' | 'project' | 'package';

export interface FilterItem {
  /** Unique identifier for the filter option (e.g., node type name, platform name) */
  key: string;
  /** Number of nodes matching this filter option */
  count: number;
  /** Accent color for the filter item icon and indicator */
  color: string;
}

/**
 * Collapsible filter section with checkbox items.
 * Used for nodeType, platform, project, and package filters.
 *
 * @summary Collapsible filter section with toggleable checkbox items
 *
 * @fires section-toggle - Dispatched when the section header is clicked
 * @fires item-toggle - Dispatched when an item checkbox is toggled (detail: { key, checked })
 * @fires preview-change - Dispatched on item hover for filter preview (detail: { type, value } or null)
 *
 * @slot icon - Icon to display in the section header
 */
export class GraphFilterSection extends LitElement {
  /** Unique section identifier */
  @property({ type: String })
  declare id: string;

  /** Display title for the section header */
  @property({ type: String })
  declare title: string;

  /** Icon name for the section header slot */
  @property({ type: String, attribute: 'icon-name' })
  declare iconName: string;

  /** Whether the section is currently expanded */
  @property({ type: Boolean, attribute: 'is-expanded' })
  declare isExpanded: boolean;

  /** Filter items to display as toggleable checkboxes */
  @property({ attribute: false })
  declare items: FilterItem[];

  /** Set of currently selected item keys */
  @property({ attribute: false })
  declare selectedItems: Set<string>;

  /** The type of filter this section controls */
  @property({ type: String, attribute: 'filter-type' })
  declare filterType: FilterType;

  /** Current canvas zoom level for color adjustments */
  @property({ type: Number })
  declare zoom: number;

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .header-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-md);
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      transition: opacity var(--durations-normal) var(--easings-default), color var(--durations-normal);
      padding: 0;
    }

    .header-button:hover {
      opacity: var(--opacity-100);
    }

    .header-button:hover .header-title {
      color: var(--colors-primary-text);
    }

    .header-icon {
      flex-shrink: 0;
      opacity: var(--opacity-60);
      transition: opacity var(--durations-normal), color var(--durations-normal);
      color: var(--colors-muted-foreground);
    }

    .header-button:hover .header-icon {
      opacity: var(--opacity-100);
      color: var(--colors-primary-text);
    }

    .header-title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
      font-weight: var(--font-weights-semibold);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .chevron {
      margin-left: auto;
      opacity: var(--opacity-40);
      transition: transform var(--durations-normal) var(--easings-default), opacity var(--durations-normal);
      color: var(--colors-muted-foreground);
    }

    .chevron.expanded {
      transform: rotate(90deg);
      opacity: var(--opacity-80);
    }

    .header-button:hover .chevron {
      opacity: var(--opacity-80);
      color: var(--colors-primary-text);
    }

    .chevron svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .items {
      display: block;
      max-height: 240px;
      overflow-y: auto;
      scrollbar-width: thin;
      transition: max-height var(--durations-normal) var(--easings-default),
                  opacity var(--durations-normal) var(--easings-default);
      opacity: 1;
    }

    .items.collapsed {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }

    .item-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-md);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color var(--durations-fast) var(--easings-default),
                  box-shadow var(--durations-fast) var(--easings-default),
                  opacity var(--durations-fast) var(--easings-default);
      position: relative;
      border-radius: var(--radii-md);
    }

    .item-button.deselected {
      opacity: var(--opacity-60);
    }

    .item-button:hover {
      opacity: var(--opacity-100);
      background-color: rgba(var(--colors-primary-rgb), var(--opacity-5));
      box-shadow: inset 0 0 0 1px rgba(var(--colors-primary-rgb), var(--opacity-10));
    }

    .item-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 0 2px 2px 0;
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      min-width: 0;
      flex: 1;
    }

    .item-icon {
      flex-shrink: 0;
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity var(--durations-normal), transform var(--durations-normal);
    }

    .item-button:hover .item-icon {
      transform: scale(1.1);
    }

    .item-label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-base);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color var(--durations-fast);
    }

    .item-label.selected {
      color: var(--colors-foreground);
      font-weight: var(--font-weights-medium);
    }

    .item-label:not(.selected) {
      color: var(--colors-muted-foreground);
      font-weight: var(--font-weights-normal);
    }

    .item-button:hover .item-label {
      color: var(--colors-foreground);
    }

    .item-count {
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-md);
      flex-shrink: 0;
      transition: opacity var(--durations-normal), background-color var(--durations-normal);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      min-width: 26px;
      text-align: center;
      margin-left: var(--spacing-2);
    }

    .item-count.selected {
      opacity: var(--opacity-50);
    }

    .item-count:not(.selected) {
      opacity: var(--opacity-30);
    }

    .item-button:hover .item-count {
      opacity: var(--opacity-70);
    }

    .header-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .item-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }
  `;

  /** Dispatches section-toggle event when header is clicked */
  private handleToggle() {
    this.dispatchEvent(
      new CustomEvent('section-toggle', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Dispatches item-toggle event when a checkbox item is toggled */
  private handleItemToggle(key: string, checked: boolean) {
    this.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key, checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Dispatches preview-change event on item hover for filter preview */
  private handleItemHover(item: FilterItem | null) {
    this.dispatchEvent(
      new CustomEvent('preview-change', {
        detail: item ? { type: this.filterType, value: item.key } : null,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Renders the appropriate icon for a filter item based on filter type */
  private renderItemIcon(item: FilterItem, isSelected: boolean, zoomColor: string) {
    const opacity = isSelected ? 1 : 0.7;
    const dropShadow = `drop-shadow(0 0 6px ${zoomColor}${isSelected ? '80' : '60'})`;

    switch (this.filterType) {
      case 'nodeType': {
        const iconPath = getNodeIconPath(
          item.key,
          item.key === NodeType.App ? Platform.iOS : undefined,
        );
        return svg`
          <svg width="16" height="16" viewBox="-18 -18 36 36" style="filter: ${dropShadow}; opacity: ${opacity}">
            <path
              d="${iconPath}"
              fill="rgba(var(--colors-background-rgb), var(--opacity-95))"
              stroke="${zoomColor}"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        `;
      }

      case 'platform': {
        const platformPath = getPlatformIconPath(item.key);
        return svg`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="filter: ${dropShadow}; opacity: ${opacity}">
            <path
              d="${platformPath}"
              fill="none"
              stroke="${zoomColor}"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        `;
      }

      case 'project':
        return html`
          <div
            class="item-icon"
            style=${styleMap({
              width: '16px',
              height: '16px',
              'border-radius': 'var(--radius)',
              'background-color': zoomColor,
              opacity: String(opacity),
              border: '1px solid rgba(255, 255, 255, 0.15)',
            })}
          ></div>
        `;

      case 'package':
        return html`
          <span class="item-icon" style=${styleMap({
            filter: dropShadow,
            opacity: String(opacity),
            color: zoomColor,
          })}>
            ${icons.Package}
          </span>
        `;
      default:
        return undefined;
    }
  }

  /** Renders a single filter item as a toggleable button */
  private renderItem(item: FilterItem) {
    const isSelected = this.selectedItems?.has(item.key) || false;
    const zoomColor = adjustColorForZoom(item.color, this.zoom);

    return html`
      <button
        class=${classMap({ 'item-button': true, deselected: !isSelected })}
        aria-pressed=${isSelected}
        @click=${() => this.handleItemToggle(item.key, !isSelected)}
        @mouseenter=${() => this.handleItemHover(item)}
        @mouseleave=${() => this.handleItemHover(null)}
      >
        ${when(
          isSelected,
          () => html`
              <div
                class="item-accent"
                style=${styleMap({
                  'background-color': zoomColor,
                  'box-shadow': `0 0 4px ${zoomColor}60`,
                })}
              ></div>
            `,
        )}

        <div class="item-content">
          ${this.renderItemIcon(item, isSelected, zoomColor)}
          <span class=${classMap({ 'item-label': true, selected: isSelected })}>
            ${this.filterType === 'nodeType' ? getNodeTypeLabel(item.key) : item.key}
          </span>
        </div>

        <span
          class=${classMap({ 'item-count': true, selected: isSelected })}
          style=${styleMap({ 'background-color': `${zoomColor}10` })}
        >
          ${item.count}
        </span>
      </button>
    `;
  }

  /** Renders the component template */
  override render(): TemplateResult {
    return html`
      <!-- Section Header -->
      <button class="header-button" aria-expanded=${this.isExpanded} @click=${this.handleToggle}>
        <div class="header-icon">
          <slot name="icon"></slot>
        </div>
        <span class="header-title">${this.title}</span>
        <span class=${classMap({ chevron: true, expanded: this.isExpanded })}>
          ${icons.ChevronRight}
        </span>
      </button>

      <!-- Section Items -->
      <div class=${classMap({ items: true, collapsed: !this.isExpanded })}>
        ${virtualize({
          items: this.items ?? [],
          renderItem: (item: FilterItem) => this.renderItem(item),
          keyFunction: (item: FilterItem) => item.key,
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-filter-section': GraphFilterSection;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-filter-section')) {
  customElements.define('xcode-graph-filter-section', GraphFilterSection);
}
