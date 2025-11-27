import { LitElement, html, css } from 'lit';

// Collapsible Root
export class GraphCollapsible extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: block;
    }
  `;

  declare open: boolean;

  constructor() {
    super();
    this.open = false;
  }

  private handleTriggerClick = () => {
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('collapsible-change', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      })
    );
  };

  override connectedCallback() {
    super.connectedCallback();
    // Listen for trigger clicks from children
    this.addEventListener('trigger-click', this.handleTriggerClick as EventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('trigger-click', this.handleTriggerClick as EventListener);
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Collapsible Trigger
export class GraphCollapsibleTrigger extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      cursor: pointer;
    }

    button {
      all: inherit;
      width: 100%;
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
    }
  `;

  private handleClick = (e: Event) => {
    e.preventDefault();
    // Dispatch event to parent collapsible
    this.dispatchEvent(
      new CustomEvent('trigger-click', {
        bubbles: true,
        composed: true,
      })
    );
  };

  protected override render() {
    return html`
      <button @click=${this.handleClick}>
        <slot></slot>
      </button>
    `;
  }
}

// Collapsible Content
export class GraphCollapsibleContent extends LitElement {
  static override properties = {
    _open: { type: Boolean, state: true },
  };

  static override styles = css`
    :host {
      display: block;
      overflow: hidden;
    }

    :host([hidden]) {
      display: none;
    }

    .content {
      overflow: hidden;
      transition: height var(--durations-normal, 150ms) ease-out;
    }

    .content[data-state='closed'] {
      height: 0;
    }

    .content[data-state='open'] {
      height: auto;
    }
  `;

  declare _open: boolean;
  private contentHeight = 0;

  constructor() {
    super();
    this._open = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    // Listen to parent collapsible state changes
    const updateOpen = () => {
      const collapsible = this.closest('graph-collapsible') as GraphCollapsible;
      if (collapsible) {
        this._open = collapsible.open;
      }
    };

    // Initial check
    updateOpen();

    // Listen for changes
    this.addEventListener('collapsible-change', updateOpen as EventListener);

    // Also use MutationObserver to watch for open attribute changes on parent
    const collapsible = this.closest('graph-collapsible');
    if (collapsible) {
      const observer = new MutationObserver(updateOpen);
      observer.observe(collapsible, {
        attributes: true,
        attributeFilter: ['open'],
      });
      (this as any)._observer = observer;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const observer = (this as any)._observer;
    if (observer) {
      observer.disconnect();
    }
  }

  protected override render() {
    return html`
      <div class="content" data-state=${this._open ? 'open' : 'closed'}>
        <slot></slot>
      </div>
    `;
  }
}

// Register all components
customElements.define('graph-collapsible', GraphCollapsible);
customElements.define('graph-collapsible-trigger', GraphCollapsibleTrigger);
customElements.define('graph-collapsible-content', GraphCollapsibleContent);

declare global {
  interface HTMLElementTagNameMap {
    'graph-collapsible': GraphCollapsible;
    'graph-collapsible-trigger': GraphCollapsibleTrigger;
    'graph-collapsible-content': GraphCollapsibleContent;
  }
}
