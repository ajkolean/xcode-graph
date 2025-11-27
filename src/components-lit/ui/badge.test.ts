import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphBadge } from './badge';

describe('GraphBadge', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    // The element is registered via customElements.define() in the module
    expect(customElements.get('graph-badge')).toBe(GraphBadge);
  });

  it('should render with default variant', async () => {
    const badge = new GraphBadge();
    container.appendChild(badge);
    await badge.updateComplete;

    expect(badge.variant).toBe('default');
    // Shadow DOM should exist
    expect(badge.shadowRoot).toBeTruthy();
    // Should have variant attribute reflected
    expect(badge.getAttribute('variant')).toBe('default');
  });

  it('should render with secondary variant', async () => {
    const badge = new GraphBadge();
    badge.variant = 'secondary';
    container.appendChild(badge);

    await badge.updateComplete;

    expect(badge.variant).toBe('secondary');
  });

  it('should render with destructive variant', async () => {
    const badge = new GraphBadge();
    badge.variant = 'destructive';
    container.appendChild(badge);

    await badge.updateComplete;

    expect(badge.variant).toBe('destructive');
  });

  it('should render with outline variant', async () => {
    const badge = new GraphBadge();
    badge.variant = 'outline';
    container.appendChild(badge);

    await badge.updateComplete;

    expect(badge.variant).toBe('outline');
  });

  it('should update when variant property changes', async () => {
    const badge = new GraphBadge();
    container.appendChild(badge);

    await badge.updateComplete;
    expect(badge.variant).toBe('default');

    badge.variant = 'secondary';
    await badge.updateComplete;

    expect(badge.variant).toBe('secondary');
  });

  it('should use Shadow DOM', async () => {
    const badge = new GraphBadge();
    container.appendChild(badge);
    await badge.updateComplete;

    // Shadow DOM components should have a shadow root
    expect(badge.shadowRoot).toBeTruthy();
  });

  it('should render slot content correctly', async () => {
    const badge = new GraphBadge();
    badge.textContent = 'Featured';
    container.appendChild(badge);
    await badge.updateComplete;

    // Shadow DOM should exist
    expect(badge.shadowRoot).toBeTruthy();
    // Slot content should be projected
    expect(badge.textContent).toBe('Featured');
  });

  it('should reflect variant attribute', async () => {
    const badge = new GraphBadge();
    badge.variant = 'secondary';
    container.appendChild(badge);
    await badge.updateComplete;

    // Variant property should reflect to attribute
    expect(badge.getAttribute('variant')).toBe('secondary');

    // Changing variant should update attribute
    badge.variant = 'destructive';
    await badge.updateComplete;
    expect(badge.getAttribute('variant')).toBe('destructive');
  });

  it('should export the correct types', () => {
    // Type check - ensure the class and types are exported correctly
    const badge: GraphBadge = new GraphBadge();
    expect(badge).toBeInstanceOf(GraphBadge);
    expect(badge).toBeInstanceOf(HTMLElement);
  });
});
