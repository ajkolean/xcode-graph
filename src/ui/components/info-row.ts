/**
 * InfoRow Lit Component
 *
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @example
 * ```html
 * <xcode-graph-info-row label="Platform" value="iOS"></xcode-graph-info-row>
 * ```
 *
 * @slot - Default slot for complex value content (overrides value prop)
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @summary Key-value pair display row
 * @slot - Default slot for complex value content (overrides value prop)
 */
export class GraphInfoRow extends LitElement {
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

  /** Renders the component template */
  override render(): TemplateResult {
    return html`
      <span class="label">${this.label}:</span>
      <span class="value">
        <slot>${this.value}</slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-info-row': GraphInfoRow;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-info-row')) {
  customElements.define('xcode-graph-info-row', GraphInfoRow);
}
