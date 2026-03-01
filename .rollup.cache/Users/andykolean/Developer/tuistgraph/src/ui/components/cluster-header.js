import { __decorate } from "tslib";
/**
 * ClusterHeader Lit Component
 *
 * Header for cluster details panel with back button, icon, and cluster info.
 * Uses graph-panel-header for consistent layout.
 * Shows source type (Local/Registry/Git) and provides path copy button.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-header
 *   cluster-name="MyPackage"
 *   cluster-type="package"
 *   cluster-color="#8B5CF6"
 *   cluster-path="/path/to/package"
 *   is-external
 * ></xcode-graph-cluster-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 */
import { icons } from '@shared/controllers/icon.adapter';
import { SourceType } from '@shared/schemas/graph.types';
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './badge.js';
import './panel-header.js';
/** Source type colors and labels */
const SOURCE_TYPE_CONFIG = {
    [SourceType.Local]: { label: 'Local', color: 'var(--colors-success)' },
    [SourceType.Registry]: { label: 'Registry', color: 'var(--colors-info)' },
    [SourceType.Git]: { label: 'Git', color: 'var(--colors-primary)' },
};
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <xcode-graph-panel-header title-size="md">
        <!-- Cluster Icon -->
        <span slot="icon" class="cluster-icon">
          <?>
        </span>

        <!-- Source Type and Type Badges -->
        <xcode-graph-badge slot="badges" variant="rounded" size="sm"></xcode-graph-badge>
        <xcode-graph-badge slot="badges" variant="rounded" size="sm"></xcode-graph-badge>
      </xcode-graph-panel-header>

      <!-- Path with Copy Button -->
      <?>
    `, parts: [{ type: 1, index: 0, name: "title", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "subtitle", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "color", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "style", strings: ["color: ", ""], ctor: A_1 }, { type: 2, index: 3 }, { type: 1, index: 5, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 5, name: "color", strings: ["", ""], ctor: A_1 }, { type: 1, index: 6, name: "label", strings: ["", ""], ctor: A_1 }, { type: 1, index: 6, name: "color", strings: ["", ""], ctor: A_1 }, { type: 2, index: 8 }] };
const lit_template_2 = { h: b_1 `
            <div class="path-row">
              <span class="path-text"><?></span>
              <button>
                <?>
              </button>
            </div>
          `, parts: [{ type: 1, index: 1, name: "title", strings: ["", ""], ctor: A_1 }, { type: 2, index: 2 }, { type: 1, index: 3, name: "class", strings: ["copy-button ", ""], ctor: A_1 }, { type: 1, index: 3, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "title", strings: ["", ""], ctor: A_1 }, { type: 2, index: 4 }] };
const lit_template_3 = { h: b_1 `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>`, parts: [] };
const lit_template_4 = { h: b_1 `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>`, parts: [] };
/**
 * Header for cluster details panel with back button, icon, and cluster info.
 * Shows source type (Local/Registry/Git) and provides path copy button.
 *
 * @summary Cluster details panel header with icon, badges, and path
 *
 * @fires back - Dispatched when back button is clicked
 */
export class GraphClusterHeader extends LitElement {
    constructor() {
        super();
        this.copied = false;
    }
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: block;
    }

    .cluster-icon {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
    }

    .cluster-icon svg {
      width: 100%;
      height: 100%;
    }

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
      margin-top: var(--spacing-2);
      padding: 0 var(--spacing-md);
    }

    .path-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-md);
    }

    .path-text {
      flex: 1;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .copy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-1);
      background: transparent;
      border: none;
      border-radius: var(--radii-sm);
      cursor: pointer;
      color: var(--colors-muted-foreground);
      transition:
        background-color var(--durations-fast) var(--easings-out),
        color var(--durations-fast) var(--easings-out);
    }

    .copy-button:hover {
      background-color: var(--colors-muted);
      color: var(--colors-foreground);
    }

    .copy-button.copied {
      color: var(--colors-success);
    }

    .copy-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .copy-button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }
  `;
    // ========================================
    // Helpers
    // ========================================
    getSourceType() {
        if (!this.clusterPath)
            return SourceType.Local;
        if (this.clusterPath.includes('.build/registry/downloads/')) {
            return SourceType.Registry;
        }
        if (this.clusterPath.includes('.build/checkouts/')) {
            return SourceType.Git;
        }
        return SourceType.Local;
    }
    getShortPath() {
        if (!this.clusterPath)
            return '';
        // Try to extract a meaningful short path
        const registryMatch = this.clusterPath.match(/\.build\/registry\/downloads\/([^/]+\/[^/]+)/);
        if (registryMatch)
            return registryMatch[1] ?? '';
        const checkoutMatch = this.clusterPath.match(/\.build\/checkouts\/([^/]+)/);
        if (checkoutMatch)
            return checkoutMatch[1] ?? '';
        // For local paths, show last 2-3 segments
        const segments = this.clusterPath.split('/').filter(Boolean);
        return segments.slice(-3).join('/');
    }
    async handleCopyPath() {
        if (!this.clusterPath)
            return;
        try {
            await navigator.clipboard.writeText(this.clusterPath);
            this.copied = true;
            setTimeout(() => {
                this.copied = false;
            }, 2000);
        }
        catch {
            // Fallback: just ignore if clipboard not available
        }
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const isPackage = this.clusterType === 'package';
        const clusterIcon = isPackage ? icons.Package : icons.Folder;
        const color = this.clusterColor || '#8B5CF6';
        const sourceType = this.getSourceType();
        const sourceConfig = SOURCE_TYPE_CONFIG[sourceType];
        const shortPath = this.getShortPath();
        return { ["_$litType$"]: lit_template_1, values: [this.clusterName, this.isExternal ? 'External' : 'Internal', color, color, unsafeHTML(clusterIcon), isPackage ? 'Package' : 'Project', color, sourceConfig?.label ?? '', sourceConfig?.color ?? 'var(--colors-muted-foreground)', shortPath
                    ? { ["_$litType$"]: lit_template_2, values: [this.clusterPath, shortPath, this.copied ? 'copied' : '', this.handleCopyPath, this.copied ? 'Copied!' : 'Copy full path', this.copied
                                ? { ["_$litType$"]: lit_template_3, values: [] } : { ["_$litType$"]: lit_template_4, values: [] }] } : nothing] };
    }
}
__decorate([
    property({ type: String, attribute: 'cluster-name' })
], GraphClusterHeader.prototype, "clusterName", void 0);
__decorate([
    property({ type: String, attribute: 'cluster-type' })
], GraphClusterHeader.prototype, "clusterType", void 0);
__decorate([
    property({ type: String, attribute: 'cluster-color' })
], GraphClusterHeader.prototype, "clusterColor", void 0);
__decorate([
    property({ type: String, attribute: 'cluster-path' })
], GraphClusterHeader.prototype, "clusterPath", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-external' })
], GraphClusterHeader.prototype, "isExternal", void 0);
__decorate([
    state()
], GraphClusterHeader.prototype, "copied", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-header')) {
    customElements.define('xcode-graph-cluster-header', GraphClusterHeader);
}
//# sourceMappingURL=cluster-header.js.map