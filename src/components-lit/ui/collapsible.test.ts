import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphCollapsible,
  GraphCollapsibleTrigger,
  GraphCollapsibleContent,
} from './collapsible';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphCollapsible', () => {
  let collapsible: GraphCollapsible;

  afterEach(() => {
    collapsible?.remove();
  });

  it('should render with default closed state', async () => {
    collapsible = new GraphCollapsible();
    document.body.appendChild(collapsible);
    await collapsible.updateComplete;

    expect(collapsible.open).toBe(false);
  });

  it('should render with open state', async () => {
    collapsible = new GraphCollapsible();
    collapsible.open = true;
    document.body.appendChild(collapsible);
    await collapsible.updateComplete;

    expect(collapsible.open).toBe(true);
    expect(collapsible.getAttribute('open')).toBe('');
  });

  it('should toggle open state', async () => {
    collapsible = new GraphCollapsible();
    document.body.appendChild(collapsible);
    await collapsible.updateComplete;

    expect(collapsible.open).toBe(false);

    collapsible.open = true;
    await collapsible.updateComplete;

    expect(collapsible.open).toBe(true);
  });

  it('should dispatch collapsible-change event when toggled', async () => {
    collapsible = new GraphCollapsible();
    document.body.appendChild(collapsible);
    await collapsible.updateComplete;

    const handleChange = vi.fn();
    collapsible.addEventListener('collapsible-change', handleChange);

    // Simulate trigger click
    collapsible.dispatchEvent(new CustomEvent('trigger-click', { bubbles: true }));
    await collapsible.updateComplete;

    expect(handleChange).toHaveBeenCalled();
    expect(collapsible.open).toBe(true);
  });
});

describe('GraphCollapsibleTrigger', () => {
  let trigger: GraphCollapsibleTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render trigger button', async () => {
    trigger = new GraphCollapsibleTrigger();
    trigger.textContent = 'Toggle';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const button = shadowQuery(trigger, 'button');
    expect(button).toBeTruthy();
  });

  it('should dispatch trigger-click event when clicked', async () => {
    trigger = new GraphCollapsibleTrigger();
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const handleClick = vi.fn();
    trigger.addEventListener('trigger-click', handleClick);

    const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
    button.click();

    expect(handleClick).toHaveBeenCalled();
  });

  it('should prevent default on click', async () => {
    trigger = new GraphCollapsibleTrigger();
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

    button.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});

describe('GraphCollapsibleContent', () => {
  let content: GraphCollapsibleContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render with closed state by default', async () => {
    content = new GraphCollapsibleContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const contentDiv = shadowQuery(content, '.content') as HTMLElement;
    expect(contentDiv).toBeTruthy();
    expect(contentDiv.dataset.state).toBe('closed');
  });

  it('should update state when parent collapsible opens', async () => {
    const collapsible = new GraphCollapsible();
    content = new GraphCollapsibleContent();
    content.textContent = 'Content';

    collapsible.appendChild(content);
    document.body.appendChild(collapsible);
    await collapsible.updateComplete;
    await content.updateComplete;

    let contentDiv = shadowQuery(content, '.content') as HTMLElement;
    expect(contentDiv.dataset.state).toBe('closed');

    collapsible.open = true;
    await collapsible.updateComplete;
    await content.updateComplete;

    contentDiv = shadowQuery(content, '.content') as HTMLElement;
    expect(contentDiv.dataset.state).toBe('open');
  });

  it('should render slotted content', async () => {
    content = new GraphCollapsibleContent();
    content.textContent = 'Hidden content';
    document.body.appendChild(content);
    await content.updateComplete;

    const slot = shadowQuery(content, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphCollapsible - Integration', () => {
  let collapsible: GraphCollapsible;
  let trigger: GraphCollapsibleTrigger;
  let content: GraphCollapsibleContent;

  afterEach(() => {
    collapsible?.remove();
  });

  it('should work together as a complete collapsible', async () => {
    collapsible = new GraphCollapsible();
    trigger = new GraphCollapsibleTrigger();
    trigger.textContent = 'Toggle';
    content = new GraphCollapsibleContent();
    content.textContent = 'Hidden content';

    collapsible.appendChild(trigger);
    collapsible.appendChild(content);
    document.body.appendChild(collapsible);

    await collapsible.updateComplete;
    await trigger.updateComplete;
    await content.updateComplete;

    // Initially closed
    expect(collapsible.open).toBe(false);
    let contentDiv = shadowQuery(content, '.content') as HTMLElement;
    expect(contentDiv.dataset.state).toBe('closed');

    // Click trigger to open
    const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
    button.click();

    await collapsible.updateComplete;
    await content.updateComplete;

    expect(collapsible.open).toBe(true);
    contentDiv = shadowQuery(content, '.content') as HTMLElement;
    expect(contentDiv.dataset.state).toBe('open');

    // Click trigger to close
    button.click();

    await collapsible.updateComplete;
    await content.updateComplete;

    expect(collapsible.open).toBe(false);
    contentDiv = shadowQuery(content, '.content') as HTMLElement;
    expect(contentDiv.dataset.state).toBe('closed');
  });
});
