/**
 * CollapsibleSection Lit Component
 *
 * An expandable/collapsible section with animated chevron.
 * Used for filter sections, details panels, and other expandable content.
 *
 * @example
 * ```html
 * <graph-collapsible-section
 *   title="Filters"
 *   ?is-expanded=${true}
 * >
 *   <span slot="icon">🔍</span>
 *   <div>Content here...</div>
 * </graph-collapsible-section>
 * ```
 *
 * @fires toggle - Dispatched when header is clicked
 *
 * @slot icon - Optional icon to display before the title
 * @slot - Default slot for expandable content
 */

import { icons } from '@shared/controllers/icon.adapter';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export class GraphCollapsibleSection extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The section title
   */
  @property({ type: String })
  declare title: string;

  /**
   * Whether the section is expanded
   */
  @property({ type: Boolean, attribute: 'is-expanded' })
  declare isExpanded: boolean;

  constructor() {
    super();
    this.title = '';
    this.isExpanded = false;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .header-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-md);
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      transition: opacity var(--durations-normal) var(--easings-default), color var(--durations-normal);
      padding: 0;
    }

    .header-button:hover {
      opacity: var(--opacity-100);
    }

    .header-button:hover .header-title {
      color: var(--colors-primary-text);
    }

    .header-icon {
      flex-shrink: 0;
      opacity: var(--opacity-60);
      transition: opacity var(--durations-normal), color var(--durations-normal);
      color: var(--colors-muted-foreground);
    }

    .header-button:hover .header-icon {
      opacity: var(--opacity-100);
      color: var(--colors-primary-text);
    }

    .header-title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      font-weight: var(--font-weights-semibold);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .chevron {
      margin-left: auto;
      opacity: var(--opacity-40);
      transition: transform var(--durations-normal) var(--easings-default), opacity var(--durations-normal);
      color: var(--colors-muted-foreground);
    }

    .chevron.expanded {
      transform: rotate(90deg);
      opacity: var(--opacity-80);
    }

    .header-button:hover .chevron {
      opacity: var(--opacity-80);
      color: var(--colors-primary-text);
    }

    .chevron svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .header-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
      border-radius: var(--radii-sm);
    }

    .content {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: grid-template-rows var(--durations-slow) var(--easings-default);
    }

    .content.expanded {
      grid-template-rows: 1fr;
    }

    .content-inner {
      min-height: 0;
    }
  `;

  // ========================================
  // Event Handlers
  // ========================================

  private handleToggle() {
    this.dispatchEvent(
      new CustomEvent('toggle', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    return html`
      <button class="header-button" @click=${this.handleToggle}>
        <div class="header-icon">
          <slot name="icon"></slot>
        </div>
        <span class="header-title">${this.title}</span>
        <span class="chevron ${this.isExpanded ? 'expanded' : ''}">
          ${unsafeHTML(icons.ChevronRight)}
        </span>
      </button>

      <div class="content ${this.isExpanded ? 'expanded' : ''}">
        <div class="content-inner">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-collapsible-section': GraphCollapsibleSection;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-collapsible-section')) {
  customElements.define('graph-collapsible-section', GraphCollapsibleSection);
}
