import { describe, it, expect, afterEach } from 'vitest';
import { GraphAlert } from './alert';
import { shadowQuery, expectShadowElement } from '../../test/shadow-helpers';

describe('GraphAlert', () => {
  let alert: GraphAlert;

  afterEach(() => {
    alert?.remove();
  });

  it('should render with default variant', async () => {
    alert = new GraphAlert();
    document.body.appendChild(alert);
    await alert.updateComplete;

    expect(alert.variant).toBe('default');
    expect(alert.getAttribute('variant')).toBe('default'); // Reflected attribute
  });

  it('should render with destructive variant', async () => {
    alert = new GraphAlert();
    alert.variant = 'destructive';
    document.body.appendChild(alert);
    await alert.updateComplete;

    expect(alert.variant).toBe('destructive');
    expect(alert.getAttribute('variant')).toBe('destructive');
  });

  it('should have role="alert" attribute', async () => {
    alert = new GraphAlert();
    document.body.appendChild(alert);
    await alert.updateComplete;

    // The role should be on the host element for accessibility
    expect(alert.getAttribute('role')).toBe('alert');
  });

  it('should render slots correctly', async () => {
    alert = new GraphAlert();

    const icon = document.createElement('svg');
    icon.setAttribute('slot', 'icon');
    alert.appendChild(icon);

    const title = document.createElement('div');
    title.setAttribute('slot', 'title');
    title.textContent = 'Alert Title';
    alert.appendChild(title);

    const description = document.createElement('div');
    description.setAttribute('slot', 'description');
    description.textContent = 'Alert description';
    alert.appendChild(description);

    document.body.appendChild(alert);
    await alert.updateComplete;

    // Check that slots are present in shadow DOM
    const iconSlot = shadowQuery(alert, 'slot[name="icon"]');
    const titleSlot = shadowQuery(alert, 'slot[name="title"]');
    const descriptionSlot = shadowQuery(alert, 'slot[name="description"]');

    expect(iconSlot).toBeTruthy();
    expect(titleSlot).toBeTruthy();
    expect(descriptionSlot).toBeTruthy();
  });

  it('should update variant dynamically', async () => {
    alert = new GraphAlert();
    document.body.appendChild(alert);
    await alert.updateComplete;

    expect(alert.variant).toBe('default');

    alert.variant = 'destructive';
    await alert.updateComplete;

    expect(alert.variant).toBe('destructive');
    expect(alert.getAttribute('variant')).toBe('destructive');
  });

  it('should render default slot for unslotted content', async () => {
    alert = new GraphAlert();
    alert.textContent = 'Simple alert content';
    document.body.appendChild(alert);
    await alert.updateComplete;

    const defaultSlot = shadowQuery(alert, 'slot:not([name])');
    expect(defaultSlot).toBeTruthy();
  });
});
