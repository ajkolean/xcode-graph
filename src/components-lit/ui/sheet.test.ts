import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphSheet,
  GraphSheetTrigger,
  GraphSheetContent,
  GraphSheetHeader,
  GraphSheetFooter,
  GraphSheetTitle,
  GraphSheetDescription,
} from './sheet';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphSheet', () => {
  let sheet: GraphSheet;

  afterEach(() => {
    sheet?.remove();
  });

  it('should render with default closed state', async () => {
    sheet = new GraphSheet();
    document.body.appendChild(sheet);
    await sheet.updateComplete;

    expect(sheet.open).toBe(false);
  });

  it('should open when open property is set', async () => {
    sheet = new GraphSheet();
    document.body.appendChild(sheet);
    await sheet.updateComplete;

    sheet.open = true;
    await sheet.updateComplete;

    expect(sheet.open).toBe(true);
  });

  it('should close via closeSheet method', async () => {
    sheet = new GraphSheet();
    sheet.open = true;
    document.body.appendChild(sheet);
    await sheet.updateComplete;

    sheet.closeSheet();
    await sheet.updateComplete;

    expect(sheet.open).toBe(false);
  });

  it('should dispatch sheet-open-change event', async () => {
    sheet = new GraphSheet();
    document.body.appendChild(sheet);
    await sheet.updateComplete;

    const handleChange = vi.fn();
    sheet.addEventListener('sheet-open-change', handleChange);

    sheet.closeSheet();

    expect(handleChange).toHaveBeenCalled();
  });
});

describe('GraphSheetTrigger', () => {
  let trigger: GraphSheetTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render trigger', async () => {
    trigger = new GraphSheetTrigger();
    trigger.textContent = 'Open Sheet';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const slot = shadowQuery(trigger, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should open sheet when clicked', async () => {
    const sheet = new GraphSheet();
    trigger = new GraphSheetTrigger();
    trigger.textContent = 'Open';

    sheet.appendChild(trigger);
    document.body.appendChild(sheet);

    await sheet.updateComplete;
    await trigger.updateComplete;

    expect(sheet.open).toBe(false);

    const div = shadowQuery(trigger, 'div') as HTMLElement;
    div.click();

    await sheet.updateComplete;

    expect(sheet.open).toBe(true);
  });
});

describe('GraphSheetContent', () => {
  let content: GraphSheetContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render with default right side', async () => {
    content = new GraphSheetContent();
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.side).toBe('right');
  });

  it('should support left side', async () => {
    content = new GraphSheetContent();
    content.side = 'left';
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.side).toBe('left');
    expect(content.getAttribute('side')).toBe('left');
  });

  it('should support top side', async () => {
    content = new GraphSheetContent();
    content.side = 'top';
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.side).toBe('top');
  });

  it('should support bottom side', async () => {
    content = new GraphSheetContent();
    content.side = 'bottom';
    document.body.appendChild(content);
    await content.updateComplete;

    expect(content.side).toBe('bottom');
  });

  it('should render close button', async () => {
    content = new GraphSheetContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const closeButton = shadowQuery(content, '.close-button');
    expect(closeButton).toBeTruthy();
  });

  it('should show overlay when open', async () => {
    const sheet = new GraphSheet();
    content = new GraphSheetContent();

    sheet.appendChild(content);
    document.body.appendChild(sheet);

    await sheet.updateComplete;
    await content.updateComplete;

    let overlay = shadowQuery(content, '.overlay');
    expect(overlay).toBeFalsy();

    sheet.open = true;
    await sheet.updateComplete;
    await content.updateComplete;

    overlay = shadowQuery(content, '.overlay');
    expect(overlay).toBeTruthy();
  });

  it('should update state attribute', async () => {
    const sheet = new GraphSheet();
    content = new GraphSheetContent();

    sheet.appendChild(content);
    document.body.appendChild(sheet);

    await sheet.updateComplete;
    await content.updateComplete;

    expect(content.getAttribute('data-state')).toBe('closed');

    sheet.open = true;
    await sheet.updateComplete;
    await content.updateComplete;

    expect(content.getAttribute('data-state')).toBe('open');
  });

  it('should close when close button is clicked', async () => {
    const sheet = new GraphSheet();
    sheet.open = true;
    content = new GraphSheetContent();

    sheet.appendChild(content);
    document.body.appendChild(sheet);

    await sheet.updateComplete;
    await content.updateComplete;

    const closeButton = shadowQuery(content, '.close-button') as HTMLButtonElement;
    closeButton.click();

    await sheet.updateComplete;

    expect(sheet.open).toBe(false);
  });

  it('should close when overlay is clicked', async () => {
    const sheet = new GraphSheet();
    sheet.open = true;
    content = new GraphSheetContent();

    sheet.appendChild(content);
    document.body.appendChild(sheet);

    await sheet.updateComplete;
    await content.updateComplete;

    const overlay = shadowQuery(content, '.overlay') as HTMLElement;
    overlay.click();

    await sheet.updateComplete;

    expect(sheet.open).toBe(false);
  });
});

describe('GraphSheetHeader', () => {
  let header: GraphSheetHeader;

  afterEach(() => {
    header?.remove();
  });

  it('should render header', async () => {
    header = new GraphSheetHeader();
    document.body.appendChild(header);
    await header.updateComplete;

    const slot = shadowQuery(header, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphSheetFooter', () => {
  let footer: GraphSheetFooter;

  afterEach(() => {
    footer?.remove();
  });

  it('should render footer', async () => {
    footer = new GraphSheetFooter();
    document.body.appendChild(footer);
    await footer.updateComplete;

    const slot = shadowQuery(footer, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphSheetTitle', () => {
  let title: GraphSheetTitle;

  afterEach(() => {
    title?.remove();
  });

  it('should render title', async () => {
    title = new GraphSheetTitle();
    title.textContent = 'Sheet Title';
    document.body.appendChild(title);
    await title.updateComplete;

    const slot = shadowQuery(title, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphSheetDescription', () => {
  let description: GraphSheetDescription;

  afterEach(() => {
    description?.remove();
  });

  it('should render description', async () => {
    description = new GraphSheetDescription();
    description.textContent = 'Sheet description';
    document.body.appendChild(description);
    await description.updateComplete;

    const slot = shadowQuery(description, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphSheet - Integration', () => {
  let sheet: GraphSheet;
  let trigger: GraphSheetTrigger;
  let content: GraphSheetContent;
  let header: GraphSheetHeader;
  let title: GraphSheetTitle;

  afterEach(() => {
    sheet?.remove();
  });

  it('should work as a complete sheet', async () => {
    sheet = new GraphSheet();
    trigger = new GraphSheetTrigger();
    trigger.textContent = 'Open Sheet';

    content = new GraphSheetContent();
    content.side = 'right';

    header = new GraphSheetHeader();
    title = new GraphSheetTitle();
    title.textContent = 'Settings';

    header.appendChild(title);
    content.appendChild(header);
    sheet.appendChild(trigger);
    sheet.appendChild(content);

    document.body.appendChild(sheet);

    await sheet.updateComplete;
    await trigger.updateComplete;
    await content.updateComplete;

    // Initially closed
    expect(sheet.open).toBe(false);

    // Click trigger
    const triggerDiv = shadowQuery(trigger, 'div') as HTMLElement;
    triggerDiv.click();

    await sheet.updateComplete;
    await content.updateComplete;

    expect(sheet.open).toBe(true);
    expect(content.getAttribute('data-state')).toBe('open');

    // Click close button
    const closeButton = shadowQuery(content, '.close-button') as HTMLButtonElement;
    closeButton.click();

    await sheet.updateComplete;

    expect(sheet.open).toBe(false);
  });

  it('should support different sides', async () => {
    const sides: SheetSide[] = ['left', 'right', 'top', 'bottom'];

    for (const side of sides) {
      content = new GraphSheetContent();
      content.side = side;
      document.body.appendChild(content);
      await content.updateComplete;

      expect(content.side).toBe(side);
      expect(content.getAttribute('side')).toBe(side);

      content.remove();
    }
  });
});
