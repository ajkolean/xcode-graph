/**
 * Sidebar Lit Component - Mission Control Theme
 *
 * Left sidebar navigation with staggered entrance animations.
 * Features noise texture, accent borders, and monospace typography.
 *
 * @example
 * ```html
 * <xcode-graph-sidebar
 *   active-tab="graph"
 * ></xcode-graph-sidebar>
 * ```
 *
 * @fires tab-change - Dispatched when tab is clicked (detail: { tab: string })
 */

import { icons } from '@shared/controllers/icon.adapter';
import { ActiveTab, type ActiveTab as ActiveTabType } from '@shared/schemas';

export type { ActiveTab } from '@shared/schemas';

import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  nothing,
  type SVGTemplateResult,
  svg,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import '@ui/components/sidebar-collapse-icon';

interface NavItem {
  id: ActiveTabType;
  label: string;
  iconSvg: SVGTemplateResult;
  hasDropdown?: boolean;
}

/**
 * Left sidebar navigation with staggered entrance animations.
 * Features noise texture, accent borders, and monospace typography.
 *
 * @summary Left sidebar navigation component
 * @fires tab-change - Dispatched when a tab is clicked (detail: { tab: string })
 */
export class GraphSidebar extends LitElement {
  @property({ type: Boolean, reflect: true })
  declare collapsed: boolean;
  @property({ type: Boolean })
  declare defaultCollapsed: boolean;

  /**
   * The currently active tab
   */
  @property({ type: String, attribute: 'active-tab' })
  declare activeTab: ActiveTabType;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.defaultCollapsed || this.hasAttribute('collapsed')) {
      this.collapsed = true;
    }
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      width: var(--sizes-sidebar-expanded);
      flex-shrink: 0;
      transition: width var(--durations-normal) var(--easings-default);
    }

    :host([collapsed]) {
      width: var(--sizes-sidebar-collapsed);
    }

    aside {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--colors-sidebar);
      border-right: var(--border-widths-thin) solid var(--colors-sidebar-border);
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    nav {
      flex: 1;
      padding: var(--spacing-md) var(--spacing-3);
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .collapse-button {
      position: absolute;
      top: var(--spacing-2);
      right: var(--spacing-2);
      width: var(--sizes-sidebar-collapsed);
      height: var(--sizes-sidebar-collapsed);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--colors-muted-foreground);
      cursor: pointer;
      transition: transform var(--durations-fast) var(--easings-default);
    }

    :host([collapsed]) .collapse-button {
      transform: rotate(180deg);
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .nav-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--radii-sm);
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        transform var(--durations-fast) var(--easings-out);
      background: transparent;
      border: var(--border-widths-thin) solid transparent;
      border-left: var(--border-widths-medium) solid transparent;
      cursor: pointer;
      color: var(--colors-muted-foreground);
      /* Staggered animation */
      animation: fadeInUp var(--durations-slow) var(--easings-out) both;
    }

    /* Animation delays for staggered effect */
    .nav-button:nth-child(1) { animation-delay: 0.05s; }
    .nav-button:nth-child(2) { animation-delay: 0.08s; }
    .nav-button:nth-child(3) { animation-delay: 0.11s; }
    .nav-button:nth-child(4) { animation-delay: 0.14s; }
    .nav-button:nth-child(5) { animation-delay: 0.17s; }
    .nav-button:nth-child(6) { animation-delay: 0.20s; }
    .nav-button:nth-child(7) { animation-delay: 0.23s; }
    .nav-button:nth-child(8) { animation-delay: 0.26s; }
    .nav-button:nth-child(9) { animation-delay: 0.29s; }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .nav-button.active {
      background-color: var(--colors-sidebar-accent);
      border-left-color: var(--colors-primary);
      color: var(--colors-foreground);
    }

    .nav-button:not(.active):hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-2));
      border-color: var(--colors-border);
      color: var(--colors-foreground);
    }

    .nav-button:active {
      transform: scale(0.98);
    }

    .nav-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .icon-container {
      width: var(--sizes-icon-lg);
      height: var(--sizes-icon-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: color var(--durations-fast) var(--easings-out);
    }

    .nav-button.active .icon-container {
      color: var(--colors-primary-text);
    }

    .icon-container svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
      stroke: currentColor;
    }

    .label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      letter-spacing: 0.01em;
    }

    .nav-button.active .label {
      font-weight: var(--font-weights-medium);
    }

    .nav-button:not(.active) .label {
      font-weight: var(--font-weights-normal);
    }

    .dropdown-icon {
      opacity: var(--opacity-40);
      transition: opacity var(--durations-fast) var(--easings-out);
    }

    .dropdown-icon svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .nav-button:hover .dropdown-icon {
      opacity: var(--opacity-80);
    }

    /* Section divider */
    .section-divider {
      height: var(--border-widths-thin);
      background: var(--colors-border);
      margin: var(--spacing-3) 0;
    }

    /* Section label */
    .section-label {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--colors-primary-text);
      opacity: var(--opacity-60);
      padding: var(--spacing-2) var(--spacing-3) var(--spacing-1);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition-duration: 0.01ms !important;
      }

      .nav-button {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .collapse-button {
        transition-duration: 0.01ms !important;
      }

      .icon-container,
      .dropdown-icon {
        transition-duration: 0.01ms !important;
      }
    }
  `;

  private get navItems(): NavItem[] {
    return [
      {
        id: ActiveTab.Overview,
        label: 'Overview',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19 8.71l-5.333 -4.148a2.666 2.666 0 0 0 -3.274 0l-5.334 4.148a2.665 2.665 0 0 0 -1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-7.2c0 -.823 -.38 -1.6 -1.03 -2.105"></path><path d="M16 15c-2.21 1.333 -5.792 1.333 -8 0"></path></svg>`,
      },
      {
        id: ActiveTab.Builds,
        label: 'Builds',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M10 5m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z"></path><path d="M7 7l0 10"></path><path d="M4 8l0 8"></path></svg>`,
        hasDropdown: true,
      },
      {
        id: ActiveTab.TestRuns,
        label: 'Test Runs',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M13.45 11.55l2.05 -2.05"></path><path d="M6.4 20a9 9 0 1 1 11.2 0z"></path></svg>`,
      },
      {
        id: ActiveTab.ModuleCache,
        label: 'Module Cache',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"></path><path d="M4 6v6a8 3 0 0 0 16 0v-6"></path><path d="M4 12v6a8 3 0 0 0 16 0v-6"></path></svg>`,
        hasDropdown: true,
      },
      {
        id: ActiveTab.XcodeCache,
        label: 'Xcode Cache',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M16 12.5l-5 -3l5 -3l5 3v5.5l-5 3z"></path><path d="M11 9.5v5.5l5 3"></path><path d="M16 12.545l5 -3.03"></path><path d="M7 9h-5"></path><path d="M7 12h-3"></path><path d="M7 15h-1"></path></svg>`,
      },
      {
        id: ActiveTab.Previews,
        label: 'Previews',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10z"></path><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9"></path><path d="M16 9h2"></path></svg>`,
      },
      {
        id: ActiveTab.Qa,
        label: 'QA',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path><path d="M9 14h.01"></path><path d="M9 17h.01"></path><path d="M12 16l1 1l3 -3"></path></svg>`,
      },
      {
        id: ActiveTab.Bundles,
        label: 'Bundles',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M8.848 14.667l-3.348 2.833"></path><path d="M12 3v5m4 4h5"></path><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M14.219 15.328l2.781 4.172"></path><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path></svg>`,
      },
      {
        id: ActiveTab.Graph,
        label: 'Graph',
        iconSvg: svg`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0"></path><path d="M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6"></path><path d="M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6"></path><path d="M6 9h12"></path><path d="M3 19h7"></path><path d="M14 19h7"></path><path d="M12 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M12 15v2"></path></svg>`,
      },
    ];
  }

  private handleTabClick(tab: ActiveTabType) {
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tab },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  override render(): TemplateResult {
    return html`
      <aside>
        <button class="collapse-button" @click=${this.toggleCollapse} title="Toggle sidebar">
          <xcode-graph-sidebar-collapse-icon ?is-collapsed=${this.collapsed}></xcode-graph-sidebar-collapse-icon>
        </button>
        <nav>
          <div class="nav-items">
            ${repeat(
              this.navItems,
              (item) => item.id,
              (item) => {
                const isActive = this.activeTab === item.id;

                return html`
                <button
                  class=${classMap({ 'nav-button': true, active: isActive })}
                  aria-current=${isActive ? 'page' : nothing}
                  @click=${() => this.handleTabClick(item.id)}
                >
                  <div class="nav-content">
                    <div class="icon-container">${item.iconSvg}</div>
                    <span class="label">${item.label}</span>
                  </div>
                  ${when(item.hasDropdown, () => html`<span class="dropdown-icon">${icons.ChevronDown}</span>`)}
                </button>
              `;
              },
            )}
          </div>
        </nav>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-sidebar': GraphSidebar;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-sidebar')) {
  customElements.define('xcode-graph-sidebar', GraphSidebar);
}
