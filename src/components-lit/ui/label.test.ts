import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphLabel } from './label';

describe('GraphLabel', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-label')).toBe(GraphLabel);
  });

  it('should render correctly', async () => {
    const label = new GraphLabel();
    label.textContent = 'Username';
    container.appendChild(label);
    await label.updateComplete;

    const labelEl = label.querySelector('label[data-slot="label"]');
    expect(labelEl).toBeTruthy();
  });

  it('should support htmlFor attribute', async () => {
    const label = new GraphLabel();
    label.htmlFor = 'email-input';
    container.appendChild(label);
    await label.updateComplete;

    const labelEl = label.querySelector('label') as HTMLLabelElement;
    expect(labelEl.getAttribute('for')).toBe('email-input');
  });

  it('should use Light DOM', () => {
    const label = new GraphLabel();
    expect(label.shadowRoot).toBeNull();
  });

  it('should apply Panda CSS classes', async () => {
    const label = new GraphLabel();
    container.appendChild(label);
    await label.updateComplete;

    const labelEl = label.querySelector('label');
    expect(labelEl?.className).toBeTruthy();
  });
});
