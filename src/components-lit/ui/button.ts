import { LitElement, html, css } from 'lit';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

/**
 * Graph Button - A Lit Web Component for buttons
 *
 * Uses Shadow DOM for proper slot support and CSS custom properties for styling.
 *
 * @example
 * ```html
 * <graph-button>Click me</graph-button>
 * <graph-button variant="destructive">Delete</graph-button>
 * <graph-button variant="outline" size="sm">Small</graph-button>
 * <graph-button size="icon"><svg>...</svg></graph-button>
 * ```
 */
export class GraphButton extends LitElement {
  static override properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    type: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      white-space: nowrap;
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      transition: all var(--durations-fast);
      flex-shrink: 0;
      cursor: pointer;
      outline: none;
      border: 1px solid transparent;
    }

    button:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    button:focus-visible {
      box-shadow: 0 0 0 3px var(--colors-ring);
    }

    /* Default variant */
    :host([variant="default"]) button,
    :host(:not([variant])) button {
      background-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    :host([variant="default"]) button:hover,
    :host(:not([variant])) button:hover {
      opacity: 0.9;
    }

    /* Destructive variant */
    :host([variant="destructive"]) button {
      background-color: var(--colors-destructive);
      color: var(--colors-white);
    }

    :host([variant="destructive"]) button:hover {
      opacity: 0.9;
    }

    /* Outline variant */
    :host([variant="outline"]) button {
      border-color: var(--colors-border);
      background-color: var(--colors-background);
      color: var(--colors-foreground);
    }

    :host([variant="outline"]) button:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    /* Secondary variant */
    :host([variant="secondary"]) button {
      background-color: var(--colors-secondary);
      color: var(--colors-secondary-foreground);
    }

    :host([variant="secondary"]) button:hover {
      opacity: 0.8;
    }

    /* Ghost variant */
    :host([variant="ghost"]) button {
      background-color: transparent;
    }

    :host([variant="ghost"]) button:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    /* Link variant */
    :host([variant="link"]) button {
      background-color: transparent;
      color: var(--colors-primary);
      text-decoration: none;
    }

    :host([variant="link"]) button:hover {
      text-decoration: underline;
    }

    /* Default size */
    :host([size="default"]) button,
    :host(:not([size])) button {
      height: var(--sizes-9);
      padding: var(--spacing-2) var(--spacing-4);
    }

    /* Small size */
    :host([size="sm"]) button {
      height: var(--sizes-8);
      padding: var(--spacing-1) var(--spacing-3);
      gap: var(--spacing-1);
    }

    /* Large size */
    :host([size="lg"]) button {
      height: var(--sizes-10);
      padding: var(--spacing-2) var(--spacing-6);
    }

    /* Icon size */
    :host([size="icon"]) button {
      height: var(--sizes-9);
      width: var(--sizes-9);
      padding: 0;
    }

    ::slotted(svg) {
      width: 16px;
      height: 16px;
      pointer-events: none;
      flex-shrink: 0;
    }
  `;

  declare variant: ButtonVariant;
  declare size: ButtonSize;
  declare disabled: boolean;
  declare type: 'button' | 'submit' | 'reset';

  constructor() {
    super();
    this.variant = 'default';
    this.size = 'default';
    this.disabled = false;
    this.type = 'button';
  }

  private handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('button-click', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        data-slot="button"
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('graph-button', GraphButton);

declare global {
  interface HTMLElementTagNameMap {
    'graph-button': GraphButton;
  }
}
