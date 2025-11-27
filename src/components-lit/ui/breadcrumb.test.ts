import { describe, it, expect, afterEach } from 'vitest';
import {
  GraphBreadcrumb,
  GraphBreadcrumbList,
  GraphBreadcrumbItem,
  GraphBreadcrumbLink,
  GraphBreadcrumbPage,
  GraphBreadcrumbSeparator,
  GraphBreadcrumbEllipsis,
} from './breadcrumb';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphBreadcrumb', () => {
  let breadcrumb: GraphBreadcrumb;

  afterEach(() => {
    breadcrumb?.remove();
  });

  it('should render breadcrumb with aria-label', async () => {
    breadcrumb = new GraphBreadcrumb();
    document.body.appendChild(breadcrumb);
    await breadcrumb.updateComplete;

    expect(breadcrumb.getAttribute('aria-label')).toBe('breadcrumb');
  });

  it('should render slot content', async () => {
    breadcrumb = new GraphBreadcrumb();
    breadcrumb.textContent = 'Breadcrumb content';
    document.body.appendChild(breadcrumb);
    await breadcrumb.updateComplete;

    const slot = shadowQuery(breadcrumb, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphBreadcrumbList', () => {
  let list: GraphBreadcrumbList;

  afterEach(() => {
    list?.remove();
  });

  it('should render list', async () => {
    list = new GraphBreadcrumbList();
    document.body.appendChild(list);
    await list.updateComplete;

    const slot = shadowQuery(list, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphBreadcrumbItem', () => {
  let item: GraphBreadcrumbItem;

  afterEach(() => {
    item?.remove();
  });

  it('should render item', async () => {
    item = new GraphBreadcrumbItem();
    document.body.appendChild(item);
    await item.updateComplete;

    const slot = shadowQuery(item, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphBreadcrumbLink', () => {
  let link: GraphBreadcrumbLink;

  afterEach(() => {
    link?.remove();
  });

  it('should render link with href', async () => {
    link = new GraphBreadcrumbLink();
    link.href = '/home';
    link.textContent = 'Home';
    document.body.appendChild(link);
    await link.updateComplete;

    const anchor = shadowQuery(link, 'a') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor.href).toContain('/home');
  });

  it('should render without href', async () => {
    link = new GraphBreadcrumbLink();
    link.textContent = 'Home';
    document.body.appendChild(link);
    await link.updateComplete;

    const anchor = shadowQuery(link, 'a');
    const slot = shadowQuery(link, 'slot');

    // When no href, should render slot directly
    expect(slot).toBeTruthy();
  });

  it('should update href dynamically', async () => {
    link = new GraphBreadcrumbLink();
    link.href = '/home';
    document.body.appendChild(link);
    await link.updateComplete;

    let anchor = shadowQuery(link, 'a') as HTMLAnchorElement;
    expect(anchor.href).toContain('/home');

    link.href = '/about';
    await link.updateComplete;

    anchor = shadowQuery(link, 'a') as HTMLAnchorElement;
    expect(anchor.href).toContain('/about');
  });
});

describe('GraphBreadcrumbPage', () => {
  let page: GraphBreadcrumbPage;

  afterEach(() => {
    page?.remove();
  });

  it('should render with correct aria attributes', async () => {
    page = new GraphBreadcrumbPage();
    page.textContent = 'Current Page';
    document.body.appendChild(page);
    await page.updateComplete;

    expect(page.getAttribute('role')).toBe('link');
    expect(page.getAttribute('aria-disabled')).toBe('true');
    expect(page.getAttribute('aria-current')).toBe('page');
  });

  it('should render slot content', async () => {
    page = new GraphBreadcrumbPage();
    page.textContent = 'Current Page';
    document.body.appendChild(page);
    await page.updateComplete;

    const slot = shadowQuery(page, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphBreadcrumbSeparator', () => {
  let separator: GraphBreadcrumbSeparator;

  afterEach(() => {
    separator?.remove();
  });

  it('should render with correct aria attributes', async () => {
    separator = new GraphBreadcrumbSeparator();
    document.body.appendChild(separator);
    await separator.updateComplete;

    expect(separator.getAttribute('role')).toBe('presentation');
    expect(separator.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render default chevron icon', async () => {
    separator = new GraphBreadcrumbSeparator();
    document.body.appendChild(separator);
    await separator.updateComplete;

    const svg = shadowQuery(separator, 'svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('default-separator')).toBe(true);
  });

  it('should render custom separator content', async () => {
    separator = new GraphBreadcrumbSeparator();
    const customSeparator = document.createElement('span');
    customSeparator.textContent = '/';
    separator.appendChild(customSeparator);
    document.body.appendChild(separator);
    await separator.updateComplete;

    const slot = shadowQuery(separator, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphBreadcrumbEllipsis', () => {
  let ellipsis: GraphBreadcrumbEllipsis;

  afterEach(() => {
    ellipsis?.remove();
  });

  it('should render with correct aria attributes', async () => {
    ellipsis = new GraphBreadcrumbEllipsis();
    document.body.appendChild(ellipsis);
    await ellipsis.updateComplete;

    expect(ellipsis.getAttribute('role')).toBe('presentation');
    expect(ellipsis.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render ellipsis icon', async () => {
    ellipsis = new GraphBreadcrumbEllipsis();
    document.body.appendChild(ellipsis);
    await ellipsis.updateComplete;

    const svg = shadowQuery(ellipsis, 'svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('icon')).toBe(true);
  });

  it('should have sr-only text', async () => {
    ellipsis = new GraphBreadcrumbEllipsis();
    document.body.appendChild(ellipsis);
    await ellipsis.updateComplete;

    const srOnly = shadowQuery(ellipsis, '.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly?.textContent).toBe('More');
  });
});
