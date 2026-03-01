import { __decorate } from "tslib";
import { css, html, LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <!-- Product Types -->
      <button class="icon-button" title="Product Types">
        <?>
        <?>
      </button>

      <!-- Platforms -->
      <button class="icon-button" title="Platforms">
        <?>
        <?>
      </button>

      <!-- Projects -->
      <button class="icon-button" title="Projects">
        <?>
        <?>
      </button>

      <!-- Packages -->
      <button class="icon-button" title="Packages">
        <?>
        <?>
      </button>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat">
          <div class="stat-value"><?></div>
          <div class="stat-label">NODES</div>
        </div>

        <div class="stat">
          <div class="stat-value"><?></div>
          <div class="stat-label">EDGES</div>
        </div>
      </div>
    `, parts: [{ type: 1, index: 1, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 2 }, { type: 2, index: 3 }, { type: 1, index: 5, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 6 }, { type: 2, index: 7 }, { type: 1, index: 9, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 10 }, { type: 2, index: 11 }, { type: 1, index: 13, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 14 }, { type: 2, index: 15 }, { type: 2, index: 20 }, { type: 2, index: 24 }] };
const lit_template_2 = { h: b_1 `<div class="badge"><?></div>`, parts: [{ type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `<div class="badge"><?></div>`, parts: [{ type: 2, index: 1 }] };
const lit_template_4 = { h: b_1 `<div class="badge"><?></div>`, parts: [{ type: 2, index: 1 }] };
const lit_template_5 = { h: b_1 `<div class="badge"><?></div>`, parts: [{ type: 2, index: 1 }] };
/**
 * Vertical icon bar shown when sidebar is collapsed.
 * Displays filter section icons with active filter badges.
 *
 * @summary Collapsed sidebar icon bar with filter badges
 *
 * @fires expand-to-section - Dispatched when a section icon is clicked (detail: { section })
 */
export class GraphCollapsedSidebar extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md) 0;
      gap: var(--spacing-md);
    }

    .icon-button {
      position: relative;
      padding: var(--spacing-2);
      border-radius: var(--radii-md);
      transition:
        background-color var(--durations-normal),
        opacity var(--durations-normal);
      background: none;
      border: none;
      color: var(--colors-primary-text);
      cursor: pointer;
    }

    .icon-button:hover {
      background-color: rgba(var(--colors-primary-rgb), var(--opacity-10));
    }

    .icon-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .icon-button svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
      stroke: currentColor;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      border-radius: var(--radii-full);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(var(--colors-primary-rgb), var(--opacity-30));
      border: var(--border-widths-thin) solid rgba(var(--colors-primary-rgb), var(--opacity-50));
      font-size: var(--font-sizes-xs);
      font-family: var(--fonts-body);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-primary-text);
    }

    .divider {
      width: var(--spacing-8);
      height: var(--border-widths-thin);
      background-color: var(--colors-border);
    }

    .stats-section {
      border-top: 1px solid var(--colors-border);
      padding-top: var(--spacing-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
      border-radius: var(--radii-sm);
      background: var(--colors-card);
    }

    .stat-value {
      text-align: center;
      font-size: var(--font-sizes-xs);
      font-family: var(--fonts-body);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
    }

    .stat-label {
      text-align: center;
      font-size: var(--font-sizes-xs);
      font-family: var(--fonts-mono);
      letter-spacing: var(--letter-spacing-wider);
      color: var(--colors-muted-foreground);
    }
  `;
    // ========================================
    // Event Handlers
    // ========================================
    handleExpandToSection(section) {
        this.dispatchEvent(new CustomEvent('expand-to-section', {
            detail: { section },
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Helpers
    // ========================================
    renderProductTypesIcon() {
        return svg `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    `;
    }
    renderPlatformsIcon() {
        return svg `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    `;
    }
    renderProjectsIcon() {
        return svg `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    `;
    }
    renderPackagesIcon() {
        return svg `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    `;
    }
    // ========================================
    // Render
    // ========================================
    render() {
        const showProductTypesBadge = this.nodeTypesFilterSize < (this.typeCounts?.size || 0);
        const showPlatformsBadge = this.platformsFilterSize < (this.platformCounts?.size || 0);
        const showProjectsBadge = this.projectsFilterSize < (this.projectCounts?.size || 0);
        const showPackagesBadge = this.packagesFilterSize < (this.packageCounts?.size || 0);
        return { ["_$litType$"]: lit_template_1, values: [() => this.handleExpandToSection('productTypes'), this.renderProductTypesIcon(), when(showProductTypesBadge, () => ({ ["_$litType$"]: lit_template_2, values: [this.nodeTypesFilterSize] })), () => this.handleExpandToSection('platforms'), this.renderPlatformsIcon(), when(showPlatformsBadge, () => ({ ["_$litType$"]: lit_template_3, values: [this.platformsFilterSize] })), () => this.handleExpandToSection('projects'), this.renderProjectsIcon(), when(showProjectsBadge, () => ({ ["_$litType$"]: lit_template_4, values: [this.projectsFilterSize] })), () => this.handleExpandToSection('packages'), this.renderPackagesIcon(), when(showPackagesBadge, () => ({ ["_$litType$"]: lit_template_5, values: [this.packagesFilterSize] })), this.filteredNodes?.length || 0, this.filteredEdges?.length || 0] };
    }
}
__decorate([
    property({ attribute: false })
], GraphCollapsedSidebar.prototype, "filteredNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphCollapsedSidebar.prototype, "filteredEdges", void 0);
__decorate([
    property({ attribute: false })
], GraphCollapsedSidebar.prototype, "typeCounts", void 0);
__decorate([
    property({ attribute: false })
], GraphCollapsedSidebar.prototype, "platformCounts", void 0);
__decorate([
    property({ attribute: false })
], GraphCollapsedSidebar.prototype, "projectCounts", void 0);
__decorate([
    property({ attribute: false })
], GraphCollapsedSidebar.prototype, "packageCounts", void 0);
__decorate([
    property({ type: Number, attribute: 'node-types-filter-size' })
], GraphCollapsedSidebar.prototype, "nodeTypesFilterSize", void 0);
__decorate([
    property({ type: Number, attribute: 'platforms-filter-size' })
], GraphCollapsedSidebar.prototype, "platformsFilterSize", void 0);
__decorate([
    property({ type: Number, attribute: 'projects-filter-size' })
], GraphCollapsedSidebar.prototype, "projectsFilterSize", void 0);
__decorate([
    property({ type: Number, attribute: 'packages-filter-size' })
], GraphCollapsedSidebar.prototype, "packagesFilterSize", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-collapsed-sidebar')) {
    customElements.define('xcode-graph-collapsed-sidebar', GraphCollapsedSidebar);
}
//# sourceMappingURL=collapsed-sidebar.js.map