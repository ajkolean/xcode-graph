/**
 * FilterSection Accessibility Tests
 *
 * Uses vitest-axe to verify the filter section meets accessibility standards.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { FilterItem, GraphFilterSection } from './filter-section';
import './filter-section';

const sampleItems: FilterItem[] = [
  { key: 'framework', count: 5, color: '#10B981' },
  { key: 'library', count: 3, color: '#3B82F6' },
];

describe('xcode-graph-filter-section a11y', () => {
  it('should have no accessibility violations when collapsed', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Product Types"
        .items=${sampleItems}
        .selectedItems=${new Set(['framework', 'library'])}
        filter-type="nodeType"
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when expanded', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Product Types"
        .items=${sampleItems}
        .selectedItems=${new Set(['framework', 'library'])}
        filter-type="nodeType"
        .zoom=${1}
        is-expanded
      ></xcode-graph-filter-section>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have aria-expanded on header button when collapsed', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Platforms"
        .items=${sampleItems}
        .selectedItems=${new Set()}
        filter-type="platform"
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const button = el.shadowRoot?.querySelector('.header-button');
    expect(button).toBeDefined();
    expect(button?.hasAttribute('aria-expanded')).toBe(true);
  });

  it('should have aria-pressed on item buttons when expanded', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Product Types"
        .items=${sampleItems}
        .selectedItems=${new Set(['framework'])}
        filter-type="project"
        .zoom=${1}
        is-expanded
      ></xcode-graph-filter-section>
    `);

    await el.updateComplete;

    const itemButtons = el.shadowRoot?.querySelectorAll('.item-button');
    if (itemButtons && itemButtons.length > 0) {
      const firstButton = itemButtons[0];
      expect(firstButton?.hasAttribute('aria-pressed')).toBe(true);
    }
  });
});
