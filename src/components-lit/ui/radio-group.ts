import { LitElement, html, css, svg } from 'lit';

/**
 * Graph Radio Group - Container for radio buttons
 */
export class GraphRadioGroup extends LitElement {
  static override properties = {
    value: { type: String },
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: grid;
      gap: 12px;
    }
  `;

  declare value: string;
  declare name: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.disabled = false;
  }

  private handleRadioChange(e: CustomEvent<{ value: string }>) {
    this.value = e.detail.value;

    this.dispatchEvent(
      new CustomEvent('radio-group-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot @radio-item-change=${this.handleRadioChange}></slot>`;
  }
}

/**
 * Graph Radio Item - Individual radio button
 */
export class GraphRadioItem extends LitElement {
  static override properties = {
    value: { type: String },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      aspect-ratio: 1;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 9999px;
      border: 1px solid var(--colors-input);
      background-color: var(--colors-input-background);
      transition: all 150ms;
      cursor: pointer;
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    button:focus-visible {
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px rgba(111, 44, 255, 0.5);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .indicator {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  declare value: string;
  declare checked: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.value = '';
    this.checked = false;
    this.disabled = false;
  }

  private handleClick() {
    if (this.disabled) return;

    this.checked = true;

    this.dispatchEvent(
      new CustomEvent('radio-item-change', {
        detail: { value: this.value },
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
        role="radio"
        aria-checked=${this.checked}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : 0}
        data-slot="radio-group-item"
        data-state=${this.checked ? 'checked' : 'unchecked'}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        ${this.checked
          ? html`
              <span class="indicator" data-slot="radio-group-indicator">
                ${svg`
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--colors-primary)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <circle cx="12" cy="12" r="12"/>
                  </svg>
                `}
              </span>
            `
          : ''}
      </button>
    `;
  }
}

customElements.define('graph-radio-group', GraphRadioGroup);
customElements.define('graph-radio-item', GraphRadioItem);

declare global {
  interface HTMLElementTagNameMap {
    'graph-radio-group': GraphRadioGroup;
    'graph-radio-item': GraphRadioItem;
  }
}
