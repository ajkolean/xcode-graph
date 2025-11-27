import { LitElement, html, css } from 'lit';

// Main Breadcrumb container
export class GraphBreadcrumb extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'breadcrumb');
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Breadcrumb list (ol)
export class GraphBreadcrumbList extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-1-5, 0.375rem);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      word-break: break-word;
    }

    @media (min-width: 640px) {
      :host {
        gap: var(--spacing-2-5, 0.625rem);
      }
    }

    ::slotted(*) {
      list-style: none;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Breadcrumb item (li)
export class GraphBreadcrumbItem extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1-5, 0.375rem);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Breadcrumb link (a)
export class GraphBreadcrumbLink extends LitElement {
  static override properties = {
    href: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      transition-property: color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    a:hover {
      color: var(--colors-foreground);
    }
  `;

  declare href: string;

  constructor() {
    super();
    this.href = '';
  }

  protected override render() {
    if (this.href) {
      return html`<a href=${this.href}><slot></slot></a>`;
    }
    return html`<slot></slot>`;
  }
}

// Breadcrumb page (current page)
export class GraphBreadcrumbPage extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      color: var(--colors-foreground);
      font-weight: var(--font-weights-normal, 400);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'link');
    this.setAttribute('aria-disabled', 'true');
    this.setAttribute('aria-current', 'page');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Breadcrumb separator
export class GraphBreadcrumbSeparator extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    ::slotted(svg) {
      width: var(--spacing-3-5, 0.875rem);
      height: var(--spacing-3-5, 0.875rem);
    }

    .default-separator {
      width: var(--spacing-3-5, 0.875rem);
      height: var(--spacing-3-5, 0.875rem);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'presentation');
    this.setAttribute('aria-hidden', 'true');
  }

  protected override render() {
    return html`
      <slot>
        <svg
          class="default-separator"
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
      </slot>
    `;
  }
}

// Breadcrumb ellipsis
export class GraphBreadcrumbEllipsis extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
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
    this.setAttribute('role', 'presentation');
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
      <span class="sr-only">More</span>
    `;
  }
}

// Register all components
customElements.define('graph-breadcrumb', GraphBreadcrumb);
customElements.define('graph-breadcrumb-list', GraphBreadcrumbList);
customElements.define('graph-breadcrumb-item', GraphBreadcrumbItem);
customElements.define('graph-breadcrumb-link', GraphBreadcrumbLink);
customElements.define('graph-breadcrumb-page', GraphBreadcrumbPage);
customElements.define('graph-breadcrumb-separator', GraphBreadcrumbSeparator);
customElements.define('graph-breadcrumb-ellipsis', GraphBreadcrumbEllipsis);

declare global {
  interface HTMLElementTagNameMap {
    'graph-breadcrumb': GraphBreadcrumb;
    'graph-breadcrumb-list': GraphBreadcrumbList;
    'graph-breadcrumb-item': GraphBreadcrumbItem;
    'graph-breadcrumb-link': GraphBreadcrumbLink;
    'graph-breadcrumb-page': GraphBreadcrumbPage;
    'graph-breadcrumb-separator': GraphBreadcrumbSeparator;
    'graph-breadcrumb-ellipsis': GraphBreadcrumbEllipsis;
  }
}
