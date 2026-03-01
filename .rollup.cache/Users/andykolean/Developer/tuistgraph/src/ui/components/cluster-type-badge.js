import { __decorate } from "tslib";
/**
 * ClusterTypeBadge Lit Component - Mission Control Theme
 *
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-type-badge
 *   cluster-type="package"
 *   cluster-color="#F59E0B"
 * ></xcode-graph-cluster-type-badge>
 * ```
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="container">
        <xcode-graph-badge variant="accent" size="sm" interactive="" glow=""></xcode-graph-badge>
      </div>
    `, parts: [{ type: 1, index: 1, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "color", strings: ["", ""], ctor: A_1 }] };
/**
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @summary Cluster type badge showing package or project
 */
export class GraphClusterTypeBadge extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
      padding: var(--spacing-4) var(--spacing-4) var(--spacing-3);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .container {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    get badgeLabel() {
        return this.clusterType === 'package' ? 'Package' : 'Project';
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const color = this.clusterColor || '#F59E0B';
        return { ["_$litType$"]: lit_template_1, values: [this.badgeLabel, color] };
    }
}
__decorate([
    property({ type: String, attribute: 'cluster-type' })
], GraphClusterTypeBadge.prototype, "clusterType", void 0);
__decorate([
    property({ type: String, attribute: 'cluster-color' })
], GraphClusterTypeBadge.prototype, "clusterColor", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-type-badge')) {
    customElements.define('xcode-graph-cluster-type-badge', GraphClusterTypeBadge);
}
//# sourceMappingURL=cluster-type-badge.js.map