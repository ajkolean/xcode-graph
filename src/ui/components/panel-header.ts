/**
 * PanelHeader Lit Component
 *
 * A reusable header component for detail panels with back button,
 * icon box, title, subtitle, and optional badges slot.
 * Consolidates patterns from node-header and cluster-header.
 *
 * @example
 * ```html
 * <xcode-graph-panel-header
 *   title="MyTarget"
 *   subtitle="Framework"
 *   color="#10B981"
 *   @back=${handleBack}
 * >
 *   <svg slot="icon">...</svg>
 *   <xcode-graph-badge slot="badges" label="Target" color="#10B981"></xcode-graph-badge>
 * </xcode-graph-panel-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 *
 * @slot icon - Icon content for the icon box (SVG or other element)
 * @slot badges - Badge elements to display below the header
 */

import { icons } from '@shared/utils/icon-adapter';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * A reusable header component for detail panels with back button,
 * icon box, title, subtitle, and optional badges slot.
 *
 * @summary Reusable panel header with back button and badge slots
 * @fires back - Dispatched when the back button is clicked
 * @slot icon - Icon content for the icon box (SVG or other element)
 * @slot badges - Badge elements to display below the header
 */
export class GraphPanelHeader extends LitElement {
  /**
   * The main title/name to display
   */
  @property({ type: String })
  declare title: string;

  /**
   * Optional subtitle text
   */
  @property({ type: String })
  declare subtitle: string;

  /**
   * Theme color for the icon box glow
   */
  @property({ type: String })
  declare color: string;

  /**
   * Title size variant
   * - 'lg': Larger heading (h2 size) - for node details
   * - 'md': Medium heading (h3 size) - for cluster details
   */
  @property({ type: String, attribute: 'title-size' })
  declare titleSize: 'lg' | 'md';

  constructor() {
    super();
    this.titleSize = 'lg';
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      flex-shrink: 0;
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-2);
    }

    /* No badges margin adjustment */
    :host([no-badges]) .header-row {
      margin-bottom: 0;
    }

    .back-button {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
      border-radius: var(--radii-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--colors-muted-foreground);
      cursor: pointer;
      transition: background-color var(--durations-normal) var(--easings-out);
      margin-top: var(--spacing-1);
    }

    .back-button:hover {
      background-color: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .back-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .back-button svg {
      width: var(--sizes-icon-lg);
      height: var(--sizes-icon-lg);
    }

    .content {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      flex: 1;
      min-width: 0;
    }

    .icon-box {
      width: var(--spacing-10);
      height: var(--spacing-10);
      border-radius: var(--radii-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-box ::slotted(svg) {
      width: 24px;
      height: 24px;
    }

    .icon-box ::slotted(*) {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-family: var(--fonts-body);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }

    .title.size-lg {
      font-size: var(--font-sizes-h2);
    }

    .title.size-md {
      font-size: var(--font-sizes-h3);
    }

    .subtitle {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badges {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    /* Hide badges container when empty */
    .badges:empty {
      display: none;
    }
  `;

  private handleBack() {
    this.dispatchEvent(
      new CustomEvent('back', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    const color = this.color || '#8B5CF6';

    return html`
      <div class="header-row">
        <!-- Back Button -->
        <button class="back-button" aria-label="Back to overview" @click=${this.handleBack}>
          ${icons.ChevronLeft}
        </button>

        <div class="content">
          <!-- Icon Box -->
          <div
            class="icon-box"
            style="
              background-color: ${color}15;
              box-shadow: 0 0 12px ${color}20;
            "
          >
            <slot name="icon"></slot>
          </div>

          <!-- Info -->
          <div class="info">
            <h2 class="title size-${this.titleSize}">${this.title}</h2>
            ${this.subtitle ? html`<div class="subtitle">${this.subtitle}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Badges Slot -->
      <div class="badges">
        <slot name="badges"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-panel-header': GraphPanelHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-panel-header')) {
  customElements.define('xcode-graph-panel-header', GraphPanelHeader);
}
