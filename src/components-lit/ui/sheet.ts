import { LitElement, html, css } from 'lit';

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

// Sheet Root
export class GraphSheet extends LitElement {
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

  closeSheet() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('sheet-open-change', {
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

// Sheet Trigger
export class GraphSheetTrigger extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `;

  private handleClick = () => {
    const sheet = this.closest('graph-sheet') as GraphSheet;
    if (sheet) {
      sheet.open = true;
      sheet.dispatchEvent(
        new CustomEvent('sheet-open-change', {
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

// Sheet Content
export class GraphSheetContent extends LitElement {
  static override properties = {
    _open: { type: Boolean, state: true },
    side: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: 50;
      flex-direction: column;
      gap: var(--spacing-4);
      background-color: var(--colors-background);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      transition-property: transform, opacity;
      transition-duration: 300ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host([data-state='open']) {
      display: flex;
    }

    /* Right side (default) */
    :host([side='right']) {
      top: 0;
      right: 0;
      bottom: 0;
      width: 75%;
      max-width: 24rem;
      border-left: 1px solid var(--colors-border);
      transform: translateX(100%);
    }

    :host([side='right'][data-state='open']) {
      transform: translateX(0);
    }

    /* Left side */
    :host([side='left']) {
      top: 0;
      left: 0;
      bottom: 0;
      width: 75%;
      max-width: 24rem;
      border-right: 1px solid var(--colors-border);
      transform: translateX(-100%);
    }

    :host([side='left'][data-state='open']) {
      transform: translateX(0);
    }

    /* Top side */
    :host([side='top']) {
      top: 0;
      left: 0;
      right: 0;
      height: auto;
      border-bottom: 1px solid var(--colors-border);
      transform: translateY(-100%);
    }

    :host([side='top'][data-state='open']) {
      transform: translateY(0);
    }

    /* Bottom side */
    :host([side='bottom']) {
      bottom: 0;
      left: 0;
      right: 0;
      height: auto;
      border-top: 1px solid var(--colors-border);
      transform: translateY(100%);
    }

    :host([side='bottom'][data-state='open']) {
      transform: translateY(0);
    }

    .overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host([data-state='open']) .overlay {
      opacity: 1;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      height: 100%;
      overflow-y: auto;
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
  declare side: SheetSide;

  constructor() {
    super();
    this._open = false;
    this.side = 'right';
  }

  override connectedCallback() {
    super.connectedCallback();

    const sheet = this.closest('graph-sheet') as GraphSheet;
    if (sheet) {
      const updateOpen = () => {
        this._open = sheet.open;
      };

      sheet.addEventListener('sheet-open-change', updateOpen as EventListener);

      const observer = new MutationObserver(updateOpen);
      observer.observe(sheet, {
        attributes: true,
        attributeFilter: ['open'],
      });

      (this as any)._observer = observer;
      updateOpen();
    }

    // Handle ESC key to close
    this.addEventListener('keydown', this.handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const observer = (this as any)._observer;
    if (observer) {
      observer.disconnect();
    }
    this.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: Event) => {
    const event = e as KeyboardEvent;
    if (event.key === 'Escape') {
      this.handleClose();
    }
  };

  private handleClose = () => {
    const sheet = this.closest('graph-sheet') as GraphSheet;
    sheet?.closeSheet();
  };

  private handleOverlayClick = () => {
    this.handleClose();
  };

  protected override render() {
    return html`
      ${this._open ? html`<div class="overlay" @click=${this.handleOverlayClick}></div>` : ''}
      <div class="content">
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
      </div>
    `;
  }

  override updated(changed: Map<string, any>) {
    if (changed.has('_open')) {
      this.setAttribute('data-state', this._open ? 'open' : 'closed');
    }
  }
}

// Sheet Header
export class GraphSheetHeader extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1-5, 0.375rem);
      padding: var(--spacing-4);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Sheet Footer
export class GraphSheetFooter extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      padding: var(--spacing-4);
      margin-top: auto;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Sheet Title
export class GraphSheetTitle extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-weight: var(--font-weights-semibold, 600);
      color: var(--colors-foreground);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Sheet Description
export class GraphSheetDescription extends LitElement {
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
customElements.define('graph-sheet', GraphSheet);
customElements.define('graph-sheet-trigger', GraphSheetTrigger);
customElements.define('graph-sheet-content', GraphSheetContent);
customElements.define('graph-sheet-header', GraphSheetHeader);
customElements.define('graph-sheet-footer', GraphSheetFooter);
customElements.define('graph-sheet-title', GraphSheetTitle);
customElements.define('graph-sheet-description', GraphSheetDescription);

declare global {
  interface HTMLElementTagNameMap {
    'graph-sheet': GraphSheet;
    'graph-sheet-trigger': GraphSheetTrigger;
    'graph-sheet-content': GraphSheetContent;
    'graph-sheet-header': GraphSheetHeader;
    'graph-sheet-footer': GraphSheetFooter;
    'graph-sheet-title': GraphSheetTitle;
    'graph-sheet-description': GraphSheetDescription;
  }
}
