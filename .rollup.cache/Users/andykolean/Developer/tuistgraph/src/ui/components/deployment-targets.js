import { __decorate } from "tslib";
import { getPlatformColor } from '@ui/utils/platform-icons';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import './badge.js';
/** Destination display labels and colors */
const DESTINATION_CONFIG = {
    iPhone: { label: 'iPhone', color: '#007AFF' },
    iPad: { label: 'iPad', color: '#5856D6' },
    mac: { label: 'Mac', color: '#64D2FF' },
    macCatalyst: { label: 'Mac Catalyst', color: '#FF9500' },
    macWithiPadDesign: { label: 'Mac (iPad Design)', color: '#FF9500' },
    appleTv: { label: 'Apple TV', color: '#B87BFF' },
    appleWatch: { label: 'Apple Watch', color: '#5AC8FA' },
    appleVision: { label: 'Apple Vision', color: '#7D7AFF' },
    appleVisionWithiPadDesign: { label: 'Vision (iPad Design)', color: '#7D7AFF' },
};
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="section">
        <?>
        <div class="badges">
          <?>
        </div>
      </div>
    `, parts: [{ type: 2, index: 1 }, { type: 2, index: 3 }] };
const lit_template_2 = { h: b_1 `<div class="section-title">Min OS Versions</div>`, parts: [] };
const lit_template_3 = { h: b_1 `
              <span class="platform-badge">
                <span class="platform-name"><?></span>
                <span class="platform-version"><?>+</span>
              </span>
            `, parts: [{ type: 1, index: 0, name: "style", strings: ["", ""], ctor: A_1 }, { type: 2, index: 2 }, { type: 2, index: 4 }] };
const lit_template_4 = { h: b_1 `
      <div class="section">
        <?>
        <div class="badges">
          <?>
        </div>
      </div>
    `, parts: [{ type: 2, index: 1 }, { type: 2, index: 3 }] };
const lit_template_5 = { h: b_1 `<div class="section-title">Destinations</div>`, parts: [] };
const lit_template_6 = { h: b_1 `
              <xcode-graph-badge variant="rounded" size="sm"></xcode-graph-badge>
            `, parts: [{ type: 1, index: 0, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: A_1 }] };
const lit_template_7 = { h: b_1 ` <?> <?> `, parts: [{ type: 2, index: 0 }, { type: 2, index: 1 }] };
/**
 * Displays platform deployment targets (minimum OS versions) and
 * supported destinations (device types) for a node.
 *
 * @summary Platform deployment targets and destination badges
 */
export class GraphDeploymentTargets extends LitElement {
    constructor() {
        super();
        this.compact = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
    }

    .section {
      margin-bottom: var(--spacing-3);
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--spacing-2);
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
    }

    .platform-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--platform-bg);
      border: var(--border-widths-thin) solid var(--platform-border);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--platform-color);
    }

    .platform-name {
      font-weight: var(--font-weights-semibold);
    }

    .platform-version {
      opacity: 0.8;
    }

    /* Compact mode */
    :host([compact]) .section-title {
      display: none;
    }

    :host([compact]) .section {
      margin-bottom: var(--spacing-1);
    }
  `;
    // ========================================
    // Render Helpers
    // ========================================
    renderPlatformTargets() {
        if (!this.deploymentTargets)
            return nothing;
        const platforms = Object.entries(this.deploymentTargets).filter(([, version]) => version != null);
        if (platforms.length === 0)
            return nothing;
        return { ["_$litType$"]: lit_template_1, values: [when(!this.compact, () => ({ ["_$litType$"]: lit_template_2, values: [] })), repeat(platforms, ([platform]) => platform, ([platform, version]) => {
                    const color = getPlatformColor(platform);
                    return { ["_$litType$"]: lit_template_3, values: [styleMap({
                                '--platform-color': color,
                                '--platform-bg': `${color}15`,
                                '--platform-border': `${color}30`,
                            }), platform, version] };
                })] };
    }
    renderDestinations() {
        if (!this.destinations || this.destinations.length === 0)
            return nothing;
        return { ["_$litType$"]: lit_template_4, values: [when(!this.compact, () => ({ ["_$litType$"]: lit_template_5, values: [] })), repeat(this.destinations, (dest) => dest, (dest) => {
                    const config = DESTINATION_CONFIG[dest] || { label: dest, color: '#8E8E93' };
                    return { ["_$litType$"]: lit_template_6, values: [config.label, config.color] };
                })] };
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const hasPlatforms = this.deploymentTargets && Object.values(this.deploymentTargets).some((v) => v != null);
        const hasDestinations = this.destinations && this.destinations.length > 0;
        if (!hasPlatforms && !hasDestinations) {
            return nothing;
        }
        return { ["_$litType$"]: lit_template_7, values: [this.renderPlatformTargets(), this.renderDestinations()] };
    }
}
__decorate([
    property({ attribute: false })
], GraphDeploymentTargets.prototype, "deploymentTargets", void 0);
__decorate([
    property({ attribute: false })
], GraphDeploymentTargets.prototype, "destinations", void 0);
__decorate([
    property({ type: Boolean })
], GraphDeploymentTargets.prototype, "compact", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-deployment-targets')) {
    customElements.define('xcode-graph-deployment-targets', GraphDeploymentTargets);
}
//# sourceMappingURL=deployment-targets.js.map