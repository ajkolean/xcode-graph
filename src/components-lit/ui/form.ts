import { LitElement, html, css } from 'lit';

// Form Item (container for form field)
export class GraphFormItem extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      gap: var(--spacing-2);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Form Label
export class GraphFormLabel extends LitElement {
  static override properties = {
    error: { type: Boolean, reflect: true },
    for: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-block;
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      line-height: 1;
      color: var(--colors-foreground);
    }

    :host([error]) {
      color: var(--colors-destructive);
    }

    label {
      cursor: pointer;
    }
  `;

  declare error: boolean;
  declare for: string;

  constructor() {
    super();
    this.error = false;
    this.for = '';
  }

  protected override render() {
    return html`
      <label for=${this.for}>
        <slot></slot>
      </label>
    `;
  }
}

// Form Control (wrapper for input element)
export class GraphFormControl extends LitElement {
  static override properties = {
    describedby: { type: String },
    invalid: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: block;
    }

    ::slotted(*) {
      width: 100%;
    }
  `;

  declare describedby: string;
  declare invalid: boolean;

  constructor() {
    super();
    this.describedby = '';
    this.invalid = false;
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  override firstUpdated() {
    // Apply aria attributes to slotted elements
    const slot = this.shadowRoot?.querySelector('slot');
    const elements = slot?.assignedElements() as HTMLElement[];

    if (elements && elements.length > 0) {
      const element = elements[0];
      if (this.describedby) {
        element.setAttribute('aria-describedby', this.describedby);
      }
      if (this.invalid) {
        element.setAttribute('aria-invalid', 'true');
      }
    }
  }
}

// Form Description
export class GraphFormDescription extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Form Message (error message)
export class GraphFormMessage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: var(--font-sizes-sm);
      color: var(--colors-destructive);
      font-weight: var(--font-weights-medium);
    }

    :host(:empty) {
      display: none;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Register all components
customElements.define('graph-form-item', GraphFormItem);
customElements.define('graph-form-label', GraphFormLabel);
customElements.define('graph-form-control', GraphFormControl);
customElements.define('graph-form-description', GraphFormDescription);
customElements.define('graph-form-message', GraphFormMessage);

declare global {
  interface HTMLElementTagNameMap {
    'graph-form-item': GraphFormItem;
    'graph-form-label': GraphFormLabel;
    'graph-form-control': GraphFormControl;
    'graph-form-description': GraphFormDescription;
    'graph-form-message': GraphFormMessage;
  }
}
