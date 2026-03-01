import { type CSSResultGroup, css, LitElement, svg, type TemplateResult } from 'lit';

/**
 * Filter icon color - used for all filter section icons
 * Based on --colors-chart-5 (160, 140, 255) with 0.7 alpha
 */
const FILTER_ICON_COLOR = 'var(--colors-filter-icon)';

import { property } from 'lit/decorators.js';

export type FilterIconName = 'product-types' | 'platforms' | 'projects' | 'packages';

/**
 * A unified icon component for filter sections.
 * Renders product-types, platforms, projects, and packages icons.
 *
 * @summary Filter section icon with multiple named variants
 */
export class GraphFilterIcon extends LitElement {
  /**
   * The icon name to render
   */
  @property({ type: String })
  declare name: FilterIconName;

  /**
   * Icon size in pixels
   */
  @property({ type: Number })
  declare size: number;

  constructor() {
    super();
    this.name = 'product-types';
    this.size = 18;
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }
  `;

  private renderProductTypes() {
    return svg`
      <svg
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${FILTER_ICON_COLOR}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    `;
  }

  private renderPlatforms() {
    return svg`
      <svg
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${FILTER_ICON_COLOR}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <line x1="3" y1="9.5" x2="21" y2="9.5" />
        <line x1="3" y1="14.5" x2="21" y2="14.5" />
        <line x1="9.5" y1="3" x2="9.5" y2="21" />
        <line x1="14.5" y1="3" x2="14.5" y2="21" />
        <circle cx="9.5" cy="9.5" r="1.5" fill="${FILTER_ICON_COLOR}" />
        <circle cx="14.5" cy="9.5" r="1.5" fill="${FILTER_ICON_COLOR}" />
        <circle cx="9.5" cy="14.5" r="1.5" fill="${FILTER_ICON_COLOR}" />
        <circle cx="14.5" cy="14.5" r="1.5" fill="${FILTER_ICON_COLOR}" />
      </svg>
    `;
  }

  private renderProjects() {
    return svg`
      <svg
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${FILTER_ICON_COLOR}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    `;
  }

  private renderPackages() {
    return svg`
      <svg
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${FILTER_ICON_COLOR}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    `;
  }

  override render(): TemplateResult {
    switch (this.name) {
      case 'product-types':
        return this.renderProductTypes();
      case 'platforms':
        return this.renderPlatforms();
      case 'projects':
        return this.renderProjects();
      case 'packages':
        return this.renderPackages();
      default:
        return this.renderProductTypes();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-filter-icon': GraphFilterIcon;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-filter-icon')) {
  customElements.define('xcode-graph-filter-icon', GraphFilterIcon);
}
