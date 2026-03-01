import { __decorate } from "tslib";
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import './info-row.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="code-sign-section">
        <div class="section-label">Code Signing</div>
        <div class="info-rows">
          <?>
          <?>
          <?>
        </div>
      </div>
    `, parts: [{ type: 2, index: 3 }, { type: 2, index: 4 }, { type: 2, index: 5 }] };
const lit_template_2 = { h: b_1 `
                <xcode-graph-info-row label="Identity">
                  <span class="truncated">
                    <?>
                  </span>
                </xcode-graph-info-row>
              `, parts: [{ type: 1, index: 1, name: "title", strings: ["", ""], ctor: A_1 }, { type: 2, index: 2 }] };
const lit_template_3 = { h: b_1 `
                <xcode-graph-info-row label="Team">
                </xcode-graph-info-row>
              `, parts: [{ type: 1, index: 0, name: "value", strings: ["", ""], ctor: A_1 }] };
const lit_template_4 = { h: b_1 `
                <xcode-graph-info-row label="Profile">
                  <span class="truncated">
                    <?>
                  </span>
                </xcode-graph-info-row>
              `, parts: [{ type: 1, index: 1, name: "title", strings: ["", ""], ctor: A_1 }, { type: 2, index: 2 }] };
const lit_template_5 = { h: b_1 `
      <div class="content">
        <div class="info-rows">
          <?>
          <?>
        </div>

        <?>
      </div>
    `, parts: [{ type: 2, index: 2 }, { type: 2, index: 3 }, { type: 2, index: 4 }] };
const lit_template_6 = { h: b_1 `
                <xcode-graph-info-row label="Swift Version">
                </xcode-graph-info-row>
              `, parts: [{ type: 1, index: 0, name: "value", strings: ["", ""], ctor: A_1 }] };
const lit_template_7 = { h: b_1 `
                <xcode-graph-info-row label="Conditions">
                  <div class="conditions">
                    <?>
                  </div>
                </xcode-graph-info-row>
              `, parts: [{ type: 2, index: 2 }] };
const lit_template_8 = { h: b_1 `<span class="condition-badge"><?></span>`, parts: [{ type: 2, index: 1 }] };
const lit_template_9 = { h: b_1 `
      <div class="header">
        <span class="title">Build Settings</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <?>
    `, parts: [{ type: 1, index: 0, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "class", strings: ["toggle-icon ", ""], ctor: A_1 }, { type: 2, index: 4 }] };
/**
 * Displays curated build settings for a node, showing key configuration
 * like Swift version, compilation conditions, and code signing.
 *
 * @summary Collapsible build settings display for a node
 */
export class GraphBuildSettings extends LitElement {
    constructor() {
        super();
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
      margin-top: var(--spacing-3);
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .conditions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
    }

    .condition-badge {
      display: inline-flex;
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--colors-muted);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }

    .code-sign-section {
      margin-top: var(--spacing-3);
      padding-top: var(--spacing-3);
      border-top: var(--border-widths-thin) solid var(--colors-border);
    }

    .section-label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--spacing-2);
    }

    .truncated {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
    get hasSettings() {
        return !!this.settings && Object.keys(this.settings).length > 0;
    }
    get hasCodeSignSettings() {
        if (!this.settings)
            return false;
        return !!(this.settings.codeSignIdentity ||
            this.settings.developmentTeam ||
            this.settings.provisioningProfile);
    }
    // ========================================
    // Render
    // ========================================
    renderCodeSignSection() {
        if (!this.hasCodeSignSettings)
            return nothing;
        const settings = this.settings;
        if (!settings)
            return nothing;
        return { ["_$litType$"]: lit_template_1, values: [settings.codeSignIdentity
                    ? { ["_$litType$"]: lit_template_2, values: [settings.codeSignIdentity, settings.codeSignIdentity] } : nothing, settings.developmentTeam
                    ? { ["_$litType$"]: lit_template_3, values: [settings.developmentTeam] } : nothing, settings.provisioningProfile
                    ? { ["_$litType$"]: lit_template_4, values: [settings.provisioningProfile, settings.provisioningProfile] } : nothing] };
    }
    renderExpandedContent() {
        const settings = this.settings;
        if (!settings)
            return nothing;
        return { ["_$litType$"]: lit_template_5, values: [settings.swiftVersion
                    ? { ["_$litType$"]: lit_template_6, values: [settings.swiftVersion] } : nothing, settings.compilationConditions && settings.compilationConditions.length > 0
                    ? { ["_$litType$"]: lit_template_7, values: [settings.compilationConditions.map((condition) => ({ ["_$litType$"]: lit_template_8, values: [condition] }))] } : nothing, this.renderCodeSignSection()] };
    }
    render() {
        if (!this.hasSettings)
            return nothing;
        return { ["_$litType$"]: lit_template_9, values: [this.toggleExpanded, this.isExpanded ? 'expanded' : '', this.isExpanded ? this.renderExpandedContent() : nothing] };
    }
}
__decorate([
    property({ attribute: false })
], GraphBuildSettings.prototype, "settings", void 0);
__decorate([
    property({ type: Boolean })
], GraphBuildSettings.prototype, "expanded", void 0);
__decorate([
    state()
], GraphBuildSettings.prototype, "isExpanded", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-build-settings')) {
    customElements.define('xcode-graph-build-settings', GraphBuildSettings);
}
//# sourceMappingURL=build-settings.js.map