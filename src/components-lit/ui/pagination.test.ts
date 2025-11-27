import { describe, it, expect, afterEach } from 'vitest';
import {
  GraphPagination,
  GraphPaginationContent,
  GraphPaginationItem,
  GraphPaginationLink,
  GraphPaginationPrevious,
  GraphPaginationNext,
  GraphPaginationEllipsis,
} from './pagination';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphPagination', () => {
  let pagination: GraphPagination;

  afterEach(() => {
    pagination?.remove();
  });

  it('should render with aria-label', async () => {
    pagination = new GraphPagination();
    document.body.appendChild(pagination);
    await pagination.updateComplete;

    expect(pagination.getAttribute('aria-label')).toBe('pagination');
  });

  it('should render slot content', async () => {
    pagination = new GraphPagination();
    document.body.appendChild(pagination);
    await pagination.updateComplete;

    const slot = shadowQuery(pagination, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphPaginationContent', () => {
  let content: GraphPaginationContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render content list', async () => {
    content = new GraphPaginationContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const slot = shadowQuery(content, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphPaginationItem', () => {
  let item: GraphPaginationItem;

  afterEach(() => {
    item?.remove();
  });

  it('should render item', async () => {
    item = new GraphPaginationItem();
    document.body.appendChild(item);
    await item.updateComplete;

    const slot = shadowQuery(item, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphPaginationLink', () => {
  let link: GraphPaginationLink;

  afterEach(() => {
    link?.remove();
  });

  it('should render with default size icon', async () => {
    link = new GraphPaginationLink();
    link.textContent = '1';
    document.body.appendChild(link);
    await link.updateComplete;

    expect(link.size).toBe('icon');
    expect(link.active).toBe(false);
  });

  it('should render with active state', async () => {
    link = new GraphPaginationLink();
    link.active = true;
    link.textContent = '1';
    document.body.appendChild(link);
    await link.updateComplete;

    expect(link.active).toBe(true);
    expect(link.hasAttribute('active')).toBe(true);

    const anchor = shadowQuery(link, 'a') as HTMLAnchorElement;
    expect(anchor.getAttribute('aria-current')).toBe('page');
  });

  it('should render with href', async () => {
    link = new GraphPaginationLink();
    link.href = '/page/2';
    link.textContent = '2';
    document.body.appendChild(link);
    await link.updateComplete;

    const anchor = shadowQuery(link, 'a') as HTMLAnchorElement;
    expect(anchor.href).toContain('/page/2');
  });

  it('should support different sizes', async () => {
    link = new GraphPaginationLink();
    link.size = 'default';
    document.body.appendChild(link);
    await link.updateComplete;

    expect(link.size).toBe('default');

    link.size = 'sm';
    await link.updateComplete;

    expect(link.size).toBe('sm');

    link.size = 'lg';
    await link.updateComplete;

    expect(link.size).toBe('lg');
  });
});

describe('GraphPaginationPrevious', () => {
  let previous: GraphPaginationPrevious;

  afterEach(() => {
    previous?.remove();
  });

  it('should render previous link', async () => {
    previous = new GraphPaginationPrevious();
    document.body.appendChild(previous);
    await previous.updateComplete;

    const anchor = shadowQuery(previous, 'a') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('aria-label')).toBe('Go to previous page');
  });

  it('should render chevron icon', async () => {
    previous = new GraphPaginationPrevious();
    document.body.appendChild(previous);
    await previous.updateComplete;

    const svg = shadowQuery(previous, 'svg');
    expect(svg).toBeTruthy();
  });

  it('should render Previous text', async () => {
    previous = new GraphPaginationPrevious();
    document.body.appendChild(previous);
    await previous.updateComplete;

    const text = shadowQuery(previous, '.text');
    expect(text?.textContent).toBe('Previous');
  });

  it('should set href', async () => {
    previous = new GraphPaginationPrevious();
    previous.href = '/page/1';
    document.body.appendChild(previous);
    await previous.updateComplete;

    const anchor = shadowQuery(previous, 'a') as HTMLAnchorElement;
    expect(anchor.href).toContain('/page/1');
  });
});

describe('GraphPaginationNext', () => {
  let next: GraphPaginationNext;

  afterEach(() => {
    next?.remove();
  });

  it('should render next link', async () => {
    next = new GraphPaginationNext();
    document.body.appendChild(next);
    await next.updateComplete;

    const anchor = shadowQuery(next, 'a') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('aria-label')).toBe('Go to next page');
  });

  it('should render chevron icon', async () => {
    next = new GraphPaginationNext();
    document.body.appendChild(next);
    await next.updateComplete;

    const svg = shadowQuery(next, 'svg');
    expect(svg).toBeTruthy();
  });

  it('should render Next text', async () => {
    next = new GraphPaginationNext();
    document.body.appendChild(next);
    await next.updateComplete;

    const text = shadowQuery(next, '.text');
    expect(text?.textContent).toBe('Next');
  });

  it('should set href', async () => {
    next = new GraphPaginationNext();
    next.href = '/page/3';
    document.body.appendChild(next);
    await next.updateComplete;

    const anchor = shadowQuery(next, 'a') as HTMLAnchorElement;
    expect(anchor.href).toContain('/page/3');
  });
});

describe('GraphPaginationEllipsis', () => {
  let ellipsis: GraphPaginationEllipsis;

  afterEach(() => {
    ellipsis?.remove();
  });

  it('should render with aria-hidden', async () => {
    ellipsis = new GraphPaginationEllipsis();
    document.body.appendChild(ellipsis);
    await ellipsis.updateComplete;

    expect(ellipsis.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render ellipsis icon', async () => {
    ellipsis = new GraphPaginationEllipsis();
    document.body.appendChild(ellipsis);
    await ellipsis.updateComplete;

    const svg = shadowQuery(ellipsis, 'svg');
    expect(svg).toBeTruthy();
  });

  it('should have sr-only text', async () => {
    ellipsis = new GraphPaginationEllipsis();
    document.body.appendChild(ellipsis);
    await ellipsis.updateComplete;

    const srOnly = shadowQuery(ellipsis, '.sr-only');
    expect(srOnly?.textContent).toBe('More pages');
  });
});

describe('GraphPagination - Integration', () => {
  let pagination: GraphPagination;
  let content: GraphPaginationContent;
  let items: GraphPaginationItem[];
  let links: GraphPaginationLink[];
  let previous: GraphPaginationPrevious;
  let next: GraphPaginationNext;
  let ellipsis: GraphPaginationEllipsis;

  afterEach(() => {
    pagination?.remove();
  });

  it('should work as a complete pagination component', async () => {
    pagination = new GraphPagination();
    content = new GraphPaginationContent();

    previous = new GraphPaginationPrevious();
    previous.href = '/page/1';

    items = [];
    links = [];

    for (let i = 1; i <= 3; i++) {
      const item = new GraphPaginationItem();
      const link = new GraphPaginationLink();
      link.href = `/page/${i}`;
      link.textContent = `${i}`;
      link.active = i === 2; // Page 2 is active

      link.appendChild(document.createTextNode(`${i}`));
      item.appendChild(link);
      content.appendChild(item);

      items.push(item);
      links.push(link);
    }

    ellipsis = new GraphPaginationEllipsis();
    const ellipsisItem = new GraphPaginationItem();
    ellipsisItem.appendChild(ellipsis);
    content.appendChild(ellipsisItem);

    next = new GraphPaginationNext();
    next.href = '/page/3';

    const prevItem = new GraphPaginationItem();
    prevItem.appendChild(previous);
    content.insertBefore(prevItem, content.firstChild);

    const nextItem = new GraphPaginationItem();
    nextItem.appendChild(next);
    content.appendChild(nextItem);

    pagination.appendChild(content);
    document.body.appendChild(pagination);

    await pagination.updateComplete;
    await content.updateComplete;

    expect(items.length).toBe(3);
    expect(links[1].active).toBe(true); // Page 2 active
  });
});
