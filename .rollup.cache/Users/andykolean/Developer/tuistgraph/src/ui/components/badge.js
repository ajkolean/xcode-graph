import { __decorate } from "tslib";
/**
 * Badge Lit Component
 *
 * A reusable badge/label component with color theming and multiple variants.
 * Consolidates badge patterns used across node-header, cluster-header,
 * cluster-type-badge, and filter-section components.
 *
 * @example
 * ```html
 * <!-- Pill badge (default) -->
 * <xcode-graph-badge
 *   label="Target"
 *   color="#10B981"
 * ></xcode-graph-badge>
 *
 * <!-- Rounded badge with accent border -->
 * <xcode-graph-badge
 *   label="Package"
 *   color="#8B5CF6"
 *   variant="accent"
 *   size="sm"
 * ></xcode-graph-badge>
 *
 * <!-- Interactive badge with glow -->
 * <xcode-graph-badge
 *   label="iOS"
 *   color="#3B82F6"
 *   interactive
 *   glow
 * ></xcode-graph-badge>
 * ```
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <span>
        <?>
      </span>
    `, parts: [{ type: 1, index: 0, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "style", strings: ["\n          --badge-color: ", ";\n          --badge-bg: ", "20;\n          --badge-border: ", "40;\n          --badge-bg-hover: ", "25;\n          --badge-border-hover: ", "50;\n          --badge-glow: ", "30;\n        "], ctor: A_1 }, { type: 2, index: 1 }] };
/**
 * A reusable badge/label component with color theming and multiple variants.
 * Consolidates badge patterns used across node-header, cluster-header,
 * cluster-type-badge, and filter-section components.
 *
 * @summary Color-themed badge with pill, rounded, and accent variants
 *
 * @cssproperty --badge-bg - Background color of the badge (computed from color prop)
 * @cssproperty --badge-border - Border color of the badge (computed from color prop)
 * @cssproperty --badge-color - Text color of the badge (computed from color prop)
 * @cssproperty --badge-bg-hover - Background color on hover (computed from color prop)
 * @cssproperty --badge-border-hover - Border color on hover (computed from color prop)
 * @cssproperty --badge-glow - Glow color on hover (computed from color prop)
 */
export class GraphBadge extends LitElement {
    constructor() {
        super();
        this.variant = 'pill';
        this.size = 'md';
        this.interactive = false;
        this.glow = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      cursor: default;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        box-shadow var(--durations-fast) var(--easings-out),
        filter var(--durations-fast) var(--easings-out);

      text-transform: uppercase;
      border: var(--border-widths-thin) solid transparent;

      /* Dynamic theming via CSS custom properties */
      background-color: var(--badge-bg);
      border-color: var(--badge-border);
      color: var(--badge-color);
    }

    /* Variant: pill (fully rounded) */
    .badge.variant-pill {
      border-radius: var(--radii-full);
    }

    /* Variant: rounded (small radius) */
    .badge.variant-rounded {
      border-radius: var(--radii-sm);
    }

    /* Variant: accent (small radius + left border) */
    .badge.variant-accent {
      border-radius: var(--radii-sm);
      border-left: var(--border-widths-medium) solid var(--badge-color);
    }

    /* Size: sm */
    .badge.size-sm {
      padding: var(--spacing-1) var(--spacing-2);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      line-height: 1;
      font-weight: var(--font-weights-semibold);
      letter-spacing: var(--letter-spacing-wider);
    }

    /* Size: md */
    .badge.size-md {
      padding: var(--spacing-1) var(--spacing-2);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      line-height: var(--line-heights-tight);
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-normal);
    }

    /* Interactive states */
    .badge.interactive {
      cursor: pointer;
    }

    .badge.interactive:hover {
      filter: brightness(1.1);
      background-color: var(--badge-bg-hover);
      border-color: var(--badge-border-hover);
    }

    .badge.interactive.variant-accent:hover {
      border-left-color: var(--badge-color);
    }

    /* Subtle glow effect on hover */
    .badge.glow:hover {
      box-shadow: 0 0 6px var(--badge-glow);
    }
  `;
    // ========================================
    // Render
    // ========================================
    render() {
        const color = this.color || '#8B5CF6';
        // Compute class list
        const classes = [
            'badge',
            `variant-${this.variant}`,
            `size-${this.size}`,
            this.interactive ? 'interactive' : '',
            this.glow ? 'glow' : '',
        ]
            .filter(Boolean)
            .join(' ');
        return { ["_$litType$"]: lit_template_1, values: [classes, color, color, color, color, color, color, this.label] };
    }
}
__decorate([
    property({ type: String })
], GraphBadge.prototype, "label", void 0);
__decorate([
    property({ type: String })
], GraphBadge.prototype, "color", void 0);
__decorate([
    property({ type: String })
], GraphBadge.prototype, "variant", void 0);
__decorate([
    property({ type: String })
], GraphBadge.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], GraphBadge.prototype, "interactive", void 0);
__decorate([
    property({ type: Boolean })
], GraphBadge.prototype, "glow", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-badge')) {
    customElements.define('xcode-graph-badge', GraphBadge);
}
//# sourceMappingURL=badge.js.map