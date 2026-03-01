/**
 * SectionHeader Lit Component
 *
 * A simple header component for sections with title and count.
 * Used in node-list, cluster-targets-list, and other list sections.
 *
 * @example
 * ```html
 * <xcode-graph-section-header
 *   title="Dependencies"
 *   count="5"
 *   suffix="direct"
 * ></xcode-graph-section-header>
 * ```
 */
import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="title"><?></div>
      <div class="count"><?></div>
    `, parts: [{ type: 2, index: 1 }, { type: 2, index: 3 }] };
/**
 * A simple header component for sections with title and count.
 * Used in node-list, cluster-targets-list, and other list sections.
 *
 * @summary Section header with title and count display
 */
export class GraphSectionHeader extends LitElement {
    constructor() {
        super();
        this.count = 0;
        this.suffix = '';
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-3);
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-semibold);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      color: var(--colors-muted-foreground);
    }

    .count {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      opacity: var(--opacity-50);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        const countText = this.suffix ? `${this.count} ${this.suffix}` : `${this.count}`;
        return { ["_$litType$"]: lit_template_1, values: [this.title, countText] };
    }
}
__decorate([
    property({ type: String })
], GraphSectionHeader.prototype, "title", void 0);
__decorate([
    property({ type: Number })
], GraphSectionHeader.prototype, "count", void 0);
__decorate([
    property({ type: String })
], GraphSectionHeader.prototype, "suffix", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-section-header')) {
    customElements.define('xcode-graph-section-header', GraphSectionHeader);
}
//# sourceMappingURL=section-header.js.map