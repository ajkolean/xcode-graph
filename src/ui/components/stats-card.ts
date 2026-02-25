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

  static override readonly styles = css`
    :host {
      display: block;
      flex: 1;
    }

    .container {
      position: relative;
      padding: var(--spacing-3) var(--spacing-md);
      border-radius: var(--radii-sm);
      background: var(--gradient-card);
      border: var(--border-widths-thin) solid var(--colors-border);
      border-left: 4px solid var(--colors-primary);
      box-shadow: inset 3px 0 8px -3px rgba(var(--colors-primary-rgb), var(--opacity-20));
      cursor: default;
      transition:
        transform var(--durations-normal) var(--easings-out),
        box-shadow var(--durations-normal) var(--easings-out),
        border-color var(--durations-normal) var(--easings-out);
      overflow: hidden;
    }

    /* Noise texture overlay */
    .container::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--effect-noise);
      opacity: var(--opacity-4);
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
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--colors-primary);
      opacity: var(--opacity-100);
      margin-bottom: var(--spacing-1);
    }

    .container.highlighted .label {
      color: var(--colors-accent);
    }

    .value {
      position: relative;
      font-family: var(--fonts-heading);
      font-size: var(--font-sizes-h1);
      font-weight: var(--font-weights-medium);
      font-variant-numeric: tabular-nums;
      color: var(--colors-foreground);
      line-height: var(--line-heights-none);
      text-shadow: 0 0 30px rgba(var(--colors-primary-rgb), var(--opacity-10));
    }

    .value.highlighted {
      color: var(--colors-accent);
      text-shadow: 0 0 20px rgba(var(--colors-accent-rgb), var(--opacity-40));
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

  override render() {
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
