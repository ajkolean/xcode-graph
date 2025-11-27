import { LitElement, html, css } from 'lit';

export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';

// Scroll Area Root
export class GraphScrollArea extends LitElement {
  static override properties = {
    orientation: { type: String },
  };

  static override styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }

    .viewport {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      overflow-x: auto;
      overflow-y: auto;
      outline: none;
      transition-property: color, box-shadow;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      scrollbar-width: thin;
      scrollbar-color: var(--colors-border) transparent;
    }

    .viewport:focus-visible {
      box-shadow: 0 0 0 3px var(--colors-ring);
      opacity: 0.5;
      outline: 1px solid transparent;
    }

    /* WebKit scrollbar styling */
    .viewport::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    .viewport::-webkit-scrollbar-track {
      background: transparent;
      border-radius: inherit;
    }

    .viewport::-webkit-scrollbar-thumb {
      background-color: var(--colors-border);
      border-radius: 9999px;
      border: 1px solid transparent;
    }

    .viewport::-webkit-scrollbar-thumb:hover {
      background-color: var(--colors-muted-foreground);
      opacity: 0.5;
    }

    .viewport::-webkit-scrollbar-corner {
      background: transparent;
    }
  `;

  declare orientation: ScrollOrientation;

  constructor() {
    super();
    this.orientation = 'vertical';
  }

  protected override render() {
    return html`
      <div class="viewport" tabindex="0">
        <slot></slot>
      </div>
    `;
  }
}

// Scroll Bar (for custom scrollbar rendering)
export class GraphScrollBar extends LitElement {
  static override properties = {
    orientation: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: flex;
      touch-action: none;
      user-select: none;
      padding: 1px;
      transition-property: colors;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    :host([orientation='vertical']) {
      height: 100%;
      width: 10px;
      border-left: 1px solid transparent;
    }

    :host([orientation='horizontal']) {
      height: 10px;
      flex-direction: column;
      border-top: 1px solid transparent;
    }

    .thumb {
      position: relative;
      flex: 1 1 0%;
      border-radius: 9999px;
      background-color: var(--colors-border);
    }
  `;

  declare orientation: 'vertical' | 'horizontal';

  constructor() {
    super();
    this.orientation = 'vertical';
  }

  protected override render() {
    return html`
      <div class="thumb"></div>
    `;
  }
}

// Register all components
customElements.define('graph-scroll-area', GraphScrollArea);
customElements.define('graph-scroll-bar', GraphScrollBar);

declare global {
  interface HTMLElementTagNameMap {
    'graph-scroll-area': GraphScrollArea;
    'graph-scroll-bar': GraphScrollBar;
  }
}
