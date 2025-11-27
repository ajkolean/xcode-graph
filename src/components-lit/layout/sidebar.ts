/**
 * Sidebar Lit Component
 *
 * Left sidebar navigation matching Tuist design.
 * Displays navigation tabs with icons and active state.
 *
 * @example
 * ```html
 * <graph-sidebar
 *   active-tab="graph"
 * ></graph-sidebar>
 * ```
 *
 * @fires tab-change - Dispatched when tab is clicked (detail: { tab: string })
 */

import { LitElement, html, svg, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

export type ActiveTab =
  | 'overview'
  | 'builds'
  | 'test-runs'
  | 'module-cache'
  | 'xcode-cache'
  | 'previews'
  | 'qa'
  | 'bundles'
  | 'graph';

interface NavItem {
  id: ActiveTab;
  label: string;
  iconSvg: string;
  hasDropdown?: boolean;
}

@customElement('graph-sidebar')
export class GraphSidebar extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The currently active tab
   */
  @property({ type: String, attribute: 'active-tab' })
  declare activeTab: ActiveTab;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      width: 256px;
      flex-shrink: 0;
    }

    aside {
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: #18181B;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    nav {
      flex: 1;
      padding: var(--spacing-md) 12px;
      overflow-y: auto;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) 12px;
      border-radius: var(--radius-lg);
      transition: all 0.2s;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(232, 234, 237, 0.7);
    }

    .nav-button.active {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--color-foreground);
    }

    .nav-button:not(.active):hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .nav-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon-container {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-container svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .label {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }

    .nav-button.active .label {
      font-weight: var(--font-weight-medium);
    }

    .nav-button:not(.active) .label {
      font-weight: var(--font-weight-normal);
    }

    .dropdown-icon {
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .dropdown-icon svg {
      width: 16px;
      height: 16px;
    }

    .nav-button:hover .dropdown-icon {
      opacity: 1;
    }
  `;

  // ========================================
  // Data
  // ========================================

  private get navItems(): NavItem[] {
    return [
      {
        id: 'overview',
        label: 'Overview',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19 8.71l-5.333 -4.148a2.666 2.666 0 0 0 -3.274 0l-5.334 4.148a2.665 2.665 0 0 0 -1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-7.2c0 -.823 -.38 -1.6 -1.03 -2.105"></path><path d="M16 15c-2.21 1.333 -5.792 1.333 -8 0"></path></svg>`,
      },
      {
        id: 'builds',
        label: 'Builds',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M10 5m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z"></path><path d="M7 7l0 10"></path><path d="M4 8l0 8"></path></svg>`,
        hasDropdown: true,
      },
      {
        id: 'test-runs',
        label: 'Test Runs',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M13.45 11.55l2.05 -2.05"></path><path d="M6.4 20a9 9 0 1 1 11.2 0z"></path></svg>`,
      },
      {
        id: 'module-cache',
        label: 'Module Cache',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"></path><path d="M4 6v6a8 3 0 0 0 16 0v-6"></path><path d="M4 12v6a8 3 0 0 0 16 0v-6"></path></svg>`,
        hasDropdown: true,
      },
      {
        id: 'xcode-cache',
        label: 'Xcode Cache',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M16 12.5l-5 -3l5 -3l5 3v5.5l-5 3z"></path><path d="M11 9.5v5.5l5 3"></path><path d="M16 12.545l5 -3.03"></path><path d="M7 9h-5"></path><path d="M7 12h-3"></path><path d="M7 15h-1"></path></svg>`,
      },
      {
        id: 'previews',
        label: 'Previews',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10z"></path><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9"></path><path d="M16 9h2"></path></svg>`,
      },
      {
        id: 'qa',
        label: 'QA',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path><path d="M9 14h.01"></path><path d="M9 17h.01"></path><path d="M12 16l1 1l3 -3"></path></svg>`,
      },
      {
        id: 'bundles',
        label: 'Bundles',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M8.848 14.667l-3.348 2.833"></path><path d="M12 3v5m4 4h5"></path><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M14.219 15.328l2.781 4.172"></path><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path></svg>`,
      },
      {
        id: 'graph',
        label: 'Graph',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0"></path><path d="M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6"></path><path d="M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6"></path><path d="M6 9h12"></path><path d="M3 19h7"></path><path d="M14 19h7"></path><path d="M12 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M12 15v2"></path></svg>`,
      },
    ];
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleTabClick(tab: ActiveTab) {
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tab },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <aside>
        <nav>
          <div class="nav-items">
            ${this.navItems.map((item) => {
              const isActive = this.activeTab === item.id;

              return html`
                <button
                  class="nav-button ${isActive ? 'active' : ''}"
                  @click=${() => this.handleTabClick(item.id)}
                >
                  <div class="nav-content">
                    <div class="icon-container">${unsafeHTML(item.iconSvg)}</div>
                    <span class="label">${item.label}</span>
                  </div>
                  ${item.hasDropdown
                    ? html`<span class="dropdown-icon">${unsafeHTML(icons.ChevronDown)}</span>`
                    : ''}
                </button>
              `;
            })}
          </div>
        </nav>
      </aside>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-sidebar': GraphSidebar;
  }
}

// Export type for use in other files
export type { ActiveTab };
