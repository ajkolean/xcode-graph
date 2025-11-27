import { LitElement, html, css } from 'lit';

// Input OTP Root
export class GraphInputOTP extends LitElement {
  static override properties = {
    maxLength: { type: Number },
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  declare maxLength: number;
  declare value: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.maxLength = 6;
    this.value = '';
    this.disabled = false;
  }

  setValue(newValue: string) {
    // Limit to maxLength
    this.value = newValue.slice(0, this.maxLength);
    this.dispatchEvent(
      new CustomEvent('input-otp-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
    this.requestUpdate();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Input OTP Group
export class GraphInputOTPGroup extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Input OTP Slot
export class GraphInputOTPSlot extends LitElement {
  static override properties = {
    index: { type: Number },
    active: { type: Boolean, reflect: true },
    char: { type: String },
    invalid: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: flex;
      position: relative;
      width: var(--spacing-9);
      height: var(--spacing-9);
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--colors-input);
      border-bottom: 1px solid var(--colors-input);
      border-right: 1px solid var(--colors-input);
      background-color: var(--colors-input-background);
      font-size: var(--font-sizes-sm);
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      outline: none;
    }

    :host(:first-of-type) {
      border-left: 1px solid var(--colors-input);
      border-top-left-radius: var(--radii-md);
      border-bottom-left-radius: var(--radii-md);
    }

    :host(:last-of-type) {
      border-top-right-radius: var(--radii-md);
      border-bottom-right-radius: var(--radii-md);
    }

    :host([active]) {
      z-index: 10;
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px var(--colors-ring);
      opacity: 0.5;
    }

    :host([invalid]) {
      border-color: var(--colors-destructive);
    }

    :host([active][invalid]) {
      border-color: var(--colors-destructive);
      box-shadow: 0 0 0 3px var(--colors-destructive);
      opacity: 0.2;
    }

    .caret {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .caret-line {
      width: 1px;
      height: var(--spacing-4);
      background-color: var(--colors-foreground);
      animation: caret-blink 1s step-end infinite;
    }

    @keyframes caret-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
    }

    :host(:not([active])) .caret {
      display: none;
    }
  `;

  declare index: number;
  declare active: boolean;
  declare char: string;
  declare invalid: boolean;

  constructor() {
    super();
    this.index = 0;
    this.active = false;
    this.char = '';
    this.invalid = false;
  }

  protected override render() {
    return html`
      <span>${this.char || ''}</span>
      ${this.active && !this.char
        ? html`
            <div class="caret">
              <div class="caret-line"></div>
            </div>
          `
        : ''}
    `;
  }
}

// Input OTP Separator
export class GraphInputOTPSeparator extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      width: var(--spacing-4);
      height: var(--spacing-4);
    }
  `;

  protected override render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14" />
      </svg>
    `;
  }
}

// Register all components
customElements.define('graph-input-otp', GraphInputOTP);
customElements.define('graph-input-otp-group', GraphInputOTPGroup);
customElements.define('graph-input-otp-slot', GraphInputOTPSlot);
customElements.define('graph-input-otp-separator', GraphInputOTPSeparator);

declare global {
  interface HTMLElementTagNameMap {
    'graph-input-otp': GraphInputOTP;
    'graph-input-otp-group': GraphInputOTPGroup;
    'graph-input-otp-slot': GraphInputOTPSlot;
    'graph-input-otp-separator': GraphInputOTPSeparator;
  }
}
