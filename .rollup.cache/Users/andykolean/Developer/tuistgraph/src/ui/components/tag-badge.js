import { __decorate } from "tslib";
/**
 * TagBadge Lit Component
 *
 * Displays architecture tags (like domain:*, layer:*) with color-coding
 * based on the tag prefix. Useful for showing organizational metadata.
 *
 * @example
 * ```html
 * <xcode-graph-tag-badge tag="domain:infrastructure"></xcode-graph-tag-badge>
 * <xcode-graph-tag-badge tag="layer:feature" interactive></xcode-graph-tag-badge>
 * ```
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
/** Tag prefix colors for visual distinction */
const TAG_PREFIX_COLORS = {
    domain: '#3B82F6', // Blue
    layer: '#10B981', // Green
    type: '#8B5CF6', // Purple
    scope: '#F59E0B', // Amber
    team: '#EC4899', // Pink
    feature: '#06B6D4', // Cyan
};
/** Default color for tags without recognized prefix */
const DEFAULT_TAG_COLOR = '#6B7280'; // Gray
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_2 = { h: b_1 `
      <span>
        <?>
        <span class="value"><?></span>
      </span>
    `, parts: [{ type: 1, index: 0, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "style", strings: ["\n          --tag-color: ", ";\n          --tag-bg: ", "15;\n          --tag-border: ", "30;\n          --tag-bg-hover: ", "25;\n          --tag-border-hover: ", "50;\n        "], ctor: A_1 }, { type: 1, index: 0, name: "title", strings: ["", ""], ctor: A_1 }, { type: 2, index: 1 }, { type: 2, index: 3 }] };
const lit_template_3 = { h: b_1 `<span class="prefix"><?>:</span>`, parts: [{ type: 2, index: 1 }] };
/**
 * Displays architecture tags (like domain:*, layer:*) with color-coding
 * based on the tag prefix. Useful for showing organizational metadata.
 *
 * @summary Color-coded architecture tag badge
 */
export class GraphTagBadge extends LitElement {
    constructor() {
        super();
        this.interactive = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: inline-flex;
    }

    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-full);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-normal);
      cursor: default;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        filter var(--durations-fast) var(--easings-out);

      background-color: transparent;
      border: 1px solid var(--tag-color);
      color: var(--tag-color);
    }

    .prefix {
      opacity: var(--opacity-70);
    }

    .value {
      font-weight: var(--font-weights-semibold);
    }

    /* Interactive states */
    .tag-badge.interactive {
      cursor: pointer;
    }

    .tag-badge.interactive:hover {
      filter: brightness(1.1);
      background-color: var(--tag-bg);
      border-color: var(--tag-color);
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    parseTag() {
        const parts = this.tag.split(':');
        if (parts.length >= 2) {
            const prefix = parts[0] ?? '';
            const value = parts.slice(1).join(':');
            const color = TAG_PREFIX_COLORS[prefix] ?? DEFAULT_TAG_COLOR;
            return { prefix, value, color };
        }
        return { prefix: '', value: this.tag, color: DEFAULT_TAG_COLOR };
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.tag)
            return { ["_$litType$"]: lit_template_1, values: [] };
        const { prefix, value, color } = this.parseTag();
        const classes = ['tag-badge', this.interactive ? 'interactive' : ''].filter(Boolean).join(' ');
        return { ["_$litType$"]: lit_template_2, values: [classes, color, color, color, color, color, this.tag, prefix ? { ["_$litType$"]: lit_template_3, values: [prefix] } : '', value] };
    }
}
__decorate([
    property({ type: String })
], GraphTagBadge.prototype, "tag", void 0);
__decorate([
    property({ type: Boolean })
], GraphTagBadge.prototype, "interactive", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-tag-badge')) {
    customElements.define('xcode-graph-tag-badge', GraphTagBadge);
}
//# sourceMappingURL=tag-badge.js.map