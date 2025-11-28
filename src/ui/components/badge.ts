/**
 * Badge Lit Component
 *
 * A reusable badge/label component with color theming and multiple variants.
 * Consolidates badge patterns used across node-header, cluster-header,
 * cluster-type-badge, and filter-section components.
 *
 * @example
 * ```html
 * <!-- Pill badge (default) -->
 * <graph-badge
 *   label="Target"
 *   color="#10B981"
 * ></graph-badge>
 *
 * <!-- Rounded badge with accent border -->
 * <graph-badge
 *   label="Package"
 *   color="#8B5CF6"
 *   variant="accent"
 *   size="sm"
 * ></graph-badge>
 *
 * <!-- Interactive badge with glow -->
 * <graph-badge
 *   label="iOS"
 *   color="#3B82F6"
 *   interactive
 *   glow
 * ></graph-badge>
 * ```
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export type BadgeVariant = 'pill' | 'rounded' | 'accent';
export type BadgeSize = 'sm' | 'md';

export class GraphBadge extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The text to display in the badge
   */
  @property({ type: String })
  declare label: string;

  /**
   * The color for the badge (hex or CSS color)
   */
  @property({ type: String })
  declare color: string;

  /**
   * Badge shape variant
   * - 'pill': Fully rounded (radii-full)
   * - 'rounded': Small border radius (radii-sm)
   * - 'accent': Small radius with left accent border
   */
  @property({ type: String })
  declare variant: BadgeVariant;

  /**
   * Badge size
   * - 'sm': Smaller text (xs), monospace font
   * - 'md': Medium text (sm), body font
   */
  @property({ type: String })
  declare size: BadgeSize;

  /**
   * Whether the badge has interactive hover states
   */
  @property({ type: Boolean })
  declare interactive: boolean;

  /**
   * Whether to show glow effect on hover
   */
  @property({ type: Boolean })
  declare glow: boolean;

  constructor() {
    super();
    this.variant = 'pill';
    this.size = 'md';
    this.interactive = false;
    this.glow = false;
  }

  // ========================================
  // Styles
  // ========================================

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      cursor: default;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        box-shadow var(--durations-fast) var(--easings-out),
        filter var(--durations-fast) var(--easings-out);

      text-transform: uppercase;
      border: var(--border-widths-thin) solid transparent;

      /* Dynamic theming via CSS custom properties */
      background-color: var(--badge-bg);
      border-color: var(--badge-border);
      color: var(--badge-color);
    }

    /* Variant: pill (fully rounded) */
    .badge.variant-pill {
      border-radius: var(--radii-full);
    }

    /* Variant: rounded (small radius) */
    .badge.variant-rounded {
      border-radius: var(--radii-sm);
    }

    /* Variant: accent (small radius + left border) */
    .badge.variant-accent {
      border-radius: var(--radii-sm);
      border-left: var(--border-widths-medium) solid var(--badge-color);
    }

    /* Size: sm */
    .badge.size-sm {
      padding: var(--spacing-1) var(--spacing-2);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      line-height: 1;
      font-weight: var(--font-weights-semibold);
      letter-spacing: var(--letter-spacing-wider);
    }

    /* Size: md */
    .badge.size-md {
      padding: var(--spacing-1) var(--spacing-2);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      line-height: var(--line-heights-tight);
      font-weight: var(--font-weights-medium);
      letter-spacing: 0.02em;
    }

    /* Interactive states */
    .badge.interactive {
      cursor: pointer;
    }

    .badge.interactive:hover {
      filter: brightness(1.1);
      background-color: var(--badge-bg-hover);
      border-color: var(--badge-border-hover);
    }

    .badge.interactive.variant-accent:hover {
      border-left-color: var(--badge-color);
    }

    /* Glow effect on hover */
    .badge.glow:hover {
      box-shadow: 0 0 12px var(--badge-glow);
    }
  `;

  // ========================================
  // Render
  // ========================================

  override render() {
    const color = this.color || '#8B5CF6';

    // Compute class list
    const classes = [
      'badge',
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.interactive ? 'interactive' : '',
      this.glow ? 'glow' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <span
        class="${classes}"
        style="
          --badge-color: ${color};
          --badge-bg: ${color}20;
          --badge-border: ${color}40;
          --badge-bg-hover: ${color}25;
          --badge-border-hover: ${color}50;
          --badge-glow: ${color}30;
        "
      >
        ${this.label}
      </span>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-badge': GraphBadge;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-badge')) {
  customElements.define('graph-badge', GraphBadge);
}
