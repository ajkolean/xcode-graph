/**
 * InfoRow Lit Component
 *
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @example
 * ```html
 * <xcode-graph-info-row label="Platform" value="iOS"></xcode-graph-info-row>
 * ```
 *
 * @slot - Default slot for complex value content (overrides value prop)
 */
import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <span class="label"><?>:</span>
      <span class="value">
        <slot><?></slot>
      </span>
    `, parts: [{ type: 2, index: 1 }, { type: 2, index: 4 }] };
/**
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @summary Key-value pair display row
 * @slot - Default slot for complex value content (overrides value prop)
 */
export class GraphInfoRow extends LitElement {
    constructor() {
        super();
        this.label = '';
        this.value = '';
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
    }

    .label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .value {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-foreground);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.label, this.value] };
    }
}
__decorate([
    property({ type: String })
], GraphInfoRow.prototype, "label", void 0);
__decorate([
    property({ type: String })
], GraphInfoRow.prototype, "value", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-info-row')) {
    customElements.define('xcode-graph-info-row', GraphInfoRow);
}
//# sourceMappingURL=info-row.js.map