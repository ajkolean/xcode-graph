import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphRadioGroup, GraphRadioItem } from './radio-group';

describe('GraphRadioGroup', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('GraphRadioGroup', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('graph-radio-group')).toBe(GraphRadioGroup);
    });

    it('should render correctly', async () => {
      const group = new GraphRadioGroup();
      container.appendChild(group);
      await group.updateComplete;

      const div = group.querySelector('[data-slot="radio-group"]');
      expect(div).toBeTruthy();
      expect(div?.getAttribute('role')).toBe('radiogroup');
    });

    it('should use Light DOM', () => {
      const group = new GraphRadioGroup();
      expect(group.shadowRoot).toBeNull();
    });
  });

  describe('GraphRadioItem', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('graph-radio-item')).toBe(GraphRadioItem);
    });

    it('should render unchecked by default', async () => {
      const item = new GraphRadioItem();
      container.appendChild(item);
      await item.updateComplete;

      expect(item.checked).toBe(false);
      const button = item.querySelector('[data-slot="radio-group-item"]');
      expect(button?.getAttribute('aria-checked')).toBe('false');
    });

    it('should render checked state', async () => {
      const item = new GraphRadioItem();
      item.checked = true;
      container.appendChild(item);
      await item.updateComplete;

      expect(item.checked).toBe(true);
      const button = item.querySelector('[data-slot="radio-group-item"]');
      expect(button?.getAttribute('aria-checked')).toBe('true');
    });

    it('should dispatch radio-item-change event on click', async () => {
      const item = new GraphRadioItem();
      item.value = 'option1';
      container.appendChild(item);
      await item.updateComplete;

      const handler = vi.fn();
      item.addEventListener('radio-item-change', handler);

      const button = item.querySelector('[data-slot="radio-group-item"]') as HTMLButtonElement;
      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe('option1');
    });

    it('should handle disabled state', async () => {
      const item = new GraphRadioItem();
      item.disabled = true;
      container.appendChild(item);
      await item.updateComplete;

      const button = item.querySelector('[data-slot="radio-group-item"]') as HTMLButtonElement;
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('should show indicator when checked', async () => {
      const item = new GraphRadioItem();
      item.checked = true;
      container.appendChild(item);
      await item.updateComplete;

      const indicator = item.querySelector('[data-slot="radio-group-indicator"]');
      expect(indicator).toBeTruthy();
    });

    it('should use Light DOM', () => {
      const item = new GraphRadioItem();
      expect(item.shadowRoot).toBeNull();
    });
  });
});
