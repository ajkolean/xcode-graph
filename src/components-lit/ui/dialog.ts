import { LitElement, html, css } from 'lit';

// Dialog Root
export class GraphDialog extends LitElement {
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

  closeDialog() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('dialog-open-change', {
        detail: { open: false },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Dialog Trigger
export class GraphDialogTrigger extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `;

  private handleClick = () => {
    const dialog = this.closest('graph-dialog') as GraphDialog;
    if (dialog) {
      dialog.open = true;
      dialog.dispatchEvent(
        new CustomEvent('dialog-open-change', {
          detail: { open: true },
          bubbles: true,
          composed: true,
        })
      );
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

// Dialog Content (uses native <dialog>)
export class GraphDialogContent extends LitElement {
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

    .close-button {
      position: absolute;
      top: var(--spacing-4);
      right: var(--spacing-4);
      border-radius: var(--radii-xs, 0.125rem);
      opacity: 0.7;
      transition: opacity 150ms;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      outline: none;
    }

    .close-button:hover {
      opacity: 1;
    }

    .close-button:focus {
      box-shadow: 0 0 0 2px var(--colors-ring);
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    .close-button svg {
      width: var(--spacing-4);
      height: var(--spacing-4);
      pointer-events: none;
      flex-shrink: 0;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `;

  declare _open: boolean;

  constructor() {
    super();
    this._open = false;
  }

  override connectedCallback() {
    super.connectedCallback();

    const dialog = this.closest('graph-dialog') as GraphDialog;
    if (dialog) {
      const updateOpen = () => {
        this._open = dialog.open;
        this.updateDialogState();
      };

      dialog.addEventListener('dialog-open-change', updateOpen as EventListener);

      const observer = new MutationObserver(updateOpen);
      observer.observe(dialog, {
        attributes: true,
        attributeFilter: ['open'],
      });

      (this as any)._observer = observer;
      (this as any)._updateOpen = updateOpen;

      // Initial state
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
      // Check if showModal is supported (JSDOM doesn't support it)
      if (typeof dialogEl.showModal === 'function') {
        dialogEl.showModal();
      } else {
        // Fallback for test environments
        dialogEl.setAttribute('open', '');
        (dialogEl as any).open = true;
      }
    } else if (!this._open && dialogEl.open) {
      if (typeof dialogEl.close === 'function') {
        dialogEl.close();
      } else {
        // Fallback for test environments
        dialogEl.removeAttribute('open');
        (dialogEl as any).open = false;
      }
    }
  }

  private handleClose = () => {
    const dialog = this.closest('graph-dialog') as GraphDialog;
    dialog?.closeDialog();
  };

  private handleDialogClose = (e: Event) => {
    // Prevent default close and use our custom close handler
    e.preventDefault();
    this.handleClose();
  };

  protected override render() {
    return html`
      <dialog @close=${this.handleDialogClose} @cancel=${this.handleDialogClose}>
        <slot></slot>
        <button class="close-button" @click=${this.handleClose} aria-label="Close">
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span class="sr-only">Close</span>
        </button>
      </dialog>
    `;
  }

  override updated(changed: Map<string, any>) {
    if (changed.has('_open')) {
      this.updateDialogState();
    }
  }
}

// Dialog Header
export class GraphDialogHeader extends LitElement {
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

// Dialog Footer
export class GraphDialogFooter extends LitElement {
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

// Dialog Title
export class GraphDialogTitle extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: var(--font-sizes-lg);
      font-weight: var(--font-weights-semibold, 600);
      line-height: 1;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Dialog Description
export class GraphDialogDescription extends LitElement {
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

// Register all components
customElements.define('graph-dialog', GraphDialog);
customElements.define('graph-dialog-trigger', GraphDialogTrigger);
customElements.define('graph-dialog-content', GraphDialogContent);
customElements.define('graph-dialog-header', GraphDialogHeader);
customElements.define('graph-dialog-footer', GraphDialogFooter);
customElements.define('graph-dialog-title', GraphDialogTitle);
customElements.define('graph-dialog-description', GraphDialogDescription);

declare global {
  interface HTMLElementTagNameMap {
    'graph-dialog': GraphDialog;
    'graph-dialog-trigger': GraphDialogTrigger;
    'graph-dialog-content': GraphDialogContent;
    'graph-dialog-header': GraphDialogHeader;
    'graph-dialog-footer': GraphDialogFooter;
    'graph-dialog-title': GraphDialogTitle;
    'graph-dialog-description': GraphDialogDescription;
  }
}
