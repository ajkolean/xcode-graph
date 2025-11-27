import { LitElement, html, css } from 'lit';

/**
 * Graph Card - A Lit Web Component for card containers
 *
 * Uses Shadow DOM with CSS custom properties.
 */
export class GraphCard extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6, 24px);
      background-color: var(--colors-card);
      color: var(--colors-card-foreground);
      border-radius: var(--radii-lg, 16px);
      border: 1px solid var(--colors-border);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphCardHeader extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      grid-auto-rows: min-content;
      align-items: start;
      gap: 6px;
      padding-inline: 24px;
      padding-top: 24px;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphCardTitle extends LitElement {
  static override styles = css`
    :host {
      line-height: 1;
      font-weight: var(--font-weights-semibold, 600);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphCardDescription extends LitElement {
  static override styles = css`
    :host {
      color: var(--colors-muted-foreground);
      font-size: var(--font-sizes-sm, 11px);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphCardContent extends LitElement {
  static override styles = css`
    :host {
      padding-inline: 24px;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphCardFooter extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      padding-inline: 24px;
      padding-bottom: 24px;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

export class GraphCardAction extends LitElement {
  static override styles = css`
    :host {
      grid-column-start: 2;
      grid-row-start: 1;
      grid-row-end: span 2;
      align-self: start;
      justify-self: end;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

customElements.define('graph-card', GraphCard);
customElements.define('graph-card-header', GraphCardHeader);
customElements.define('graph-card-title', GraphCardTitle);
customElements.define('graph-card-description', GraphCardDescription);
customElements.define('graph-card-content', GraphCardContent);
customElements.define('graph-card-footer', GraphCardFooter);
customElements.define('graph-card-action', GraphCardAction);

declare global {
  interface HTMLElementTagNameMap {
    'graph-card': GraphCard;
    'graph-card-header': GraphCardHeader;
    'graph-card-title': GraphCardTitle;
    'graph-card-description': GraphCardDescription;
    'graph-card-content': GraphCardContent;
    'graph-card-footer': GraphCardFooter;
    'graph-card-action': GraphCardAction;
  }
}
