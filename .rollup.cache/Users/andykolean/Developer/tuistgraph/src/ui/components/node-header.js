import { __decorate } from "tslib";
/**
 * NodeHeader Lit Component
 *
 * Header for node details panel with icon, name, and type badges.
 * Uses graph-panel-header for consistent layout.
 *
 * @example
 * ```html
 * <xcode-graph-node-header
 *   .node=${nodeData}
 *   zoom="1.0"
 * ></xcode-graph-node-header>
 * ```
 *
 * @fires close - Dispatched when back/close button clicked
 * @fires cluster-click - Dispatched when cluster badge clicked (detail: { clusterId })
 */
import { NodeType } from '@shared/schemas/graph.types';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getNodeIconPath, getNodeTypeLabel } from '@ui/utils/node-icons';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import './badge.js';
import './panel-header.js';
import './tag-badge.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_2 = { h: b_1 `
      <xcode-graph-panel-header title-size="lg">
        <!-- Node Icon -->
        <svg slot="icon" width="24" height="24" viewBox="-18 -18 36 36">
          <?>
        </svg>

        <!-- Badges -->
        <?>
        <xcode-graph-badge slot="badges"></xcode-graph-badge>
        <?>
        <?>
      </xcode-graph-panel-header>

      <!-- Architecture Tags -->
      <?>
    `, parts: [{ type: 1, index: 0, name: "title", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "subtitle", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "back", strings: ["", ""], ctor: E_1 }, { type: 2, index: 3 }, { type: 2, index: 5 }, { type: 1, index: 6, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 6, name: "color", strings: ["", ""], ctor: A_1 }, { type: 2, index: 7 }, { type: 2, index: 8 }, { type: 2, index: 10 }] };
const lit_template_3 = { h: b_1 `
              <xcode-graph-badge slot="badges"></xcode-graph-badge>
            `, parts: [{ type: 1, index: 0, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: A_1 }] };
const lit_template_4 = { h: b_1 `
              <xcode-graph-badge slot="badges" label="Remote" color="var(--colors-warning)"></xcode-graph-badge>
            `, parts: [] };
const lit_template_5 = { h: b_1 `
              <xcode-graph-badge slot="badges" label="Foreign Build" color="var(--colors-warning)"></xcode-graph-badge>
            `, parts: [] };
const lit_template_6 = { h: b_1 `
            <div class="tags-container">
              <?>
            </div>
          `, parts: [{ type: 2, index: 1 }] };
const lit_template_7 = { h: b_1 `<xcode-graph-tag-badge></xcode-graph-tag-badge>`, parts: [{ type: 1, index: 0, name: "tag", strings: ["", ""], ctor: A_1 }] };
/**
 * Header for the node details panel with icon, name, type badges, and tags.
 * Uses graph-panel-header for consistent layout.
 *
 * @summary Node details header with icon, badges, and tags
 * @fires close - Dispatched when the back/close button is clicked
 * @fires cluster-click - Dispatched when a cluster badge is clicked (detail: { clusterId })
 */
export class GraphNodeHeader extends LitElement {
    constructor() {
        super();
        this.showClusterLink = true;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
    }

    graph-panel-header {
      --panel-header-padding: var(--spacing-md);
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
      margin-top: var(--spacing-2);
      padding: 0 var(--spacing-md);
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleBack() {
        if (this.showClusterLink) {
            const clusterId = this.node.type === NodeType.Package ? this.node.name : this.node.project;
            if (clusterId) {
                this.dispatchEvent(new CustomEvent('cluster-click', {
                    detail: { clusterId },
                    bubbles: true,
                    composed: true,
                }));
                return;
            }
        }
        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.node)
            return { ["_$litType$"]: lit_template_1, values: [] };
        const iconPath = getNodeIconPath(this.node.type, this.node.type === NodeType.App ? this.node.platform : undefined);
        const nodeTypeColor = getNodeTypeColor(this.node.type);
        const nodeDisplayColor = adjustColorForZoom(nodeTypeColor, this.zoom);
        let clusterColor;
        if (this.node.type === NodeType.Package) {
            clusterColor = generateColor(this.node.name, 'package');
        }
        else if (this.node.project) {
            clusterColor = generateColor(this.node.project, 'project');
        }
        else {
            clusterColor = nodeTypeColor;
        }
        const clusterDisplayColor = adjustColorForZoom(clusterColor, this.zoom);
        const showClusterBadge = this.node.project || this.node.type === NodeType.Package;
        const getSubtitle = () => {
            if (!showClusterBadge)
                return undefined;
            if (this.node.type === NodeType.Package)
                return this.node.name;
            return this.node.project;
        };
        const subtitle = getSubtitle();
        const clusterBadgeLabel = this.node.type === NodeType.Package ? 'Package' : 'Project';
        const hasTags = this.node.tags && this.node.tags.length > 0;
        return { ["_$litType$"]: lit_template_2, values: [this.node.name, subtitle || '', nodeDisplayColor, this.handleBack, svg `
            <path
              d="${iconPath}"
              fill="rgba(var(--colors-background-rgb), var(--opacity-95))"
              stroke="${nodeDisplayColor}"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          `, showClusterBadge
                    ? { ["_$litType$"]: lit_template_3, values: [clusterBadgeLabel, clusterDisplayColor] } : '', getNodeTypeLabel(this.node.type), nodeDisplayColor, this.node.isRemote
                    ? { ["_$litType$"]: lit_template_4, values: [] } : '', this.node.foreignBuild
                    ? { ["_$litType$"]: lit_template_5, values: [] } : '', hasTags && this.node.tags
                    ? { ["_$litType$"]: lit_template_6, values: [this.node.tags.map((tag) => ({ ["_$litType$"]: lit_template_7, values: [tag] }))] } : nothing] };
    }
}
__decorate([
    property({ attribute: false })
], GraphNodeHeader.prototype, "node", void 0);
__decorate([
    property({ type: Number })
], GraphNodeHeader.prototype, "zoom", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-cluster-link' })
], GraphNodeHeader.prototype, "showClusterLink", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-header')) {
    customElements.define('xcode-graph-node-header', GraphNodeHeader);
}
//# sourceMappingURL=node-header.js.map