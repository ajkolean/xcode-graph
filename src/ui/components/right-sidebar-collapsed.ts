/**
 * CollapsedSidebar Lit Component
 *
 * Vertical icon bar shown when sidebar is collapsed.
 * Displays filter section icons with active filter badges.
 *
 * @example
 * ```html
 * <xcode-graph-collapsed-sidebar
 *   .filteredNodes=${nodes}
 *   .filteredEdges=${edges}
 *   node-types-filter-size="3"
 * ></xcode-graph-collapsed-sidebar>
 * ```
 *
 * @fires expand-to-section - Dispatched when section icon clicked (detail: { section })
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, css, html, LitElement, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

/**
 * Vertical icon bar shown when sidebar is collapsed.
 * Displays filter section icons with active filter badges.
 *
 * @summary Collapsed sidebar icon bar with filter badges
 *
 * @fires expand-to-section - Dispatched when a section icon is clicked (detail: { section })
 */
export class GraphCollapsedSidebar extends LitElement {
  /** Nodes remaining after filter application */
  @property({ attribute: false })
  declare filteredNodes: GraphNode[];

  /** Edges remaining after filter application */
  @property({ attribute: false })
  declare filteredEdges: GraphEdge[];

  /** Count of nodes per node type */
  @property({ attribute: false })
  declare typeCounts: Map<string, number>;

  /** Count of nodes per platform */
  @property({ attribute: false })
  declare platformCounts: Map<string, number>;

  /** Count of nodes per project */
  @property({ attribute: false })
  declare projectCounts: Map<string, number>;

  /** Count of nodes per package */
  @property({ attribute: false })
  declare packageCounts: Map<string, number>;

  /** Number of currently selected node type filters */
  @property({ type: Number, attribute: 'node-types-filter-size' })
  declare nodeTypesFilterSize: number;

  /** Number of currently selected platform filters */
  @property({ type: Number, attribute: 'platforms-filter-size' })
  declare platformsFilterSize: number;

  /** Number of currently selected project filters */
  @property({ type: Number, attribute: 'projects-filter-size' })
  declare projectsFilterSize: number;

  /** Number of currently selected package filters */
  @property({ type: Number, attribute: 'packages-filter-size' })
  declare packagesFilterSize: number;

  static override readonly styles: CSSResultGroup = css`
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

  private handleExpandToSection(section: string) {
    this.dispatchEvent(
      new CustomEvent('expand-to-section', {
        detail: { section },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderProductTypesIcon() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    `;
  }

  private renderPlatformsIcon() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    `;
  }

  private renderProjectsIcon() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    `;
  }

  private renderPackagesIcon() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    `;
  }

  override render(): TemplateResult {
    const showProductTypesBadge = this.nodeTypesFilterSize < (this.typeCounts?.size || 0);
    const showPlatformsBadge = this.platformsFilterSize < (this.platformCounts?.size || 0);
    const showProjectsBadge = this.projectsFilterSize < (this.projectCounts?.size || 0);
    const showPackagesBadge = this.packagesFilterSize < (this.packageCounts?.size || 0);

    return html`
      <!-- Product Types -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('productTypes')}
        title="Product Types"
      >
        ${this.renderProductTypesIcon()}
        ${when(showProductTypesBadge, () => html`<div class="badge">${this.nodeTypesFilterSize}</div>`)}
      </button>

      <!-- Platforms -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('platforms')}
        title="Platforms"
      >
        ${this.renderPlatformsIcon()}
        ${when(showPlatformsBadge, () => html`<div class="badge">${this.platformsFilterSize}</div>`)}
      </button>

      <!-- Projects -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('projects')}
        title="Projects"
      >
        ${this.renderProjectsIcon()}
        ${when(showProjectsBadge, () => html`<div class="badge">${this.projectsFilterSize}</div>`)}
      </button>

      <!-- Packages -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('packages')}
        title="Packages"
      >
        ${this.renderPackagesIcon()}
        ${when(showPackagesBadge, () => html`<div class="badge">${this.packagesFilterSize}</div>`)}
      </button>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat">
          <div class="stat-value">${this.filteredNodes?.length || 0}</div>
          <div class="stat-label">NODES</div>
        </div>

        <div class="stat">
          <div class="stat-value">${this.filteredEdges?.length || 0}</div>
          <div class="stat-label">EDGES</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-collapsed-sidebar': GraphCollapsedSidebar;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-collapsed-sidebar')) {
  customElements.define('xcode-graph-collapsed-sidebar', GraphCollapsedSidebar);
}
