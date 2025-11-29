/**
 * IconButton Lit Component
 *
 * A unified icon button component with variants for all clickable icon scenarios.
 * Supports ghost, subtle, and solid variants with multiple color options.
 *
 * @example
 * ```html
 * <graph-icon-button
 *   title="Close"
 *   variant="ghost"
 *   color="neutral"
 * >
 *   <svg>...</svg>
 * </graph-icon-button>
 * ```
 *
 * @fires click - Native click event (not prevented)
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export type IconButtonVariant = 'ghost' | 'subtle' | 'solid';
export type IconButtonColor = 'neutral' | 'primary' | 'destructive';
export type IconButtonSize = 'sm' | 'md';

export class GraphIconButton extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * Button variant style
   */
  @property({ type: String })
  declare variant: IconButtonVariant;

  /**
   * Button color scheme
   */
  @property({ type: String })
  declare color: IconButtonColor;

  /**
   * Button size
   */
  @property({ type: String })
  declare size: IconButtonSize;

  /**
   * Whether the button is disabled
   */
  @property({ type: Boolean })
  declare disabled: boolean;

  /**
   * Tooltip text
   */
  @property({ type: String })
  declare title: string;

  constructor() {
    super();
    this.variant = 'ghost';
    this.color = 'neutral';
    this.size = 'md';
    this.disabled = false;
    this.title = '';
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      border: var(--border-widths-thin) solid transparent;
      cursor: pointer;
      transition:
        background-color var(--durations-fast) var(--easings-out),
        border-color var(--durations-fast) var(--easings-out),
        color var(--durations-fast) var(--easings-out),
        transform var(--durations-fast) var(--easings-out);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: var(--opacity-40);
    }

    button:active:not(:disabled) {
      transform: scale(0.95);
    }

    /* Size: sm */
    :host([size="sm"]) button {
      padding: var(--spacing-1);
      border-radius: var(--radii-sm);
    }

    :host([size="sm"]) ::slotted(svg),
    :host([size="sm"]) button svg {
      width: var(--sizes-icon-xs);
      height: var(--sizes-icon-xs);
    }

    /* Size: md (default) */
    button {
      padding: var(--spacing-1);
      border-radius: var(--radii-md);
    }

    ::slotted(svg),
    button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      stroke: currentColor;
    }

    /* Variant: ghost (default) */
    button {
      background: none;
      color: var(--colors-muted-foreground);
    }

    /* Ghost + Neutral */
    :host([variant="ghost"][color="neutral"]) button:hover:not(:disabled),
    :host([color="neutral"]:not([variant])) button:hover:not(:disabled) {
      background-color: var(--colors-muted);
      color: var(--colors-foreground);
    }

    /* Ghost + Primary */
    :host([variant="ghost"][color="primary"]) button:hover:not(:disabled) {
      background-color: rgba(var(--colors-primary-rgb), var(--opacity-10));
      color: var(--colors-primary);
    }

    /* Ghost + Destructive */
    :host([variant="ghost"][color="destructive"]) button:hover:not(:disabled) {
      background-color: rgba(var(--colors-destructive-rgb), var(--opacity-10));
      color: var(--colors-destructive);
    }

    /* Variant: subtle */
    :host([variant="subtle"]) button {
      background: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      border-color: rgba(var(--colors-foreground-rgb), var(--opacity-10));
      color: var(--colors-muted-foreground);
    }

    :host([variant="subtle"][color="neutral"]) button:hover:not(:disabled) {
      background: rgba(var(--colors-foreground-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-foreground-rgb), var(--opacity-15));
      color: var(--colors-foreground);
    }

    :host([variant="subtle"][color="primary"]) button:hover:not(:disabled) {
      background: rgba(var(--colors-primary-rgb), var(--opacity-10));
      border-color: rgba(var(--colors-primary-rgb), var(--opacity-20));
      color: var(--colors-primary);
    }

    :host([variant="subtle"][color="destructive"]) button:hover:not(:disabled) {
      background-color: rgba(var(--colors-destructive-rgb), var(--opacity-15));
      border-color: rgba(var(--colors-destructive-rgb), var(--opacity-30));
      color: var(--colors-destructive);
      transform: scale(1.05);
    }

    :host([variant="subtle"][color="destructive"]) button:active:not(:disabled) {
      transform: scale(0.95);
    }

    /* Variant: solid */
    :host([variant="solid"][color="neutral"]) button {
      background: var(--colors-muted);
      color: var(--colors-foreground);
    }

    :host([variant="solid"][color="neutral"]) button:hover:not(:disabled) {
      background: var(--colors-muted-foreground);
      color: var(--colors-background);
    }

    :host([variant="solid"][color="primary"]) button {
      background: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    :host([variant="solid"][color="primary"]) button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--colors-primary) 85%, white);
    }

    :host([variant="solid"][color="destructive"]) button {
      background: var(--colors-destructive);
      color: var(--colors-destructive-foreground);
    }

    :host([variant="solid"][color="destructive"]) button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--colors-destructive) 85%, white);
    }
  `;

  // ========================================
  // Render
  // ========================================

  override render() {
    return html`
      <button
        ?disabled=${this.disabled}
        title=${this.title || ''}
      >
        <slot></slot>
      </button>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-icon-button': GraphIconButton;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-icon-button')) {
  customElements.define('graph-icon-button', GraphIconButton);
}
