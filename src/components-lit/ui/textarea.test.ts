import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphTextarea } from './textarea';

describe('GraphTextarea', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('graph-textarea')).toBe(GraphTextarea);
  });

  it('should render correctly', async () => {
    const textarea = new GraphTextarea();
    container.appendChild(textarea);
    await textarea.updateComplete;

    const textareaEl = textarea.querySelector('textarea[data-slot="textarea"]');
    expect(textareaEl).toBeTruthy();
  });

  it('should handle value changes', async () => {
    const textarea = new GraphTextarea();
    textarea.value = 'test content';
    container.appendChild(textarea);
    await textarea.updateComplete;

    const textareaEl = textarea.querySelector('textarea') as HTMLTextAreaElement;
    expect(textareaEl.value).toBe('test content');
  });

  it('should dispatch textarea-change event on input', async () => {
    const textarea = new GraphTextarea();
    container.appendChild(textarea);
    await textarea.updateComplete;

    const handler = vi.fn();
    textarea.addEventListener('textarea-change', handler);

    const textareaEl = textarea.querySelector('textarea') as HTMLTextAreaElement;
    textareaEl.value = 'new content';
    textareaEl.dispatchEvent(new Event('input'));

    await textarea.updateComplete;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('new content');
  });

  it('should handle placeholder', async () => {
    const textarea = new GraphTextarea();
    textarea.placeholder = 'Enter description...';
    container.appendChild(textarea);
    await textarea.updateComplete;

    const textareaEl = textarea.querySelector('textarea') as HTMLTextAreaElement;
    expect(textareaEl.placeholder).toBe('Enter description...');
  });

  it('should handle disabled state', async () => {
    const textarea = new GraphTextarea();
    textarea.disabled = true;
    container.appendChild(textarea);
    await textarea.updateComplete;

    const textareaEl = textarea.querySelector('textarea') as HTMLTextAreaElement;
    expect(textareaEl.disabled).toBe(true);
  });

  it('should handle rows attribute', async () => {
    const textarea = new GraphTextarea();
    textarea.rows = 5;
    container.appendChild(textarea);
    await textarea.updateComplete;

    const textareaEl = textarea.querySelector('textarea') as HTMLTextAreaElement;
    expect(textareaEl.rows).toBe(5);
  });

  it('should use Light DOM', () => {
    const textarea = new GraphTextarea();
    expect(textarea.shadowRoot).toBeNull();
  });
});
