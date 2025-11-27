import { LitElement, html, css } from 'lit';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';

export type SelectSize = 'sm' | 'default';

// Select Root
export class GraphSelect extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
  `;

  declare open: boolean;
  declare value: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.open = false;
    this.value = '';
    this.disabled = false;
  }

  toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('select-open-change', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      })
    );
  }

  selectValue(newValue: string) {
    this.value = newValue;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('select-change', {
        detail: { value: newValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Select Trigger
export class GraphSelectTrigger extends LitElement {
  static override properties = {
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    placeholder: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      width: 100%;
    }

    button {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-2);
      border-radius: var(--radii-md);
      border: 1px solid var(--colors-input);
      background-color: var(--colors-input-background);
      padding: var(--spacing-2) var(--spacing-3);
      font-size: var(--font-sizes-sm);
      white-space: nowrap;
      transition-property: color, box-shadow;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      outline: none;
      cursor: pointer;
    }

    :host([size='default']) button {
      height: var(--spacing-9);
    }

    :host([size='sm']) button {
      height: var(--spacing-8);
    }

    button:focus-visible {
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px var(--colors-ring);
      opacity: 0.5;
    }

    :host([placeholder]) button {
      color: var(--colors-muted-foreground);
    }

    button:disabled,
    :host([disabled]) button {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .icon {
      width: var(--spacing-4);
      height: var(--spacing-4);
      opacity: 0.5;
      flex-shrink: 0;
    }
  `;

  declare size: SelectSize;
  declare disabled: boolean;
  declare placeholder: boolean;

  constructor() {
    super();
    this.size = 'default';
    this.disabled = false;
    this.placeholder = false;
  }

  private handleClick() {
    const select = this.closest('graph-select') as GraphSelect;
    select?.toggleOpen();
  }

  protected override render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
        aria-haspopup="listbox"
        aria-expanded=${this.closest('graph-select')?.open ? 'true' : 'false'}
      >
        <slot></slot>
        <svg
          class="icon"
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
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    `;
  }
}

// Select Value (displays selected value)
export class GraphSelectValue extends LitElement {
  static override properties = {
    placeholder: { type: String },
  };

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  declare placeholder: string;

  constructor() {
    super();
    this.placeholder = 'Select...';
  }

  protected override render() {
    const select = this.closest('graph-select') as GraphSelect;
    const value = select?.value;

    if (!value) {
      return html`<span>${this.placeholder}</span>`;
    }

    return html`<slot></slot>`;
  }
}

// Select Content (dropdown)
export class GraphSelectContent extends LitElement {
  static override properties = {
    _open: { type: Boolean, state: true },
  };

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: 50;
      max-height: var(--radix-select-content-available-height, 400px);
      min-width: 8rem;
      overflow-x: hidden;
      overflow-y: auto;
      border-radius: var(--radii-md);
      border: 1px solid var(--colors-border);
      background-color: var(--colors-popover);
      color: var(--colors-popover-foreground);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    :host([data-state='open']) {
      display: block;
    }

    .viewport {
      padding: var(--spacing-1);
    }
  `;

  declare _open: boolean;
  private cleanup?: () => void;

  constructor() {
    super();
    this._open = false;
  }

  override connectedCallback() {
    super.connectedCallback();

    const select = this.closest('graph-select') as GraphSelect;
    if (select) {
      const updateOpen = () => {
        this._open = select.open;
        if (this._open) {
          this.updatePosition();
        }
      };

      select.addEventListener('select-open-change', updateOpen as EventListener);

      const observer = new MutationObserver(updateOpen);
      observer.observe(select, {
        attributes: true,
        attributeFilter: ['open'],
      });

      (this as any)._observer = observer;
      (this as any)._updateOpen = updateOpen;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const observer = (this as any)._observer;
    if (observer) {
      observer.disconnect();
    }
    this.cleanup?.();
  }

  private async updatePosition() {
    const select = this.closest('graph-select') as GraphSelect;
    const trigger = select?.querySelector('graph-select-trigger');

    if (!trigger || !this._open) return;

    // Wait for next frame to ensure elements are rendered
    await new Promise((resolve) => requestAnimationFrame(resolve));

    this.cleanup = autoUpdate(trigger, this, async () => {
      const { x, y } = await computePosition(trigger, this, {
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
      });

      Object.assign(this.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  protected override render() {
    return html`
      <div class="viewport" role="listbox">
        <slot></slot>
      </div>
    `;
  }

  override updated(changed: Map<string, any>) {
    if (changed.has('_open')) {
      this.setAttribute('data-state', this._open ? 'open' : 'closed');
    }
  }
}

// Select Item
export class GraphSelectItem extends LitElement {
  static override properties = {
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: flex;
      position: relative;
      width: 100%;
      cursor: default;
      user-select: none;
      align-items: center;
      gap: var(--spacing-2);
      border-radius: var(--radii-sm);
      padding: var(--spacing-1-5) var(--spacing-2);
      padding-right: var(--spacing-8);
      font-size: var(--font-sizes-sm);
      outline: none;
    }

    :host(:hover),
    :host(:focus) {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .indicator {
      position: absolute;
      right: var(--spacing-2);
      display: flex;
      width: var(--spacing-3-5, 0.875rem);
      height: var(--spacing-3-5, 0.875rem);
      align-items: center;
      justify-content: center;
    }

    .indicator svg {
      width: var(--spacing-4);
      height: var(--spacing-4);
    }

    :host(:not([selected])) .indicator {
      display: none;
    }
  `;

  declare value: string;
  declare disabled: boolean;
  declare selected: boolean;

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
    this.selected = false;
  }

  private handleClick() {
    if (this.disabled) return;

    const select = this.closest('graph-select') as GraphSelect;
    select?.selectValue(this.value);

    // Update all items in the same select
    const allItems = select?.querySelectorAll('graph-select-item');
    allItems?.forEach((item) => {
      (item as GraphSelectItem).selected = item === this;
    });
  }

  protected override render() {
    return html`
      <div @click=${this.handleClick} role="option" aria-selected=${this.selected}>
        <slot></slot>
        <span class="indicator">
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
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </div>
    `;
  }
}

// Select Label
export class GraphSelectLabel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: var(--spacing-2);
      padding-top: var(--spacing-1-5);
      padding-bottom: var(--spacing-1-5);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Select Separator
export class GraphSelectSeparator extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 1px;
      margin: var(--spacing-1) calc(var(--spacing-1) * -1);
      background-color: var(--colors-border);
      pointer-events: none;
    }
  `;

  protected override render() {
    return html``;
  }
}

// Select Group
export class GraphSelectGroup extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Register all components
customElements.define('graph-select', GraphSelect);
customElements.define('graph-select-trigger', GraphSelectTrigger);
customElements.define('graph-select-value', GraphSelectValue);
customElements.define('graph-select-content', GraphSelectContent);
customElements.define('graph-select-item', GraphSelectItem);
customElements.define('graph-select-label', GraphSelectLabel);
customElements.define('graph-select-separator', GraphSelectSeparator);
customElements.define('graph-select-group', GraphSelectGroup);

declare global {
  interface HTMLElementTagNameMap {
    'graph-select': GraphSelect;
    'graph-select-trigger': GraphSelectTrigger;
    'graph-select-value': GraphSelectValue;
    'graph-select-content': GraphSelectContent;
    'graph-select-item': GraphSelectItem;
    'graph-select-label': GraphSelectLabel;
    'graph-select-separator': GraphSelectSeparator;
    'graph-select-group': GraphSelectGroup;
  }
}
