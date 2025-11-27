/**
 * Header Lit Component
 *
 * Top header component matching Tuist design.
 * Spans full width with logo, breadcrumbs, and user actions.
 *
 * @example
 * ```html
 * <graph-header></graph-header>
 * ```
 */

import { LitElement, html, svg, css } from 'lit';
import { customElement } from 'lit/decorators.js';
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
      height: 48px;
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      position: relative;
      background-color: #18181B;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 50;
    }

    .left-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 28px;
      height: 28px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s ease;
      background: linear-gradient(135deg, #6F2CFF 0%, #8B5CF6 100%);
      cursor: pointer;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .breadcrumb-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: var(--radius);
      transition: background-color 0.2s;
      background: none;
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
      cursor: pointer;
    }

    .breadcrumb-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: var(--font-weight-semibold);
      color: white;
    }

    .separator {
      color: rgba(255, 255, 255, 0.3);
    }

    .separator svg {
      width: 16px;
      height: 16px;
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .docs-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      transition: background-color 0.2s;
      color: rgba(232, 234, 237, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: none;
      cursor: pointer;
    }

    .docs-button:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .docs-button svg {
      width: 16px;
      height: 16px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s;
      background: linear-gradient(135deg, #E91E63 0%, #FF6EC7 100%);
      border: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: var(--font-weight-semibold);
      color: white;
      cursor: pointer;
    }

    .user-avatar:hover {
      opacity: 0.9;
    }

    .icon {
      display: inline-flex;
    }

    .icon svg {
      width: 16px;
      height: 16px;
    }
  `;

  // ========================================
  // Helper SVGs
  // ========================================

  private renderSelectorIcon() {
    return svg`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
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
        stroke-width="2"
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
          <!-- Tuist Logo -->
          <div class="logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>

          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <!-- Organization -->
            <button class="breadcrumb-button">
              <div class="avatar">T</div>
              <span>tuist</span>
              ${this.renderSelectorIcon()}
            </button>

            <!-- Separator -->
            <div class="separator">${this.renderSlashIcon()}</div>

            <!-- Project -->
            <button class="breadcrumb-button">
              <span>tuist</span>
              ${this.renderSelectorIcon()}
            </button>

            <!-- Separator -->
            <div class="separator">${this.renderSlashIcon()}</div>
          </div>
        </div>

        <!-- Right Section: Actions -->
        <div class="right-section">
          <!-- Docs Button -->
          <button class="docs-button" title="Documentation">
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
