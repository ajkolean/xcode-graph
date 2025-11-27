import { LitElement, html, css } from 'lit';

export class GraphAvatar extends LitElement {
  static override properties = {
    size: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      position: relative;
      width: var(--spacing-10);
      height: var(--spacing-10);
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 9999px;
    }

    :host([size='sm']) {
      width: var(--spacing-8);
      height: var(--spacing-8);
    }

    :host([size='lg']) {
      width: var(--spacing-12);
      height: var(--spacing-12);
    }

    :host([size='xl']) {
      width: var(--spacing-16);
      height: var(--spacing-16);
    }

    ::slotted(img) {
      aspect-ratio: 1 / 1;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    ::slotted([slot='fallback']) {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background-color: var(--colors-muted);
    }

    .fallback-hidden {
      display: none;
    }
  `;

  declare size: 'sm' | 'default' | 'lg' | 'xl';

  constructor() {
    super();
    this.size = 'default';
  }

  protected override render() {
    return html`
      <slot name="image"></slot>
      <slot name="fallback"></slot>
      <slot></slot>
    `;
  }
}

customElements.define('graph-avatar', GraphAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'graph-avatar': GraphAvatar;
  }
}
