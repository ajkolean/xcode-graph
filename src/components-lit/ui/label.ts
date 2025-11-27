import { LitElement, html, css } from 'lit';

/**
 * Graph Label - A Lit Web Component for form labels
 *
 * Accessible label with support for targeting form elements.
 * Uses Shadow DOM with native Lit CSS for proper encapsulation.
 *
 * Note: The 'for' attribute works with elements in the same DOM tree.
 * For Shadow DOM, we handle clicks to forward focus to the target element.
 *
 * @example
 * ```html
 * <graph-label for="email">Email</graph-label>
 * <graph-label>Username</graph-label>
 * ```
 */
export class GraphLabel extends LitElement {
  static override properties = {
    htmlFor: { type: String, attribute: 'for' },
  };

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-sizes-sm);
      line-height: var(--line-heights-none);
      font-weight: var(--font-weights-medium);
      user-select: none;
      cursor: default;
    }
  `;

  declare htmlFor: string;

  constructor() {
    super();
    this.htmlFor = '';
  }

  /**
   * Handle clicks to focus the target element if specified
   */
  private handleClick() {
    if (this.htmlFor) {
      // Try to find the element in the document
      const target = document.getElementById(this.htmlFor);
      if (target) {
        target.focus();
        // If it's a clickable element, click it
        if (target instanceof HTMLInputElement || target instanceof HTMLButtonElement) {
          target.click();
        }
      }
    }
  }

  protected override render() {
    return html`<label @click=${this.handleClick}><slot></slot></label>`;
  }
}

customElements.define('graph-label', GraphLabel);

declare global {
  interface HTMLElementTagNameMap {
    'graph-label': GraphLabel;
  }
}
