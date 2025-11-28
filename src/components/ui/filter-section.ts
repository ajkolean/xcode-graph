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

import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';
import { getNodeIconPath, getNodeTypeLabel } from '@/utils/rendering/node-icons';
import { getPlatformIconPath } from '@/utils/rendering/platform-icons';
import { adjustColorForZoom } from '@/utils/rendering/zoom-colors';

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
      transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s;
      padding: 0;
    }

    .header-button:hover {
      opacity: 1;
    }

    .header-button:hover .header-title {
      color: var(--primary);
    }

    .header-icon {
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.2s, color 0.2s;
      color: var(--muted-foreground);
    }

    .header-button:hover .header-icon {
      opacity: 1;
      color: var(--primary);
    }

    .header-title {
      font-family: var(--font-family-mono);
      font-size: var(--text-xs);
      color: var(--muted-foreground);
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transition: color 0.2s;
    }

    .chevron {
      margin-left: auto;
      opacity: 0.4;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
      color: var(--muted-foreground);
    }

    .chevron.expanded {
      transform: rotate(90deg);
      opacity: 0.8;
    }

    .header-button:hover .chevron {
      opacity: 0.8;
      color: var(--primary);
    }

    .chevron svg {
      width: 14px;
      height: 14px;
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .item-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px var(--spacing-md);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border-radius: var(--radius);
      /* Staggered animation */
      animation: filterItemFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .item-button:nth-child(1) { animation-delay: 0.02s; }
    .item-button:nth-child(2) { animation-delay: 0.04s; }
    .item-button:nth-child(3) { animation-delay: 0.06s; }
    .item-button:nth-child(4) { animation-delay: 0.08s; }
    .item-button:nth-child(5) { animation-delay: 0.10s; }
    .item-button:nth-child(6) { animation-delay: 0.12s; }
    .item-button:nth-child(7) { animation-delay: 0.14s; }
    .item-button:nth-child(8) { animation-delay: 0.16s; }

    @keyframes filterItemFadeIn {
      from {
        opacity: 0;
        transform: translateX(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .item-button:hover {
      background-color: rgba(255, 160, 60, 0.05);
      box-shadow: inset 0 0 0 1px rgba(255, 160, 60, 0.1);
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
      transition: opacity 0.2s, transform 0.2s;
    }

    .item-button:hover .item-icon {
      transform: scale(1.1);
    }

    .item-label {
      font-family: var(--font-family-body);
      font-size: var(--text-body);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.15s;
    }

    .item-label.selected {
      color: var(--foreground);
      font-weight: var(--font-weight-medium);
    }

    .item-label:not(.selected) {
      color: var(--muted-foreground);
      font-weight: var(--font-weight-regular);
    }

    .item-button:hover .item-label {
      color: var(--foreground);
    }

    .item-count {
      padding: 3px 8px;
      border-radius: var(--radius);
      flex-shrink: 0;
      transition: opacity 0.2s, background-color 0.2s;
      font-family: var(--font-family-mono);
      font-size: var(--text-xs);
      font-weight: var(--font-weight-medium);
      color: var(--foreground);
      min-width: 26px;
      text-align: center;
      margin-left: 8px;
    }

    .item-count.selected {
      opacity: 0.5;
    }

    .item-count:not(.selected) {
      opacity: 0.3;
    }

    .item-button:hover .item-count {
      opacity: 0.7;
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
      }),
    );
  }

  private handleItemToggle(key: string, checked: boolean) {
    this.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key, checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleItemHover(item: FilterItem | null) {
    this.dispatchEvent(
      new CustomEvent('preview-change', {
        detail: item ? { type: this.filterType, value: item.key } : null,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private renderItemIcon(item: FilterItem, isSelected: boolean, zoomColor: string) {
    const opacity = isSelected ? 1 : 0.7;
    const dropShadow = `drop-shadow(0 0 6px ${zoomColor}${isSelected ? '80' : '60'})`;

    switch (this.filterType) {
      case 'nodeType': {
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
      ${
        this.isExpanded
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
                    ${
                      isSelected
                        ? html`
                          <div
                            class="item-accent"
                            style="
                              background-color: ${zoomColor};
                              box-shadow: 0 0 4px ${zoomColor}60;
                            "
                          ></div>
                        `
                        : ''
                    }

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
          : ''
      }
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
