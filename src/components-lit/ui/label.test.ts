import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GraphLabel } from './label';
import { shadowQuery } from '../../test/shadow-helpers';

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

    // Label uses Shadow DOM
    expect(label.shadowRoot).toBeTruthy();
    const labelEl = shadowQuery(label, 'label');
    expect(labelEl).toBeTruthy();
  });

  it('should support htmlFor attribute', async () => {
    const label = new GraphLabel();
    label.htmlFor = 'email-input';
    container.appendChild(label);
    await label.updateComplete;

    // htmlFor is tracked as a property and used in click handler
    expect(label.htmlFor).toBe('email-input');
  });

  it('should use Shadow DOM', async () => {
    const label = new GraphLabel();
    container.appendChild(label);
    await label.updateComplete;

    expect(label.shadowRoot).toBeTruthy();
  });
});
