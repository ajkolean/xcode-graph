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

    // Skeleton uses Shadow DOM with :host styling
    expect(skeleton.shadowRoot).toBeTruthy();
  });

  it('should use Shadow DOM', async () => {
    const skeleton = new GraphSkeleton();
    container.appendChild(skeleton);
    await skeleton.updateComplete;

    expect(skeleton.shadowRoot).toBeTruthy();
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
