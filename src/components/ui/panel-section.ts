/**
 * PanelSection Lit Component
 *
 * A consistent container for sections within panels.
 * Provides padding, borders, and flex-shrink control.
 *
 * @example
 * ```html
 * <graph-panel-section bordered shrink>
 *   <h3>Section Title</h3>
 *   <p>Section content...</p>
 * </graph-panel-section>
 * ```
 *
 * @slot - Default slot for section content
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export type PanelSectionPadding = 'none' | 'sm' | 'md' | 'lg';

export class GraphPanelSection extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * Whether to show a bottom border
   */
  @property({ type: Boolean })
  declare bordered: boolean;

  /**
   * Padding size
   */
  @property({ type: String })
  declare padding: PanelSectionPadding;

  /**
   * Whether to prevent shrinking (flex-shrink: 0)
   */
  @property({ type: Boolean })
  declare shrink: boolean;

  constructor() {
    super();
    this.bordered = false;
    this.padding = 'md';
    this.shrink = true;
  }

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
    }

    :host([bordered]) {
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    :host([shrink]) {
      flex-shrink: 0;
    }

    :host(:not([shrink])) {
      flex-shrink: 1;
    }

    /* Padding: none */
    :host([padding="none"]) {
      padding: 0;
    }

    /* Padding: sm */
    :host([padding="sm"]) {
      padding: var(--spacing-2);
    }

    /* Padding: md (default) */
    :host,
    :host([padding="md"]) {
      padding: var(--spacing-md);
    }

    /* Padding: lg */
    :host([padding="lg"]) {
      padding: var(--spacing-lg);
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
    return html`<slot></slot>`;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-panel-section': GraphPanelSection;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-panel-section')) {
  customElements.define('graph-panel-section', GraphPanelSection);
}
