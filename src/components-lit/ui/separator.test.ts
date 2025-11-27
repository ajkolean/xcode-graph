import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphSeparator } from './separator';

describe('GraphSeparator', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-separator')).toBe(GraphSeparator);
  });

  it('should render with default horizontal orientation', async () => {
    const separator = new GraphSeparator();
    container.appendChild(separator);
    await separator.updateComplete;

    expect(separator.orientation).toBe('horizontal');
    const div = separator.querySelector('[data-slot="separator-root"]');
    expect(div?.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('should render with vertical orientation', async () => {
    const separator = new GraphSeparator();
    separator.orientation = 'vertical';
    container.appendChild(separator);
    await separator.updateComplete;

    expect(separator.orientation).toBe('vertical');
    const div = separator.querySelector('[data-slot="separator-root"]');
    expect(div?.getAttribute('data-orientation')).toBe('vertical');
  });

  it('should be decorative by default', async () => {
    const separator = new GraphSeparator();
    container.appendChild(separator);
    await separator.updateComplete;

    expect(separator.decorative).toBe(true);
    const div = separator.querySelector('[data-slot="separator-root"]');
    expect(div?.getAttribute('role')).toBe('none');
  });

  it('should have separator role when not decorative', async () => {
    const separator = new GraphSeparator();
    separator.decorative = false;
    container.appendChild(separator);
    await separator.updateComplete;

    const div = separator.querySelector('[data-slot="separator-root"]');
    expect(div?.getAttribute('role')).toBe('separator');
    expect(div?.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('should use Light DOM', () => {
    const separator = new GraphSeparator();
    expect(separator.shadowRoot).toBeNull();
  });

  it('should apply Panda CSS classes', async () => {
    const separator = new GraphSeparator();
    container.appendChild(separator);
    await separator.updateComplete;

    const div = separator.querySelector('[data-slot="separator-root"]');
    expect(div?.className).toBeTruthy();
  });
});
