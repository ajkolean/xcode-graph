import { LitElement, html, css } from 'lit';

// Pagination Root (nav)
export class GraphPagination extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      width: 100%;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'pagination');
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Pagination Content (ul)
export class GraphPaginationContent extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--spacing-1);
    }

    ::slotted(*) {
      list-style: none;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Pagination Item (li)
export class GraphPaginationItem extends LitElement {
  static override styles = css`
    :host {
      display: list-item;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Pagination Link (a)
export class GraphPaginationLink extends LitElement {
  static override properties = {
    href: { type: String },
    active: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      transition-property: color, background-color, border-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      outline: none;
      text-decoration: none;
      color: inherit;
    }

    /* Size variants */
    :host([size='default']) a {
      height: var(--spacing-9);
      padding: 0 var(--spacing-4);
    }

    :host([size='sm']) a {
      height: var(--spacing-8);
      padding: 0 var(--spacing-3);
    }

    :host([size='lg']) a {
      height: var(--spacing-10);
      padding: 0 var(--spacing-8);
    }

    :host([size='icon']) a {
      width: var(--spacing-9);
      height: var(--spacing-9);
      padding: 0;
    }

    /* Active (outline) vs inactive (ghost) styles */
    :host(:not([active])) a {
      background-color: transparent;
    }

    :host(:not([active])) a:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    :host([active]) a {
      border: 1px solid var(--colors-input);
      background-color: var(--colors-background);
    }

    :host([active]) a:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    a:focus-visible {
      box-shadow: 0 0 0 2px var(--colors-ring);
    }
  `;

  declare href: string;
  declare active: boolean;
  declare size: 'default' | 'sm' | 'lg' | 'icon';

  constructor() {
    super();
    this.href = '';
    this.active = false;
    this.size = 'icon';
  }

  protected override render() {
    return html`
      <a
        href=${this.href || '#'}
        aria-current=${this.active ? 'page' : 'false'}
      >
        <slot></slot>
      </a>
    `;
  }
}

// Pagination Previous
export class GraphPaginationPrevious extends LitElement {
  static override properties = {
    href: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      height: var(--spacing-9);
      padding: 0 var(--spacing-2-5, 0.625rem);
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      background-color: transparent;
      transition-property: color, background-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      text-decoration: none;
      color: inherit;
    }

    a:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    @media (min-width: 640px) {
      a {
        padding-left: var(--spacing-2-5, 0.625rem);
      }
    }

    .icon {
      width: var(--spacing-4);
      height: var(--spacing-4);
    }

    .text {
      display: none;
    }

    @media (min-width: 640px) {
      .text {
        display: block;
      }
    }
  `;

  declare href: string;

  constructor() {
    super();
    this.href = '';
  }

  protected override render() {
    return html`
      <a href=${this.href || '#'} aria-label="Go to previous page">
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span class="text">Previous</span>
      </a>
    `;
  }
}

// Pagination Next
export class GraphPaginationNext extends LitElement {
  static override properties = {
    href: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      height: var(--spacing-9);
      padding: 0 var(--spacing-2-5, 0.625rem);
      border-radius: var(--radii-md);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      background-color: transparent;
      transition-property: color, background-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      text-decoration: none;
      color: inherit;
    }

    a:hover {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    @media (min-width: 640px) {
      a {
        padding-right: var(--spacing-2-5, 0.625rem);
      }
    }

    .icon {
      width: var(--spacing-4);
      height: var(--spacing-4);
    }

    .text {
      display: none;
    }

    @media (min-width: 640px) {
      .text {
        display: block;
      }
    }
  `;

  declare href: string;

  constructor() {
    super();
    this.href = '';
  }

  protected override render() {
    return html`
      <a href=${this.href || '#'} aria-label="Go to next page">
        <span class="text">Next</span>
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
          <path d="m9 18 6-6-6-6" />
        </svg>
      </a>
    `;
  }
}

// Pagination Ellipsis
export class GraphPaginationEllipsis extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      width: var(--spacing-9);
      height: var(--spacing-9);
      align-items: center;
      justify-content: center;
    }

    .icon {
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

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  protected override render() {
    return html`
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
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
      <span class="sr-only">More pages</span>
    `;
  }
}

// Register all components
customElements.define('graph-pagination', GraphPagination);
customElements.define('graph-pagination-content', GraphPaginationContent);
customElements.define('graph-pagination-item', GraphPaginationItem);
customElements.define('graph-pagination-link', GraphPaginationLink);
customElements.define('graph-pagination-previous', GraphPaginationPrevious);
customElements.define('graph-pagination-next', GraphPaginationNext);
customElements.define('graph-pagination-ellipsis', GraphPaginationEllipsis);

declare global {
  interface HTMLElementTagNameMap {
    'graph-pagination': GraphPagination;
    'graph-pagination-content': GraphPaginationContent;
    'graph-pagination-item': GraphPaginationItem;
    'graph-pagination-link': GraphPaginationLink;
    'graph-pagination-previous': GraphPaginationPrevious;
    'graph-pagination-next': GraphPaginationNext;
    'graph-pagination-ellipsis': GraphPaginationEllipsis;
  }
}
