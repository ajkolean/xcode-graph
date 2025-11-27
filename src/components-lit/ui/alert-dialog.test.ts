import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphAlertDialog,
  GraphAlertDialogTrigger,
  GraphAlertDialogContent,
  GraphAlertDialogHeader,
  GraphAlertDialogFooter,
  GraphAlertDialogTitle,
  GraphAlertDialogDescription,
  GraphAlertDialogAction,
  GraphAlertDialogCancel,
} from './alert-dialog';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphAlertDialog', () => {
  let alertDialog: GraphAlertDialog;

  afterEach(() => {
    alertDialog?.remove();
  });

  it('should render with default closed state', async () => {
    alertDialog = new GraphAlertDialog();
    document.body.appendChild(alertDialog);
    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
  });

  it('should open when open property is set', async () => {
    alertDialog = new GraphAlertDialog();
    document.body.appendChild(alertDialog);
    await alertDialog.updateComplete;

    alertDialog.open = true;
    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(true);
  });

  it('should close via closeDialog method with cancel action', async () => {
    alertDialog = new GraphAlertDialog();
    alertDialog.open = true;
    document.body.appendChild(alertDialog);
    await alertDialog.updateComplete;

    alertDialog.closeDialog('cancel');
    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
  });

  it('should close via closeDialog method with action', async () => {
    alertDialog = new GraphAlertDialog();
    alertDialog.open = true;
    document.body.appendChild(alertDialog);
    await alertDialog.updateComplete;

    alertDialog.closeDialog('action');
    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
  });

  it('should dispatch alert-dialog-close event with action', async () => {
    alertDialog = new GraphAlertDialog();
    alertDialog.open = true;
    document.body.appendChild(alertDialog);
    await alertDialog.updateComplete;

    const handleClose = vi.fn();
    alertDialog.addEventListener('alert-dialog-close', handleClose);

    alertDialog.closeDialog('action');

    expect(handleClose).toHaveBeenCalled();
    const event = handleClose.mock.calls[0][0] as CustomEvent;
    expect(event.detail.action).toBe('action');
  });
});

describe('GraphAlertDialogTrigger', () => {
  let trigger: GraphAlertDialogTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render trigger', async () => {
    trigger = new GraphAlertDialogTrigger();
    trigger.textContent = 'Delete';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const slot = shadowQuery(trigger, 'slot');
    expect(slot).toBeTruthy();
  });

  it('should open alert dialog when clicked', async () => {
    const alertDialog = new GraphAlertDialog();
    trigger = new GraphAlertDialogTrigger();
    trigger.textContent = 'Delete';

    alertDialog.appendChild(trigger);
    document.body.appendChild(alertDialog);

    await alertDialog.updateComplete;
    await trigger.updateComplete;

    expect(alertDialog.open).toBe(false);

    const div = shadowQuery(trigger, 'div') as HTMLElement;
    div.click();

    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(true);
  });
});

describe('GraphAlertDialogContent', () => {
  let content: GraphAlertDialogContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render dialog element', async () => {
    content = new GraphAlertDialogContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const dialogEl = shadowQuery(content, 'dialog');
    expect(dialogEl).toBeTruthy();
  });

  it('should show when parent alert dialog is open', async () => {
    const alertDialog = new GraphAlertDialog();
    content = new GraphAlertDialogContent();

    alertDialog.appendChild(content);
    document.body.appendChild(alertDialog);

    await alertDialog.updateComplete;
    await content.updateComplete;

    const dialogEl = shadowQuery(content, 'dialog') as HTMLDialogElement;
    expect(dialogEl.open).toBe(false);

    alertDialog.open = true;
    await alertDialog.updateComplete;
    await content.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(dialogEl.open).toBe(true);
  });
});

describe('GraphAlertDialogHeader', () => {
  let header: GraphAlertDialogHeader;

  afterEach(() => {
    header?.remove();
  });

  it('should render header', async () => {
    header = new GraphAlertDialogHeader();
    document.body.appendChild(header);
    await header.updateComplete;

    const slot = shadowQuery(header, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphAlertDialogFooter', () => {
  let footer: GraphAlertDialogFooter;

  afterEach(() => {
    footer?.remove();
  });

  it('should render footer', async () => {
    footer = new GraphAlertDialogFooter();
    document.body.appendChild(footer);
    await footer.updateComplete;

    const slot = shadowQuery(footer, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphAlertDialogTitle', () => {
  let title: GraphAlertDialogTitle;

  afterEach(() => {
    title?.remove();
  });

  it('should render title', async () => {
    title = new GraphAlertDialogTitle();
    title.textContent = 'Are you sure?';
    document.body.appendChild(title);
    await title.updateComplete;

    const slot = shadowQuery(title, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphAlertDialogDescription', () => {
  let description: GraphAlertDialogDescription;

  afterEach(() => {
    description?.remove();
  });

  it('should render description', async () => {
    description = new GraphAlertDialogDescription();
    description.textContent = 'This action cannot be undone.';
    document.body.appendChild(description);
    await description.updateComplete;

    const slot = shadowQuery(description, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphAlertDialogAction', () => {
  let action: GraphAlertDialogAction;

  afterEach(() => {
    action?.remove();
  });

  it('should render action button', async () => {
    action = new GraphAlertDialogAction();
    action.textContent = 'Continue';
    document.body.appendChild(action);
    await action.updateComplete;

    const button = shadowQuery(action, 'button');
    expect(button).toBeTruthy();
  });

  it('should close dialog with action when clicked', async () => {
    const alertDialog = new GraphAlertDialog();
    alertDialog.open = true;
    action = new GraphAlertDialogAction();
    action.textContent = 'Continue';

    alertDialog.appendChild(action);
    document.body.appendChild(alertDialog);

    await alertDialog.updateComplete;
    await action.updateComplete;

    const button = shadowQuery(action, 'button') as HTMLButtonElement;
    button.click();

    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
  });
});

describe('GraphAlertDialogCancel', () => {
  let cancel: GraphAlertDialogCancel;

  afterEach(() => {
    cancel?.remove();
  });

  it('should render cancel button', async () => {
    cancel = new GraphAlertDialogCancel();
    cancel.textContent = 'Cancel';
    document.body.appendChild(cancel);
    await cancel.updateComplete;

    const button = shadowQuery(cancel, 'button');
    expect(button).toBeTruthy();
  });

  it('should close dialog with cancel when clicked', async () => {
    const alertDialog = new GraphAlertDialog();
    alertDialog.open = true;
    cancel = new GraphAlertDialogCancel();
    cancel.textContent = 'Cancel';

    alertDialog.appendChild(cancel);
    document.body.appendChild(alertDialog);

    await alertDialog.updateComplete;
    await cancel.updateComplete;

    const button = shadowQuery(cancel, 'button') as HTMLButtonElement;
    button.click();

    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
  });
});

describe('GraphAlertDialog - Integration', () => {
  let alertDialog: GraphAlertDialog;
  let trigger: GraphAlertDialogTrigger;
  let content: GraphAlertDialogContent;
  let header: GraphAlertDialogHeader;
  let title: GraphAlertDialogTitle;
  let description: GraphAlertDialogDescription;
  let footer: GraphAlertDialogFooter;
  let action: GraphAlertDialogAction;
  let cancel: GraphAlertDialogCancel;

  afterEach(() => {
    alertDialog?.remove();
  });

  it('should work as a complete alert dialog', async () => {
    alertDialog = new GraphAlertDialog();
    trigger = new GraphAlertDialogTrigger();
    trigger.textContent = 'Delete Account';

    content = new GraphAlertDialogContent();
    header = new GraphAlertDialogHeader();
    title = new GraphAlertDialogTitle();
    title.textContent = 'Are you absolutely sure?';
    description = new GraphAlertDialogDescription();
    description.textContent = 'This action cannot be undone.';
    footer = new GraphAlertDialogFooter();
    cancel = new GraphAlertDialogCancel();
    cancel.textContent = 'Cancel';
    action = new GraphAlertDialogAction();
    action.textContent = 'Delete';

    header.appendChild(title);
    header.appendChild(description);
    footer.appendChild(cancel);
    footer.appendChild(action);
    content.appendChild(header);
    content.appendChild(footer);

    alertDialog.appendChild(trigger);
    alertDialog.appendChild(content);

    document.body.appendChild(alertDialog);

    await alertDialog.updateComplete;
    await trigger.updateComplete;
    await content.updateComplete;

    // Initially closed
    expect(alertDialog.open).toBe(false);

    // Click trigger to open
    const triggerDiv = shadowQuery(trigger, 'div') as HTMLElement;
    triggerDiv.click();

    await alertDialog.updateComplete;
    await content.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(alertDialog.open).toBe(true);

    // Click cancel button
    const cancelButton = shadowQuery(cancel, 'button') as HTMLButtonElement;
    cancelButton.click();

    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
  });

  it('should handle action button click', async () => {
    alertDialog = new GraphAlertDialog();
    trigger = new GraphAlertDialogTrigger();
    trigger.textContent = 'Delete';

    content = new GraphAlertDialogContent();
    action = new GraphAlertDialogAction();
    action.textContent = 'Confirm';

    content.appendChild(action);
    alertDialog.appendChild(trigger);
    alertDialog.appendChild(content);

    document.body.appendChild(alertDialog);

    await alertDialog.updateComplete;

    // Open dialog
    const triggerDiv = shadowQuery(trigger, 'div') as HTMLElement;
    triggerDiv.click();
    await alertDialog.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(alertDialog.open).toBe(true);

    // Click action button
    const actionButton = shadowQuery(action, 'button') as HTMLButtonElement;

    const handleClose = vi.fn();
    alertDialog.addEventListener('alert-dialog-close', handleClose);

    actionButton.click();

    await alertDialog.updateComplete;

    expect(alertDialog.open).toBe(false);
    expect(handleClose).toHaveBeenCalled();
    const event = handleClose.mock.calls[0][0] as CustomEvent;
    expect(event.detail.action).toBe('action');
  });
});
