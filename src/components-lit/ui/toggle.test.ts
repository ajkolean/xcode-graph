import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphToggle } from './toggle';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphToggle', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-toggle')).toBe(GraphToggle);
  });

  it('should render unpressed by default', async () => {
    const toggle = new GraphToggle();
    container.appendChild(toggle);
    await toggle.updateComplete;

    expect(toggle.pressed).toBe(false);
    const button = shadowQuery(toggle, '[data-slot="toggle"]');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.getAttribute('data-state')).toBe('off');
  });

  it('should render pressed state', async () => {
    const toggle = new GraphToggle();
    toggle.pressed = true;
    container.appendChild(toggle);
    await toggle.updateComplete;

    const button = shadowQuery(toggle, '[data-slot="toggle"]');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.getAttribute('data-state')).toBe('on');
  });

  it('should toggle on click', async () => {
    const toggle = new GraphToggle();
    container.appendChild(toggle);
    await toggle.updateComplete;

    const button = shadowQuery(toggle, '[data-slot="toggle"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    await toggle.updateComplete;

    expect(toggle.pressed).toBe(true);
  });

  it('should dispatch toggle-change event', async () => {
    const toggle = new GraphToggle();
    container.appendChild(toggle);
    await toggle.updateComplete;

    const handler = vi.fn();
    toggle.addEventListener('toggle-change', handler);

    const button = shadowQuery(toggle, '[data-slot="toggle"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.pressed).toBe(true);
  });

  it('should support variants', async () => {
    const variants = ['default', 'outline'] as const;

    for (const variant of variants) {
      const toggle = new GraphToggle();
      toggle.variant = variant;
      container.appendChild(toggle);
      await toggle.updateComplete;

      expect(toggle.variant).toBe(variant);
      toggle.remove();
    }
  });

  it('should support sizes', async () => {
    const sizes = ['default', 'sm', 'lg'] as const;

    for (const size of sizes) {
      const toggle = new GraphToggle();
      toggle.size = size;
      container.appendChild(toggle);
      await toggle.updateComplete;

      expect(toggle.size).toBe(size);
      toggle.remove();
    }
  });

  it('should not toggle when disabled', async () => {
    const toggle = new GraphToggle();
    toggle.disabled = true;
    container.appendChild(toggle);
    await toggle.updateComplete;

    const button = shadowQuery(toggle, '[data-slot="toggle"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();

    expect(toggle.pressed).toBe(false);
  });

  it('should use Shadow DOM', async () => {
    const toggle = new GraphToggle();
    container.appendChild(toggle);
    await toggle.updateComplete;

    expect(toggle.shadowRoot).toBeTruthy();
  });
});
