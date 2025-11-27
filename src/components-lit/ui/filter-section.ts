/**
 * FilterSection Lit Component
 *
 * Collapsible filter section with checkbox items.
 * Used for nodeType, platform, project, and package filters.
 *
 * @example
 * ```html
 * <graph-filter-section
 *   id="nodeTypes"
 *   title="Product Types"
 *   icon-name="product-types"
 *   .items=${items}
 *   .selectedItems=${selectedSet}
 *   is-expanded
 * ></graph-filter-section>
 * ```
 *
 * @fires section-toggle - Dispatched when header is clicked
 * @fires item-toggle - Dispatched when item checkbox toggled (detail: { key, checked })
 * @fires preview-change - Dispatched on hover (detail: { type, value } or null)
 */

import { LitElement, html, svg, css } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';
import { getNodeIconPath, getNodeTypeLabel } from '@/utils/nodeIcons';
import { getPlatformIconPath } from '@/utils/platformIcons';
import { adjustColorForZoom } from '@/utils/zoomColorUtils';

export type FilterType = 'nodeType' | 'platform' | 'project' | 'package';

export interface FilterItem {
  key: string;
  count: number;
  color: string;
}

export class GraphFilterSection extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: String })
  declare id: string;

  @property({ type: String })
  declare title: string;

  @property({ type: String, attribute: 'icon-name' })
  declare iconName: string;

  @property({ type: Boolean, attribute: 'is-expanded' })
  declare isExpanded: boolean;

  @property({ attribute: false })
  declare items: FilterItem[];

  @property({ attribute: false })
  declare selectedItems: Set<string>;

  @property({ type: String, attribute: 'filter-type' })
  declare filterType: FilterType;

  @property({ type: Number })
  declare zoom: number;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
    }

    .header-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: var(--spacing-md);
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s;
      padding: 0;
    }

    .header-button:hover {
      opacity: 0.8;
    }

    .header-icon {
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .header-button:hover .header-icon {
      opacity: 0.8;
    }

    .header-title {
      font-family: 'DM Sans', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      font-weight: var(--font-weight-medium);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .chevron {
      margin-left: auto;
      opacity: 0.4;
      transition: transform 0.2s;
    }

    .chevron.expanded {
      transform: rotate(90deg);
    }

    .chevron svg {
      width: 14px;
      height: 14px;
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px var(--spacing-md);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .item-button:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }

    .item-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }

    .item-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .item-label {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-body);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-label.selected {
      color: var(--color-foreground);
      font-weight: var(--font-weight-medium);
    }

    .item-label:not(.selected) {
      color: var(--color-secondary);
      font-weight: var(--font-weight-regular);
    }

    .item-count {
      padding: 2px 6px;
      border-radius: var(--radius);
      flex-shrink: 0;
      transition: opacity 0.2s;
      font-family: 'Inter', sans-serif;
      font-size: var(--text-label);
      color: var(--color-foreground);
      min-width: 24px;
      text-align: center;
      margin-left: 8px;
    }

    .item-count.selected {
      opacity: 0.3;
    }

    .item-count:not(.selected) {
      opacity: 0.22;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleToggle() {
    this.dispatchEvent(
      new CustomEvent('section-toggle', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleItemToggle(key: string, checked: boolean) {
    this.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key, checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleItemHover(item: FilterItem | null) {
    this.dispatchEvent(
      new CustomEvent('preview-change', {
        detail: item ? { type: this.filterType, value: item.key } : null,
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private renderItemIcon(item: FilterItem, isSelected: boolean, zoomColor: string) {
    const opacity = isSelected ? 1 : 0.7;
    const dropShadow = `drop-shadow(0 0 6px ${zoomColor}${isSelected ? '80' : '60'})`;

    switch (this.filterType) {
      case 'nodeType':
        const iconPath = getNodeIconPath(item.key, item.key === 'app' ? 'iOS' : undefined);
        return svg`
          <svg width="16" height="16" viewBox="-18 -18 36 36" style="filter: ${dropShadow}; opacity: ${opacity}">
            <path
              d="${iconPath}"
              fill="rgba(15, 15, 20, 0.95)"
              stroke="${zoomColor}"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        `;

      case 'platform':
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

      case 'project':
        return html`
          <div
            class="item-icon"
            style="
              width: 12px;
              height: 12px;
              border-radius: var(--radius);
              background-color: ${zoomColor};
              opacity: ${opacity};
              box-shadow: 0 0 8px ${zoomColor}${isSelected ? '80' : '60'};
            "
          ></div>
        `;

      case 'package':
        return html`
          <span class="item-icon" style="filter: ${dropShadow}; opacity: ${opacity}; color: ${zoomColor}">
            ${unsafeHTML(icons.Package)}
          </span>
        `;
    }
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <!-- Section Header -->
      <button class="header-button" @click=${this.handleToggle}>
        <div class="header-icon">
          <slot name="icon"></slot>
        </div>
        <span class="header-title">${this.title}</span>
        <span class="chevron ${this.isExpanded ? 'expanded' : ''}">
          ${unsafeHTML(icons.ChevronRight)}
        </span>
      </button>

      <!-- Section Items -->
      ${this.isExpanded
        ? html`
            <div class="items">
              ${this.items?.map((item) => {
                const isSelected = this.selectedItems?.has(item.key) || false;
                const zoomColor = adjustColorForZoom(item.color, this.zoom);

                return html`
                  <button
                    class="item-button"
                    @click=${() => this.handleItemToggle(item.key, !isSelected)}
                    @mouseenter=${() => this.handleItemHover(item)}
                    @mouseleave=${() => this.handleItemHover(null)}
                  >
                    ${isSelected
                      ? html`
                          <div
                            class="item-accent"
                            style="
                              background-color: ${zoomColor};
                              box-shadow: 0 0 4px ${zoomColor}60;
                            "
                          ></div>
                        `
                      : ''}

                    <div class="item-content">
                      ${this.renderItemIcon(item, isSelected, zoomColor)}
                      <span class="item-label ${isSelected ? 'selected' : ''}">
                        ${this.filterType === 'nodeType' ? getNodeTypeLabel(item.key) : item.key}
                      </span>
                    </div>

                    <span
                      class="item-count ${isSelected ? 'selected' : ''}"
                      style="background-color: ${zoomColor}10"
                    >
                      ${item.count}
                    </span>
                  </button>
                `;
              })}
            </div>
          `
        : ''}
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-filter-section': GraphFilterSection;
  }
}

export type { FilterType, FilterItem };

// Register custom element with HMR support
if (!customElements.get('graph-filter-section')) {
  customElements.define('graph-filter-section', GraphFilterSection);
}
