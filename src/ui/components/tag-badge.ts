/**
 * TagBadge Lit Component
 *
 * Displays architecture tags (like domain:*, layer:*) with color-coding
 * based on the tag prefix. Useful for showing organizational metadata.
 *
 * @example
 * ```html
 * <graph-tag-badge tag="domain:infrastructure"></graph-tag-badge>
 * <graph-tag-badge tag="layer:feature" interactive></graph-tag-badge>
 * ```
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

/** Tag prefix colors for visual distinction */
const TAG_PREFIX_COLORS: Record<string, string> = {
  domain: '#3B82F6', // Blue
  layer: '#10B981', // Green
  type: '#8B5CF6', // Purple
  scope: '#F59E0B', // Amber
  team: '#EC4899', // Pink
  feature: '#06B6D4', // Cyan
};

/** Default color for tags without recognized prefix */
const DEFAULT_TAG_COLOR = '#6B7280'; // Gray

export class GraphTagBadge extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The full tag string (e.g., "domain:infrastructure")
   */
  @property({ type: String })
  declare tag: string;

  /**
   * Whether the badge has interactive hover states
   */
  @property({ type: Boolean })
  declare interactive: boolean;

  constructor() {
    super();
    this.interactive = false;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: inline-flex;
    }

    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      letter-spacing: 0.01em;
      cursor: default;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        filter var(--durations-fast) var(--easings-out);

      background-color: var(--tag-bg);
      border: var(--border-widths-thin) solid var(--tag-border);
      color: var(--tag-color);
    }

    .prefix {
      opacity: 0.7;
    }

    .value {
      font-weight: var(--font-weights-semibold);
    }

    /* Interactive states */
    .tag-badge.interactive {
      cursor: pointer;
    }

    .tag-badge.interactive:hover {
      filter: brightness(1.1);
      background-color: var(--tag-bg-hover);
      border-color: var(--tag-border-hover);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private parseTag(): { prefix: string; value: string; color: string } {
    const parts = this.tag.split(':');
    if (parts.length >= 2) {
      const prefix = parts[0];
      const value = parts.slice(1).join(':');
      const color = TAG_PREFIX_COLORS[prefix] || DEFAULT_TAG_COLOR;
      return { prefix, value, color };
    }
    return { prefix: '', value: this.tag, color: DEFAULT_TAG_COLOR };
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    if (!this.tag) return html``;

    const { prefix, value, color } = this.parseTag();

    const classes = ['tag-badge', this.interactive ? 'interactive' : ''].filter(Boolean).join(' ');

    return html`
      <span
        class="${classes}"
        style="
          --tag-color: ${color};
          --tag-bg: ${color}15;
          --tag-border: ${color}30;
          --tag-bg-hover: ${color}25;
          --tag-border-hover: ${color}50;
        "
        title=${this.tag}
      >
        ${prefix ? html`<span class="prefix">${prefix}:</span>` : ''}
        <span class="value">${value}</span>
      </span>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-tag-badge': GraphTagBadge;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-tag-badge')) {
  customElements.define('graph-tag-badge', GraphTagBadge);
}
