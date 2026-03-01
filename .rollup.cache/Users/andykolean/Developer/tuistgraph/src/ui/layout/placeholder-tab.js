/**
 * PlaceholderTab Lit Component
 *
 * Placeholder content for tabs that are coming soon.
 * Displays centered message with title.
 *
 * @example
 * ```html
 * <xcode-graph-placeholder-tab title="Builds"></xcode-graph-placeholder-tab>
 * ```
 */
import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="container">
        <div class="title"><?></div>
        <div class="subtitle">This section is coming soon</div>
      </div>
    `, parts: [{ type: 2, index: 2 }] };
/**
 * Placeholder content for tabs that are coming soon.
 * Displays a centered message with title.
 *
 * @summary Coming soon placeholder tab
 */
export class GraphPlaceholderTab extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      background-color: var(--colors-background);
    }

    .container {
      text-align: center;
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-h1);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      margin-bottom: var(--spacing-2);
      opacity: var(--opacity-80);
    }

    .subtitle {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-base);
      color: var(--colors-muted-foreground);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.title] };
    }
}
__decorate([
    property({ type: String })
], GraphPlaceholderTab.prototype, "title", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-placeholder-tab')) {
    customElements.define('xcode-graph-placeholder-tab', GraphPlaceholderTab);
}
//# sourceMappingURL=placeholder-tab.js.map