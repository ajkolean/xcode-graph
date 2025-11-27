import { LitElement, html, css } from 'lit';

/**
 * Graph Switch - A Lit Web Component for toggle switches
 *
 * Accessible switch with proper ARIA support and keyboard navigation.
 * Uses Shadow DOM with CSS custom properties.
 */
export class GraphSwitch extends LitElement {
  static override properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
    value: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      height: 18.4px;
      width: 32px;
      flex-shrink: 0;
      align-items: center;
      border-radius: var(--radii-full);
      border: 1px solid transparent;
      transition: all var(--durations-fast);
      cursor: pointer;
      outline: none;
      padding: 0;
      position: relative;
    }

    button:focus-visible {
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px var(--colors-ring);
      opacity: 0.5;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host([checked]) button {
      background-color: var(--colors-primary);
    }

    :host(:not([checked])) button {
      background-color: var(--colors-input-background);
    }

    .thumb {
      pointer-events: none;
      display: block;
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background-color: var(--colors-card);
      transition: transform 150ms;
    }

    :host([checked]) .thumb {
      transform: translateX(calc(100% - 2px));
    }

    :host(:not([checked])) .thumb {
      transform: translateX(0);
    }
  `;

  declare checked: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.name = '';
    this.value = '';
  }

  private handleClick() {
    if (this.disabled) return;

    this.checked = !this.checked;

    this.dispatchEvent(
      new CustomEvent('switch-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.handleClick();
    }
  }

  protected override render() {
    return html`
      <button
        type="button"
        role="switch"
        aria-checked=${this.checked}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : 0}
        data-slot="switch"
        data-state=${this.checked ? 'checked' : 'unchecked'}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <span class="thumb" data-slot="switch-thumb"></span>
      </button>
    `;
  }
}

customElements.define('graph-switch', GraphSwitch);

declare global {
  interface HTMLElementTagNameMap {
    'graph-switch': GraphSwitch;
  }
}
