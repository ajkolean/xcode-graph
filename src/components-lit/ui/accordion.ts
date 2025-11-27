import { LitElement, html, css, svg } from 'lit';

export class GraphAccordion extends LitElement {
  static override properties = {
    value: { type: String },
    type: { type: String },
  };

  static override styles = css`
    :host {
      display: block;
    }
  `;

  declare value: string;
  declare type: 'single' | 'multiple';

  constructor() {
    super();
    this.value = '';
    this.type = 'single';
  }

  private handleItemToggle(e: CustomEvent<{ value: string; open: boolean }>) {
    if (this.type === 'single') {
      this.value = e.detail.open ? e.detail.value : '';
    }

    this.dispatchEvent(
      new CustomEvent('accordion-change', {
        detail: { value: e.detail.value, open: e.detail.open },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot @accordion-item-toggle=${this.handleItemToggle}></slot>`;
  }
}

export class GraphAccordionItem extends LitElement {
  static override properties = {
    value: { type: String },
    open: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      border-bottom: 1px solid var(--colors-border);
    }

    :host(:last-child) {
      border-bottom: none;
    }
  `;

  declare value: string;
  declare open: boolean;

  constructor() {
    super();
    this.value = '';
    this.open = false;
  }

  private handleToggle() {
    this.open = !this.open;

    this.dispatchEvent(
      new CustomEvent('accordion-item-toggle', {
        detail: { value: this.value, open: this.open },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot @accordion-trigger-click=${this.handleToggle}></slot>`;
  }
}

export class GraphAccordionTrigger extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    button {
      display: flex;
      flex: 1;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      border-radius: var(--radii-md);
      padding-block: 16px;
      text-align: left;
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      transition: all 150ms;
      cursor: pointer;
      outline: none;
      border: none;
      background: transparent;
      width: 100%;
    }

    button:hover {
      text-decoration: underline;
    }

    button:focus-visible {
      box-shadow: 0 0 0 3px rgba(111, 44, 255, 0.5);
    }

    button:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    .icon {
      color: var(--colors-muted-foreground);
      pointer-events: none;
      flex-shrink: 0;
      transition: transform 200ms;
    }

    :host([open]) .icon {
      transform: rotate(180deg);
    }
  `;

  declare open: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.open = false;
    this.disabled = false;
  }

  private handleClick() {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('accordion-trigger-click', {
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <button
        type="button"
        data-slot="accordion-trigger"
        data-state=${this.open ? 'open' : 'closed'}
        @click=${this.handleClick}
      >
        <slot></slot>
        ${svg`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        `}
      </button>
    `;
  }
}

export class GraphAccordionContent extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      overflow: hidden;
      font-size: var(--font-sizes-sm);
      transition: all 150ms;
    }

    :host(:not([open])) {
      display: none;
    }

    .content {
      padding-top: 0;
      padding-bottom: 16px;
    }
  `;

  declare open: boolean;

  constructor() {
    super();
    this.open = false;
  }

  protected override render() {
    return html`
      <div class="content" data-slot="accordion-content" data-state=${this.open ? 'open' : 'closed'}>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('graph-accordion', GraphAccordion);
customElements.define('graph-accordion-item', GraphAccordionItem);
customElements.define('graph-accordion-trigger', GraphAccordionTrigger);
customElements.define('graph-accordion-content', GraphAccordionContent);

declare global {
  interface HTMLElementTagNameMap {
    'graph-accordion': GraphAccordion;
    'graph-accordion-item': GraphAccordionItem;
    'graph-accordion-trigger': GraphAccordionTrigger;
    'graph-accordion-content': GraphAccordionContent;
  }
}
