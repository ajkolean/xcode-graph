import { LitElement, html, css } from 'lit';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left';
export type HoverCardAlign = 'start' | 'center' | 'end';

// Hover Card Root
export class GraphHoverCard extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
    openDelay: { type: Number },
    closeDelay: { type: Number },
  };

  static override styles = css`
    :host {
      display: inline-block;
    }
  `;

  declare open: boolean;
  declare openDelay: number;
  declare closeDelay: number;

  private openTimeout?: number;
  private closeTimeout?: number;

  constructor() {
    super();
    this.open = false;
    this.openDelay = 700;
    this.closeDelay = 300;
  }

  scheduleOpen() {
    this.clearTimeouts();
    this.openTimeout = window.setTimeout(() => {
      this.open = true;
      this.dispatchEvent(
        new CustomEvent('hover-card-open-change', {
          detail: { open: true },
          bubbles: true,
          composed: true,
        })
      );
    }, this.openDelay);
  }

  scheduleClose() {
    this.clearTimeouts();
    this.closeTimeout = window.setTimeout(() => {
      this.open = false;
      this.dispatchEvent(
        new CustomEvent('hover-card-open-change', {
          detail: { open: false },
          bubbles: true,
          composed: true,
        })
      );
    }, this.closeDelay);
  }

  private clearTimeouts() {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = undefined;
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimeouts();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Hover Card Trigger
export class GraphHoverCardTrigger extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `;

  private handleMouseEnter = () => {
    const hoverCard = this.closest('graph-hover-card') as GraphHoverCard;
    hoverCard?.scheduleOpen();
  };

  private handleMouseLeave = () => {
    const hoverCard = this.closest('graph-hover-card') as GraphHoverCard;
    hoverCard?.scheduleClose();
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Hover Card Content
export class GraphHoverCardContent extends LitElement {
  static override properties = {
    _open: { type: Boolean, state: true },
    side: { type: String },
    align: { type: String },
    sideOffset: { type: Number },
  };

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: 50;
      width: 16rem;
      border-radius: var(--radii-md);
      border: 1px solid var(--colors-border);
      background-color: var(--colors-popover);
      color: var(--colors-popover-foreground);
      padding: var(--spacing-4);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      outline: none;
      opacity: 0;
      transition: opacity var(--durations-fast, 100ms) ease-out;
    }

    :host([data-state='open']) {
      display: block;
      opacity: 1;
    }
  `;

  declare _open: boolean;
  declare side: HoverCardSide;
  declare align: HoverCardAlign;
  declare sideOffset: number;

  private cleanup?: () => void;

  constructor() {
    super();
    this._open = false;
    this.side = 'bottom';
    this.align = 'center';
    this.sideOffset = 4;
  }

  private handleMouseEnter = () => {
    const hoverCard = this.closest('graph-hover-card') as GraphHoverCard;
    hoverCard?.clearTimeouts?.();
  };

  private handleMouseLeave = () => {
    const hoverCard = this.closest('graph-hover-card') as GraphHoverCard;
    hoverCard?.scheduleClose();
  };

  override connectedCallback() {
    super.connectedCallback();

    const hoverCard = this.closest('graph-hover-card') as GraphHoverCard;
    if (hoverCard) {
      const updateOpen = () => {
        this._open = hoverCard.open;
        if (this._open) {
          this.updatePosition();
        } else {
          this.cleanup?.();
        }
      };

      hoverCard.addEventListener('hover-card-open-change', updateOpen as EventListener);

      const observer = new MutationObserver(updateOpen);
      observer.observe(hoverCard, {
        attributes: true,
        attributeFilter: ['open'],
      });

      (this as any)._observer = observer;
      (this as any)._updateOpen = updateOpen;
    }

    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const observer = (this as any)._observer;
    if (observer) {
      observer.disconnect();
    }
    this.cleanup?.();
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  private async updatePosition() {
    const hoverCard = this.closest('graph-hover-card') as GraphHoverCard;
    const trigger = hoverCard?.querySelector('graph-hover-card-trigger');

    if (!trigger || !this._open) return;

    await new Promise((resolve) => requestAnimationFrame(resolve));

    this.cleanup = autoUpdate(trigger, this, async () => {
      const { x, y } = await computePosition(trigger, this, {
        placement: `${this.side}-${this.align}` as any,
        middleware: [offset(this.sideOffset), flip(), shift({ padding: 8 })],
      });

      Object.assign(this.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  override updated(changed: Map<string, any>) {
    if (changed.has('_open')) {
      this.setAttribute('data-state', this._open ? 'open' : 'closed');
    }
  }
}

// Register all components
customElements.define('graph-hover-card', GraphHoverCard);
customElements.define('graph-hover-card-trigger', GraphHoverCardTrigger);
customElements.define('graph-hover-card-content', GraphHoverCardContent);

declare global {
  interface HTMLElementTagNameMap {
    'graph-hover-card': GraphHoverCard;
    'graph-hover-card-trigger': GraphHoverCardTrigger;
    'graph-hover-card-content': GraphHoverCardContent;
  }
}
