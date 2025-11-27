import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphRadioGroup, GraphRadioItem } from './radio-group';
import { shadowQuery } from '../../test/shadow-helpers';

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

      // RadioGroup renders <slot> in Shadow DOM
      expect(group.shadowRoot).toBeTruthy();
    });

    it('should use Shadow DOM', async () => {
      const group = new GraphRadioGroup();
      container.appendChild(group);
      await group.updateComplete;

      expect(group.shadowRoot).toBeTruthy();
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
      const button = shadowQuery(item, '[data-slot="radio-group-item"]');
      expect(button?.getAttribute('aria-checked')).toBe('false');
    });

    it('should render checked state', async () => {
      const item = new GraphRadioItem();
      item.checked = true;
      container.appendChild(item);
      await item.updateComplete;

      expect(item.checked).toBe(true);
      const button = shadowQuery(item, '[data-slot="radio-group-item"]');
      expect(button?.getAttribute('aria-checked')).toBe('true');
    });

    it('should dispatch radio-item-change event on click', async () => {
      const item = new GraphRadioItem();
      item.value = 'option1';
      container.appendChild(item);
      await item.updateComplete;

      const handler = vi.fn();
      item.addEventListener('radio-item-change', handler);

      const button = shadowQuery(item, '[data-slot="radio-group-item"]') as HTMLButtonElement;
      expect(button).toBeTruthy();
      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe('option1');
    });

    it('should handle disabled state', async () => {
      const item = new GraphRadioItem();
      item.disabled = true;
      container.appendChild(item);
      await item.updateComplete;

      const button = shadowQuery(item, '[data-slot="radio-group-item"]') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('should show indicator when checked', async () => {
      const item = new GraphRadioItem();
      item.checked = true;
      container.appendChild(item);
      await item.updateComplete;

      const indicator = shadowQuery(item, '[data-slot="radio-group-indicator"]');
      expect(indicator).toBeTruthy();
    });

    it('should use Shadow DOM', async () => {
      const item = new GraphRadioItem();
      container.appendChild(item);
      await item.updateComplete;

      expect(item.shadowRoot).toBeTruthy();
    });
  });
});
