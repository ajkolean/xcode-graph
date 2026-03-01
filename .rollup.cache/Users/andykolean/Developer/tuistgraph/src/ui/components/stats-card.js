import { __decorate } from "tslib";
/**
 * StatsCard Lit Component - Mission Control Theme
 *
 * Reusable stats card component for displaying metrics.
 * Features bold left accent border, noise texture, and monospace typography.
 * Can be toggleable for interactive highlight controls.
 *
 * @example
 * ```html
 * <xcode-graph-stats-card label="Total" value="42"></xcode-graph-stats-card>
 * <xcode-graph-stats-card label="Deps" value="10" toggleable active></xcode-graph-stats-card>
 * ```
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div>
        <div class="label"><?></div>
        <div>
          <?>
        </div>
      </div>
    `, parts: [{ type: 1, index: 0, name: "class", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 2 }, { type: 1, index: 3, name: "class", strings: ["value ", ""], ctor: A_1 }, { type: 2, index: 4 }] };
/**
 * Reusable stats card component for displaying metrics.
 * Features bold left accent border and monospace typography.
 * Can be toggleable for interactive highlight controls.
 *
 * @summary Stats metric card with optional toggle behavior
 * @fires card-toggle - Dispatched when a toggleable card is clicked
 */
export class GraphStatsCard extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      flex: 1;
    }

    .container {
      position: relative;
      padding: var(--spacing-3) var(--spacing-md);
      border-radius: var(--radii-sm);
      background: var(--colors-card);
      border: var(--border-widths-thin) solid var(--colors-border);
      border-left: 4px solid var(--colors-primary);
      cursor: default;
      transition:
        border-color var(--durations-normal) var(--easings-out);
      overflow: hidden;
    }

    .container.highlighted {
      border-left-color: var(--colors-accent);
    }

    /* Toggleable styles */
    .container.toggleable {
      cursor: pointer;
      user-select: none;
    }

    /* Toggleable inactive: gray/muted appearance */
    .container.toggleable:not(.active) {
      border-left-color: rgba(var(--colors-muted-foreground-rgb, 148, 163, 184), 0.3);
    }

    /* Toggleable active: primary styling */
    .container.toggleable.active {
      border-left-color: var(--colors-primary);
    }

    .label {
      position: relative;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--colors-primary-text);
      opacity: var(--opacity-100);
      margin-bottom: var(--spacing-1);
    }

    .container.highlighted .label {
      color: var(--colors-accent);
    }

    /* Toggleable inactive label: muted */
    .container.toggleable:not(.active) .label {
      color: var(--colors-muted-foreground);
      opacity: 0.7;
    }

    /* Toggleable active label: primary */
    .container.toggleable.active .label {
      color: var(--colors-primary-text);
    }

    .value {
      position: relative;
      font-family: var(--fonts-heading);
      font-size: var(--font-sizes-h2);
      font-weight: var(--font-weights-medium);
      font-variant-numeric: tabular-nums;
      color: var(--colors-foreground);
      line-height: var(--line-heights-none);
    }

    /* Compact mode for node detail metrics */
    :host([compact]) .container {
      padding: var(--spacing-2) var(--spacing-3);
    }

    :host([compact]) .value {
      font-size: var(--font-sizes-h3);
    }

    :host([compact]) .label {
      font-size: var(--font-sizes-xs);
    }

    .value.highlighted {
      color: var(--colors-accent);
    }

    /* Toggleable inactive value: muted */
    .container.toggleable:not(.active) .value {
      color: var(--colors-muted-foreground);
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleClick() {
        if (this.toggleable) {
            this.dispatchEvent(new CustomEvent('card-toggle', {
                bubbles: true,
                composed: true,
            }));
        }
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const classes = [
            'container',
            this.highlighted ? 'highlighted' : '',
            this.toggleable ? 'toggleable' : '',
            this.active ? 'active' : '',
        ]
            .filter(Boolean)
            .join(' ');
        return { ["_$litType$"]: lit_template_1, values: [classes, this.handleClick, this.label, this.highlighted ? 'highlighted' : '', this.value] };
    }
}
__decorate([
    property({ type: String, attribute: 'label' })
], GraphStatsCard.prototype, "label", void 0);
__decorate([
    property({ type: String, attribute: 'value' })
], GraphStatsCard.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, attribute: 'highlighted' })
], GraphStatsCard.prototype, "highlighted", void 0);
__decorate([
    property({ type: Boolean, attribute: 'compact' })
], GraphStatsCard.prototype, "compact", void 0);
__decorate([
    property({ type: Boolean, attribute: 'toggleable' })
], GraphStatsCard.prototype, "toggleable", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active' })
], GraphStatsCard.prototype, "active", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-stats-card')) {
    customElements.define('xcode-graph-stats-card', GraphStatsCard);
}
//# sourceMappingURL=stats-card.js.map