/**
 * FilterIcons Lit Components
 *
 * Icon components for filter sections.
 * Provides consistent iconography across the filter panel.
 *
 * @example
 * ```html
 * <graph-product-types-icon></graph-product-types-icon>
 * <graph-platforms-icon></graph-platforms-icon>
 * <graph-projects-icon></graph-projects-icon>
 * <graph-packages-icon></graph-packages-icon>
 * ```
 */

import { LitElement, html, svg, css } from 'lit';
import { customElement } from 'lit/decorators.js';

const iconColor = 'rgba(168, 157, 255, 0.7)';

// ========================================
// Product Types Icon
// ========================================

@customElement('graph-product-types-icon')
export class GraphProductTypesIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }
  `;

  render() {
    return svg`
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${iconColor}"
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
}

// ========================================
// Platforms Icon
// ========================================

@customElement('graph-platforms-icon')
export class GraphPlatformsIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }
  `;

  render() {
    return svg`
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${iconColor}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <line x1="3" y1="9.5" x2="21" y2="9.5" />
        <line x1="3" y1="14.5" x2="21" y2="14.5" />
        <line x1="9.5" y1="3" x2="9.5" y2="21" />
        <line x1="14.5" y1="3" x2="14.5" y2="21" />
        <circle cx="9.5" cy="9.5" r="1.5" fill="${iconColor}" />
        <circle cx="14.5" cy="9.5" r="1.5" fill="${iconColor}" />
        <circle cx="9.5" cy="14.5" r="1.5" fill="${iconColor}" />
        <circle cx="14.5" cy="14.5" r="1.5" fill="${iconColor}" />
      </svg>
    `;
  }
}

// ========================================
// Projects Icon
// ========================================

@customElement('graph-projects-icon')
export class GraphProjectsIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }
  `;

  render() {
    return svg`
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${iconColor}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    `;
  }
}

// ========================================
// Packages Icon
// ========================================

@customElement('graph-packages-icon')
export class GraphPackagesIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }
  `;

  render() {
    return svg`
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${iconColor}"
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
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-product-types-icon': GraphProductTypesIcon;
    'graph-platforms-icon': GraphPlatformsIcon;
    'graph-projects-icon': GraphProjectsIcon;
    'graph-packages-icon': GraphPackagesIcon;
  }
}
