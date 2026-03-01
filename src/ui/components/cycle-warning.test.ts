/**
 * Tests for GraphCycleWarning component
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphCycleWarning } from './cycle-warning';
import './cycle-warning';

describe('xcode-graph-cycle-warning', () => {
  describe('Rendering', () => {
    it('should render when cycles are provided', async () => {
      const cycles = [['A', 'B', 'C', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      expect(el).to.exist;
      const banner = el.shadowRoot?.querySelector('.warning-banner');
      expect(banner).to.exist;
    });

    it('should not render when cycles array is empty', async () => {
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${[]}></xcode-graph-cycle-warning>
      `);

      const banner = el.shadowRoot?.querySelector('.warning-banner');
      expect(banner).to.not.exist;
    });

    it('should display correct cycle count', async () => {
      const cycles = [
        ['A', 'B', 'A'],
        ['C', 'D', 'E', 'C'],
        ['X', 'Y', 'X'],
      ];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const count = el.shadowRoot?.querySelector('.cycle-count');
      expect(count?.textContent).to.equal('3');
    });

    it('should display warning title and icon', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const title = el.shadowRoot?.querySelector('.warning-title');
      expect(title?.textContent).to.include('Circular Dependencies Detected');

      const icon = el.shadowRoot?.querySelector('.warning-icon');
      expect(icon?.textContent).to.equal('⚠️');
    });
  });

  describe('Expand/Collapse', () => {
    it('should not show cycle list by default', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const cycleList = el.shadowRoot?.querySelector('.cycle-list');
      expect(cycleList).to.not.exist;
    });

    it('should show cycle list when expand button is clicked', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expect(expandBtn).to.exist;

      expandBtn.click();
      await el.updateComplete;

      const cycleList = el.shadowRoot?.querySelector('.cycle-list');
      expect(cycleList).to.exist;
    });

    it('should toggle button text when expanding/collapsing', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;

      expect(expandBtn.textContent).to.include('Show Details');

      expandBtn.click();
      await el.updateComplete;

      expect(expandBtn.textContent).to.include('Hide Details');

      expandBtn.click();
      await el.updateComplete;

      expect(expandBtn.textContent).to.include('Show Details');
    });

    it('should display all cycles in the list', async () => {
      const cycles = [
        ['A', 'B', 'C', 'A'],
        ['X', 'Y', 'X'],
      ];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expandBtn.click();
      await el.updateComplete;

      const cycleItems = el.shadowRoot?.querySelectorAll('.cycle-item');
      expect(cycleItems?.length).to.equal(2);
    });

    it('should format cycles correctly', async () => {
      const cycles = [['A', 'B', 'C', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expandBtn.click();
      await el.updateComplete;

      const cyclePath = el.shadowRoot?.querySelector('.cycle-path');
      expect(cyclePath?.textContent).to.equal('A → B → C → A');
    });
  });

  describe('Dismiss', () => {
    it('should hide banner when dismiss button is clicked', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      let banner = el.shadowRoot?.querySelector('.warning-banner');
      expect(banner).to.exist;

      const dismissBtn = el.shadowRoot?.querySelector('.btn-dismiss') as HTMLButtonElement;
      dismissBtn.click();
      await el.updateComplete;

      banner = el.shadowRoot?.querySelector('.warning-banner');
      expect(banner).to.not.exist;
    });

    it('should dispatch dismiss event when dismissed', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      let eventFired = false;
      el.addEventListener('dismiss', () => {
        eventFired = true;
      });

      const dismissBtn = el.shadowRoot?.querySelector('.btn-dismiss') as HTMLButtonElement;
      dismissBtn.click();
      await el.updateComplete;

      expect(eventFired).to.be.true;
    });

    it('should hide banner when close button (×) is clicked', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
      closeBtn.click();
      await el.updateComplete;

      const banner = el.shadowRoot?.querySelector('.warning-banner');
      expect(banner).to.not.exist;
    });
  });

  describe('Edge Cases', () => {
    it('should handle single node cycle', async () => {
      const cycles = [['A', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const count = el.shadowRoot?.querySelector('.cycle-count');
      expect(count?.textContent).to.equal('1');

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expandBtn.click();
      await el.updateComplete;

      const cyclePath = el.shadowRoot?.querySelector('.cycle-path');
      expect(cyclePath?.textContent).to.equal('A → A');
    });

    it('should handle very long cycle paths', async () => {
      const longCycle = Array.from({ length: 20 }, (_, i) => `Node${i}`);
      const firstNode = longCycle[0] ?? 'Node0';
      longCycle.push(firstNode); // Complete the cycle
      const cycles = [longCycle];

      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expandBtn.click();
      await el.updateComplete;

      const cycleList = el.shadowRoot?.querySelector('.cycle-list');
      expect(cycleList).to.exist;
      // Verify the long cycle path is rendered (JSDOM doesn't compute scrollHeight)
      const cyclePath = el.shadowRoot?.querySelector('.cycle-path');
      expect(cyclePath?.textContent).to.include('Node0');
      expect(cyclePath?.textContent).to.include('Node19');
    });

    it('should handle many cycles', async () => {
      const manyCycles = Array.from({ length: 50 }, (_, i) => [`A${i}`, `B${i}`, `A${i}`]);

      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${manyCycles}></xcode-graph-cycle-warning>
      `);

      const count = el.shadowRoot?.querySelector('.cycle-count');
      expect(count?.textContent).to.equal('50');

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expandBtn.click();
      await el.updateComplete;

      const cycleItems = el.shadowRoot?.querySelectorAll('.cycle-item');
      expect(cycleItems?.length).to.equal(50);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', async () => {
      const cycles = [['A', 'B', 'A']];
      const el = await fixture<GraphCycleWarning>(html`
        <xcode-graph-cycle-warning .cycles=${cycles}></xcode-graph-cycle-warning>
      `);

      const expandBtn = el.shadowRoot?.querySelector('.btn-expand') as HTMLButtonElement;
      expect(expandBtn.textContent).to.not.be.empty;

      const dismissBtn = el.shadowRoot?.querySelector('.btn-dismiss') as HTMLButtonElement;
      expect(dismissBtn.textContent).to.not.be.empty;

      const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
      expect(closeBtn.getAttribute('title')).to.equal('Dismiss');
    });
  });
});
