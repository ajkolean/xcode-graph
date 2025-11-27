import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphSkeleton } from './skeleton';

describe('GraphSkeleton', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-skeleton')).toBe(GraphSkeleton);
  });

  it('should render correctly', async () => {
    const skeleton = new GraphSkeleton();
    container.appendChild(skeleton);
    await skeleton.updateComplete;

    const div = skeleton.querySelector('[data-slot="skeleton"]');
    expect(div).toBeTruthy();
  });

  it('should use Light DOM', () => {
    const skeleton = new GraphSkeleton();
    expect(skeleton.shadowRoot).toBeNull();
  });

  it('should apply Panda CSS classes', async () => {
    const skeleton = new GraphSkeleton();
    container.appendChild(skeleton);
    await skeleton.updateComplete;

    const div = skeleton.querySelector('[data-slot="skeleton"]');
    expect(div?.className).toBeTruthy();
    expect(div?.className.length).toBeGreaterThan(0);
  });

  it('should accept custom styles via inline style attribute', async () => {
    const skeleton = new GraphSkeleton();
    skeleton.style.width = '200px';
    skeleton.style.height = '20px';
    container.appendChild(skeleton);
    await skeleton.updateComplete;

    expect(skeleton.style.width).toBe('200px');
    expect(skeleton.style.height).toBe('20px');
  });
});
