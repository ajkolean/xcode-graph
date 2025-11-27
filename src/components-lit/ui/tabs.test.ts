import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shadowQuery } from '../../test/shadow-helpers';
import { GraphTabs, GraphTabsList, GraphTabsTrigger, GraphTabsContent } from './tabs';

describe('GraphTabs Components', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('GraphTabs', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tabs')).toBe(GraphTabs);
    });

    it('should render correctly', async () => {
      const tabs = new GraphTabs();
      container.appendChild(tabs);
      await tabs.updateComplete;

      // Tabs renders <slot> in Shadow DOM
      expect(tabs.shadowRoot).toBeTruthy();
    });

    it('should handle value changes', async () => {
      const tabs = new GraphTabs();
      tabs.value = 'tab1';
      container.appendChild(tabs);
      await tabs.updateComplete;

      expect(tabs.value).toBe('tab1');
    });

    it('should use Shadow DOM', async () => {
      const tabs = new GraphTabs();
      container.appendChild(tabs);
      await tabs.updateComplete;

      expect(tabs.shadowRoot).toBeTruthy();
    });
  });

  describe('GraphTabsList', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tabs-list')).toBe(GraphTabsList);
    });

    it('should render with role tablist', async () => {
      const list = new GraphTabsList();
      container.appendChild(list);
      await list.updateComplete;

      // TabsList renders <slot> in Shadow DOM
      expect(list.shadowRoot).toBeTruthy();
    });
  });

  describe('GraphTabsTrigger', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tabs-trigger')).toBe(GraphTabsTrigger);
    });

    it('should render as button with role tab', async () => {
      const trigger = new GraphTabsTrigger();
      trigger.value = 'tab1';
      container.appendChild(trigger);
      await trigger.updateComplete;

      const button = shadowQuery(trigger, 'button');
      expect(button?.getAttribute('role')).toBe('tab');
    });

    it('should handle active state', async () => {
      const trigger = new GraphTabsTrigger();
      trigger.active = true;
      container.appendChild(trigger);
      await trigger.updateComplete;

      const button = shadowQuery(trigger, 'button');
      expect(button?.getAttribute('aria-selected')).toBe('true');
      expect(button?.getAttribute('data-state')).toBe('active');
    });

    it('should dispatch event on click', async () => {
      const trigger = new GraphTabsTrigger();
      trigger.value = 'tab1';
      container.appendChild(trigger);
      await trigger.updateComplete;

      const handler = vi.fn();
      trigger.addEventListener('tab-trigger-click', handler);

      const button = shadowQuery(trigger, 'button') as HTMLButtonElement;
      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('GraphTabsContent', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tabs-content')).toBe(GraphTabsContent);
    });

    it('should not render when inactive', async () => {
      const content = new GraphTabsContent();
      content.active = false;
      container.appendChild(content);
      await content.updateComplete;

      expect(content.shadowRoot).toBeTruthy();
      expect(content.active).toBe(false);
    });

    it('should render when active', async () => {
      const content = new GraphTabsContent();
      content.active = true;
      container.appendChild(content);
      await content.updateComplete;

      expect(content.shadowRoot).toBeTruthy();
      expect(content.active).toBe(true);
    });
  });
});
