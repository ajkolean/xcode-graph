import { LitElement, html, css } from 'lit';

export type SeparatorOrientation = 'horizontal' | 'vertical';

/**
 * Graph Separator - A Lit Web Component for visual separators
 *
 * Accessible separator with support for horizontal and vertical orientations.
 * Uses Shadow DOM with native Lit CSS for proper encapsulation.
 *
 * @example
 * ```html
 * <graph-separator></graph-separator>
 * <graph-separator orientation="vertical"></graph-separator>
 * ```
 */
export class GraphSeparator extends LitElement {
  static override properties = {
    orientation: { type: String, reflect: true },
    decorative: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      background-color: var(--colors-border);
      flex-shrink: 0;
    }

    /* Horizontal orientation (default) */
    :host([orientation='horizontal']),
    :host(:not([orientation])) {
      height: 1px;
      width: 100%;
    }

    /* Vertical orientation */
    :host([orientation='vertical']) {
      height: 100%;
      width: 1px;
    }
  `;

  declare orientation: SeparatorOrientation;
  declare decorative: boolean;

  constructor() {
    super();
    this.orientation = 'horizontal';
    this.decorative = true;
  }

  override connectedCallback() {
    super.connectedCallback();
    // Set ARIA role based on decorative property
    if (!this.decorative) {
      this.setAttribute('role', 'separator');
      this.setAttribute('aria-orientation', this.orientation);
    } else {
      this.setAttribute('role', 'none');
    }
  }

  protected override render() {
    return html``;
  }
}

// Register the custom element
customElements.define('graph-separator', GraphSeparator);

// Type declaration for HTML element registry
declare global {
  interface HTMLElementTagNameMap {
    'graph-separator': GraphSeparator;
  }
}
