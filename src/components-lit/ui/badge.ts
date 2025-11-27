import { LitElement, html, css } from 'lit';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * Graph Badge - A Lit Web Component for displaying badges
 *
 * Uses Shadow DOM for proper slot support and CSS custom properties for styling.
 *
 * @example
 * ```html
 * <graph-badge variant="default">New</graph-badge>
 * <graph-badge variant="secondary">Beta</graph-badge>
 * <graph-badge variant="destructive">Error</graph-badge>
 * <graph-badge variant="outline">Info</graph-badge>
 * ```
 */
export class GraphBadge extends LitElement {
  static override properties = {
    variant: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radii-md);
      border: 1px solid transparent;
      padding-inline: var(--spacing-2);
      padding-block: 2px;
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      width: fit-content;
      white-space: nowrap;
      flex-shrink: 0;
      gap: var(--spacing-1);
      transition: colors var(--durations-normal);
      overflow: hidden;
    }

    /* Default variant */
    :host([variant='default']),
    :host(:not([variant])) {
      background-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    /* Secondary variant */
    :host([variant='secondary']) {
      background-color: var(--colors-secondary);
      color: var(--colors-secondary-foreground);
    }

    /* Destructive variant */
    :host([variant='destructive']) {
      background-color: var(--colors-destructive);
      color: var(--colors-white);
    }

    /* Outline variant */
    :host([variant='outline']) {
      background-color: transparent;
      border-color: var(--colors-border);
      color: var(--colors-foreground);
    }

    ::slotted(svg) {
      width: 12px;
      height: 12px;
      pointer-events: none;
    }
  `;

  declare variant: BadgeVariant;

  constructor() {
    super();
    this.variant = 'default';
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Register the custom element
customElements.define('graph-badge', GraphBadge);

// Type declaration for HTML element registry
declare global {
  interface HTMLElementTagNameMap {
    'graph-badge': GraphBadge;
  }
}
