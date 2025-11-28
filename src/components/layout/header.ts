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

import { css, html, LitElement, svg } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';

export class GraphHeader extends LitElement {
  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
    }

    header {
      height: 52px;
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      position: relative;
      background: var(--gradient-header);
      border-bottom: 1px solid var(--colors-border);
      z-index: 50;
      overflow: hidden;
    }

    /* Scan line effect */
    header::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--effect-scanlines);
      pointer-events: none;
    }

    /* Subtle noise texture */
    header::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--effect-noise);
      opacity: 0.02;
      pointer-events: none;
    }

    .left-section {
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      z-index: 1;
    }

    .logo {
      width: 32px;
      height: 32px;
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition:
        transform 0.2s var(--easings-out),
        box-shadow 0.2s var(--easings-out);
      background: var(--colors-primary);
      box-shadow:
        0 0 20px rgba(var(--colors-primary-rgb), 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      cursor: pointer;
    }

    .logo:hover {
      transform: scale(1.05);
      box-shadow:
        0 0 30px rgba(var(--colors-primary-rgb), 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .logo svg {
      width: 18px;
      height: 18px;
      fill: var(--colors-primary-foreground);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .breadcrumb-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: var(--radii-sm);
      transition:
        background-color 0.15s var(--easings-out),
        border-color 0.15s var(--easings-out);
      background: transparent;
      border: 1px solid transparent;
      font-family: var(--fonts-mono);
      font-size: 12px;
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      cursor: pointer;
    }

    .breadcrumb-button:hover {
      background-color: rgba(255, 255, 255, 0.04);
      border-color: var(--colors-border);
    }

    .avatar {
      width: 20px;
      height: 20px;
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--colors-accent);
      font-family: var(--fonts-mono);
      font-size: 10px;
      font-weight: var(--font-weights-bold);
      color: var(--colors-accent-foreground);
    }

    .separator {
      color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
    }

    .separator svg {
      width: 16px;
      height: 16px;
    }

    .selector-icon {
      color: var(--colors-muted-foreground);
      opacity: 0.6;
      transition: opacity 0.15s var(--easings-out);
    }

    .breadcrumb-button:hover .selector-icon {
      opacity: 1;
    }

    .selector-icon svg {
      width: 14px;
      height: 14px;
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      z-index: 1;
    }

    .action-button {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radii-sm);
      transition:
        background-color 0.15s var(--easings-out),
        border-color 0.15s var(--easings-out),
        color 0.15s var(--easings-out);
      color: var(--colors-muted-foreground);
      border: 1px solid var(--colors-border);
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
    }

    .action-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      color: var(--colors-foreground);
    }

    .action-button svg {
      width: 16px;
      height: 16px;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition:
        transform 0.15s var(--easings-out),
        box-shadow 0.15s var(--easings-out);
      background: linear-gradient(135deg, var(--colors-accent) 0%, rgba(64, 224, 208, 0.7) 100%);
      border: none;
      font-family: var(--fonts-mono);
      font-size: 13px;
      font-weight: var(--font-weights-bold);
      color: var(--colors-accent-foreground);
      cursor: pointer;
    }

    .user-avatar:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(var(--colors-accent-rgb), 0.4);
    }

    .icon {
      display: inline-flex;
    }

    .icon svg {
      width: 16px;
      height: 16px;
    }

    /* Status indicator dot */
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radii-full);
      background: var(--colors-success);
      box-shadow: 0 0 8px rgba(var(--colors-success-rgb), 0.6);
      animation: statusPulse 2s ease-in-out infinite;
    }

    @keyframes statusPulse {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 8px rgba(var(--colors-success-rgb), 0.6);
      }
      50% {
        opacity: 0.7;
        box-shadow: 0 0 12px rgba(var(--colors-success-rgb), 0.8);
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

  render() {
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
