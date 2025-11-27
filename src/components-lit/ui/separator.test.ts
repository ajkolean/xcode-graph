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
    expect(separator.getAttribute('orientation')).toBe('horizontal');
  });

  it('should render with vertical orientation', async () => {
    const separator = new GraphSeparator();
    separator.orientation = 'vertical';
    container.appendChild(separator);
    await separator.updateComplete;

    expect(separator.orientation).toBe('vertical');
    expect(separator.getAttribute('orientation')).toBe('vertical');
  });

  it('should be decorative by default', async () => {
    const separator = new GraphSeparator();
    container.appendChild(separator);
    await separator.updateComplete;

    expect(separator.decorative).toBe(true);
    // Decorative separators have role="none" set on the host
    expect(separator.getAttribute('role')).toBe('none');
  });

  it('should have separator role when not decorative', async () => {
    const separator = new GraphSeparator();
    separator.decorative = false;
    container.appendChild(separator);
    await separator.updateComplete;

    // ARIA attributes are set on the host element
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('should use Shadow DOM', async () => {
    const separator = new GraphSeparator();
    container.appendChild(separator);
    await separator.updateComplete;

    expect(separator.shadowRoot).toBeTruthy();
  });
});
