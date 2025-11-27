import { LitElement, html, css } from 'lit';

export class GraphTabs extends LitElement {
  static override properties = {
    value: { type: String },
  };

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;

  declare value: string;

  constructor() {
    super();
    this.value = '';
  }

  private handleTabChange(e: CustomEvent<{ value: string }>) {
    this.value = e.detail.value;

    this.dispatchEvent(
      new CustomEvent('tabs-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot @tab-trigger-click=${this.handleTabChange}></slot>`;
  }
}

export class GraphTabsList extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      height: 36px;
      width: fit-content;
      align-items: center;
      justify-content: center;
      border-radius: var(--radii-lg);
      background-color: var(--colors-muted);
      color: var(--colors-muted-foreground);
      padding: 3px;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphTabsTrigger extends LitElement {
  static override properties = {
    value: { type: String },
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    button {
      display: inline-flex;
      height: calc(100% - 1px);
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: var(--radii-lg);
      border: 1px solid transparent;
      padding: 4px 8px;
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      white-space: nowrap;
      transition: colors 150ms;
      cursor: pointer;
      outline: none;
    }

    :host([active]) button {
      background-color: var(--colors-card);
      color: var(--colors-foreground);
    }

    button:focus-visible {
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px rgba(111, 44, 255, 0.5);
    }

    button:disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  `;

  declare value: string;
  declare active: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.value = '';
    this.active = false;
    this.disabled = false;
  }

  private handleClick() {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('tab-trigger-click', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <button
        type="button"
        role="tab"
        aria-selected=${this.active}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : 0}
        data-slot="tabs-trigger"
        data-state=${this.active ? 'active' : 'inactive'}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

export class GraphTabsContent extends LitElement {
  static override properties = {
    value: { type: String },
    active: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      flex: 1;
      outline: none;
    }

    :host(:not([active])) {
      display: none;
    }
  `;

  declare value: string;
  declare active: boolean;

  constructor() {
    super();
    this.value = '';
    this.active = false;
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

customElements.define('graph-tabs', GraphTabs);
customElements.define('graph-tabs-list', GraphTabsList);
customElements.define('graph-tabs-trigger', GraphTabsTrigger);
customElements.define('graph-tabs-content', GraphTabsContent);

declare global {
  interface HTMLElementTagNameMap {
    'graph-tabs': GraphTabs;
    'graph-tabs-list': GraphTabsList;
    'graph-tabs-trigger': GraphTabsTrigger;
    'graph-tabs-content': GraphTabsContent;
  }
}
