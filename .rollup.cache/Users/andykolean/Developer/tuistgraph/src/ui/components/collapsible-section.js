import { __decorate } from "tslib";
/**
 * CollapsibleSection Lit Component
 *
 * An expandable/collapsible section with animated chevron.
 * Used for filter sections, details panels, and other expandable content.
 *
 * @example
 * ```html
 * <xcode-graph-collapsible-section
 *   title="Filters"
 *   ?is-expanded=${true}
 * >
 *   <span slot="icon">🔍</span>
 *   <div>Content here...</div>
 * </xcode-graph-collapsible-section>
 * ```
 *
 * @fires toggle - Dispatched when header is clicked
 *
 * @slot icon - Optional icon to display before the title
 * @slot - Default slot for expandable content
 */
import { icons } from '@shared/controllers/icon.adapter';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <button class="header-button">
        <div class="header-icon">
          <slot name="icon"></slot>
        </div>
        <span class="header-title"><?></span>
        <span>
          <?>
        </span>
      </button>

      <div>
        <div class="content-inner">
          <slot></slot>
        </div>
      </div>
    `, parts: [{ type: 1, index: 0, name: "aria-expanded", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 4 }, { type: 1, index: 5, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 6 }, { type: 1, index: 7, name: "class", strings: ["", ""], ctor: A_1 }] };
/**
 * An expandable/collapsible section with animated chevron.
 * Used for filter sections, details panels, and other expandable content.
 *
 * @summary Expandable/collapsible section with animated chevron
 *
 * @fires toggle - Dispatched when the header is clicked
 *
 * @slot icon - Optional icon to display before the title
 * @slot - Default slot for expandable content
 */
export class GraphCollapsibleSection extends LitElement {
    constructor() {
        super();
        this.title = '';
        this.isExpanded = false;
    }
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
      font-size: var(--font-sizes-xs);
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

    .header-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
      border-radius: var(--radii-sm);
    }

    .content {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: grid-template-rows var(--durations-slow) var(--easings-default);
    }

    .content.expanded {
      grid-template-rows: 1fr;
    }

    .content-inner {
      min-height: 0;
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleToggle() {
        this.dispatchEvent(new CustomEvent('toggle', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.isExpanded, this.handleToggle, this.title, classMap({ chevron: true, expanded: this.isExpanded }), unsafeHTML(icons.ChevronRight), classMap({ content: true, expanded: this.isExpanded })] };
    }
}
__decorate([
    property({ type: String })
], GraphCollapsibleSection.prototype, "title", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-expanded' })
], GraphCollapsibleSection.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-collapsible-section')) {
    customElements.define('xcode-graph-collapsible-section', GraphCollapsibleSection);
}
//# sourceMappingURL=collapsible-section.js.map