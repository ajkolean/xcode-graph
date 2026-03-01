import { __decorate } from "tslib";
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
import { icons } from '@shared/controllers/icon.adapter';
import { NodeType, Platform } from '@shared/schemas/graph.types';
import { getNodeIconPath, getNodeTypeLabel } from '@ui/utils/node-icons';
import { getPlatformIconPath } from '@ui/utils/platform-icons';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
          <div class="item-icon"></div>
        `, parts: [{ type: 1, index: 0, name: "style", strings: ["", ""], ctor: A_1 }] };
const lit_template_2 = { h: b_1 `
          <span class="item-icon">
            <?>
          </span>
        `, parts: [{ type: 1, index: 0, name: "style", strings: ["", ""], ctor: A_1 }, { type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `
      <button>
        <?>

        <div class="item-content">
          <?>
          <span>
            <?>
          </span>
        </div>

        <span>
          <?>
        </span>
      </button>
    `, parts: [{ type: 1, index: 0, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "aria-pressed", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mouseenter", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "mouseleave", strings: ["", ""], ctor: E_1 }, { type: 2, index: 1 }, { type: 2, index: 3 }, { type: 1, index: 4, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 5 }, { type: 1, index: 6, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 6, name: "style", strings: ["", ""], ctor: A_1 }, { type: 2, index: 7 }] };
const lit_template_4 = { h: b_1 `
              <div class="item-accent"></div>
            `, parts: [{ type: 1, index: 0, name: "style", strings: ["", ""], ctor: A_1 }] };
const lit_template_5 = { h: b_1 `
      <!-- Section Header -->
      <button class="header-button">
        <div class="header-icon">
          <slot name="icon"></slot>
        </div>
        <span class="header-title"><?></span>
        <span>
          <?>
        </span>
      </button>

      <!-- Section Items -->
      <?>
    `, parts: [{ type: 1, index: 1, name: "aria-expanded", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 5 }, { type: 1, index: 6, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 7 }, { type: 2, index: 9 }] };
const lit_template_6 = { h: b_1 `
            <div class="items">
              <?>
            </div>
          `, parts: [{ type: 2, index: 1 }] };
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
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
      margin-bottom: var(--border-widths-thin);
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
    // ========================================
    // Event Handlers
    // ========================================
    handleToggle() {
        this.dispatchEvent(new CustomEvent('section-toggle', {
            bubbles: true,
            composed: true,
        }));
    }
    handleItemToggle(key, checked) {
        this.dispatchEvent(new CustomEvent('item-toggle', {
            detail: { key, checked },
            bubbles: true,
            composed: true,
        }));
    }
    handleItemHover(item) {
        this.dispatchEvent(new CustomEvent('preview-change', {
            detail: item ? { type: this.filterType, value: item.key } : null,
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Helpers
    // ========================================
    renderItemIcon(item, isSelected, zoomColor) {
        const opacity = isSelected ? 1 : 0.7;
        const dropShadow = `drop-shadow(0 0 6px ${zoomColor}${isSelected ? '80' : '60'})`;
        switch (this.filterType) {
            case 'nodeType': {
                const iconPath = getNodeIconPath(item.key, item.key === NodeType.App ? Platform.iOS : undefined);
                return svg `
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
                return svg `
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
                return { ["_$litType$"]: lit_template_1, values: [styleMap({
                            width: '16px',
                            height: '16px',
                            'border-radius': 'var(--radius)',
                            'background-color': zoomColor,
                            opacity: String(opacity),
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                        })] };
            case 'package':
                return { ["_$litType$"]: lit_template_2, values: [styleMap({
                            filter: dropShadow,
                            opacity: String(opacity),
                            color: zoomColor,
                        }), unsafeHTML(icons.Package)] };
        }
    }
    // ========================================
    // Render
    // ========================================
    renderItem(item) {
        const isSelected = this.selectedItems?.has(item.key) || false;
        const zoomColor = adjustColorForZoom(item.color, this.zoom);
        return { ["_$litType$"]: lit_template_3, values: [classMap({ 'item-button': true, deselected: !isSelected }), isSelected, () => this.handleItemToggle(item.key, !isSelected), () => this.handleItemHover(item), () => this.handleItemHover(null), when(isSelected, () => ({ ["_$litType$"]: lit_template_4, values: [styleMap({
                            'background-color': zoomColor,
                            'box-shadow': `0 0 4px ${zoomColor}60`,
                        })] })), this.renderItemIcon(item, isSelected, zoomColor), classMap({ 'item-label': true, selected: isSelected }), this.filterType === 'nodeType' ? getNodeTypeLabel(item.key) : item.key, classMap({ 'item-count': true, selected: isSelected }), styleMap({ 'background-color': `${zoomColor}10` }), item.count] };
    }
    render() {
        return { ["_$litType$"]: lit_template_5, values: [this.isExpanded, this.handleToggle, this.title, classMap({ chevron: true, expanded: this.isExpanded }), unsafeHTML(icons.ChevronRight), when(this.isExpanded, () => ({ ["_$litType$"]: lit_template_6, values: [virtualize({
                            items: this.items ?? [],
                            renderItem: (item) => this.renderItem(item),
                            keyFunction: (item) => item.key,
                        })] }))] };
    }
}
__decorate([
    property({ type: String })
], GraphFilterSection.prototype, "id", void 0);
__decorate([
    property({ type: String })
], GraphFilterSection.prototype, "title", void 0);
__decorate([
    property({ type: String, attribute: 'icon-name' })
], GraphFilterSection.prototype, "iconName", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-expanded' })
], GraphFilterSection.prototype, "isExpanded", void 0);
__decorate([
    property({ attribute: false })
], GraphFilterSection.prototype, "items", void 0);
__decorate([
    property({ attribute: false })
], GraphFilterSection.prototype, "selectedItems", void 0);
__decorate([
    property({ type: String, attribute: 'filter-type' })
], GraphFilterSection.prototype, "filterType", void 0);
__decorate([
    property({ type: Number })
], GraphFilterSection.prototype, "zoom", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-filter-section')) {
    customElements.define('xcode-graph-filter-section', GraphFilterSection);
}
//# sourceMappingURL=filter-section.js.map