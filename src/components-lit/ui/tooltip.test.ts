import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GraphTooltip,
  GraphTooltipTrigger,
  GraphTooltipContent,
  GraphTooltipProvider,
} from './tooltip';

describe('GraphTooltip Components', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Component Registration', () => {
    it('should register all tooltip components', () => {
      expect(customElements.get('graph-tooltip-provider')).toBe(GraphTooltipProvider);
      expect(customElements.get('graph-tooltip')).toBe(GraphTooltip);
      expect(customElements.get('graph-tooltip-trigger')).toBe(GraphTooltipTrigger);
      expect(customElements.get('graph-tooltip-content')).toBe(GraphTooltipContent);
    });
  });

  describe('GraphTooltip', () => {
    it('should start closed by default', async () => {
      const tooltip = new GraphTooltip();
      container.appendChild(tooltip);
      await tooltip.updateComplete;

      expect(tooltip.open).toBe(false);
    });

    it('should have default delay of 700ms', async () => {
      const tooltip = new GraphTooltip();
      container.appendChild(tooltip);
      await tooltip.updateComplete;

      expect(tooltip.delayDuration).toBe(700);
    });

    it('should use Shadow DOM', async () => {
      const tooltip = new GraphTooltip();
      container.appendChild(tooltip);
      await tooltip.updateComplete;

      expect(tooltip.shadowRoot).toBeTruthy();
    });

    it('should open when open property is set', async () => {
      const tooltip = new GraphTooltip();
      container.appendChild(tooltip);
      await tooltip.updateComplete;

      tooltip.open = true;
      await tooltip.updateComplete;

      expect(tooltip.open).toBe(true);
    });

    it('should close when open property is set to false', async () => {
      const tooltip = new GraphTooltip();
      tooltip.open = true;
      container.appendChild(tooltip);
      await tooltip.updateComplete;

      tooltip.open = false;
      await tooltip.updateComplete;

      expect(tooltip.open).toBe(false);
    });
  });

  describe('GraphTooltipTrigger', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tooltip-trigger')).toBe(GraphTooltipTrigger);
    });

    it('should use Shadow DOM', async () => {
      const trigger = new GraphTooltipTrigger();
      container.appendChild(trigger);
      await trigger.updateComplete;

      expect(trigger.shadowRoot).toBeTruthy();
    });
  });

  describe('GraphTooltipContent', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tooltip-content')).toBe(GraphTooltipContent);
    });

    it('should default to top side', async () => {
      const content = new GraphTooltipContent();
      container.appendChild(content);
      await content.updateComplete;

      expect(content.side).toBe('top');
    });

    it('should support all 4 sides', async () => {
      const sides: Array<'top' | 'right' | 'bottom' | 'left'> = [
        'top',
        'right',
        'bottom',
        'left',
      ];

      for (const side of sides) {
        const content = new GraphTooltipContent();
        content.side = side;
        container.appendChild(content);
        await content.updateComplete;

        expect(content.side).toBe(side);
        expect(content.getAttribute('side')).toBe(side);

        content.remove();
      }
    });

    it('should use Shadow DOM', async () => {
      const content = new GraphTooltipContent();
      container.appendChild(content);
      await content.updateComplete;

      expect(content.shadowRoot).toBeTruthy();
    });

    it('should have role="tooltip"', async () => {
      const content = new GraphTooltipContent();
      container.appendChild(content);
      await content.updateComplete;

      const tooltipEl = content.shadowRoot?.querySelector('[role="tooltip"]');
      expect(tooltipEl).toBeTruthy();
    });
  });

  describe('GraphTooltipProvider', () => {
    it('should be defined', () => {
      expect(customElements.get('graph-tooltip-provider')).toBe(
        GraphTooltipProvider
      );
    });

    it('should have default delay of 700ms', async () => {
      const provider = new GraphTooltipProvider();
      container.appendChild(provider);
      await provider.updateComplete;

      expect(provider.delayDuration).toBe(700);
    });

    it('should use Shadow DOM', async () => {
      const provider = new GraphTooltipProvider();
      container.appendChild(provider);
      await provider.updateComplete;

      expect(provider.shadowRoot).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should compose all components together', async () => {
      container.innerHTML = `
        <graph-tooltip>
          <graph-tooltip-trigger>
            <button>Hover me</button>
          </graph-tooltip-trigger>
          <graph-tooltip-content side="right">
            Tooltip text
          </graph-tooltip-content>
        </graph-tooltip>
      `;

      const tooltip = container.querySelector('graph-tooltip') as GraphTooltip;
      const trigger = container.querySelector('graph-tooltip-trigger');
      const content = container.querySelector('graph-tooltip-content');

      await tooltip.updateComplete;

      expect(tooltip).toBeTruthy();
      expect(trigger).toBeTruthy();
      expect(content).toBeTruthy();
      expect(tooltip.open).toBe(false);
    });
  });
});
