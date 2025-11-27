import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphSwitch } from './switch';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphSwitch', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-switch')).toBe(GraphSwitch);
  });

  it('should render unchecked by default', async () => {
    const switchEl = new GraphSwitch();
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    expect(switchEl.checked).toBe(false);
    const button = shadowQuery(switchEl, '[data-slot="switch"]');
    expect(button?.getAttribute('aria-checked')).toBe('false');
    expect(button?.getAttribute('data-state')).toBe('unchecked');
  });

  it('should render checked state', async () => {
    const switchEl = new GraphSwitch();
    switchEl.checked = true;
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    expect(switchEl.checked).toBe(true);
    const button = shadowQuery(switchEl, '[data-slot="switch"]');
    expect(button?.getAttribute('aria-checked')).toBe('true');
    expect(button?.getAttribute('data-state')).toBe('checked');
  });

  it('should toggle on click', async () => {
    const switchEl = new GraphSwitch();
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    expect(switchEl.checked).toBe(false);

    const button = shadowQuery(switchEl, '[data-slot="switch"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    await switchEl.updateComplete;

    expect(switchEl.checked).toBe(true);
  });

  it('should dispatch switch-change event', async () => {
    const switchEl = new GraphSwitch();
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    const handler = vi.fn();
    switchEl.addEventListener('switch-change', handler);

    const button = shadowQuery(switchEl, '[data-slot="switch"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.checked).toBe(true);
  });

  it('should handle disabled state', async () => {
    const switchEl = new GraphSwitch();
    switchEl.disabled = true;
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    const button = shadowQuery(switchEl, '[data-slot="switch"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('should not toggle when disabled', async () => {
    const switchEl = new GraphSwitch();
    switchEl.disabled = true;
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    const button = shadowQuery(switchEl, '[data-slot="switch"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    expect(switchEl.checked).toBe(false);
  });

  it('should support keyboard navigation', async () => {
    const switchEl = new GraphSwitch();
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    const button = shadowQuery(switchEl, '[data-slot="switch"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    await switchEl.updateComplete;

    expect(switchEl.checked).toBe(true);
  });

  it('should render thumb element', async () => {
    const switchEl = new GraphSwitch();
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    const thumb = shadowQuery(switchEl, '[data-slot="switch-thumb"]');
    expect(thumb).toBeTruthy();
  });

  it('should use Shadow DOM', async () => {
    const switchEl = new GraphSwitch();
    container.appendChild(switchEl);
    await switchEl.updateComplete;

    expect(switchEl.shadowRoot).toBeTruthy();
  });
});
