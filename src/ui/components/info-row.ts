/**
 * InfoRow Lit Component
 *
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @example
 * ```html
 * <graph-info-row label="Platform" value="iOS"></graph-info-row>
 * ```
 *
 * @slot - Default slot for complex value content (overrides value prop)
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export class GraphInfoRow extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The label text (left side)
   */
  @property({ type: String })
  declare label: string;

  /**
   * The value text (right side) - can be overridden by slot
   */
  @property({ type: String })
  declare value: string;

  constructor() {
    super();
    this.label = '';
    this.value = '';
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
    }

    .label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .value {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-foreground);
    }
  `;

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    return html`
      <span class="label">${this.label}:</span>
      <span class="value">
        <slot>${this.value}</slot>
      </span>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-info-row': GraphInfoRow;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-info-row')) {
  customElements.define('graph-info-row', GraphInfoRow);
}
