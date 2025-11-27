/**
 * StatsCard Lit Component
 *
 * Reusable stats card component for displaying metrics.
 * Used across all right sidebar panels for consistent metric display.
 *
 * @example
 * ```html
 * <graph-stats-card label="Total" value="42"></graph-stats-card>
 * <graph-stats-card label="Selected" value="10" highlighted></graph-stats-card>
 * ```
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class GraphStatsCard extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The label text displayed above the value
   */
  @property({ type: String, attribute: 'label' })
  declare label: string;

  /**
   * The value to display (can be string or number)
   */
  @property({ type: String, attribute: 'value' })
  declare value: string | number;

  /**
   * Whether to highlight the value with accent color
   */
  @property({ type: Boolean, attribute: 'highlighted' })
  declare highlighted: boolean;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      flex: 1;
    }

    .container {
      padding: 12px;
      border-radius: var(--radius);
      background-color: var(--color-card);
      border: 1px solid var(--color-border);
      cursor: default;
      transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
    }

    .container:hover {
      transform: scale(1.02);
      box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 15%, transparent);
    }

    .label {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      margin-bottom: var(--spacing-xs);
    }

    .value {
      font-family: 'DM Sans', sans-serif;
      font-size: var(--text-h3);
      font-weight: var(--font-weight-semibold);
      color: var(--color-foreground);
    }

    .value.highlighted {
      color: rgba(168, 157, 255, 1);
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container">
        <div class="label">${this.label}</div>
        <div class="value ${this.highlighted ? 'highlighted' : ''}">
          ${this.value}
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-stats-card': GraphStatsCard;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-stats-card')) {
  customElements.define('graph-stats-card', GraphStatsCard);
}
