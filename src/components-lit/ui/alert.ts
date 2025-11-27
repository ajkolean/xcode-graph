import { LitElement, html, css } from 'lit';

export type AlertVariant = 'default' | 'destructive';

export class GraphAlert extends LitElement {
  static override properties = {
    variant: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: grid;
      position: relative;
      width: 100%;
      border-radius: var(--radii-lg);
      border: 1px solid var(--colors-border);
      padding: var(--spacing-3) var(--spacing-4);
      font-size: var(--font-sizes-sm);
      grid-template-columns: 0 1fr;
      gap: 0 var(--spacing-3);
      row-gap: var(--spacing-1);
      align-items: start;
    }

    :host([variant='default']) {
      background-color: var(--colors-card);
      color: var(--colors-card-foreground);
    }

    :host([variant='destructive']) {
      background-color: var(--colors-card);
      color: var(--colors-destructive);
    }

    /* When icon slot has content, adjust grid columns */
    :host(:has(::slotted([slot='icon']))) {
      grid-template-columns: calc(var(--spacing-4) * 1) 1fr;
    }

    ::slotted([slot='icon']) {
      width: var(--spacing-4);
      height: var(--spacing-4);
      transform: translateY(2px);
      color: currentColor;
    }

    ::slotted([slot='title']) {
      grid-column-start: 2;
      font-weight: var(--font-weights-medium);
      letter-spacing: -0.025em;
      line-height: 1;
      min-height: var(--spacing-4);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ::slotted([slot='description']) {
      grid-column-start: 2;
      color: var(--colors-muted-foreground);
      font-size: var(--font-sizes-sm);
      display: grid;
      gap: var(--spacing-1);
      justify-items: start;
    }

    :host([variant='destructive']) ::slotted([slot='description']) {
      color: var(--colors-destructive);
      opacity: 0.9;
    }

    /* Default slot for content without specific slots */
    slot:not([name]) {
      grid-column-start: 2;
    }
  `;

  declare variant: AlertVariant;

  constructor() {
    super();
    this.variant = 'default';
  }

  override connectedCallback() {
    super.connectedCallback();
    // Add role="alert" for accessibility
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'alert');
    }
  }

  protected override render() {
    return html`
      <slot name="icon"></slot>
      <slot name="title"></slot>
      <slot name="description"></slot>
      <slot></slot>
    `;
  }
}

customElements.define('graph-alert', GraphAlert);

declare global {
  interface HTMLElementTagNameMap {
    'graph-alert': GraphAlert;
  }
}
