import { LitElement, html, css } from 'lit';

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'default' | 'sm' | 'lg';

/**
 * Graph Toggle - A Lit Web Component for toggle buttons
 *
 * Uses Shadow DOM with CSS custom properties.
 */
export class GraphToggle extends LitElement {
  static override properties = {
    pressed: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    variant: { type: String },
    size: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      transition: colors var(--durations-fast);
      white-space: nowrap;
      flex-shrink: 0;
      cursor: pointer;
      outline: none;
      border: 1px solid transparent;
      background-color: transparent;
    }

    button:hover {
      background-color: var(--colors-muted);
      color: var(--colors-muted-foreground);
    }

    button:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    button:focus-visible {
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px rgba(111, 44, 255, 0.5);
    }

    /* Outline variant */
    :host([variant="outline"]) button {
      border-color: var(--colors-input);
    }

    :host([variant="outline"]) button:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    /* Pressed state */
    :host([pressed]) button {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    /* Sizes */
    :host([size="default"]) button,
    :host(:not([size])) button {
      height: 36px;
      padding-inline: 8px;
      min-width: 36px;
    }

    :host([size="sm"]) button {
      height: 32px;
      padding-inline: 6px;
      min-width: 32px;
    }

    :host([size="lg"]) button {
      height: 40px;
      padding-inline: 10px;
      min-width: 40px;
    }
  `;

  declare pressed: boolean;
  declare disabled: boolean;
  declare variant: ToggleVariant;
  declare size: ToggleSize;

  constructor() {
    super();
    this.pressed = false;
    this.disabled = false;
    this.variant = 'default';
    this.size = 'default';
  }

  private handleClick() {
    if (this.disabled) return;

    this.pressed = !this.pressed;

    this.dispatchEvent(
      new CustomEvent('toggle-change', {
        detail: { pressed: this.pressed },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <button
        type="button"
        aria-pressed=${this.pressed}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        data-slot="toggle"
        data-state=${this.pressed ? 'on' : 'off'}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('graph-toggle', GraphToggle);

declare global {
  interface HTMLElementTagNameMap {
    'graph-toggle': GraphToggle;
  }
}
