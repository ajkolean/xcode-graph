import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphDialog,
  GraphDialogTrigger,
  GraphDialogContent,
  GraphDialogHeader,
  GraphDialogFooter,
  GraphDialogTitle,
  GraphDialogDescription,
} from './dialog';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphDialog', () => {
  let dialog: GraphDialog;

  afterEach(() => {
    dialog?.remove();
  });

  it('should render with default closed state', async () => {
    dialog = new GraphDialog();
    document.body.appendChild(dialog);
    await dialog.updateComplete;

    expect(dialog.open).toBe(false);
  });

  it('should open when open property is set', async () => {
    dialog = new GraphDialog();
    document.body.appendChild(dialog);
    await dialog.updateComplete;

    dialog.open = true;
    await dialog.updateComplete;

    expect(dialog.open).toBe(true);
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('should close via closeDialog method', async () => {
    dialog = new GraphDialog();
    dialog.open = true;
    document.body.appendChild(dialog);
    await dialog.updateComplete;

    dialog.closeDialog();
    await dialog.updateComplete;

    expect(dialog.open).toBe(false);
  });

  it('should dispatch dialog-open-change event', async () => {
    dialog = new GraphDialog();
    document.body.appendChild(dialog);
    await dialog.updateComplete;

    const handleChange = vi.fn();
    dialog.addEventListener('dialog-open-change', handleChange);

    dialog.closeDialog();

    expect(handleChange).toHaveBeenCalled();
  });
});

describe('GraphDialogTrigger', () => {
  let trigger: GraphDialogTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render trigger', async () => {
    trigger = new GraphDialogTrigger();
    trigger.textContent = 'Open Dialog';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const slot = shadowQuery(trigger, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should open dialog when clicked', async () => {
    const dialog = new GraphDialog();
    trigger = new GraphDialogTrigger();
    trigger.textContent = 'Open';

    dialog.appendChild(trigger);
    document.body.appendChild(dialog);

    await dialog.updateComplete;
    await trigger.updateComplete;

    expect(dialog.open).toBe(false);

    const div = shadowQuery(trigger, 'div') as HTMLElement;
    div.click();

    await dialog.updateComplete;

    expect(dialog.open).toBe(true);
  });
});

describe('GraphDialogContent', () => {
  let content: GraphDialogContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render dialog element', async () => {
    content = new GraphDialogContent();
    content.textContent = 'Dialog content';
    document.body.appendChild(content);
    await content.updateComplete;

    const dialogEl = shadowQuery(content, 'dialog');
    expect(dialogEl).toBeTruthy();
  });

  it('should render close button', async () => {
    content = new GraphDialogContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const closeButton = shadowQuery(content, '.close-button');
    expect(closeButton).toBeTruthy();
  });

  it('should show when parent dialog is open', async () => {
    const dialog = new GraphDialog();
    content = new GraphDialogContent();

    dialog.appendChild(content);
    document.body.appendChild(dialog);

    await dialog.updateComplete;
    await content.updateComplete;

    const dialogEl = shadowQuery(content, 'dialog') as HTMLDialogElement;
    expect(dialogEl.open).toBe(false);

    dialog.open = true;
    await dialog.updateComplete;
    await content.updateComplete;
    // Small delay for dialog state update
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(dialogEl.open).toBe(true);
  });

  it('should close when close button is clicked', async () => {
    const dialog = new GraphDialog();
    dialog.open = true;
    content = new GraphDialogContent();

    dialog.appendChild(content);
    document.body.appendChild(dialog);

    await dialog.updateComplete;
    await content.updateComplete;

    const closeButton = shadowQuery(content, '.close-button') as HTMLButtonElement;
    closeButton.click();

    await dialog.updateComplete;

    expect(dialog.open).toBe(false);
  });
});

describe('GraphDialogHeader', () => {
  let header: GraphDialogHeader;

  afterEach(() => {
    header?.remove();
  });

  it('should render header', async () => {
    header = new GraphDialogHeader();
    document.body.appendChild(header);
    await header.updateComplete;

    const slot = shadowQuery(header, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDialogFooter', () => {
  let footer: GraphDialogFooter;

  afterEach(() => {
    footer?.remove();
  });

  it('should render footer', async () => {
    footer = new GraphDialogFooter();
    document.body.appendChild(footer);
    await footer.updateComplete;

    const slot = shadowQuery(footer, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDialogTitle', () => {
  let title: GraphDialogTitle;

  afterEach(() => {
    title?.remove();
  });

  it('should render title', async () => {
    title = new GraphDialogTitle();
    title.textContent = 'Dialog Title';
    document.body.appendChild(title);
    await title.updateComplete;

    const slot = shadowQuery(title, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDialogDescription', () => {
  let description: GraphDialogDescription;

  afterEach(() => {
    description?.remove();
  });

  it('should render description', async () => {
    description = new GraphDialogDescription();
    description.textContent = 'Dialog description';
    document.body.appendChild(description);
    await description.updateComplete;

    const slot = shadowQuery(description, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphDialog - Integration', () => {
  let dialog: GraphDialog;
  let trigger: GraphDialogTrigger;
  let content: GraphDialogContent;
  let header: GraphDialogHeader;
  let title: GraphDialogTitle;
  let description: GraphDialogDescription;
  let footer: GraphDialogFooter;

  afterEach(() => {
    dialog?.remove();
  });

  it('should work as a complete dialog', async () => {
    dialog = new GraphDialog();
    trigger = new GraphDialogTrigger();
    trigger.textContent = 'Open Dialog';

    content = new GraphDialogContent();
    header = new GraphDialogHeader();
    title = new GraphDialogTitle();
    title.textContent = 'Are you sure?';
    description = new GraphDialogDescription();
    description.textContent = 'This action cannot be undone.';
    footer = new GraphDialogFooter();

    header.appendChild(title);
    header.appendChild(description);
    content.appendChild(header);
    content.appendChild(footer);

    dialog.appendChild(trigger);
    dialog.appendChild(content);

    document.body.appendChild(dialog);

    await dialog.updateComplete;
    await trigger.updateComplete;
    await content.updateComplete;

    // Initially closed
    expect(dialog.open).toBe(false);

    // Click trigger to open
    const triggerDiv = shadowQuery(trigger, 'div') as HTMLElement;
    triggerDiv.click();

    await dialog.updateComplete;
    await content.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(dialog.open).toBe(true);

    const dialogEl = shadowQuery(content, 'dialog') as HTMLDialogElement;
    expect(dialogEl.open).toBe(true);

    // Click close button
    const closeButton = shadowQuery(content, '.close-button') as HTMLButtonElement;
    closeButton.click();

    await dialog.updateComplete;

    expect(dialog.open).toBe(false);
  });
});
