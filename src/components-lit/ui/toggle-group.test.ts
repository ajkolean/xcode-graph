import { describe, it, expect, afterEach, vi } from 'vitest';
import { GraphToggleGroup, GraphToggleGroupItem } from './toggle-group';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphToggleGroup', () => {
  let toggleGroup: GraphToggleGroup;

  afterEach(() => {
    toggleGroup?.remove();
  });

  it('should render with default type single', async () => {
    toggleGroup = new GraphToggleGroup();
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    expect(toggleGroup.type).toBe('single');
    expect(toggleGroup.value).toBe('');
  });

  it('should render with default variant and size', async () => {
    toggleGroup = new GraphToggleGroup();
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    expect(toggleGroup.variant).toBe('default');
    expect(toggleGroup.size).toBe('default');
  });

  it('should support outline variant', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.variant = 'outline';
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    expect(toggleGroup.variant).toBe('outline');
    expect(toggleGroup.getAttribute('variant')).toBe('outline');
  });

  it('should support different sizes', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.size = 'sm';
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    expect(toggleGroup.size).toBe('sm');

    toggleGroup.size = 'lg';
    await toggleGroup.updateComplete;

    expect(toggleGroup.size).toBe('lg');
  });

  it('should toggle item value in single mode', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.type = 'single';
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    toggleGroup.toggleItem('option1');
    await toggleGroup.updateComplete;

    expect(toggleGroup.value).toBe('option1');

    toggleGroup.toggleItem('option1');
    await toggleGroup.updateComplete;

    expect(toggleGroup.value).toBe('');
  });

  it('should toggle multiple items in multiple mode', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.type = 'multiple';
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    toggleGroup.toggleItem('option1');
    await toggleGroup.updateComplete;

    expect(toggleGroup.value).toEqual(['option1']);

    toggleGroup.toggleItem('option2');
    await toggleGroup.updateComplete;

    expect(toggleGroup.value).toEqual(['option1', 'option2']);

    toggleGroup.toggleItem('option1');
    await toggleGroup.updateComplete;

    expect(toggleGroup.value).toEqual(['option2']);
  });

  it('should dispatch toggle-group-change event', async () => {
    toggleGroup = new GraphToggleGroup();
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    const handleChange = vi.fn();
    toggleGroup.addEventListener('toggle-group-change', handleChange);

    toggleGroup.toggleItem('option1');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should check if item is pressed', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.value = 'option1';
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    expect(toggleGroup.isPressed('option1')).toBe(true);
    expect(toggleGroup.isPressed('option2')).toBe(false);
  });

  it('should not toggle when disabled', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.disabled = true;
    document.body.appendChild(toggleGroup);
    await toggleGroup.updateComplete;

    toggleGroup.toggleItem('option1');
    await toggleGroup.updateComplete;

    expect(toggleGroup.value).toBe('');
  });
});

describe('GraphToggleGroupItem', () => {
  let item: GraphToggleGroupItem;

  afterEach(() => {
    item?.remove();
  });

  it('should render with value', async () => {
    item = new GraphToggleGroupItem();
    item.value = 'option1';
    item.textContent = 'Option 1';
    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.value).toBe('option1');
    expect(item.pressed).toBe(false);
  });

  it('should render button', async () => {
    item = new GraphToggleGroupItem();
    item.value = 'option1';
    document.body.appendChild(item);
    await item.updateComplete;

    const button = shadowQuery(item, 'button');
    expect(button).toBeTruthy();
  });

  it('should handle pressed state', async () => {
    item = new GraphToggleGroupItem();
    item.value = 'option1';
    item.pressed = true;
    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.pressed).toBe(true);
    expect(item.hasAttribute('pressed')).toBe(true);

    const button = shadowQuery(item, 'button');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should handle disabled state', async () => {
    item = new GraphToggleGroupItem();
    item.value = 'option1';
    item.disabled = true;
    document.body.appendChild(item);
    await item.updateComplete;

    expect(item.disabled).toBe(true);

    const button = shadowQuery(item, 'button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe('GraphToggleGroup - Integration', () => {
  let toggleGroup: GraphToggleGroup;
  let item1: GraphToggleGroupItem;
  let item2: GraphToggleGroupItem;
  let item3: GraphToggleGroupItem;

  afterEach(() => {
    toggleGroup?.remove();
  });

  it('should work as a complete toggle group (single)', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.type = 'single';

    item1 = new GraphToggleGroupItem();
    item1.value = 'left';
    item1.textContent = 'Left';

    item2 = new GraphToggleGroupItem();
    item2.value = 'center';
    item2.textContent = 'Center';

    item3 = new GraphToggleGroupItem();
    item3.value = 'right';
    item3.textContent = 'Right';

    toggleGroup.appendChild(item1);
    toggleGroup.appendChild(item2);
    toggleGroup.appendChild(item3);

    document.body.appendChild(toggleGroup);

    await toggleGroup.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;
    await item3.updateComplete;

    // Initially no selection
    expect(toggleGroup.value).toBe('');
    expect(item1.pressed).toBe(false);

    // Click first item
    const button1 = shadowQuery(item1, 'button') as HTMLButtonElement;
    button1.click();

    await toggleGroup.updateComplete;
    await item1.updateComplete;

    expect(toggleGroup.value).toBe('left');
    expect(item1.pressed).toBe(true);

    // Click second item (should deselect first in single mode)
    const button2 = shadowQuery(item2, 'button') as HTMLButtonElement;
    button2.click();

    await toggleGroup.updateComplete;
    await item2.updateComplete;

    expect(toggleGroup.value).toBe('center');
    expect(item2.pressed).toBe(true);
  });

  it('should work as a complete toggle group (multiple)', async () => {
    toggleGroup = new GraphToggleGroup();
    toggleGroup.type = 'multiple';

    item1 = new GraphToggleGroupItem();
    item1.value = 'bold';
    item1.textContent = 'B';

    item2 = new GraphToggleGroupItem();
    item2.value = 'italic';
    item2.textContent = 'I';

    item3 = new GraphToggleGroupItem();
    item3.value = 'underline';
    item3.textContent = 'U';

    toggleGroup.appendChild(item1);
    toggleGroup.appendChild(item2);
    toggleGroup.appendChild(item3);

    document.body.appendChild(toggleGroup);

    await toggleGroup.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;
    await item3.updateComplete;

    // Click multiple items
    const button1 = shadowQuery(item1, 'button') as HTMLButtonElement;
    const button2 = shadowQuery(item2, 'button') as HTMLButtonElement;

    button1.click();
    await toggleGroup.updateComplete;
    await item1.updateComplete;

    expect(toggleGroup.value).toEqual(['bold']);
    expect(item1.pressed).toBe(true);

    button2.click();
    await toggleGroup.updateComplete;
    await item2.updateComplete;

    expect(toggleGroup.value).toEqual(['bold', 'italic']);
    expect(item1.pressed).toBe(true);
    expect(item2.pressed).toBe(true);
  });
});
