import { __decorate } from "tslib";
/**
 * ClusterStats Lit Component
 *
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-stats
 *   filtered-dependencies="5"
 *   total-dependencies="10"
 *   .platforms=${platformsSet}
 *   .targetBreakdown=${{ framework: 3, library: 2, test: 1 }}
 * ></xcode-graph-cluster-stats>
 * ```
 */
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { getPlatformColor, getPlatformIconPath } from '@ui/utils/platform-icons';
import { css, html, LitElement, nothing, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import './badge.js';
import './stats-card';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="section">
        <div class="section-title">Target Breakdown</div>
        <div class="badges-grid">
          <?>
        </div>
      </div>
    `, parts: [{ type: 2, index: 3 }] };
const lit_template_2 = { h: b_1 `
              <span class="type-badge">
                <span><?></span>
                <span class="type-count"><?></span>
              </span>
            `, parts: [{ type: 1, index: 0, name: "style", strings: ["\n                  color: ", ";\n                  background-color: color-mix(in srgb, ", " 15%, transparent);\n                  border: var(--border-widths-thin) solid color-mix(in srgb, ", " 30%, transparent);\n                "], ctor: A_1 }, { type: 2, index: 2 }, { type: 2, index: 4 }] };
const lit_template_3 = { h: b_1 `
      <div class="content">
        <div class="stats-grid">
          <xcode-graph-stats-card label="Dependencies" compact="" toggleable=""></xcode-graph-stats-card>

          <xcode-graph-stats-card label="Dependents" compact="" toggleable=""></xcode-graph-stats-card>
        </div>

        <?>

        <?>
      </div>
    `, parts: [{ type: 1, index: 2, name: "value", strings: ["", "/", ""], ctor: A_1 }, { type: 1, index: 2, name: "active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 2, name: "card-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "value", strings: ["", "/", ""], ctor: A_1 }, { type: 1, index: 3, name: "active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 3, name: "card-toggle", strings: ["", ""], ctor: E_1 }, { type: 2, index: 4 }, { type: 2, index: 5 }] };
const lit_template_4 = { h: b_1 `
              <div class="section">
                <div class="section-title">Platforms (<?>)</div>
                <div class="badges-grid">
                  <?>
                </div>
              </div>
            `, parts: [{ type: 2, index: 2 }, { type: 2, index: 4 }] };
const lit_template_5 = { h: b_1 `
                      <div class="platform-badge">
                        <?>
                        <span class="platform-name">
                          <?>
                        </span>
                      </div>
                    `, parts: [{ type: 1, index: 0, name: "style", strings: ["\n                          background-color: color-mix(in srgb, ", " 15%, transparent);\n                          border-color: color-mix(in srgb, ", " 30%, transparent);\n                        "], ctor: A_1 }, { type: 2, index: 1 }, { type: 1, index: 2, name: "style", strings: ["color: ", ""], ctor: A_1 }, { type: 2, index: 3 }] };
const lit_template_6 = { h: b_1 `
      <div class="header">
        <span class="header-title">Metrics</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "class", strings: ["toggle-icon ", ""], ctor: A_1 }, { type: 2, index: 4 }] };
/**
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @summary Collapsible cluster metrics with stats cards and breakdowns
 *
 * @fires toggle-direct-deps - Dispatched when dependencies card is toggled
 * @fires toggle-direct-dependents - Dispatched when dependents card is toggled
 */
export class GraphClusterStats extends LitElement {
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
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .header:hover .header-title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .header-title {
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

    .content {
      margin-top: var(--spacing-2);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2);
    }

    .section {
      margin-top: var(--spacing-3);
    }

    .section-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      margin-bottom: var(--spacing-1);
    }

    .badges-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-2);
    }

    .platform-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-md);
      border: var(--border-widths-thin) solid transparent;
    }

    .platform-badge svg {
      width: var(--sizes-icon-xs);
      height: var(--sizes-icon-xs);
    }

    .platform-name {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
    }

    .type-count {
      opacity: var(--opacity-80);
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
    renderTargetBreakdown() {
        if (!this.targetBreakdown || Object.keys(this.targetBreakdown).length === 0) {
            return nothing;
        }
        const entries = Object.entries(this.targetBreakdown)
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]); // Sort by count descending
        if (entries.length === 0)
            return nothing;
        return { ["_$litType$"]: lit_template_1, values: [entries.map(([type, count]) => {
                    const color = getNodeTypeColor(type);
                    const label = getNodeTypeLabel(type);
                    return { ["_$litType$"]: lit_template_2, values: [color, color, color, label, count] };
                })] };
    }
    renderExpandedContent() {
        const platformCount = this.platforms?.size || 0;
        return { ["_$litType$"]: lit_template_3, values: [this.filteredDependencies, this.totalDependencies, this.activeDirectDeps, () => this.handleCardToggle('toggle-direct-deps'), this.filteredDependents, this.totalDependents, this.activeDirectDependents, () => this.handleCardToggle('toggle-direct-dependents'), this.renderTargetBreakdown(), platformCount > 0
                    ? { ["_$litType$"]: lit_template_4, values: [platformCount, Array.from(this.platforms).map((platform) => {
                                const color = getPlatformColor(platform);
                                const iconPath = getPlatformIconPath(platform);
                                return { ["_$litType$"]: lit_template_5, values: [color, color, iconPath
                                            ? svg `
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="${color}">
                                <path d="${iconPath}" />
                              </svg>
                            `
                                            : '', color, platform] };
                            })] } : nothing] };
    }
    render() {
        return { ["_$litType$"]: lit_template_6, values: [this.toggleExpanded, this.isExpanded ? 'expanded' : '', this.isExpanded ? this.renderExpandedContent() : nothing] };
    }
}
__decorate([
    property({ type: Number, attribute: 'filtered-dependencies' })
], GraphClusterStats.prototype, "filteredDependencies", void 0);
__decorate([
    property({ type: Number, attribute: 'total-dependencies' })
], GraphClusterStats.prototype, "totalDependencies", void 0);
__decorate([
    property({ type: Number, attribute: 'filtered-dependents' })
], GraphClusterStats.prototype, "filteredDependents", void 0);
__decorate([
    property({ type: Number, attribute: 'total-dependents' })
], GraphClusterStats.prototype, "totalDependents", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-direct-deps' })
], GraphClusterStats.prototype, "activeDirectDeps", void 0);
__decorate([
    property({ type: Boolean, attribute: 'active-direct-dependents' })
], GraphClusterStats.prototype, "activeDirectDependents", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterStats.prototype, "platforms", void 0);
__decorate([
    property({ attribute: false })
], GraphClusterStats.prototype, "targetBreakdown", void 0);
__decorate([
    property({ type: Boolean })
], GraphClusterStats.prototype, "expanded", void 0);
__decorate([
    state()
], GraphClusterStats.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-stats')) {
    customElements.define('xcode-graph-cluster-stats', GraphClusterStats);
}
//# sourceMappingURL=cluster-stats.js.map