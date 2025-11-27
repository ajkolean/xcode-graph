import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shadowQuery } from '../../test/shadow-helpers';
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

      // Accordion renders <slot> in Shadow DOM
      expect(accordion.shadowRoot).toBeTruthy();
    });

    it('should default to single type', async () => {
      const accordion = new GraphAccordion();
      container.appendChild(accordion);
      await accordion.updateComplete;

      expect(accordion.type).toBe('single');
    });

    it('should use Shadow DOM', async () => {
      const accordion = new GraphAccordion();
      container.appendChild(accordion);
      await accordion.updateComplete;

      expect(accordion.shadowRoot).toBeTruthy();
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

      const button = shadowQuery(trigger, 'button');
      expect(button).toBeTruthy();
    });

    it('should handle open state', async () => {
      const trigger = new GraphAccordionTrigger();
      trigger.open = true;
      container.appendChild(trigger);
      await trigger.updateComplete;

      const button = shadowQuery(trigger, 'button');
      expect(button?.getAttribute('data-state')).toBe('open');
    });

    it('should dispatch event on click', async () => {
      const trigger = new GraphAccordionTrigger();
      container.appendChild(trigger);
      await trigger.updateComplete;

      const handler = vi.fn();
      trigger.addEventListener('accordion-trigger-click', handler);

      const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should render chevron icon', async () => {
      const trigger = new GraphAccordionTrigger();
      container.appendChild(trigger);
      await trigger.updateComplete;

      const svg = shadowQuery(trigger, 'svg');
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

      // Content div exists but host is hidden via :host(:not([open])) { display: none }
      const div = shadowQuery(content, '[data-slot="accordion-content"]');
      expect(div).toBeTruthy();
      expect(div?.getAttribute('data-state')).toBe('closed');
    });

    it('should render when open', async () => {
      const content = new GraphAccordionContent();
      content.open = true;
      container.appendChild(content);
      await content.updateComplete;

      const div = shadowQuery(content, '[data-slot="accordion-content"]');
      expect(div).toBeTruthy();
      expect(div?.getAttribute('data-state')).toBe('open');
    });
  });
});
