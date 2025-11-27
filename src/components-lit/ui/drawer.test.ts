import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphDrawer,
  GraphDrawerTrigger,
  GraphDrawerContent,
  GraphDrawerHeader,
  GraphDrawerFooter,
  GraphDrawerTitle,
  GraphDrawerDescription,
} from './drawer';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphDrawer', () => {
  let drawer: GraphDrawer;

  afterEach(() => {
    drawer?.remove();
  });

  it('should render with default closed state', async () => {
    drawer = new GraphDrawer();
    document.body.appendChild(drawer);
    await drawer.updateComplete;

    expect(drawer.open).toBe(false);
    expect(drawer.direction).toBe('bottom');
  });

  it('should open when open property is set', async () => {
    drawer = new GraphDrawer();
    document.body.appendChild(drawer);
    await drawer.updateComplete;

    drawer.open = true;
    await drawer.updateComplete;

    expect(drawer.open).toBe(true);
  });

  it('should support different directions', async () => {
    drawer = new GraphDrawer();
    drawer.direction = 'top';
    document.body.appendChild(drawer);
    await drawer.updateComplete;

    expect(drawer.direction).toBe('top');

    drawer.direction = 'left';
    await drawer.updateComplete;

    expect(drawer.direction).toBe('left');

    drawer.direction = 'right';
    await drawer.updateComplete;

    expect(drawer.direction).toBe('right');
  });

  it('should close via closeDrawer method', async () => {
    drawer = new GraphDrawer();
    drawer.open = true;
    document.body.appendChild(drawer);
    await drawer.updateComplete;

    drawer.closeDrawer();
    await drawer.updateComplete;

    expect(drawer.open).toBe(false);
  });

  it('should dispatch drawer-open-change event', async () => {
    drawer = new GraphDrawer();
    document.body.appendChild(drawer);
    await drawer.updateComplete;

    const handleChange = vi.fn();
    drawer.addEventListener('drawer-open-change', handleChange);

    drawer.closeDrawer();

    expect(handleChange).toHaveBeenCalled();
  });
});

describe('GraphDrawerTrigger', () => {
  let trigger: GraphDrawerTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render trigger', async () => {
    trigger = new GraphDrawerTrigger();
    trigger.textContent = 'Open Drawer';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const slot = shadowQuery(trigger, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should open drawer when clicked', async () => {
    const drawer = new GraphDrawer();
    trigger = new GraphDrawerTrigger();
    trigger.textContent = 'Open';

    drawer.appendChild(trigger);
    document.body.appendChild(drawer);

    await drawer.updateComplete;
    await trigger.updateComplete;

    expect(drawer.open).toBe(false);

    const div = shadowQuery(trigger, 'div') as HTMLElement;
    div.click();

    await drawer.updateComplete;

    expect(drawer.open).toBe(true);
  });
});

describe('GraphDrawerContent', () => {
  let content: GraphDrawerContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render content', async () => {
    content = new GraphDrawerContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const contentDiv = shadowQuery(content, '.content');
    expect(contentDiv).toBeTruthy();
  });

  it('should render handle for bottom direction', async () => {
    const drawer = new GraphDrawer();
    drawer.direction = 'bottom';
    content = new GraphDrawerContent();

    drawer.appendChild(content);
    document.body.appendChild(drawer);

    await drawer.updateComplete;
    await content.updateComplete;

    const handle = shadowQuery(content, '.handle');
    expect(handle).toBeTruthy();
  });

  it('should show overlay when open', async () => {
    const drawer = new GraphDrawer();
    content = new GraphDrawerContent();

    drawer.appendChild(content);
    document.body.appendChild(drawer);

    await drawer.updateComplete;
    await content.updateComplete;

    let overlay = shadowQuery(content, '.overlay');
    expect(overlay).toBeFalsy();

    drawer.open = true;
    await drawer.updateComplete;
    await content.updateComplete;

    overlay = shadowQuery(content, '.overlay');
    expect(overlay).toBeTruthy();
  });

  it('should update state and direction attributes', async () => {
    const drawer = new GraphDrawer();
    drawer.direction = 'top';
    content = new GraphDrawerContent();

    drawer.appendChild(content);
    document.body.appendChild(drawer);

    await drawer.updateComplete;
    await content.updateComplete;

    expect(content.getAttribute('data-state')).toBe('closed');
    expect(content.getAttribute('data-direction')).toBe('top');

    drawer.open = true;
    await drawer.updateComplete;
    await content.updateComplete;

    expect(content.getAttribute('data-state')).toBe('open');
  });

  it('should close when overlay is clicked', async () => {
    const drawer = new GraphDrawer();
    drawer.open = true;
    content = new GraphDrawerContent();

    drawer.appendChild(content);
    document.body.appendChild(drawer);

    await drawer.updateComplete;
    await content.updateComplete;

    const overlay = shadowQuery(content, '.overlay') as HTMLElement;
    overlay.click();

    await drawer.updateComplete;

    expect(drawer.open).toBe(false);
  });
});

describe('GraphDrawerHeader', () => {
  let header: GraphDrawerHeader;

  afterEach(() => {
    header?.remove();
  });

  it('should render header', async () => {
    header = new GraphDrawerHeader();
    document.body.appendChild(header);
    await header.updateComplete;

    const slot = shadowQuery(header, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDrawerFooter', () => {
  let footer: GraphDrawerFooter;

  afterEach(() => {
    footer?.remove();
  });

  it('should render footer', async () => {
    footer = new GraphDrawerFooter();
    document.body.appendChild(footer);
    await footer.updateComplete;

    const slot = shadowQuery(footer, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDrawerTitle', () => {
  let title: GraphDrawerTitle;

  afterEach(() => {
    title?.remove();
  });

  it('should render title', async () => {
    title = new GraphDrawerTitle();
    title.textContent = 'Drawer Title';
    document.body.appendChild(title);
    await title.updateComplete;

    const slot = shadowQuery(title, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDrawerDescription', () => {
  let description: GraphDrawerDescription;

  afterEach(() => {
    description?.remove();
  });

  it('should render description', async () => {
    description = new GraphDrawerDescription();
    description.textContent = 'Drawer description';
    document.body.appendChild(description);
    await description.updateComplete;

    const slot = shadowQuery(description, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDrawer - Integration', () => {
  let drawer: GraphDrawer;
  let trigger: GraphDrawerTrigger;
  let content: GraphDrawerContent;

  afterEach(() => {
    drawer?.remove();
  });

  it('should work as a complete drawer', async () => {
    drawer = new GraphDrawer();
    drawer.direction = 'bottom';

    trigger = new GraphDrawerTrigger();
    trigger.textContent = 'Open Drawer';

    content = new GraphDrawerContent();
    content.textContent = 'Drawer content';

    drawer.appendChild(trigger);
    drawer.appendChild(content);

    document.body.appendChild(drawer);

    await drawer.updateComplete;
    await trigger.updateComplete;
    await content.updateComplete;

    // Initially closed
    expect(drawer.open).toBe(false);

    // Click trigger
    const triggerDiv = shadowQuery(trigger, 'div') as HTMLElement;
    triggerDiv.click();

    await drawer.updateComplete;
    await content.updateComplete;

    expect(drawer.open).toBe(true);
    expect(content.getAttribute('data-state')).toBe('open');
    expect(content.getAttribute('data-direction')).toBe('bottom');

    // Close drawer
    drawer.closeDrawer();
    await drawer.updateComplete;

    expect(drawer.open).toBe(false);
  });
});
