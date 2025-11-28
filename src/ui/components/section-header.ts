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

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

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

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-3);
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
    }

    .count {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      opacity: var(--opacity-30);
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
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
