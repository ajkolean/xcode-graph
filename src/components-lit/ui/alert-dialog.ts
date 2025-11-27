import { LitElement, html, css } from 'lit';

// Alert Dialog Root
export class GraphAlertDialog extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: contents;
    }
  `;

  declare open: boolean;

  constructor() {
    super();
    this.open = false;
  }

  closeDialog(action: 'cancel' | 'action' = 'cancel') {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('alert-dialog-close', {
        detail: { action },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Alert Dialog Trigger
export class GraphAlertDialogTrigger extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `;

  private handleClick = () => {
    const alertDialog = this.closest('graph-alert-dialog') as GraphAlertDialog;
    if (alertDialog) {
      alertDialog.open = true;
    }
  };

  protected override render() {
    return html`
      <div @click=${this.handleClick}>
        <slot></slot>
      </div>
    `;
  }
}

// Alert Dialog Content
export class GraphAlertDialogContent extends LitElement {
  static override properties = {
    _open: { type: Boolean, state: true },
  };

  static override styles = css`
    dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 50;
      display: grid;
      width: 100%;
      max-width: calc(100% - 2rem);
      gap: var(--spacing-4);
      border-radius: var(--radii-lg);
      border: 1px solid var(--colors-border);
      background-color: var(--colors-background);
      padding: var(--spacing-6);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      transition-property: opacity, transform;
      transition-duration: 200ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (min-width: 640px) {
      dialog {
        max-width: 32rem;
      }
    }

    dialog::backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: rgba(0, 0, 0, 0.5);
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    dialog[open] {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    dialog:not([open]) {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
  `;

  declare _open: boolean;

  constructor() {
    super();
    this._open = false;
  }

  override connectedCallback() {
    super.connectedCallback();

    const alertDialog = this.closest('graph-alert-dialog') as GraphAlertDialog;
    if (alertDialog) {
      const updateOpen = () => {
        this._open = alertDialog.open;
        this.updateDialogState();
      };

      const observer = new MutationObserver(updateOpen);
      observer.observe(alertDialog, {
        attributes: true,
        attributeFilter: ['open'],
      });

      (this as any)._observer = observer;
      updateOpen();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const observer = (this as any)._observer;
    if (observer) {
      observer.disconnect();
    }
  }

  private updateDialogState() {
    const dialogEl = this.shadowRoot?.querySelector('dialog');
    if (!dialogEl) return;

    if (this._open && !dialogEl.open) {
      if (typeof dialogEl.showModal === 'function') {
        dialogEl.showModal();
      } else {
        dialogEl.setAttribute('open', '');
        (dialogEl as any).open = true;
      }
    } else if (!this._open && dialogEl.open) {
      if (typeof dialogEl.close === 'function') {
        dialogEl.close();
      } else {
        dialogEl.removeAttribute('open');
        (dialogEl as any).open = false;
      }
    }
  }

  private handleCancel = (e: Event) => {
    e.preventDefault();
    const alertDialog = this.closest('graph-alert-dialog') as GraphAlertDialog;
    alertDialog?.closeDialog('cancel');
  };

  protected override render() {
    return html`
      <dialog @close=${this.handleCancel} @cancel=${this.handleCancel}>
        <slot></slot>
      </dialog>
    `;
  }

  override updated(changed: Map<string, any>) {
    if (changed.has('_open')) {
      this.updateDialogState();
    }
  }
}

// Alert Dialog Header
export class GraphAlertDialogHeader extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      text-align: center;
    }

    @media (min-width: 640px) {
      :host {
        text-align: left;
      }
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Alert Dialog Footer
export class GraphAlertDialogFooter extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column-reverse;
      gap: var(--spacing-2);
    }

    @media (min-width: 640px) {
      :host {
        flex-direction: row;
        justify-content: flex-end;
      }
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Alert Dialog Title
export class GraphAlertDialogTitle extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: var(--font-sizes-lg);
      font-weight: var(--font-weights-semibold, 600);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Alert Dialog Description
export class GraphAlertDialogDescription extends LitElement {
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

// Alert Dialog Action (confirm button)
export class GraphAlertDialogAction extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      height: var(--spacing-9);
      padding: 0 var(--spacing-4);
      background-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
      border: none;
      cursor: pointer;
      transition-property: background-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    button:hover {
      background-color: var(--colors-primary);
      opacity: 0.9;
    }

    button:focus-visible {
      outline: 2px solid var(--colors-ring);
      outline-offset: 2px;
    }
  `;

  private handleClick = () => {
    const alertDialog = this.closest('graph-alert-dialog') as GraphAlertDialog;
    alertDialog?.closeDialog('action');
  };

  protected override render() {
    return html`
      <button @click=${this.handleClick}>
        <slot></slot>
      </button>
    `;
  }
}

// Alert Dialog Cancel (cancel button)
export class GraphAlertDialogCancel extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      height: var(--spacing-9);
      padding: 0 var(--spacing-4);
      border: 1px solid var(--colors-input);
      background-color: var(--colors-background);
      cursor: pointer;
      transition-property: background-color, color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    button:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    button:focus-visible {
      outline: 2px solid var(--colors-ring);
      outline-offset: 2px;
    }
  `;

  private handleClick = () => {
    const alertDialog = this.closest('graph-alert-dialog') as GraphAlertDialog;
    alertDialog?.closeDialog('cancel');
  };

  protected override render() {
    return html`
      <button @click=${this.handleClick}>
        <slot></slot>
      </button>
    `;
  }
}

// Register all components
customElements.define('graph-alert-dialog', GraphAlertDialog);
customElements.define('graph-alert-dialog-trigger', GraphAlertDialogTrigger);
customElements.define('graph-alert-dialog-content', GraphAlertDialogContent);
customElements.define('graph-alert-dialog-header', GraphAlertDialogHeader);
customElements.define('graph-alert-dialog-footer', GraphAlertDialogFooter);
customElements.define('graph-alert-dialog-title', GraphAlertDialogTitle);
customElements.define('graph-alert-dialog-description', GraphAlertDialogDescription);
customElements.define('graph-alert-dialog-action', GraphAlertDialogAction);
customElements.define('graph-alert-dialog-cancel', GraphAlertDialogCancel);

declare global {
  interface HTMLElementTagNameMap {
    'graph-alert-dialog': GraphAlertDialog;
    'graph-alert-dialog-trigger': GraphAlertDialogTrigger;
    'graph-alert-dialog-content': GraphAlertDialogContent;
    'graph-alert-dialog-header': GraphAlertDialogHeader;
    'graph-alert-dialog-footer': GraphAlertDialogFooter;
    'graph-alert-dialog-title': GraphAlertDialogTitle;
    'graph-alert-dialog-description': GraphAlertDialogDescription;
    'graph-alert-dialog-action': GraphAlertDialogAction;
    'graph-alert-dialog-cancel': GraphAlertDialogCancel;
  }
}
