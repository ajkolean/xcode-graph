import { LitElement, html, css } from 'lit';

// Table Container (wraps the table for overflow control)
export class GraphTable extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      caption-side: bottom;
      font-size: var(--font-sizes-sm);
      border-collapse: collapse;
    }
  `;

  protected override render() {
    return html`
      <table>
        <slot></slot>
      </table>
    `;
  }
}

// Table Header (thead)
export class GraphTableHeader extends LitElement {
  static override styles = css`
    :host {
      display: table-header-group;
    }

    ::slotted(graph-table-row) {
      border-bottom: 1px solid var(--colors-border);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Table Body (tbody)
export class GraphTableBody extends LitElement {
  static override styles = css`
    :host {
      display: table-row-group;
    }

    ::slotted(graph-table-row:last-child) {
      border-bottom: 0;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Table Footer (tfoot)
export class GraphTableFooter extends LitElement {
  static override styles = css`
    :host {
      display: table-footer-group;
      background-color: var(--colors-muted);
      opacity: 0.5;
      border-top: 1px solid var(--colors-border);
      font-weight: var(--font-weights-medium);
    }

    ::slotted(graph-table-row:last-child) {
      border-bottom: 0;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Table Row (tr)
export class GraphTableRow extends LitElement {
  static override properties = {
    selected: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: table-row;
      border-bottom: 1px solid var(--colors-border);
      transition-property: background-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    :host(:hover) {
      background-color: var(--colors-muted);
      opacity: 0.5;
    }

    :host([selected]) {
      background-color: var(--colors-muted);
    }
  `;

  declare selected: boolean;

  constructor() {
    super();
    this.selected = false;
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Table Head (th)
export class GraphTableHead extends LitElement {
  static override styles = css`
    :host {
      display: table-cell;
      height: var(--spacing-10);
      padding: 0 var(--spacing-2);
      text-align: left;
      vertical-align: middle;
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      white-space: nowrap;
    }

    :host(:has([role='checkbox'])) {
      padding-right: 0;
    }

    ::slotted([role='checkbox']) {
      transform: translateY(2px);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Table Cell (td)
export class GraphTableCell extends LitElement {
  static override styles = css`
    :host {
      display: table-cell;
      padding: var(--spacing-2);
      vertical-align: middle;
      white-space: nowrap;
    }

    :host(:has([role='checkbox'])) {
      padding-right: 0;
    }

    ::slotted([role='checkbox']) {
      transform: translateY(2px);
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Table Caption (caption)
export class GraphTableCaption extends LitElement {
  static override styles = css`
    :host {
      display: table-caption;
      margin-top: var(--spacing-4);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
      caption-side: bottom;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Register all components
customElements.define('graph-table', GraphTable);
customElements.define('graph-table-header', GraphTableHeader);
customElements.define('graph-table-body', GraphTableBody);
customElements.define('graph-table-footer', GraphTableFooter);
customElements.define('graph-table-row', GraphTableRow);
customElements.define('graph-table-head', GraphTableHead);
customElements.define('graph-table-cell', GraphTableCell);
customElements.define('graph-table-caption', GraphTableCaption);

declare global {
  interface HTMLElementTagNameMap {
    'graph-table': GraphTable;
    'graph-table-header': GraphTableHeader;
    'graph-table-body': GraphTableBody;
    'graph-table-footer': GraphTableFooter;
    'graph-table-row': GraphTableRow;
    'graph-table-head': GraphTableHead;
    'graph-table-cell': GraphTableCell;
    'graph-table-caption': GraphTableCaption;
  }
}
