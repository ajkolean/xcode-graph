import { __decorate } from "tslib";
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import './section-header.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="header">
        <span class="title">Composition</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "class", strings: ["", ""], ctor: A_1 }, { type: 2, index: 4 }] };
const lit_template_2 = { h: b_1 `
            <div class="content">
              <div class="stats-row">
                <span class="stat-label">Total Source Files</span>
                <span class="stat-value"><?></span>
              </div>

              <div class="stats-row">
                <span class="stat-label">Total Resources</span>
                <span class="stat-value"><?></span>
              </div>

              <?>

              <?>
            </div>
          `, parts: [{ type: 2, index: 4 }, { type: 2, index: 8 }, { type: 2, index: 9 }, { type: 2, index: 10 }] };
const lit_template_3 = { h: b_1 `
                    <div class="notable-resources">
                      <?>
                      <?>
                    </div>
                  `, parts: [{ type: 2, index: 1 }, { type: 2, index: 2 }] };
const lit_template_4 = { h: b_1 `<span class="resource-badge privacy">Privacy Manifest</span>`, parts: [] };
const lit_template_5 = { h: b_1 `<span class="resource-badge"><?></span>`, parts: [{ type: 2, index: 1 }] };
const lit_template_6 = { h: b_1 `
                    <div class="section-divider"></div>
                    <div class="sub-title">Largest Targets</div>
                    <div class="largest-targets">
                      <?>
                    </div>
                  `, parts: [{ type: 2, index: 3 }] };
const lit_template_7 = { h: b_1 `
                          <div class="target-row">
                            <span class="target-name"><?></span>
                            <span class="target-count"><?> files</span>
                          </div>
                        `, parts: [{ type: 1, index: 1, name: "title", strings: ["", ""], ctor: A_1 }, { type: 2, index: 2 }, { type: 2, index: 4 }] };
/**
 * Shows composition statistics for a cluster including total source files,
 * total resources (with notable ones highlighted), and largest targets by source count.
 *
 * @summary Collapsible cluster composition statistics
 */
export class GraphClusterComposition extends LitElement {
    constructor() {
        super();
        this.nodes = [];
        this.expanded = false;
        this.isExpanded = false;
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

    .content {
      margin-top: var(--spacing-2);
    }

    .stats-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 0;
    }

    .stat-label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
    }

    .stat-value {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
    }

    .notable-resources {
      margin-top: var(--spacing-2);
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
    }

    .resource-badge {
      display: inline-flex;
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--colors-muted);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }

    .resource-badge.privacy {
      background-color: color-mix(in srgb, var(--colors-success) 15%, transparent);
      color: var(--colors-success);
    }

    .section-divider {
      height: 1px;
      background-color: var(--colors-border);
      margin: var(--spacing-2) 0;
    }

    .largest-targets {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .target-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .target-name {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 180px;
    }

    .target-count {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }

    .sub-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--spacing-2);
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
    get totalSources() {
        return this.nodes.reduce((sum, node) => sum + (node.sourceCount || 0), 0);
    }
    get totalResources() {
        return this.nodes.reduce((sum, node) => sum + (node.resourceCount || 0), 0);
    }
    get notableResources() {
        const notable = new Set();
        for (const node of this.nodes) {
            if (node.notableResources) {
                for (const resource of node.notableResources) {
                    notable.add(resource);
                }
            }
        }
        return notable;
    }
    get hasPrivacyManifest() {
        return this.notableResources.has('PrivacyInfo.xcprivacy');
    }
    get largestTargets() {
        return this.nodes
            .filter((node) => (node.sourceCount || 0) > 0)
            .map((node) => ({ name: node.name, count: node.sourceCount || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    get hasContent() {
        return this.totalSources > 0 || this.totalResources > 0;
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.hasContent)
            return nothing;
        return { ["_$litType$"]: lit_template_1, values: [this.toggleExpanded, classMap({ 'toggle-icon': true, expanded: this.isExpanded }), when(this.isExpanded, () => ({ ["_$litType$"]: lit_template_2, values: [this.totalSources.toLocaleString(), this.totalResources.toLocaleString(), when(this.hasPrivacyManifest || this.notableResources.size > 0, () => ({ ["_$litType$"]: lit_template_3, values: [when(this.hasPrivacyManifest, () => ({ ["_$litType$"]: lit_template_4, values: [] })), Array.from(this.notableResources)
                                    .filter((r) => r !== 'PrivacyInfo.xcprivacy')
                                    .slice(0, 3)
                                    .map((r) => ({ ["_$litType$"]: lit_template_5, values: [r] }))] })), when(this.largestTargets.length > 0, () => ({ ["_$litType$"]: lit_template_6, values: [this.largestTargets.map((target) => ({ ["_$litType$"]: lit_template_7, values: [target.name, target.name, target.count] }))] }))] }))] };
    }
}
__decorate([
    property({ attribute: false })
], GraphClusterComposition.prototype, "nodes", void 0);
__decorate([
    property({ type: Boolean })
], GraphClusterComposition.prototype, "expanded", void 0);
__decorate([
    state()
], GraphClusterComposition.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-composition')) {
    customElements.define('xcode-graph-cluster-composition', GraphClusterComposition);
}
//# sourceMappingURL=cluster-composition.js.map