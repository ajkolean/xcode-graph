/**
 * Header Lit Component - Mission Control Theme
 *
 * Top header component with bold identity.
 * Features scan line effect, glowing logo, and monospace typography.
 *
 * @example
 * ```html
 * <graph-header></graph-header>
 * ```
 */

import { icons } from '@shared/controllers/icon.adapter';
import { type CSSResultGroup, css, html, LitElement, svg, type TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * Top header component with bold identity. Features scan line effect,
 * glowing logo, and monospace typography.
 *
 * @summary Mission control themed header bar
 */
export class GraphHeader extends LitElement {
  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    header {
      height: var(--sizes-header-height);
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      position: relative;
      background: var(--colors-card);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
      z-index: 50;
      overflow: hidden;
    }

    .left-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      position: relative;
      z-index: 1;
    }

    .logo {
      width: var(--spacing-8);
      height: var(--spacing-8);
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition:
        transform var(--durations-normal) var(--easings-out),
        box-shadow var(--durations-normal) var(--easings-out);
      background: var(--colors-primary);
      cursor: pointer;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .logo svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
      fill: var(--colors-primary-foreground);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .breadcrumb-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-sm);
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out);
      background: transparent;
      border: var(--border-widths-thin) solid transparent;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      cursor: pointer;
    }

    .breadcrumb-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-4));
      border-color: var(--colors-border);
    }

    .avatar {
      width: var(--sizes-icon-lg);
      height: var(--sizes-icon-lg);
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--colors-accent);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-bold);
      color: var(--colors-accent-foreground);
    }

    .separator {
      color: rgba(var(--colors-foreground-rgb), var(--opacity-20));
      display: flex;
      align-items: center;
    }

    .separator svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
    }

    .selector-icon {
      color: var(--colors-muted-foreground);
      opacity: var(--opacity-60);
      transition: opacity var(--durations-fast) var(--easings-out);
    }

    .breadcrumb-button:hover .selector-icon {
      opacity: var(--opacity-100);
    }

    .selector-icon svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      position: relative;
      z-index: 1;
    }

    .action-button {
      width: var(--sizes-9);
      height: var(--sizes-9);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radii-sm);
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        color var(--durations-fast) var(--easings-out);
      color: var(--colors-muted-foreground);
      border: var(--border-widths-thin) solid var(--colors-border);
      background: rgba(var(--colors-foreground-rgb), var(--opacity-2));
      cursor: pointer;
    }

    .action-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      border-color: rgba(var(--colors-foreground-rgb), var(--opacity-10));
      color: var(--colors-foreground);
    }

    .action-button svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
    }

    .user-avatar {
      width: var(--sizes-9);
      height: var(--sizes-9);
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition:
        transform var(--durations-fast) var(--easings-out),
        box-shadow var(--durations-fast) var(--easings-out);
      background: linear-gradient(135deg, var(--colors-accent) 0%, rgba(var(--colors-accent-rgb), var(--opacity-70)) 100%);
      border: none;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-bold);
      color: var(--colors-accent-foreground);
      cursor: pointer;
    }

    .user-avatar:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(var(--colors-accent-rgb), var(--opacity-40));
    }

    .icon {
      display: inline-flex;
    }

    .icon svg {
      width: var(--sizes-icon-md);
      height: var(--sizes-icon-md);
    }

    /* Status indicator dot */
    .status-dot {
      width: var(--spacing-1);
      height: var(--spacing-1);
      border-radius: var(--radii-full);
      background: var(--colors-success);
      box-shadow: 0 0 8px rgba(var(--colors-success-rgb), var(--opacity-60));
      animation: statusPulse 2s ease-in-out infinite;
    }

    @keyframes statusPulse {
      0%, 100% {
        opacity: var(--opacity-100);
        box-shadow: 0 0 8px rgba(var(--colors-success-rgb), var(--opacity-60));
      }
      50% {
        opacity: var(--opacity-70);
        box-shadow: 0 0 12px rgba(var(--colors-success-rgb), var(--opacity-80));
      }
    }
  `;

  // ========================================
  // Helper SVGs
  // ========================================

  private renderSelectorIcon() {
    return svg`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M8 9l4 -4l4 4"></path>
        <path d="M16 15l-4 4l-4 -4"></path>
      </svg>
    `;
  }

  private renderSlashIcon() {
    return svg`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M17 5l-10 14"></path>
      </svg>
    `;
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    return html`
      <header>
        <!-- Left Section: Logo + Breadcrumbs -->
        <div class="left-section">
          <!-- Logo with glow -->
          <div class="logo">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>

          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <!-- Organization -->
            <button class="breadcrumb-button">
              <div class="avatar">T</div>
              <span>tuist</span>
              <span class="selector-icon">${this.renderSelectorIcon()}</span>
            </button>

            <!-- Separator -->
            <div class="separator">${this.renderSlashIcon()}</div>

            <!-- Project -->
            <button class="breadcrumb-button">
              <span>tuist</span>
              <span class="selector-icon">${this.renderSelectorIcon()}</span>
            </button>

            <!-- Separator -->
            <div class="separator">${this.renderSlashIcon()}</div>

            <!-- Status indicator -->
            <div class="status-dot" title="Connected"></div>
          </div>
        </div>

        <!-- Right Section: Actions -->
        <div class="right-section">
          <!-- Docs Button -->
          <button class="action-button" title="Documentation">
            <span class="icon">${unsafeHTML(icons.Book)}</span>
          </button>

          <!-- User Avatar -->
          <button class="user-avatar">A</button>
        </div>
      </header>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-header': GraphHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-header')) {
  customElements.define('graph-header', GraphHeader);
}
