import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphCheckbox } from './checkbox';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphCheckbox', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-checkbox')).toBe(GraphCheckbox);
  });

  it('should render unchecked by default', async () => {
    const checkbox = new GraphCheckbox();
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(false);
    const button = shadowQuery(checkbox, '[data-slot="checkbox"]');
    expect(button?.getAttribute('aria-checked')).toBe('false');
    expect(button?.getAttribute('data-state')).toBe('unchecked');
  });

  it('should render checked state', async () => {
    const checkbox = new GraphCheckbox();
    checkbox.checked = true;
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(true);
    const button = shadowQuery(checkbox, '[data-slot="checkbox"]');
    expect(button?.getAttribute('aria-checked')).toBe('true');
    expect(button?.getAttribute('data-state')).toBe('checked');
  });

  it('should render indeterminate state', async () => {
    const checkbox = new GraphCheckbox();
    checkbox.indeterminate = true;
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]');
    expect(button?.getAttribute('aria-checked')).toBe('mixed');
  });

  it('should toggle on click', async () => {
    const checkbox = new GraphCheckbox();
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(false);

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(true);

    button.click();
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(false);
  });

  it('should dispatch checkbox-change event', async () => {
    const checkbox = new GraphCheckbox();
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const handler = vi.fn();
    checkbox.addEventListener('checkbox-change', handler);

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.checked).toBe(true);
  });

  it('should handle disabled state', async () => {
    const checkbox = new GraphCheckbox();
    checkbox.disabled = true;
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.tabIndex).toBe(-1);
  });

  it('should not toggle when disabled', async () => {
    const checkbox = new GraphCheckbox();
    checkbox.disabled = true;
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const handler = vi.fn();
    checkbox.addEventListener('checkbox-change', handler);

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    expect(handler).not.toHaveBeenCalled();
    expect(checkbox.checked).toBe(false);
  });

  it('should support keyboard navigation (Space)', async () => {
    const checkbox = new GraphCheckbox();
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(true);
  });

  it('should support keyboard navigation (Enter)', async () => {
    const checkbox = new GraphCheckbox();
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const button = shadowQuery(checkbox, '[data-slot="checkbox"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(true);
  });

  it('should show check indicator when checked', async () => {
    const checkbox = new GraphCheckbox();
    checkbox.checked = true;
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    const indicator = shadowQuery(checkbox, '[data-slot="checkbox-indicator"]');
    expect(indicator).toBeTruthy();
  });

  it('should use Shadow DOM', async () => {
    const checkbox = new GraphCheckbox();
    container.appendChild(checkbox);
    await checkbox.updateComplete;

    expect(checkbox.shadowRoot).toBeTruthy();
  });
});
