/**
 * FilterView Lit Component
 *
 * Complete filter interface with stats, search, and filter sections.
 * Composes StatsCard, SearchBar, ClearFiltersButton, and FilterSection components.
 *
 * @example
 * ```html
 * <graph-filter-view
 *   filtered-nodes-count="10"
 *   total-nodes-count="100"
 *   filtered-edges-count="25"
 *   total-edges-count="200"
 *   .filters=${filterState}
 *   search-query=""
 *   zoom="1.0"
 * ></graph-filter-view>
 * ```
 *
 * @fires filters-change - Dispatched when filter state changes
 * @fires search-change - Dispatched when search query changes
 * @fires section-toggle - Dispatched when a section is expanded/collapsed
 * @fires preview-change - Dispatched when hovering over filter items
 * @fires clear-filters - Dispatched when clear filters button is clicked
 */

import type { FilterState } from '@shared/schemas';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import './stats-card';
import './search-bar';
import './clear-filters-button';
import './filter-section';
import './filter-icons';
import './empty-state';

export interface FilterItem {
  key: string;
  count: number;
  color: string;
}

export class GraphFilterView extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: Number, attribute: 'filtered-nodes-count' })
  declare filteredNodesCount: number;

  @property({ type: Number, attribute: 'total-nodes-count' })
  declare totalNodesCount: number;

  @property({ type: Number, attribute: 'filtered-edges-count' })
  declare filteredEdgesCount: number;

  @property({ type: Number, attribute: 'total-edges-count' })
  declare totalEdgesCount: number;

  @property({ attribute: false })
  declare filters: FilterState;

  @property({ type: String, attribute: 'search-query' })
  declare searchQuery: string;

  @property({ attribute: false })
  declare nodeTypeItems: FilterItem[];

  @property({ attribute: false })
  declare platformItems: FilterItem[];

  @property({ attribute: false })
  declare projectItems: FilterItem[];

  @property({ attribute: false })
  declare packageItems: FilterItem[];

  @property({ type: Number })
  declare zoom: number;

  @state()
  private declare expandedSections: Record<string, boolean>;

  constructor() {
    super();
    this.filteredNodesCount = 0;
    this.totalNodesCount = 0;
    this.filteredEdgesCount = 0;
    this.totalEdgesCount = 0;
    this.filters = {
      nodeTypes: new Set(),
      platforms: new Set(),
      projects: new Set(),
      packages: new Set(),
    };
    this.searchQuery = '';
    this.nodeTypeItems = [];
    this.platformItems = [];
    this.projectItems = [];
    this.packageItems = [];
    this.zoom = 1.0;
    this.expandedSections = {
      productTypes: true,
      platforms: true,
      projects: true,
      packages: true,
    };
  }

  // ========================================
  // Styles
  // ========================================

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-y: auto;
    }

    .stats-container {
      padding: var(--spacing-md);
      display: flex;
      gap: var(--spacing-3);
    }

    .filter-content {
      height: 100%;
      overflow-y: auto;
    }

    .sections {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
      padding: var(--spacing-6) var(--spacing-md);
    }

    .section-divider {
      height: var(--border-widths-thin);
      background-color: var(--colors-border);
      margin: 0 calc(-1 * var(--spacing-1));
    }
  `;

  // ========================================
  // Computed
  // ========================================

  private get isFiltersActive(): boolean {
    return (
      this.filters.nodeTypes.size > 0 ||
      this.filters.platforms.size > 0 ||
      this.filters.projects.size > 0 ||
      this.filters.packages.size > 0
    );
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleSearchChange(e: CustomEvent<{ query: string }>) {
    this.dispatchEvent(
      new CustomEvent('search-change', {
        detail: { query: e.detail.query },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleSearchClear() {
    this.dispatchEvent(
      new CustomEvent('search-change', {
        detail: { query: '' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleClearFilters() {
    this.dispatchEvent(
      new CustomEvent('clear-filters', {
        bubbles: true,
        composed: true,
      }),
    );
    this.handleSearchClear();
  }

  private handleSectionToggle(section: string) {
    this.expandedSections = {
      ...this.expandedSections,
      [section]: !this.expandedSections[section],
    };
    this.dispatchEvent(
      new CustomEvent('section-toggle', {
        detail: { section },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleItemToggle(filterType: string, key: string, checked: boolean) {
    const filterKey = this.getFilterKey(filterType);
    const newSet = new Set(this.filters[filterKey]);

    if (checked) {
      newSet.add(key);
    } else {
      newSet.delete(key);
    }

    const newFilters = { ...this.filters, [filterKey]: newSet };

    this.dispatchEvent(
      new CustomEvent('filters-change', {
        detail: { filters: newFilters },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handlePreviewChange(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('preview-change', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getFilterKey(filterType: string): keyof FilterState {
    switch (filterType) {
      case 'nodeType':
        return 'nodeTypes';
      case 'platform':
        return 'platforms';
      case 'project':
        return 'projects';
      case 'package':
        return 'packages';
      default:
        return 'nodeTypes';
    }
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    return html`
      <!-- Stats Cards -->
      <div class="stats-container">
        <graph-stats-card
          label="Nodes"
          value="${this.filteredNodesCount}/${this.totalNodesCount}"
          ?highlighted=${this.isFiltersActive}
        ></graph-stats-card>
        <graph-stats-card
          label="Dependencies"
          value="${this.filteredEdgesCount}/${this.totalEdgesCount}"
          ?highlighted=${this.isFiltersActive}
        ></graph-stats-card>
      </div>

      <!-- Clear Filters Button -->
      <graph-clear-filters-button
        ?is-active=${this.isFiltersActive || !!this.searchQuery}
        @clear-filters=${this.handleClearFilters}
      ></graph-clear-filters-button>

      <!-- Search Bar -->
      <graph-search-bar
        search-query=${this.searchQuery}
        @search-change=${this.handleSearchChange}
        @search-clear=${this.handleSearchClear}
      ></graph-search-bar>

      <!-- Filter Content -->
      <div class="filter-content">
        <div class="sections">
          <!-- Product Types -->
          <graph-filter-section
            id="productTypes"
            title="Product Types"
            icon-name="product-types"
            ?is-expanded=${this.expandedSections.productTypes}
            .items=${this.nodeTypeItems}
            .selectedItems=${this.filters.nodeTypes}
            filter-type="nodeType"
            .zoom=${this.zoom}
            @section-toggle=${() => this.handleSectionToggle('productTypes')}
            @item-toggle=${(e: CustomEvent) => this.handleItemToggle('nodeType', e.detail.key, e.detail.checked)}
            @preview-change=${this.handlePreviewChange}
          >
            <graph-product-types-icon slot="icon"></graph-product-types-icon>
          </graph-filter-section>

          <div class="section-divider"></div>

          <!-- Platforms -->
          <graph-filter-section
            id="platforms"
            title="Platforms"
            icon-name="platforms"
            ?is-expanded=${this.expandedSections.platforms}
            .items=${this.platformItems}
            .selectedItems=${this.filters.platforms}
            filter-type="platform"
            .zoom=${this.zoom}
            @section-toggle=${() => this.handleSectionToggle('platforms')}
            @item-toggle=${(e: CustomEvent) => this.handleItemToggle('platform', e.detail.key, e.detail.checked)}
            @preview-change=${this.handlePreviewChange}
          >
            <graph-platforms-icon slot="icon"></graph-platforms-icon>
          </graph-filter-section>

          <div class="section-divider"></div>

          <!-- Projects -->
          <graph-filter-section
            id="projects"
            title="Projects"
            icon-name="projects"
            ?is-expanded=${this.expandedSections.projects}
            .items=${this.projectItems}
            .selectedItems=${this.filters.projects}
            filter-type="project"
            .zoom=${this.zoom}
            @section-toggle=${() => this.handleSectionToggle('projects')}
            @item-toggle=${(e: CustomEvent) => this.handleItemToggle('project', e.detail.key, e.detail.checked)}
            @preview-change=${this.handlePreviewChange}
          >
            <graph-projects-icon slot="icon"></graph-projects-icon>
          </graph-filter-section>

          ${
            this.packageItems.length > 0
              ? html`
                <div class="section-divider"></div>

                <!-- Packages -->
                <graph-filter-section
                  id="packages"
                  title="Packages"
                  icon-name="packages"
                  ?is-expanded=${this.expandedSections.packages}
                  .items=${this.packageItems}
                  .selectedItems=${this.filters.packages}
                  filter-type="package"
                  .zoom=${this.zoom}
                  @section-toggle=${() => this.handleSectionToggle('packages')}
                  @item-toggle=${(e: CustomEvent) => this.handleItemToggle('package', e.detail.key, e.detail.checked)}
                  @preview-change=${this.handlePreviewChange}
                >
                  <graph-packages-icon slot="icon"></graph-packages-icon>
                </graph-filter-section>
              `
              : ''
          }
        </div>
      </div>

      <!-- Empty State -->
      ${
        this.filteredNodesCount === 0
          ? html`
            <graph-empty-state
              ?has-active-filters=${this.isFiltersActive}
              @clear-filters=${this.handleClearFilters}
            ></graph-empty-state>
          `
          : ''
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-filter-view': GraphFilterView;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-filter-view')) {
  customElements.define('graph-filter-view', GraphFilterView);
}
