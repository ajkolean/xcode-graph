import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GraphSelect,
  GraphSelectTrigger,
  GraphSelectValue,
  GraphSelectContent,
  GraphSelectItem,
  GraphSelectLabel,
  GraphSelectSeparator,
  GraphSelectGroup,
} from './select';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphSelect', () => {
  let select: GraphSelect;

  afterEach(() => {
    select?.remove();
  });

  it('should render with default closed state', async () => {
    select = new GraphSelect();
    document.body.appendChild(select);
    await select.updateComplete;

    expect(select.open).toBe(false);
    expect(select.value).toBe('');
  });

  it('should toggle open state', async () => {
    select = new GraphSelect();
    document.body.appendChild(select);
    await select.updateComplete;

    select.toggleOpen();
    await select.updateComplete;

    expect(select.open).toBe(true);
  });

  it('should set value', async () => {
    select = new GraphSelect();
    document.body.appendChild(select);
    await select.updateComplete;

    select.selectValue('option1');
    await select.updateComplete;

    expect(select.value).toBe('option1');
    expect(select.open).toBe(false);
  });

  it('should dispatch select-change event', async () => {
    select = new GraphSelect();
    document.body.appendChild(select);
    await select.updateComplete;

    const handleChange = vi.fn();
    select.addEventListener('select-change', handleChange);

    select.selectValue('option1');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should not open when disabled', async () => {
    select = new GraphSelect();
    select.disabled = true;
    document.body.appendChild(select);
    await select.updateComplete;

    select.toggleOpen();
    await select.updateComplete;

    expect(select.open).toBe(false);
  });
});

describe('GraphSelectTrigger', () => {
  let trigger: GraphSelectTrigger;

  afterEach(() => {
    trigger?.remove();
  });

  it('should render with default size', async () => {
    trigger = new GraphSelectTrigger();
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    expect(trigger.size).toBe('default');
    const button = shadowQuery(trigger, 'button');
    expect(button).toBeTruthy();
  });

  it('should render with small size', async () => {
    trigger = new GraphSelectTrigger();
    trigger.size = 'sm';
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    expect(trigger.size).toBe('sm');
    expect(trigger.getAttribute('size')).toBe('sm');
  });

  it('should handle disabled state', async () => {
    trigger = new GraphSelectTrigger();
    trigger.disabled = true;
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should render chevron icon', async () => {
    trigger = new GraphSelectTrigger();
    document.body.appendChild(trigger);
    await trigger.updateComplete;

    const svg = shadowQuery(trigger, 'svg');
    expect(svg).toBeTruthy();
  });
});

describe('GraphSelectValue', () => {
  let value: GraphSelectValue;

  afterEach(() => {
    value?.remove();
  });

  it('should render placeholder when no value', async () => {
    const select = new GraphSelect();
    value = new GraphSelectValue();
    value.placeholder = 'Choose an option';

    select.appendChild(value);
    document.body.appendChild(select);

    await select.updateComplete;
    await value.updateComplete;

    // Placeholder is rendered in Shadow DOM
    const span = shadowQuery(value, 'span');
    expect(span?.textContent).toBe('Choose an option');
  });

  it('should use default placeholder', async () => {
    const select = new GraphSelect();
    value = new GraphSelectValue();

    select.appendChild(value);
    document.body.appendChild(select);

    await select.updateComplete;
    await value.updateComplete;

    expect(value.placeholder).toBe('Select...');
  });
});

describe('GraphSelectContent', () => {
  let content: GraphSelectContent;

  afterEach(() => {
    content?.remove();
  });

  it('should render content', async () => {
    content = new GraphSelectContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const viewport = shadowQuery(content, '.viewport');
    expect(viewport).toBeTruthy();
  });

  it('should have listbox role', async () => {
    content = new GraphSelectContent();
    document.body.appendChild(content);
    await content.updateComplete;

    const viewport = shadowQuery(content, '[role="listbox"]');
    expect(viewport).toBeTruthy();
  });

  it('should update state attribute when opened', async () => {
    const select = new GraphSelect();
    content = new GraphSelectContent();

    select.appendChild(content);
    document.body.appendChild(select);

    await select.updateComplete;
    await content.updateComplete;

    expect(content.getAttribute('data-state')).toBe('closed');

    select.open = true;
    await select.updateComplete;
    await content.updateComplete;
    // Small delay for state update
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(content.getAttribute('data-state')).toBe('open');
  });
});

describe('GraphSelectItem', () => {
  let item: GraphSelectItem;

  afterEach(() => {
    item?.remove();
  });

  it('should render with value', async () => {
    item = new GraphSelectItem();
    item.value = 'option1';
    item.textContent = 'Option 1';
    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.value).toBe('option1');
  });

  it('should not be selected by default', async () => {
    item = new GraphSelectItem();
    item.value = 'option1';
    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.selected).toBe(false);
  });

  it('should handle disabled state', async () => {
    item = new GraphSelectItem();
    item.value = 'option1';
    item.disabled = true;
    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.disabled).toBe(true);
    expect(item.hasAttribute('disabled')).toBe(true);
  });

  it('should show indicator when selected', async () => {
    item = new GraphSelectItem();
    item.value = 'option1';
    item.selected = true;
    document.body.appendChild(item);
    await item.updateComplete;

    const indicator = shadowQuery(item, '.indicator');
    expect(indicator).toBeTruthy();
  });
});

describe('GraphSelectLabel', () => {
  let label: GraphSelectLabel;

  afterEach(() => {
    label?.remove();
  });

  it('should render label', async () => {
    label = new GraphSelectLabel();
    label.textContent = 'Category';
    document.body.appendChild(label);
    await label.updateComplete;

    const slot = shadowQuery(label, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphSelectSeparator', () => {
  let separator: GraphSelectSeparator;

  afterEach(() => {
    separator?.remove();
  });

  it('should render separator', async () => {
    separator = new GraphSelectSeparator();
    document.body.appendChild(separator);
    await separator.updateComplete;

    expect(separator).toBeTruthy();
  });
});

describe('GraphSelectGroup', () => {
  let group: GraphSelectGroup;

  afterEach(() => {
    group?.remove();
  });

  it('should render group', async () => {
    group = new GraphSelectGroup();
    document.body.appendChild(group);
    await group.updateComplete;

    const slot = shadowQuery(group, 'slot');
    expect(slot).toBeTruthy();
  });
});

describe('GraphSelect - Integration', () => {
  let select: GraphSelect;
  let trigger: GraphSelectTrigger;
  let value: GraphSelectValue;
  let content: GraphSelectContent;
  let item1: GraphSelectItem;
  let item2: GraphSelectItem;

  afterEach(() => {
    select?.remove();
  });

  it('should work as a complete select component', async () => {
    select = new GraphSelect();
    trigger = new GraphSelectTrigger();
    value = new GraphSelectValue();
    content = new GraphSelectContent();
    item1 = new GraphSelectItem();
    item1.value = 'option1';
    item1.textContent = 'Option 1';
    item2 = new GraphSelectItem();
    item2.value = 'option2';
    item2.textContent = 'Option 2';

    trigger.appendChild(value);
    content.appendChild(item1);
    content.appendChild(item2);
    select.appendChild(trigger);
    select.appendChild(content);

    document.body.appendChild(select);

    await select.updateComplete;
    await trigger.updateComplete;
    await value.updateComplete;
    await content.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;

    // Initially closed
    expect(select.open).toBe(false);
    expect(select.value).toBe('');

    // Open the select
    const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
    button.click();

    await select.updateComplete;
    expect(select.open).toBe(true);

    // Select an item
    const itemDiv = shadowQuery(item1, 'div[role="option"]') as HTMLElement;
    itemDiv.click();

    await select.updateComplete;
    expect(select.value).toBe('option1');
    expect(select.open).toBe(false);
    expect(item1.selected).toBe(true);
  });
});
