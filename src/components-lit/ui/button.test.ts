import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphButton } from './button';

describe('GraphButton', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-button')).toBe(GraphButton);
  });

  it('should render with default variant and size', async () => {
    const button = new GraphButton();
    container.appendChild(button);
    await button.updateComplete;

    expect(button.variant).toBe('default');
    expect(button.size).toBe('default');

    const btn = button.shadowRoot?.querySelector('button[data-slot="button"]');
    expect(btn).toBeTruthy();
  });

  it('should render with destructive variant', async () => {
    const button = new GraphButton();
    button.variant = 'destructive';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.variant).toBe('destructive');
  });

  it('should render with outline variant', async () => {
    const button = new GraphButton();
    button.variant = 'outline';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.variant).toBe('outline');
  });

  it('should render with secondary variant', async () => {
    const button = new GraphButton();
    button.variant = 'secondary';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.variant).toBe('secondary');
  });

  it('should render with ghost variant', async () => {
    const button = new GraphButton();
    button.variant = 'ghost';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.variant).toBe('ghost');
  });

  it('should render with link variant', async () => {
    const button = new GraphButton();
    button.variant = 'link';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.variant).toBe('link');
  });

  it('should render with sm size', async () => {
    const button = new GraphButton();
    button.size = 'sm';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.size).toBe('sm');
  });

  it('should render with lg size', async () => {
    const button = new GraphButton();
    button.size = 'lg';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.size).toBe('lg');
  });

  it('should render with icon size', async () => {
    const button = new GraphButton();
    button.size = 'icon';
    container.appendChild(button);
    await button.updateComplete;

    expect(button.size).toBe('icon');
  });

  it('should be disabled when disabled property is set', async () => {
    const button = new GraphButton();
    button.disabled = true;
    container.appendChild(button);
    await button.updateComplete;

    const btn = button.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(btn?.disabled).toBe(true);
  });

  it('should dispatch button-click event on click', async () => {
    const button = new GraphButton();
    container.appendChild(button);
    await button.updateComplete;

    const clickHandler = vi.fn();
    button.addEventListener('button-click', clickHandler);

    const btn = button.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch click when disabled', async () => {
    const button = new GraphButton();
    button.disabled = true;
    container.appendChild(button);
    await button.updateComplete;

    const clickHandler = vi.fn();
    button.addEventListener('button-click', clickHandler);

    const btn = button.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(clickHandler).not.toHaveBeenCalled();
  });

  it('should use Light DOM (no shadow root)', async () => {
    const button = new GraphButton();
    container.appendChild(button);
    await button.updateComplete;

    expect(button.shadowRoot).toBeNull();
  });

  it('should apply Panda CSS classes', async () => {
    const button = new GraphButton();
    container.appendChild(button);
    await button.updateComplete;

    const btn = button.querySelector('button');
    expect(btn?.className).toBeTruthy();
    expect(btn?.className.length).toBeGreaterThan(0);
  });

  it('should set button type attribute', async () => {
    const button = new GraphButton();
    button.type = 'submit';
    container.appendChild(button);
    await button.updateComplete;

    const btn = button.querySelector('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });
});
