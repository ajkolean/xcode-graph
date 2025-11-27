import { LitElement, html, css } from 'lit';

/**
 * Graph Textarea - A Lit Web Component for multiline text input
 *
 * Uses Shadow DOM with native Lit CSS for proper encapsulation.
 *
 * @example
 * ```html
 * <graph-textarea placeholder="Enter description..."></graph-textarea>
 * <graph-textarea rows="5"></graph-textarea>
 * ```
 */
export class GraphTextarea extends LitElement {
  static override properties = {
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean },
    name: { type: String },
    rows: { type: Number },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare rows: number;

  constructor() {
    super();
    this.value = '';
    this.placeholder = '';
    this.disabled = false;
    this.required = false;
    this.name = '';
    this.rows = 3;
  }

  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    textarea {
      display: flex;
      min-height: 64px;
      width: 100%;
      border-radius: var(--radii-md);
      border: 1px solid var(--colors-input);
      background-color: var(--colors-input-background);
      padding-inline: var(--spacing-3);
      padding-block: var(--spacing-2);
      font-size: var(--font-sizes-base);
      color: var(--colors-foreground);
      transition: colors var(--durations-normal);
      outline: none;
      resize: none;
      font-family: inherit;
    }

    textarea::placeholder {
      color: var(--colors-muted-foreground);
    }

    textarea:focus-visible {
      border-color: var(--colors-ring);
      outline: 3px solid var(--colors-ring);
      outline-offset: 0;
      opacity: 0.5;
    }

    textarea:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;

    this.dispatchEvent(
      new CustomEvent('textarea-change', {
        detail: { value: target.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <textarea
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?required=${this.required}
        name=${this.name}
        rows=${this.rows}
        @input=${this.handleInput}
      ></textarea>
    `;
  }
}

customElements.define('graph-textarea', GraphTextarea);

declare global {
  interface HTMLElementTagNameMap {
    'graph-textarea': GraphTextarea;
  }
}
