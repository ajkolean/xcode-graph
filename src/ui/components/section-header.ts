/**
 * SectionHeader Lit Component
 *
 * A simple header component for sections with title and count.
 * Used in node-list, cluster-targets-list, and other list sections.
 *
 * @example
 * ```html
 * <graph-section-header
 *   title="Dependencies"
 *   count="5"
 *   suffix="direct"
 * ></graph-section-header>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * A simple header component for sections with title and count.
 * Used in node-list, cluster-targets-list, and other list sections.
 *
 * @summary Section header with title and count display
 */
export class GraphSectionHeader extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The section title
   */
  @property({ type: String })
  declare title: string;

  /**
   * The count to display
   */
  @property({ type: Number })
  declare count: number;

  /**
   * Optional suffix after count (e.g., "direct", "targets")
   */
  @property({ type: String })
  declare suffix: string;

  constructor() {
    super();
    this.count = 0;
    this.suffix = '';
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-3);
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-semibold);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      color: var(--colors-muted-foreground);
    }

    .count {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      opacity: var(--opacity-50);
    }
  `;

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    const countText = this.suffix ? `${this.count} ${this.suffix}` : `${this.count}`;

    return html`
      <div class="title">${this.title}</div>
      <div class="count">${countText}</div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-section-header': GraphSectionHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-section-header')) {
  customElements.define('graph-section-header', GraphSectionHeader);
}
