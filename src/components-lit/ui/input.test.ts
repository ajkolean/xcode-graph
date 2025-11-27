import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphInput } from './input';
import { shadowQuery } from '../../test/shadow-helpers';

describe('GraphInput', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-input')).toBe(GraphInput);
  });

  it('should render with default type text', async () => {
    const input = new GraphInput();
    container.appendChild(input);
    await input.updateComplete;

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    expect(inputEl).toBeTruthy();
    expect(inputEl.type).toBe('text');
  });

  it('should support different input types', async () => {
    const types = ['email', 'password', 'number', 'tel', 'url'];

    for (const type of types) {
      const input = new GraphInput();
      input.type = type;
      container.appendChild(input);
      await input.updateComplete;

      const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
      expect(inputEl.type).toBe(type);

      input.remove();
    }
  });

  it('should handle value changes', async () => {
    const input = new GraphInput();
    input.value = 'test value';
    container.appendChild(input);
    await input.updateComplete;

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    expect(inputEl.value).toBe('test value');
  });

  it('should dispatch input-change event on input', async () => {
    const input = new GraphInput();
    container.appendChild(input);
    await input.updateComplete;

    const handler = vi.fn();
    input.addEventListener('input-change', handler);

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    inputEl.value = 'new value';
    inputEl.dispatchEvent(new Event('input'));

    await input.updateComplete;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('new value');
  });

  it('should handle placeholder', async () => {
    const input = new GraphInput();
    input.placeholder = 'Enter text...';
    container.appendChild(input);
    await input.updateComplete;

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    expect(inputEl.placeholder).toBe('Enter text...');
  });

  it('should handle disabled state', async () => {
    const input = new GraphInput();
    input.disabled = true;
    container.appendChild(input);
    await input.updateComplete;

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    expect(inputEl.disabled).toBe(true);
  });

  it('should handle required attribute', async () => {
    const input = new GraphInput();
    input.required = true;
    container.appendChild(input);
    await input.updateComplete;

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    expect(inputEl.required).toBe(true);
  });

  it('should handle name attribute', async () => {
    const input = new GraphInput();
    input.name = 'email';
    container.appendChild(input);
    await input.updateComplete;

    const inputEl = shadowQuery(input, 'input') as HTMLInputElement;
    expect(inputEl.name).toBe('email');
  });

  it('should use Shadow DOM', async () => {
    const input = new GraphInput();
    container.appendChild(input);
    await input.updateComplete;

    expect(input.shadowRoot).toBeTruthy();
  });
});
