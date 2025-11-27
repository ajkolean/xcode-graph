import { LitElement, html, css } from 'lit';

/**
 * Graph Skeleton - A Lit Web Component for loading placeholders
 *
 * Uses Shadow DOM with native Lit CSS for proper encapsulation.
 *
 * @example
 * ```html
 * <graph-skeleton></graph-skeleton>
 * <graph-skeleton style="width: 200px; height: 20px;"></graph-skeleton>
 * ```
 */
export class GraphSkeleton extends LitElement {
  static override styles = css`
    :host {
      display: block;
      background-color: var(--colors-accent);
      border-radius: var(--radii-md);
      animation: skeletonPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Register the custom element
customElements.define('graph-skeleton', GraphSkeleton);

// Type declaration for HTML element registry
declare global {
  interface HTMLElementTagNameMap {
    'graph-skeleton': GraphSkeleton;
  }
}
