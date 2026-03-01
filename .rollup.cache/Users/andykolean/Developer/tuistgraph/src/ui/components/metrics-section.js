import { __decorate } from "tslib";
/**
 * MetricsSection Lit Component
 *
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @example
 * ```html
 * <xcode-graph-metrics-section
 *   dependencies-count="5"
 *   total-dependencies-count="10"
 *   active-direct-deps
 * ></xcode-graph-metrics-section>
 * ```
 */
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import './stats-card';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="header">
        <span class="title">Metrics</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 4 }] };
const lit_template_2 = { h: b_1 `
          <div class="grid">
            <xcode-graph-stats-card label="Dependencies" compact="" toggleable=""></xcode-graph-stats-card>

            <xcode-graph-stats-card label="Dependents" compact="" toggleable=""></xcode-graph-stats-card>

            <xcode-graph-stats-card label="Transitive Dependencies" compact="" toggleable=""></xcode-graph-stats-card>

            <xcode-graph-stats-card label="Transitive Dependents" compact="" toggleable=""></xcode-graph-stats-card>
          </div>
        `, parts: [{ type: 1, index: 1, name: "value", strings: ["", "/", ""], ctor: A_1 }, { type: 1, index: 1, name: "active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "card-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "value", strings: ["", "/", ""], ctor: A_1 }, { type: 1, index: 2, name: "active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 2, name: "card-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "value", strings: ["", ""], ctor: A_1 }, { type: 1, index: 3, name: "active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 3, name: "card-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "value", strings: ["", ""], ctor: A_1 }, { type: 1, index: 4, name: "active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 4, name: "card-toggle", strings: ["", ""], ctor: E_1 }] };
/**
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @summary Metrics grid with toggleable stats cards
 * @fires toggle-direct-deps - Dispatched when direct dependencies card is toggled
 * @fires toggle-transitive-deps - Dispatched when transitive dependencies card is toggled
 * @fires toggle-direct-dependents - Dispatched when direct dependents card is toggled
 * @fires toggle-transitive-dependents - Dispatched when transitive dependents card is toggled
 */
export class GraphMetricsSection extends LitElement {
    constructor() {
        super();
        this.expanded = true;
        this.isExpanded = true;
    }
    connectedCallback() {
        super.connectedCallback();
        this.isExpanded = this.expanded;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
      flex-shrink: 0;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .header:hover .title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-muted-foreground);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .toggle-icon {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      color: var(--colors-muted-foreground);
      opacity: var(--opacity-40);
      transition: transform var(--durations-fast) var(--easings-out), color var(--durations-normal), opacity var(--durations-normal);
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
    handleCardToggle(card) {
        this.dispatchEvent(new CustomEvent(card, {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        return { ["_$litType$"]: lit_template_1, values: [this.toggleExpanded, classMap({ 'toggle-icon': true, expanded: this.isExpanded }), when(this.isExpanded, () => ({ ["_$litType$"]: lit_template_2, values: [this.dependenciesCount, this.totalDependenciesCount, this.activeDirectDeps, () => this.handleCardToggle('toggle-direct-deps'), this.dependentsCount, this.totalDependentsCount, this.activeDirectDependents, () => this.handleCardToggle('toggle-direct-dependents'), this.transitiveDependenciesCount, this.activeTransitiveDeps, () => this.handleCardToggle('toggle-transitive-deps'), this.transitiveDependentsCount, this.activeTransitiveDependents, () => this.handleCardToggle('toggle-transitive-dependents')] }))] };
    }
}
__decorate([
    property({ type: Number, attribute: 'dependencies-count' })
], GraphMetricsSection.prototype, "dependenciesCount", void 0);
__decorate([
    property({ type: Number, attribute: 'dependents-count' })
], GraphMetricsSection.prototype, "dependentsCount", void 0);
__decorate([
    property({ type: Number, attribute: 'total-dependencies-count' })
], GraphMetricsSection.prototype, "totalDependenciesCount", void 0);
__decorate([
    property({ type: Number, attribute: 'total-dependents-count' })
], GraphMetricsSection.prototype, "totalDependentsCount", void 0);
__decorate([
    property({ type: Number, attribute: 'transitive-dependencies-count' })
], GraphMetricsSection.prototype, "transitiveDependenciesCount", void 0);
__decorate([
    property({ type: Number, attribute: 'transitive-dependents-count' })
], GraphMetricsSection.prototype, "transitiveDependentsCount", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-high-fan-in' })
], GraphMetricsSection.prototype, "isHighFanIn", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-high-fan-out' })
], GraphMetricsSection.prototype, "isHighFanOut", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-direct-deps' })
], GraphMetricsSection.prototype, "activeDirectDeps", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-transitive-deps' })
], GraphMetricsSection.prototype, "activeTransitiveDeps", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-direct-dependents' })
], GraphMetricsSection.prototype, "activeDirectDependents", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-transitive-dependents' })
], GraphMetricsSection.prototype, "activeTransitiveDependents", void 0);
__decorate([
    property({ type: Boolean })
], GraphMetricsSection.prototype, "expanded", void 0);
__decorate([
    state()
], GraphMetricsSection.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-metrics-section')) {
    customElements.define('xcode-graph-metrics-section', GraphMetricsSection);
}
//# sourceMappingURL=metrics-section.js.map