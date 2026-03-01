import { __decorate } from "tslib";
/**
 * PanelHeader Lit Component
 *
 * A reusable header component for detail panels with back button,
 * icon box, title, subtitle, and optional badges slot.
 * Consolidates patterns from node-header and cluster-header.
 *
 * @example
 * ```html
 * <xcode-graph-panel-header
 *   title="MyTarget"
 *   subtitle="Framework"
 *   color="#10B981"
 *   @back=${handleBack}
 * >
 *   <svg slot="icon">...</svg>
 *   <xcode-graph-badge slot="badges" label="Target" color="#10B981"></xcode-graph-badge>
 * </xcode-graph-panel-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 *
 * @slot icon - Icon content for the icon box (SVG or other element)
 * @slot badges - Badge elements to display below the header
 */
import { icons } from '@shared/controllers/icon.adapter';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="header-row">
        <!-- Back Button -->
        <button class="back-button" aria-label="Back to overview">
          <?>
        </button>

        <div class="content">
          <!-- Icon Box -->
          <div class="icon-box">
            <slot name="icon"></slot>
          </div>

          <!-- Info -->
          <div class="info">
            <h2><?></h2>
            <?>
          </div>
        </div>
      </div>

      <!-- Badges Slot -->
      <div class="badges">
        <slot name="badges"></slot>
      </div>
    `, parts: [{ type: 1, index: 2, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 3 }, { type: 1, index: 6, name: "style", strings: ["\n              background-color: ", "15;\n              box-shadow: 0 0 12px ", "20;\n            "], ctor: A_1 }, { type: 1, index: 10, name: "class", strings: ["title size-", ""], ctor: A_1 }, { type: 2, index: 11 }, { type: 2, index: 12 }] };
const lit_template_2 = { h: b_1 `<div class="subtitle"><?></div>`, parts: [{ type: 2, index: 1 }] };
/**
 * A reusable header component for detail panels with back button,
 * icon box, title, subtitle, and optional badges slot.
 *
 * @summary Reusable panel header with back button and badge slots
 * @fires back - Dispatched when the back button is clicked
 * @slot icon - Icon content for the icon box (SVG or other element)
 * @slot badges - Badge elements to display below the header
 */
export class GraphPanelHeader extends LitElement {
    constructor() {
        super();
        this.titleSize = 'lg';
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      padding: var(--spacing-md);
      flex-shrink: 0;
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-2);
    }

    /* No badges margin adjustment */
    :host([no-badges]) .header-row {
      margin-bottom: 0;
    }

    .back-button {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
      border-radius: var(--radii-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--colors-muted-foreground);
      cursor: pointer;
      transition: background-color var(--durations-normal) var(--easings-out);
      margin-top: var(--spacing-1);
    }

    .back-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .back-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .back-button svg {
      width: var(--sizes-icon-lg);
      height: var(--sizes-icon-lg);
    }

    .content {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      flex: 1;
      min-width: 0;
    }

    .icon-box {
      width: var(--spacing-10);
      height: var(--spacing-10);
      border-radius: var(--radii-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-box ::slotted(svg) {
      width: 24px;
      height: 24px;
    }

    .icon-box ::slotted(*) {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-family: var(--fonts-body);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }

    .title.size-lg {
      font-size: var(--font-sizes-h2);
    }

    .title.size-md {
      font-size: var(--font-sizes-h3);
    }

    .subtitle {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badges {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    /* Hide badges container when empty */
    .badges:empty {
      display: none;
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleBack() {
        this.dispatchEvent(new CustomEvent('back', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const color = this.color || '#8B5CF6';
        return { ["_$litType$"]: lit_template_1, values: [this.handleBack, unsafeHTML(icons.ChevronLeft), color, color, this.titleSize, this.title, this.subtitle ? { ["_$litType$"]: lit_template_2, values: [this.subtitle] } : ''] };
    }
}
__decorate([
    property({ type: String })
], GraphPanelHeader.prototype, "title", void 0);
__decorate([
    property({ type: String })
], GraphPanelHeader.prototype, "subtitle", void 0);
__decorate([
    property({ type: String })
], GraphPanelHeader.prototype, "color", void 0);
__decorate([
    property({ type: String, attribute: 'title-size' })
], GraphPanelHeader.prototype, "titleSize", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-panel-header')) {
    customElements.define('xcode-graph-panel-header', GraphPanelHeader);
}
//# sourceMappingURL=panel-header.js.map