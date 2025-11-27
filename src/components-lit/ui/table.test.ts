import { describe, it, expect, afterEach } from 'vitest';
import {
  GraphTable,
  GraphTableHeader,
  GraphTableBody,
  GraphTableFooter,
  GraphTableRow,
  GraphTableHead,
  GraphTableCell,
  GraphTableCaption,
} from './table';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphTable', () => {
  let table: GraphTable;

  afterEach(() => {
    table?.remove();
  });

  it('should render table element', async () => {
    table = new GraphTable();
    document.body.appendChild(table);
    await table.updateComplete;

    const tableEl = shadowQuery(table, 'table');
    expect(tableEl).toBeTruthy();
  });

  it('should render slot content', async () => {
    table = new GraphTable();
    table.textContent = 'Table content';
    document.body.appendChild(table);
    await table.updateComplete;

    const slot = shadowQuery(table, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableHeader', () => {
  let header: GraphTableHeader;

  afterEach(() => {
    header?.remove();
  });

  it('should render header', async () => {
    header = new GraphTableHeader();
    document.body.appendChild(header);
    await header.updateComplete;

    const slot = shadowQuery(header, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableBody', () => {
  let body: GraphTableBody;

  afterEach(() => {
    body?.remove();
  });

  it('should render body', async () => {
    body = new GraphTableBody();
    document.body.appendChild(body);
    await body.updateComplete;

    const slot = shadowQuery(body, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableFooter', () => {
  let footer: GraphTableFooter;

  afterEach(() => {
    footer?.remove();
  });

  it('should render footer', async () => {
    footer = new GraphTableFooter();
    document.body.appendChild(footer);
    await footer.updateComplete;

    const slot = shadowQuery(footer, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableRow', () => {
  let row: GraphTableRow;

  afterEach(() => {
    row?.remove();
  });

  it('should render with default state', async () => {
    row = new GraphTableRow();
    document.body.appendChild(row);
    await row.updateComplete;

    expect(row.selected).toBe(false);
  });

  it('should render with selected state', async () => {
    row = new GraphTableRow();
    row.selected = true;
    document.body.appendChild(row);
    await row.updateComplete;

    expect(row.selected).toBe(true);
    expect(row.hasAttribute('selected')).toBe(true);
  });

  it('should toggle selected state', async () => {
    row = new GraphTableRow();
    document.body.appendChild(row);
    await row.updateComplete;

    expect(row.selected).toBe(false);

    row.selected = true;
    await row.updateComplete;

    expect(row.selected).toBe(true);
  });

  it('should render slot content', async () => {
    row = new GraphTableRow();
    document.body.appendChild(row);
    await row.updateComplete;

    const slot = shadowQuery(row, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableHead', () => {
  let head: GraphTableHead;

  afterEach(() => {
    head?.remove();
  });

  it('should render head cell', async () => {
    head = new GraphTableHead();
    head.textContent = 'Header';
    document.body.appendChild(head);
    await head.updateComplete;

    const slot = shadowQuery(head, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableCell', () => {
  let cell: GraphTableCell;

  afterEach(() => {
    cell?.remove();
  });

  it('should render cell', async () => {
    cell = new GraphTableCell();
    cell.textContent = 'Cell content';
    document.body.appendChild(cell);
    await cell.updateComplete;

    const slot = shadowQuery(cell, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTableCaption', () => {
  let caption: GraphTableCaption;

  afterEach(() => {
    caption?.remove();
  });

  it('should render caption', async () => {
    caption = new GraphTableCaption();
    caption.textContent = 'Table caption';
    document.body.appendChild(caption);
    await caption.updateComplete;

    const slot = shadowQuery(caption, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphTable - Integration', () => {
  let table: GraphTable;
  let header: GraphTableHeader;
  let body: GraphTableBody;
  let row: GraphTableRow;
  let head: GraphTableHead;
  let cell: GraphTableCell;

  afterEach(() => {
    table?.remove();
  });

  it('should work together as a complete table', async () => {
    table = new GraphTable();
    header = new GraphTableHeader();
    body = new GraphTableBody();
    row = new GraphTableRow();
    head = new GraphTableHead();
    head.textContent = 'Header';
    cell = new GraphTableCell();
    cell.textContent = 'Cell';

    const headerRow = new GraphTableRow();
    headerRow.appendChild(head);
    header.appendChild(headerRow);

    row.appendChild(cell);
    body.appendChild(row);

    table.appendChild(header);
    table.appendChild(body);
    document.body.appendChild(table);

    await table.updateComplete;
    await header.updateComplete;
    await body.updateComplete;
    await row.updateComplete;

    const tableEl = shadowQuery(table, 'table');
    expect(tableEl).toBeTruthy();
  });
});
