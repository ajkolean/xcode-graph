/**
 * CollapsedSidebar Lit Component
 *
 * Vertical icon bar shown when sidebar is collapsed.
 * Displays filter section icons with active filter badges.
 *
 * @example
 * ```html
 * <graph-collapsed-sidebar
 *   .filteredNodes=${nodes}
 *   .filteredEdges=${edges}
 *   node-types-filter-size="3"
 * ></graph-collapsed-sidebar>
 * ```
 *
 * @fires expand-to-section - Dispatched when section icon clicked (detail: { section })
 */

import { LitElement, html, svg, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';

export class GraphCollapsedSidebar extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare filteredNodes: GraphNode[];

  @property({ attribute: false })
  declare filteredEdges: GraphEdge[];

  @property({ attribute: false })
  declare typeCounts: Map<string, number>;

  @property({ attribute: false })
  declare platformCounts: Map<string, number>;

  @property({ type: Number, attribute: 'node-types-filter-size' })
  declare nodeTypesFilterSize: number;

  @property({ type: Number, attribute: 'platforms-filter-size' })
  declare platformsFilterSize: number;

  @property({ type: Number, attribute: 'projects-filter-size' })
  declare projectsFilterSize: number;

  @property({ type: Number, attribute: 'packages-filter-size' })
  declare packagesFilterSize: number;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
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
      padding: 8px;
      border-radius: var(--radius);
      transition: background-color 0.2s;
      background: none;
      border: none;
      color: rgba(168, 157, 255, 0.8);
      cursor: pointer;
    }

    .icon-button:hover {
      background-color: var(--color-muted);
    }

    .icon-button svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(168, 157, 255, 0.3);
      border: 1px solid rgba(168, 157, 255, 0.5);
      font-size: 9px;
      font-family: 'Inter', sans-serif;
      font-weight: var(--font-weight-semibold);
      color: rgba(168, 157, 255, 1);
    }

    .divider {
      width: 32px;
      height: 1px;
      background-color: var(--color-sidebar-border);
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .stat-value {
      text-align: center;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: var(--font-weight-semibold);
      color: var(--color-muted-foreground);
    }

    .stat-label {
      text-align: center;
      font-size: 8px;
      font-family: 'Inter', sans-serif;
      color: var(--color-foreground);
      opacity: 0.3;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleExpandToSection(section: string) {
    this.dispatchEvent(
      new CustomEvent('expand-to-section', {
        detail: { section },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private renderProductTypesIcon() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    `;
  }

  private renderPlatformsIcon() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <line x1="3" y1="9.5" x2="21" y2="9.5" />
        <line x1="3" y1="14.5" x2="21" y2="14.5" />
        <line x1="9.5" y1="3" x2="9.5" y2="21" />
        <line x1="14.5" y1="3" x2="14.5" y2="21" />
        <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor" />
        <circle cx="9.5" cy="14.5" r="1.5" fill="currentColor" />
        <circle cx="14.5" cy="14.5" r="1.5" fill="currentColor" />
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

  // ========================================
  // Render
  // ========================================

  render() {
    const showProductTypesBadge = this.nodeTypesFilterSize < (this.typeCounts?.size || 0);
    const showPlatformsBadge = this.platformsFilterSize < (this.platformCounts?.size || 0);

    return html`
      <!-- Product Types -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('productTypes')}
        title="Product Types"
      >
        ${this.renderProductTypesIcon()}
        ${showProductTypesBadge
          ? html`<div class="badge">${this.nodeTypesFilterSize}</div>`
          : ''}
      </button>

      <!-- Platforms -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('platforms')}
        title="Platforms"
      >
        ${this.renderPlatformsIcon()}
        ${showPlatformsBadge
          ? html`<div class="badge">${this.platformsFilterSize}</div>`
          : ''}
      </button>

      <!-- Projects -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('projects')}
        title="Projects"
      >
        ${this.renderProjectsIcon()}
      </button>

      <!-- Packages -->
      <button
        class="icon-button"
        @click=${() => this.handleExpandToSection('packages')}
        title="Packages"
      >
        ${this.renderPackagesIcon()}
      </button>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Stats -->
      <div class="stat">
        <div class="stat-value">${this.filteredNodes?.length || 0}</div>
        <div class="stat-label">NODES</div>
      </div>

      <div class="stat">
        <div class="stat-value">${this.filteredEdges?.length || 0}</div>
        <div class="stat-label">EDGES</div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-collapsed-sidebar': GraphCollapsedSidebar;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-collapsed-sidebar')) {
  customElements.define('graph-collapsed-sidebar', GraphCollapsedSidebar);
}
