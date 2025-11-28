/**
 * StatsCard Lit Component - Mission Control Theme
 *
 * Reusable stats card component for displaying metrics.
 * Features bold left accent border, noise texture, and monospace typography.
 *
 * @example
 * ```html
 * <graph-stats-card label="Total" value="42"></graph-stats-card>
 * <graph-stats-card label="Selected" value="10" highlighted></graph-stats-card>
 * ```
 */

import { css, html, LitElement } from 'lit';
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
      position: relative;
      padding: 14px 16px;
      border-radius: var(--radii-sm);
      background: var(--gradient-card);
      border: 1px solid var(--colors-border);
      border-left: 3px solid var(--colors-primary);
      cursor: default;
      transition:
        transform 0.2s var(--easings-out),
        box-shadow 0.2s var(--easings-out),
        border-color 0.2s var(--easings-out);
      overflow: hidden;
    }

    /* Noise texture overlay */
    .container::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--effect-noise);
      opacity: 0.03;
      pointer-events: none;
      border-radius: inherit;
    }

    .container:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadows-glow-primary);
      border-left-color: var(--colors-primary);
    }

    .container.highlighted {
      border-left-color: var(--colors-accent);
    }

    .container.highlighted:hover {
      box-shadow: var(--shadows-glow-accent);
    }

    .label {
      position: relative;
      font-family: var(--fonts-mono);
      font-size: 10px;
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--colors-primary);
      opacity: 0.8;
      margin-bottom: 6px;
    }

    .container.highlighted .label {
      color: var(--colors-accent);
    }

    .value {
      position: relative;
      font-family: var(--fonts-heading);
      font-size: 28px;
      font-weight: var(--font-weights-medium);
      font-variant-numeric: tabular-nums;
      color: var(--colors-foreground);
      line-height: var(--line-heights-none);
    }

    .value.highlighted {
      color: var(--colors-accent);
      text-shadow: 0 0 20px rgba(var(--colors-accent-rgb), 0.4);
    }

    /* Subtle scan line effect */
    .container::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--effect-scanlines);
      pointer-events: none;
      border-radius: inherit;
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container ${this.highlighted ? 'highlighted' : ''}">
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
