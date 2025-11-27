import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GraphAccordion,
  GraphAccordionItem,
  GraphAccordionTrigger,
  GraphAccordionContent,
} from './accordion';

describe('GraphAccordion Components', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('GraphAccordion', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-accordion')).toBe(GraphAccordion);
    });

    it('should render correctly', async () => {
      const accordion = new GraphAccordion();
      container.appendChild(accordion);
      await accordion.updateComplete;

      expect(accordion.querySelector('[data-slot="accordion"]')).toBeTruthy();
    });

    it('should default to single type', async () => {
      const accordion = new GraphAccordion();
      container.appendChild(accordion);
      await accordion.updateComplete;

      expect(accordion.type).toBe('single');
    });

    it('should use Light DOM', () => {
      const accordion = new GraphAccordion();
      expect(accordion.shadowRoot).toBeNull();
    });
  });

  describe('GraphAccordionItem', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-accordion-item')).toBe(GraphAccordionItem);
    });

    it('should render closed by default', async () => {
      const item = new GraphAccordionItem();
      container.appendChild(item);
      await item.updateComplete;

      expect(item.open).toBe(false);
    });

    it('should render open state', async () => {
      const item = new GraphAccordionItem();
      item.open = true;
      container.appendChild(item);
      await item.updateComplete;

      expect(item.open).toBe(true);
    });
  });

  describe('GraphAccordionTrigger', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-accordion-trigger')).toBe(GraphAccordionTrigger);
    });

    it('should render as button', async () => {
      const trigger = new GraphAccordionTrigger();
      container.appendChild(trigger);
      await trigger.updateComplete;

      const button = trigger.querySelector('button[data-slot="accordion-trigger"]');
      expect(button).toBeTruthy();
    });

    it('should handle open state', async () => {
      const trigger = new GraphAccordionTrigger();
      trigger.open = true;
      container.appendChild(trigger);
      await trigger.updateComplete;

      const button = trigger.querySelector('button');
      expect(button?.getAttribute('data-state')).toBe('open');
    });

    it('should dispatch event on click', async () => {
      const trigger = new GraphAccordionTrigger();
      container.appendChild(trigger);
      await trigger.updateComplete;

      const handler = vi.fn();
      trigger.addEventListener('accordion-trigger-click', handler);

      const button = trigger.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should render chevron icon', async () => {
      const trigger = new GraphAccordionTrigger();
      container.appendChild(trigger);
      await trigger.updateComplete;

      const svg = trigger.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('GraphAccordionContent', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-accordion-content')).toBe(GraphAccordionContent);
    });

    it('should not render when closed', async () => {
      const content = new GraphAccordionContent();
      content.open = false;
      container.appendChild(content);
      await content.updateComplete;

      const div = content.querySelector('[data-slot="accordion-content"]');
      expect(div).toBeNull();
    });

    it('should render when open', async () => {
      const content = new GraphAccordionContent();
      content.open = true;
      container.appendChild(content);
      await content.updateComplete;

      const div = content.querySelector('[data-slot="accordion-content"]');
      expect(div).toBeTruthy();
      expect(div?.getAttribute('data-state')).toBe('open');
    });
  });
});
