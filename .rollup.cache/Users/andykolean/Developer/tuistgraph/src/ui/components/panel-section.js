/**
 * PanelSection Lit Component
 *
 * A consistent container for sections within panels.
 * Provides padding, borders, and flex-shrink control.
 *
 * @example
 * ```html
 * <xcode-graph-panel-section bordered shrink>
 *   <h3>Section Title</h3>
 *   <p>Section content...</p>
 * </xcode-graph-panel-section>
 * ```
 *
 * @slot - Default slot for section content
 */
import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<slot></slot>`, parts: [] };
/**
 * A consistent container for sections within panels.
 * Provides padding, borders, and flex-shrink control.
 *
 * @summary Panel section container with configurable padding and borders
 * @slot - Default slot for section content
 */
export class GraphPanelSection extends LitElement {
    constructor() {
        super();
        this.bordered = false;
        this.padding = 'md';
        this.shrink = true;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
    }

    :host([bordered]) {
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    :host([shrink]) {
      flex-shrink: 0;
    }

    :host(:not([shrink])) {
      flex-shrink: 1;
    }

    /* Padding: none */
    :host([padding="none"]) {
      padding: 0;
    }

    /* Padding: sm */
    :host([padding="sm"]) {
      padding: var(--spacing-2);
    }

    /* Padding: md (default) */
    :host,
    :host([padding="md"]) {
      padding: var(--spacing-md);
    }

    /* Padding: lg */
    :host([padding="lg"]) {
      padding: var(--spacing-lg);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [] };
    }
}
__decorate([
    property({ type: Boolean })
], GraphPanelSection.prototype, "bordered", void 0);
__decorate([
    property({ type: String })
], GraphPanelSection.prototype, "padding", void 0);
__decorate([
    property({ type: Boolean })
], GraphPanelSection.prototype, "shrink", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-panel-section')) {
    customElements.define('xcode-graph-panel-section', GraphPanelSection);
}
//# sourceMappingURL=panel-section.js.map