/**
 * StatsCard Lit Component
 *
 * Reusable stats card component for displaying metrics.
 * Can be toggleable for interactive highlight controls.
 *
 * @example
 * ```html
 * <xcode-graph-stats-card label="Total" value="42"></xcode-graph-stats-card>
 * <xcode-graph-stats-card label="Deps" value="10" toggleable active></xcode-graph-stats-card>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Reusable stats card component for displaying metrics.
 * Can be toggleable for interactive highlight controls.
 *
 * @summary Stats metric card with optional toggle behavior
 * @fires card-toggle - Dispatched when a toggleable card is clicked
 */
export class GraphStatsCard extends LitElement {
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

  /**
   * Whether to use compact sizing (smaller fonts for node detail metrics)
   */
  @property({ type: Boolean, attribute: 'compact' })
  declare compact: boolean;

  /**
   * Whether this card is a clickable toggle
   */
  @property({ type: Boolean, attribute: 'toggleable' })
  declare toggleable: boolean;

  /**
   * Whether this toggleable card is currently active (on)
   */
  @property({ type: Boolean, attribute: 'active' })
  declare active: boolean;

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      flex: 1;
    }

    .container {
      position: relative;
      padding: var(--spacing-3) var(--spacing-md);
      border-radius: var(--radii-lg);
      background: var(--colors-card);
      border: var(--border-widths-thin) solid var(--colors-border);
      cursor: default;
      transition:
        border-color var(--durations-normal) var(--easings-out);
      overflow: hidden;
    }

    .container.highlighted {
      border-color: var(--colors-accent);
    }

    /* Toggleable styles */
    .container.toggleable {
      cursor: pointer;
      user-select: none;
    }

    /* Toggleable inactive: gray/muted appearance */
    .container.toggleable:not(.active) {
      border-color: color-mix(in srgb, var(--colors-muted-foreground) 30%, transparent);
    }

    /* Toggleable active: primary styling */
    .container.toggleable.active {
      border-color: var(--colors-primary);
    }

    .label {
      position: relative;
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: none;
      color: var(--colors-primary-text);
      opacity: var(--opacity-100);
      margin-bottom: var(--spacing-1);
    }

    .container.highlighted .label {
      color: var(--colors-accent);
    }

    /* Toggleable inactive label: muted */
    .container.toggleable:not(.active) .label {
      color: var(--colors-muted-foreground);
      opacity: 0.7;
    }

    /* Toggleable active label: primary */
    .container.toggleable.active .label {
      color: var(--colors-primary-text);
    }

    .value {
      position: relative;
      font-family: var(--fonts-heading);
      font-size: var(--font-sizes-h2);
      font-weight: var(--font-weights-medium);
      font-variant-numeric: tabular-nums;
      color: var(--colors-foreground);
      line-height: var(--line-heights-none);
    }

    /* Compact mode for node detail metrics */
    :host([compact]) .container {
      padding: var(--spacing-2) var(--spacing-3);
    }

    :host([compact]) .value {
      font-size: var(--font-sizes-h3);
    }

    :host([compact]) .label {
      font-size: var(--font-sizes-xs);
    }

    .value.highlighted {
      color: var(--colors-accent);
    }

    /* Toggleable inactive value: muted */
    .container.toggleable:not(.active) .value {
      color: var(--colors-muted-foreground);
    }
  `;

  /** Dispatches card-toggle event when the card is toggleable and clicked */
  private handleClick() {
    if (this.toggleable) {
      this.dispatchEvent(
        new CustomEvent('card-toggle', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /** Renders the stats card with label, value, and conditional styling */
  override render(): TemplateResult {
    const classes = [
      'container',
      this.highlighted ? 'highlighted' : '',
      this.toggleable ? 'toggleable' : '',
      this.active ? 'active' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${classes}" @click=${this.handleClick}>
        <div class="label">${this.label}</div>
        <div class="value ${this.highlighted ? 'highlighted' : ''}">
          ${this.value}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-stats-card': GraphStatsCard;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-stats-card')) {
  customElements.define('xcode-graph-stats-card', GraphStatsCard);
}
