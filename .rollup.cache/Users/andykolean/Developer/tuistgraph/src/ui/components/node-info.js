import { __decorate } from "tslib";
/**
 * NodeInfo Lit Component
 *
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @example
 * ```html
 * <xcode-graph-node-info .node=${nodeData}></xcode-graph-node-info>
 * ```
 */
import { Origin } from '@shared/schemas/graph.types';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import './deployment-targets.js';
import './info-row.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="section">
        <div class="title">Foreign Build</div>
        <div class="info-rows">
          <xcode-graph-info-row label="Output"></xcode-graph-info-row>
          <xcode-graph-info-row label="Linking"></xcode-graph-info-row>
          <xcode-graph-info-row label="Inputs">
            <?>
            <?>
            <?>
            <?>
          </xcode-graph-info-row>
        </div>
        <div><?></div>
        <button class="expand-toggle"><?> script</button>
      </div>
    `, parts: [{ type: 1, index: 3, name: "value", strings: ["", ""], ctor: A_1 }, { type: 1, index: 4, name: "value", strings: ["", ""], ctor: A_1 }, { type: 2, index: 6 }, { type: 2, index: 7 }, { type: 2, index: 8 }, { type: 2, index: 9 }, { type: 1, index: 10, name: "class", strings: ["script-block ", ""], ctor: A_1 }, { type: 2, index: 11 }, { type: 1, index: 12, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 13 }] };
const lit_template_2 = { h: b_1 `<span class="input-badge"><?> files</span>`, parts: [{ type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `<span class="input-badge"><?> folders</span>`, parts: [{ type: 2, index: 1 }] };
const lit_template_4 = { h: b_1 `<span class="input-badge"><?> scripts</span>`, parts: [{ type: 2, index: 1 }] };
const lit_template_5 = { h: b_1 `
      <div class="content">
        <div class="section">
          <div class="title">Node Info</div>
          <div class="info-rows">
            <xcode-graph-info-row label="Platform"></xcode-graph-info-row>
            <xcode-graph-info-row label="Origin"></xcode-graph-info-row>
            <xcode-graph-info-row label="Type"></xcode-graph-info-row>
            <?>
            <?>
          </div>
        </div>

        <?>

        <?>

        <?>
      </div>
    `, parts: [{ type: 1, index: 4, name: "value", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "value", strings: ["", ""], ctor: A_1 }, { type: 1, index: 6, name: "value", strings: ["", ""], ctor: A_1 }, { type: 2, index: 7 }, { type: 2, index: 8 }, { type: 2, index: 9 }, { type: 2, index: 10 }, { type: 2, index: 11 }] };
const lit_template_6 = { h: b_1 `<xcode-graph-info-row label="Product"></xcode-graph-info-row>`, parts: [{ type: 1, index: 0, name: "value", strings: ["", ""], ctor: A_1 }] };
const lit_template_7 = { h: b_1 `<xcode-graph-info-row label="Bundle ID">
                  <span class="bundle-id"><?></span>
                </xcode-graph-info-row>`, parts: [{ type: 2, index: 2 }] };
const lit_template_8 = { h: b_1 `
            <div class="section">
              <div class="title">Platform Support</div>
              <xcode-graph-deployment-targets></xcode-graph-deployment-targets>
            </div>
          `, parts: [{ type: 1, index: 2, name: "deploymentTargets", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "destinations", strings: ["", ""], ctor: P_1 }] };
const lit_template_9 = { h: b_1 `
            <div class="section">
              <div class="title">Contents</div>
              <div class="info-rows">
                <?>
                <?>
              </div>
            </div>
          `, parts: [{ type: 2, index: 3 }, { type: 2, index: 4 }] };
const lit_template_10 = { h: b_1 `<xcode-graph-info-row label="Source Files"></xcode-graph-info-row>`, parts: [{ type: 1, index: 0, name: "value", strings: ["", ""], ctor: A_1 }] };
const lit_template_11 = { h: b_1 `<xcode-graph-info-row label="Resources"></xcode-graph-info-row>`, parts: [{ type: 1, index: 0, name: "value", strings: ["", ""], ctor: A_1 }] };
const lit_template_12 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_13 = { h: b_1 `
      <div class="header">
        <span class="header-title">Details</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "class", strings: ["toggle-icon ", ""], ctor: A_1 }, { type: 2, index: 4 }] };
/**
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @summary Collapsible node information details section
 */
export class GraphNodeInfo extends LitElement {
    constructor() {
        super();
        this.expanded = true;
        this.isExpanded = true;
        this.scriptExpanded = false;
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
      margin-top: var(--spacing-3);
    }

    .section {
      margin-bottom: var(--spacing-3);
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .title {
      margin-bottom: var(--spacing-2);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .bundle-id {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .script-block {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      background: var(--colors-muted);
      border-radius: var(--radii-sm);
      padding: var(--spacing-2);
      margin-top: var(--spacing-2);
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 80px;
      transition: max-height 0.2s ease;
    }

    .script-block.expanded {
      max-height: none;
    }

    .expand-toggle {
      display: inline-block;
      margin-top: var(--spacing-1);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-primary);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
    }

    .expand-toggle:hover {
      text-decoration: underline;
    }

    .input-badge {
      display: inline-block;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      background: var(--colors-muted);
      border-radius: var(--radii-sm);
      padding: 1px var(--spacing-1);
      margin-left: var(--spacing-1);
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
    get originLabel() {
        return this.node.origin === Origin.Local ? 'Local Project' : 'External Package';
    }
    get hasDeploymentTargets() {
        return (!!this.node.deploymentTargets &&
            Object.values(this.node.deploymentTargets).some((v) => v != null));
    }
    get hasDestinations() {
        return !!this.node.destinations && this.node.destinations.length > 0;
    }
    // ========================================
    // Render
    // ========================================
    renderForeignBuild() {
        const fb = this.node.foreignBuild;
        if (!fb)
            return nothing;
        return { ["_$litType$"]: lit_template_1, values: [fb.outputPath, fb.outputLinking, String(fb.inputCount), fb.inputs.files.length > 0 ? { ["_$litType$"]: lit_template_2, values: [fb.inputs.files.length] } : nothing, fb.inputs.folders.length > 0 ? { ["_$litType$"]: lit_template_3, values: [fb.inputs.folders.length] } : nothing, fb.inputs.scripts.length > 0 ? { ["_$litType$"]: lit_template_4, values: [fb.inputs.scripts.length] } : nothing, this.scriptExpanded ? 'expanded' : '', fb.script, () => {
                    this.scriptExpanded = !this.scriptExpanded;
                }, this.scriptExpanded ? 'Collapse' : 'Expand'] };
    }
    renderExpandedContent() {
        const showProductName = this.node.productName && this.node.productName !== this.node.name;
        const showBundleId = !!this.node.bundleId;
        const showDeploymentTargets = this.hasDeploymentTargets || this.hasDestinations;
        const showSourceCount = this.node.sourceCount != null && this.node.sourceCount > 0;
        const showResourceCount = this.node.resourceCount != null && this.node.resourceCount > 0;
        return { ["_$litType$"]: lit_template_5, values: [this.node.platform, this.originLabel, getNodeTypeLabel(this.node.type), showProductName && this.node.productName
                    ? { ["_$litType$"]: lit_template_6, values: [this.node.productName] } : nothing, showBundleId
                    ? { ["_$litType$"]: lit_template_7, values: [this.node.bundleId] } : nothing, showDeploymentTargets
                    ? { ["_$litType$"]: lit_template_8, values: [this.node.deploymentTargets, this.node.destinations] } : nothing, showSourceCount || showResourceCount
                    ? { ["_$litType$"]: lit_template_9, values: [showSourceCount
                                ? { ["_$litType$"]: lit_template_10, values: [String(this.node.sourceCount)] } : nothing, showResourceCount
                                ? { ["_$litType$"]: lit_template_11, values: [String(this.node.resourceCount)] } : nothing] } : nothing, this.renderForeignBuild()] };
    }
    render() {
        if (!this.node)
            return { ["_$litType$"]: lit_template_12, values: [] };
        return { ["_$litType$"]: lit_template_13, values: [this.toggleExpanded, this.isExpanded ? 'expanded' : '', this.isExpanded ? this.renderExpandedContent() : nothing] };
    }
}
__decorate([
    property({ attribute: false })
], GraphNodeInfo.prototype, "node", void 0);
__decorate([
    property({ type: Boolean })
], GraphNodeInfo.prototype, "expanded", void 0);
__decorate([
    state()
], GraphNodeInfo.prototype, "isExpanded", void 0);
__decorate([
    state()
], GraphNodeInfo.prototype, "scriptExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-info')) {
    customElements.define('xcode-graph-node-info', GraphNodeInfo);
}
//# sourceMappingURL=node-info.js.map