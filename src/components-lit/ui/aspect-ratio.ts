import { LitElement, html, css } from 'lit';

export class GraphAspectRatio extends LitElement {
  static override properties = {
    ratio: { type: Number },
  };

  static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
    }

    .wrapper {
      position: relative;
      width: 100%;
      padding-bottom: var(--aspect-ratio-padding, 100%);
    }

    .content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  `;

  declare ratio: number;

  constructor() {
    super();
    this.ratio = 1; // Default to 1:1 (square)
  }

  protected override render() {
    // Calculate padding-bottom percentage based on ratio
    const paddingBottom = `${(1 / this.ratio) * 100}%`;

    return html`
      <div class="wrapper" style="padding-bottom: ${paddingBottom}">
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('graph-aspect-ratio', GraphAspectRatio);

declare global {
  interface HTMLElementTagNameMap {
    'graph-aspect-ratio': GraphAspectRatio;
  }
}
