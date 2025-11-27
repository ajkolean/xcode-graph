import { LitElement, html, css } from 'lit';

/**
 * Graph Input - A Lit Web Component for text input fields
 *
 * Uses Light DOM for Panda CSS styling.
 *
 * @example
 * ```html
 * <graph-input placeholder="Enter text..."></graph-input>
 * <graph-input type="email" value="user@example.com"></graph-input>
 * <graph-input disabled></graph-input>
 * ```
 */
export class GraphInput extends LitElement {
  static override properties = {
    type: { type: String },
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean },
    name: { type: String },
    className: { type: String, attribute: 'class' },
  };

  declare type: string;
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare className: string;

  constructor() {
    super();
    this.type = 'text';
    this.value = '';
    this.placeholder = '';
    this.disabled = false;
    this.required = false;
    this.name = '';
    this.className = '';
  }

  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    input {
      display: flex;
      height: var(--sizes-9);
      width: 100%;
      min-width: 0;
      border-radius: var(--radii-md);
      border: 1px solid var(--colors-input);
      background-color: var(--colors-input-background);
      padding-inline: var(--spacing-3);
      padding-block: var(--spacing-1);
      font-size: var(--font-sizes-base);
      color: var(--colors-foreground);
      transition: colors var(--durations-normal);
      outline: none;
    }

    input::placeholder {
      color: var(--colors-muted-foreground);
    }

    input:focus-visible {
      border-color: var(--colors-ring);
      outline: 3px solid var(--colors-ring);
      outline-offset: 0;
      opacity: 0.5;
    }

    input:disabled {
      pointer-events: none;
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;

    // Dispatch custom event for React wrapper
    this.dispatchEvent(
      new CustomEvent('input-change', {
        detail: { value: target.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <input
        type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?required=${this.required}
        name=${this.name}
        @input=${this.handleInput}
      />
    `;
  }
}

customElements.define('graph-input', GraphInput);

declare global {
  interface HTMLElementTagNameMap {
    'graph-input': GraphInput;
  }
}
