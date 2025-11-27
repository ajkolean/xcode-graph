import { LitElement, html, css } from 'lit';

export type DrawerDirection = 'top' | 'right' | 'bottom' | 'left';

// Drawer Root
export class GraphDrawer extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
    direction: { type: String },
  };

  static override styles = css`
    :host {
      display: contents;
    }
  `;

  declare open: boolean;
  declare direction: DrawerDirection;

  constructor() {
    super();
    this.open = false;
    this.direction = 'bottom';
  }

  closeDrawer() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('drawer-open-change', {
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

// Drawer Trigger
export class GraphDrawerTrigger extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `;

  private handleClick = () => {
    const drawer = this.closest('graph-drawer') as GraphDrawer;
    if (drawer) {
      drawer.open = true;
      drawer.dispatchEvent(
        new CustomEvent('drawer-open-change', {
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

// Drawer Content
export class GraphDrawerContent extends LitElement {
  static override properties = {
    _open: { type: Boolean, state: true },
    _direction: { type: String, state: true },
  };

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: 50;
      flex-direction: column;
      height: auto;
      background-color: var(--colors-background);
      transition-property: transform, opacity;
      transition-duration: 300ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host([data-state='open']) {
      display: flex;
    }

    /* Bottom (default) */
    :host([data-direction='bottom']) {
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 80vh;
      margin-top: 6rem;
      border-top: 1px solid var(--colors-border);
      border-top-left-radius: var(--radii-lg);
      border-top-right-radius: var(--radii-lg);
      transform: translateY(100%);
    }

    :host([data-direction='bottom'][data-state='open']) {
      transform: translateY(0);
    }

    /* Top */
    :host([data-direction='top']) {
      top: 0;
      left: 0;
      right: 0;
      max-height: 80vh;
      margin-bottom: 6rem;
      border-bottom: 1px solid var(--colors-border);
      border-bottom-left-radius: var(--radii-lg);
      border-bottom-right-radius: var(--radii-lg);
      transform: translateY(-100%);
    }

    :host([data-direction='top'][data-state='open']) {
      transform: translateY(0);
    }

    /* Right */
    :host([data-direction='right']) {
      top: 0;
      right: 0;
      bottom: 0;
      width: 75%;
      max-width: 24rem;
      border-left: 1px solid var(--colors-border);
      transform: translateX(100%);
    }

    :host([data-direction='right'][data-state='open']) {
      transform: translateX(0);
    }

    /* Left */
    :host([data-direction='left']) {
      top: 0;
      left: 0;
      bottom: 0;
      width: 75%;
      max-width: 24rem;
      border-right: 1px solid var(--colors-border);
      transform: translateX(-100%);
    }

    :host([data-direction='left'][data-state='open']) {
      transform: translateX(0);
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
      height: 100%;
      overflow-y: auto;
    }

    .handle {
      margin: var(--spacing-4) auto 0;
      height: var(--spacing-2);
      width: 100px;
      flex-shrink: 0;
      border-radius: 9999px;
      background-color: var(--colors-muted);
      display: none;
    }

    :host([data-direction='bottom']) .handle {
      display: block;
    }
  `;

  declare _open: boolean;
  declare _direction: DrawerDirection;

  constructor() {
    super();
    this._open = false;
    this._direction = 'bottom';
  }

  override connectedCallback() {
    super.connectedCallback();

    const drawer = this.closest('graph-drawer') as GraphDrawer;
    if (drawer) {
      const updateOpen = () => {
        this._open = drawer.open;
        this._direction = drawer.direction;
      };

      drawer.addEventListener('drawer-open-change', updateOpen as EventListener);

      const observer = new MutationObserver(updateOpen);
      observer.observe(drawer, {
        attributes: true,
        attributeFilter: ['open', 'direction'],
      });

      (this as any)._observer = observer;
      updateOpen();
    }

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
    const drawer = this.closest('graph-drawer') as GraphDrawer;
    drawer?.closeDrawer();
  };

  private handleOverlayClick = () => {
    this.handleClose();
  };

  protected override render() {
    return html`
      ${this._open ? html`<div class="overlay" @click=${this.handleOverlayClick}></div>` : ''}
      <div class="content">
        <div class="handle"></div>
        <slot></slot>
      </div>
    `;
  }

  override updated(changed: Map<string, any>) {
    if (changed.has('_open')) {
      this.setAttribute('data-state', this._open ? 'open' : 'closed');
    }
    if (changed.has('_direction')) {
      this.setAttribute('data-direction', this._direction);
    }
  }
}

// Drawer Header
export class GraphDrawerHeader extends LitElement {
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

// Drawer Footer
export class GraphDrawerFooter extends LitElement {
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

// Drawer Title
export class GraphDrawerTitle extends LitElement {
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

// Drawer Description
export class GraphDrawerDescription extends LitElement {
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
customElements.define('graph-drawer', GraphDrawer);
customElements.define('graph-drawer-trigger', GraphDrawerTrigger);
customElements.define('graph-drawer-content', GraphDrawerContent);
customElements.define('graph-drawer-header', GraphDrawerHeader);
customElements.define('graph-drawer-footer', GraphDrawerFooter);
customElements.define('graph-drawer-title', GraphDrawerTitle);
customElements.define('graph-drawer-description', GraphDrawerDescription);

declare global {
  interface HTMLElementTagNameMap {
    'graph-drawer': GraphDrawer;
    'graph-drawer-trigger': GraphDrawerTrigger;
    'graph-drawer-content': GraphDrawerContent;
    'graph-drawer-header': GraphDrawerHeader;
    'graph-drawer-footer': GraphDrawerFooter;
    'graph-drawer-title': GraphDrawerTitle;
    'graph-drawer-description': GraphDrawerDescription;
  }
}
